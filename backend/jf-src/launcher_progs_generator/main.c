#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <sys/stat.h>
#include <errno.h>

#ifdef BIN_PATH
const char *path = BIN_PATH;
#else
// Default path
const char *path = "/usr/bin";
#endif

#ifdef CMD_TO_RUN
const char *s_cmd = CMD_TO_RUN;
#else
// Default static command
const char *s_cmd = "docker images";
#endif

const int MAX_ARGV_COUNT = 256;


// For static command splitting.
char **
split_ws(const char *ori){
    int i=0;
    int cnt = 0;
    const char *start = NULL;
    char **splitted = calloc(MAX_ARGV_COUNT+1, sizeof(char*));

    while (1){
        // Check if it is a whitespace or a NULL character
        int space = isspace(*(ori+i)) || *(ori+i)=='\0';
        // Find out start and end to be splitted.
        if (start==NULL && !space) {
            start = ori+i;
        } else if (start!=NULL && space) {
            const char *end = ori+i-1;
            size_t len = end-start+1;
            char * new = strncpy(malloc(len+1), start, len);
            new[len]='\0';
            splitted[cnt++] = new;
            start = NULL;
        }
        if (*(ori+i)=='\0')
            break;
        else if (cnt == MAX_ARGV_COUNT)
            // Cut off the remain
            //TODO exit(2)?
            break;
        i++;
    }
    return splitted;
}


// This will merge s_argv and d_argv into s_argv.
// Will cut off arguments over MAX_ARGV_COUNT.
char **
merge_argv(char **s_argv, char **d_argv){
    int i=0, j=0;
    for (i=0; i<MAX_ARGV_COUNT; i++){
        if (s_argv[i]==NULL) break;
    }
    for (j=1; i<MAX_ARGV_COUNT; i++, j++){ // j start from 1. Omitting first d_argv.
        s_argv[i] = d_argv[j];
        if (d_argv[j]==NULL) break;
    }
    s_argv[MAX_ARGV_COUNT] = NULL;
    //TODO if i==MAX_ARGV_COUNT then exit(3)?
    return s_argv;
}

int
exist(const char *path) {
    struct stat stats;

    int ret = stat(path, &stats);

    if (ret==-1 && errno==ENOENT) {
        return 0;
    }
    return 1;
}

int
main (int d_argc/*Dynamic argument count*/,
        char *d_argv[]/*Dynamic argument vector*/) {
    setuid(0);
    int i=0;
    char **s_argv = split_ws(s_cmd); // Static argv from static command line.

    for (i=0; i<MAX_ARGV_COUNT;i++) {
        if (s_argv[i]==NULL) break;
    }
    int s_argc = i;
    if (s_argc==0) {
        // Allowing dynamic command only could give vulnerability.
        fprintf(stderr, "[Error] Empty command\n");
        return 1; // Disallow this, and it's safe now.
    }

#ifndef DISABLE_DARGV
    s_argv = merge_argv(s_argv, d_argv); // merge static + dynamic into s_argv
    s_argc = s_argc + d_argc - 1;
#endif

    //temp = path + "/" + s_argv[0]
    char *temp = calloc(strlen(path)+strlen(s_argv[0])+10, 1);
    strcpy(temp, path);
    strcat(temp, "/");
    strcat(temp, s_argv[0]);

    // In case command not found.
    if (!exist(temp)) {
        fprintf(stderr, "[Error] %s: command not found in path directory.\n", s_argv[0]);
        return 2;
    }

    execv(temp, s_argv); // NEVER use system() instead of direct exec.
}

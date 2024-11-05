#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <sys/stat.h>
#include <errno.h>

const int MAX_ARGV_COUNT = 256;


#ifdef BASE_PATH
const char *_BASE_PATH = BASE_PATH;
#else
// Default path
const char *_BASE_PATH = "/jfbcore/jf-bin/launcher_bins";
#endif


// Replace quote in string into empty string.
char *
remove_quote(char *s, int quote_type){
    int cnt = 0;
    int i = 0;
    char find = 0;
    if (quote_type==1) {
        find = '\'';
    } else {
        find = '"';
    }
    // s.replace(find, '')
    int len = strlen(s);
    for (i=0; i<len+1; i++) {
        s[i-cnt] = s[i];
        if (s[i]==find){
            cnt += 1;
        }
    }
    return s;
}


// For command splitting.
char **
split_argv(const char *ori){
    int i=0;
    int cnt = 0;
    const char *start = NULL;
    char **splitted = calloc(MAX_ARGV_COUNT+1, sizeof(char*));
    int inside_quote = 0; // 0: no quote wrapping. 1: inside of single quote. 2: inside of double quote.
    int need_quote_remove = 0;

    while (1){
        // Check if it is a whitespace or a NULL character
        int space = isspace(*(ori+i)) || *(ori+i)=='\0';
        // Check if it is a single quote
        int squote = *(ori+i)=='\'';
        // Check if it is a double quote
        int dquote = *(ori+i)=='"';

        if (inside_quote){ // Quote mode
            if (*(ori+i)=='\0') {
                // Unclosed quote error
                fprintf(stderr, "[Error] Unexpected EOF while looking for matching quote.\n");
                exit(3);
            }

            // Just look for matching quote.
            if ( (inside_quote==1 && squote) || 
                    (inside_quote==2 && dquote)) {
                need_quote_remove=inside_quote; // This will unset at the end character processing.
                inside_quote=0;
                // Switch back to Normal mode.
            }
            
        } else { // Normal mode
            // Find out start and end to be splitted.
            if (squote) inside_quote = 1;
            else if (dquote) inside_quote = 2;

            if (inside_quote) { // Switch into Quote mode
                if (start==NULL) {
                    start = ori+i+1;
                }
                i++;
                continue; // No longer Normal mode.
            }

            if (start==NULL && !space) { //start character
                start = ori+i;
            } else if (start!=NULL && space) { //end character
                const char *end = ori+i-1;
                size_t len = end-start+1;
                char * new = strncpy(malloc(len+1), start, len);
                new[len]='\0';
                if (need_quote_remove) {
                    int quote_type = need_quote_remove;
                    new = remove_quote(new, quote_type);
                    need_quote_remove = 0;
                }
                splitted[cnt++] = new;
                start = NULL;
            }

            // break case
            if (*(ori+i)=='\0')
                break;
            else if (cnt == MAX_ARGV_COUNT)
                // Cut off the remain
                //TODO exit(2)?
                break; 
        }
        i++;
    }
    return splitted;
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

// This callocs a new memory for return string.
const char *
join(const char *dir1, const char *dir2){ //FIXME Simple concat -> real join
    //temp = path + "/" + s_argv[0]
    char *temp = calloc(strlen(dir1)+strlen(dir2)+10, 1);
    strcpy(temp, dir1);
    strcat(temp, "/");
    strcat(temp, dir2);
    return temp;
}

// This callocs a new memory for return string.
const char *
join_space(const char *dir1, const char *dir2){ //FIXME change function name
    //temp = path + " " + s_argv[0]
    char *temp = calloc(strlen(dir1)+strlen(dir2)+10, 1);
    strcpy(temp, dir1);
    strcat(temp, " ");
    strcat(temp, dir2);
    return temp;
}

int
main (int argc, char *argv[]) {
    if (argc>2 && !strcmp("-c", argv[1])){
        // argv[2] = argv[2].split("/")[-1]
        int i=0;
        char **program_argv = split_argv(argv[2]);
        char *program_argv_0 = program_argv[0];
        for (i=0; i<(int)strlen(program_argv[0]); i++) {
            if (program_argv[0][i]=='/') {
                program_argv_0 = program_argv[0]+i+1;
            }
        }
        program_argv[0] = program_argv_0;

        // Check if the command available and exec.
        const char *program_path = join(_BASE_PATH, program_argv[0]);
        if (!exist(program_path)){
            fprintf(stderr, "[Error] %s: command not found in the directory.\n", program_argv[0]);
            return 2;
        } else {
#ifdef VERBOSE
            // Verbose the command
            fprintf(stderr, "Excuting command:");
            for (i=0; i<argc-2;i++) {
                fprintf (stderr, " %s", program_argv[i]);
            }
            fprintf(stderr, "\n");
#endif
            execv(program_path, program_argv); // NEVER use system() instead of direct exec.

        }
    } else {
        fprintf(stderr, "Not supported yet.\n"); exit(1);
        //TODO
        //printf(">");
        //fgets(s , 1024, stdin)
    }


}

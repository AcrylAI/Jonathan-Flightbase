// launcher in C++ ... kinda

// C++ STD libraries
#include <iostream>
#include <sstream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>

// C libraries 
#include <cstdio> 
#include <cstdlib>
#include <cstring>

// POSIX libraries
#include <sys/stat.h>
#include <unistd.h>

#ifdef BASE_PATH
std::string _BASE_PATH = BASE_PATH;
#else
// Default path
std::string _BASE_PATH = "/jfbcore/jf-bin/launcher_bins";
#endif

const int MAX_ARGV_COUNT = 256;


void c_str_arr_to_std_str_vec(std::vector<std::string>& vector_to_use, int sizeOfInput, char* input[])
{
    for(int i=0; i<sizeOfInput; i++)
    {
        std::string inputToAdd = input[i];
        vector_to_use.push_back(inputToAdd);
    }
}

bool exist(std::string path) 
{
    std::ifstream temp_file;
    temp_file.open(path);
    if(temp_file) return true;
    return false;
}

// Replace ' or " in string into empty string.
// quote_type 1 for ', everything else for "
char * remove_quote(char *s, int quote_type)
{
    std::string s_str(s);
    char find;
    if (quote_type==1) find = '\'';    
    else find = '"';
    s_str.erase(std::remove(s_str.begin(), s_str.end(), find), s_str.end());
    return strdup(s_str.c_str());
}

// For command splitting.
char ** split_argv(const char *ori, int &size){
    int i=0;
    int cnt = 0;
    const char *start = NULL;
    char **splitted = (char **) calloc(MAX_ARGV_COUNT+1, sizeof(char*));
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
                
                char * new_str = strncpy((char*)malloc(len+1), start, len);
                new_str[len]='\0';
                if (need_quote_remove) {
                    int quote_type = need_quote_remove;
                    new_str = remove_quote(new_str, quote_type);
                    need_quote_remove = 0;
                }
                splitted[cnt++] = new_str;
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
    size = cnt;
    return splitted;
}

int main(int argc, char* argv[])
{
    std::vector<std::string> convertedInput;
    c_str_arr_to_std_str_vec(convertedInput,argc,argv);
    if(argc > 2 && convertedInput[1] == "-c")
        {
            std::vector<std::string> tokenizedInput;
            int size;
            char **program_argv = split_argv(argv[2],size);
            tokenizedInput.push_back("sudo");
            c_str_arr_to_std_str_vec(tokenizedInput,size,program_argv);
            std::string filePath = (_BASE_PATH + "/" + tokenizedInput[1]);
            bool truthValue = !exist(filePath);
            if(tokenizedInput[1].find("mfs") == 0)
            {
                truthValue = false;
            }
            if(truthValue)
            {
                fprintf(stderr, "[Error] %s: command not found in the directory.\n", tokenizedInput[1].c_str());
                return 2;
            }
            else
            {
            tokenizedInput[1] = filePath;
                #ifdef VERBOSE
                    fprintf(stderr, "Executing command:");
                    for (int i=2; i<argc;i++) 
                    {
                        fprintf (stderr, " %s", convertedInput[i].c_str());
                    }
                    fprintf(stderr, "\n");
                #endif 
                std::vector<const char *> tokenizedInputCString(tokenizedInput.size());
                std::transform(tokenizedInput.begin(), tokenizedInput.end(), tokenizedInputCString.begin(), std::mem_fun_ref(&std::string::c_str));
                tokenizedInputCString.push_back(NULL);
                execv("/usr/bin/sudo",const_cast<char* const *>(tokenizedInputCString.data()));
            } 
    }
    else
    {
        fprintf(stderr, "Not supported yet.\n"); 
        exit(1);
    }    
    return 0;
}
//
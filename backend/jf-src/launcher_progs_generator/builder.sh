#!/bin/bash

USER=launcher


SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`


if [ $# -eq 4 ]
then
  sudo gcc $BASE_DIR/main.c -march=x86-64 -o "$3" -Wall -Wextra -D'BIN_PATH="'"$1"'"' -D'CMD_TO_RUN="'"$2"'"' -DDISABLE_DARGV && 
  sudo chown root:$USER "$3" &&
  sudo chmod 4550 "$3" &&
  echo "Build Complete"
elif [ $# -eq 3 ]
then
  sudo gcc $BASE_DIR/main.c -march=x86-64 -o "$3" -Wall -Wextra -D'BIN_PATH="'"$1"'"' -D'CMD_TO_RUN="'"$2"'"' && 
  sudo chown root:$USER "$3" &&
  sudo chmod 4550 "$3" &&
  echo "Build Complete"
elif [ $# -eq 2 ]
then
  sudo gcc $BASE_DIR/main.c -march=x86-64 -o $BASE_DIR/test -Wall -Wextra -D'BIN_PATH="'"$1"'"' -D'CMD_TO_RUN="'"$2"'"' && 
  sudo chown root:$USER $BASE_DIR/test &&
  sudo chmod 4550 $BASE_DIR/test &&
  echo "Build Complete"
elif [ $# -eq 1 ]
then
  sudo gcc $BASE_DIR/main.c -march=x86-64 -o $BASE_DIR/test -Wall -Wextra -D'CMD_TO_RUN="'"$1"'"' && 
  sudo chown root:$USER $BASE_DIR/test &&
  sudo chmod 4550 $BASE_DIR/test &&
  echo "Build Complete"
else
  sudo gcc $BASE_DIR/main.c -march=x86-64 -o $BASE_DIR/test -Wall -Wextra &&
  sudo chown root:$USER $BASE_DIR/test &&
  sudo chmod 4550 $BASE_DIR/test &&
  echo "Build Complete"
fi

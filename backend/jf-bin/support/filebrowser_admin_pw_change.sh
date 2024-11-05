#!/bin/bash
# while getopts "n:" opt; do
#     case $opt in
#         n)
#             echo "Option -n is set"
#             echo $OPTARG
#             new_password="$OPTARG"
#             ;;
#         \?)
#             echo "Invalid option: -$OPTARG"
#             exit 1
#             ;;
#     esac
# done
cd $JF_HOME/src/.filebrowser/

pwd

process_name="filebrowser"

pid=$(pidof $process_name)

echo  "filebrowser pid : $pid" 

# echo "new password : $new_password"

VAR_NAME="FILEBROWSER_RUNNING_CMD"



if [ -z "$pid" ]; then
    # 실행중이 아니라면
    if [ -z "${!VAR_NAME}" ]; then
        echo "filebrowser is not running and env setting error"
        touch /pod-status/.error
        exit 1
    else
        $FILEBROWSER_BINARYPATH users update $user_id -p "$new_password"
        if [ $? -eq 0 ]; then
          echo "The command succeeded."
          echo "" > /password_change_faile.log
        else
          echo "The command failed with exit code $?."
          echo "Password change Faile because user id wrong($user_id)" > /password_change_faile.log
        fi
        $FILEBROWSER_RUNNING_CMD &
        exit 0
    fi
fi
# 실행중이라면 

# 환경 변수가 설정되어 있는지 확인
if [ -z "${!VAR_NAME}" ]; then
  echo "$VAR_NAME is not set."
  FILEBROWSER_RUNNING_CMD=$(cat /proc/$pid/cmdline | tr "\000" " ")
  echo "filebrowser cmd : $FILEBROWSER_RUNNING_CMD" 
  FILEBROWSER_BINARYPATH=$(echo $FILEBROWSER_RUNNING_CMD | cut -d " " -f1)
  echo "filebrowser path : $FILEBROWSER_BINARYPATH" 
else
  echo "$VAR_NAME is set to ${!VAR_NAME}"
fi

kill -9 $pid

$FILEBROWSER_BINARYPATH users update $user_id -p "$new_password"
if [ $? -eq 0 ]; then
  echo "The command succeeded."
  echo "" > /password_change_faile.log
else
  echo "The command failed with exit code $?."
  echo "Password change Faile because user id wrong($user_id)" > /password_change_faile.log
fi

$FILEBROWSER_RUNNING_CMD &
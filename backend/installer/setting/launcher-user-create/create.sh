#!/bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

# Add Group launcher & User launcher
groupadd --gid $LAUNCHER_GID $LAUNCHER_GNAME
# echo "$LAUNCHER_PASSWORD:$LAUNCHER_PASSWORD" | tr ':' '\n' | useradd --home-dir $LAUNCHER_HOME --shell $LOGIN_SHELL --no-create-home --uid $LAUNCHER_UID --gid $LAUNCHER_GID $LAUNCHER_UNAME
useradd --home-dir $LAUNCHER_HOME --shell $LOGIN_SHELL --no-create-home --uid $LAUNCHER_UID --gid $LAUNCHER_GID $LAUNCHER_UNAME
echo "$LAUNCHER_PASSWORD:$LAUNCHER_PASSWORD" | tr ':' '\n' | passwd $LAUNCHER_UNAME

rm -f $LOGIN_SHELL
g++ $LAUNCHER_SRC/main.cpp -std=c++11 -o $LOGIN_SHELL -D"BASE_PATH=\"$LAUNCHER_HOME\""

python3 $LAUNCHER_SRC/sudoer.py
if [ $? -gt 0 ]
then
    python $LAUNCHER_SRC/sudoer.py
fi

# key 생성
ssh-keygen -N "" <<< $'\n' -f $LAUNCHER_PRIVATE_KEY  <<< $'y'
cp $LAUNCHER_PUBLIC_KEY  $LAUNCHER_AUTHORIZED_KEYS
chown $LAUNCHER_UNAME:$LAUNCHER_UNAME $LAUNCHER_HOME/.ssh/*

#usermod -a -G docker $LAUNCHER_UNAME

#!/bin/bash
#launcher_bins 안에 .kube/ 가 필요한지 확인 필요 (연결 문제가 발생했었음. ( Master 케이스에서 ?))

JFBCORE_ROOT=/jfbcore
LAUNCHER_BINS_DIR=$JFBCORE_ROOT/jf-bin/launcher_bins
LAUNCHER_HOME=$LAUNCHER_BINS_DIR
LOGIN_SHELL=$JFBCORE_ROOT/jf-bin/launcher
LAUNCHER_UNAME=launcher
LAUNCHER_GNAME=launcher
LAUNCHER_UID=2020
LAUNCHER_GID=2020
PASSWORD="qwerty" # Don't use `:'. it will be used as a delimiter.

# Add Group launcher & User launcher
groupadd --gid $LAUNCHER_GID $LAUNCHER_GNAME
# echo "$PASSWORD:$PASSWORD" | tr ':' '\n' | useradd --home-dir $LAUNCHER_HOME --shell $LOGIN_SHELL --no-create-home --uid $LAUNCHER_UID --gid $LAUNCHER_GID $LAUNCHER_UNAME
useradd --home-dir $LAUNCHER_HOME --shell $LOGIN_SHELL --no-create-home --uid $LAUNCHER_UID --gid $LAUNCHER_GID $LAUNCHER_UNAME
echo "$PASSWORD:$PASSWORD" | tr ':' '\n' | passwd $LAUNCHER_UNAME

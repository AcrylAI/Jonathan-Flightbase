#!/bin/bash
SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`  

PY_PARAM=$@

# $BASE_DIR = sh file's PWD
#### USER CODE DEFINE ####
# /home/USER/src/pytorch_synthetic_benchmark_ddp.py
# >> IN JOB
# /src/pytorch_synthetic_benchmark_ddp.py

# PY
MY_PY=$BASE_DIR/pytorch_synthetic_benchmark_ddp.py  # <<< 

##########################

MASTER_ADDR=$MASTER_ADDR # Provided by SYSTEM
MASTER_PORT=$MASTER_PORT # Provided by SYSTEM
NODE_RANK=$OMPI_COMM_WORLD_RANK # Provided by SYSTEM
NNODES=$OMPI_COMM_WORLD_SIZE # Provided by SYSTEM
NPROC_PER_NODE=1 # must be 1. (if Run by System)
LOCAL_RANK="--local_rank $OMPI_COMM_WORLD_LOCAL_RANK" # Provided by SYSTEM

python -m torch.distributed.launch \
    --nproc_per_node $NPROC_PER_NODE --nnodes $NNODES --node_rank $NODE_RANK --master_addr $MASTER_ADDR --master_port $MASTER_PORT \
    $MY_PY $LOCAL_RANK $PY_PARAM

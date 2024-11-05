SCRIPT=$( readlink -m $( type -p $0 ))
BASE_DIR=`dirname ${SCRIPT}`  
python3 -u $BASE_DIR/pytorch_synthetic_benchmark.py
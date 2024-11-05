#!/bin/bash

while getopts ":s:d:" opts; do 
    case $opts in 
            # o)
            #     #echo ${$OPTARG}
            #     option=$OPTARG
            #     ;;
        s)
            source=$OPTARG
            ;;
        d)
            destination=$OPTARG
            ;;
    esac
done

#echo ${source}*

echo $destination

#echo rsync -avP ${source}/* $destination

for f in ${source}/*
do
    echo $f
    rsync -avP $f $destination > /dev/null
done

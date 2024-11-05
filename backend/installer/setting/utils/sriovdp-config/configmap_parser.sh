#!/bin/bash

subsystem=$(lspci -nnk | grep Virtual | awk '{ print $NF }' | head -1)
echo $subsystem

subsystem=$(echo $subsystem | sed -e 's/\[//g' | sed -e 's/\]//g')

SAVEIFS=$IFS
IFS=$":"
subsystem=($subsystem)
IFS=$SAVEIFS

echo vendors : ${subsystem[0]}
echo devices : ${subsystem[1]}


# apiVersion: v1
# kind: ConfigMap
# metadata:
#   name: sriovdp-config
#   namespace: kube-system
# data:
#   config.json: |
#     {
#         "resourceList": [
#             {
#                 "resourceName": "ib",
#                 "resourcePrefix": "",
#                 "selectors": {
#                     "vendors": ["15b3"],
#                     "devices": ["101a"],
#                     "drivers": ["mlx5_core"]
#                 }
#             }
#         ]
#     }

# c2:00.2 Infiniband controller [0207]: Mellanox Technologies MT28800 Family [ConnectX-5 Ex Virtual Function] [vendors:devices]
#         Subsystem: Mellanox Technologies MT28800 Family [ConnectX-5 Ex Virtual Function] [15b3:0002]

# c2:00.0 Infiniband controller [0207]: Mellanox Technologies MT28800 Family [ConnectX-5 Ex] [15b3:1019]
#         Subsystem: Mellanox Technologies MT28800 Family [ConnectX-5 Ex] [15b3:0002]
# c2:00.1 Infiniband controller [0207]: Mellanox Technologies MT28800 Family [ConnectX-5 Ex] [15b3:1019]
#         Subsystem: Mellanox Technologies MT28800 Family [ConnectX-5 Ex] [15b3:0002]
# c2:00.2 Infiniband controller [0207]: Mellanox Technologies MT28800 Family [ConnectX-5 Ex Virtual Function] [15b3:101a]
#         Subsystem: Mellanox Technologies MT28800 Family [ConnectX-5 Ex Virtual Function] [15b3:0002]
# c2:00.3 Infiniband controller [0207]: Mellanox Technologies MT28800 Family [ConnectX-5 Ex Virtual Function] [15b3:101a]
#         Subsystem: Mellanox Technologies MT28800 Family [ConnectX-5 Ex Virtual Function] [15b3:0002]

#!/bin/bash
. ../parser.sh

# 1. Default Package install
cd default

./installer.sh
cd ..

# 2. Docker Package install
cd docker
./installer.sh
cd ..

# 3. Nvidia-Docker Package install
cd nvidia-docker
./installer.sh
cd ..

# 4. Kubernetes Package install
cd kubernetes
./installer.sh
cd ..

# 5. NFS Package install
cd nfs
./installer.sh
cd ..

# 6. OFED Package install (Optional)
if [[ "$OFED_INSTALL" != "False" ]]
then
    echo $OFED_INSTALL
    cd ofed
    echo RUN OFED INSTALL
    cd ..
    
    cd ofed_nv_peer_mem
    echo RUN nv_peer_mem install
    cd ..
else
    echo OFED_INSTALL SKIP
fi

# 7. MFS Package install (Optional)
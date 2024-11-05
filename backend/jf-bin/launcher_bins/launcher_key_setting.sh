:<<'END'
# 사용하려는 계정 ssh-keygen 생성
sudo -u {계정이름} ssh-keygen -N "" <<< $'\n' -f {/etc/passwd 계정 홈 디렉토리}/.ssh/id_rsa  <<< $'y'
# public key -> authorized_keys
cp {/etc/passwd 계정 홈 디렉토리}/.ssh/id_rsa.pub  {/etc/passwd 계정 홈 디렉토리}/.ssh/authorized_keys
# private key -> /jfbcore/jf-bin/launcher_bins
cp {/etc/passwd 계정 홈 디렉토리}/.ssh/id_rsa  /jfbcore/jf-bin/launcher_bins
END

# 계정이름 launcher_new라고 가정 (launcher_new 라는 계정이 이미 있다고 가정)
sudo -u launcher_new ssh-keygen -N "" <<< $'\n' -f /home/launcher_new/.ssh/id_rsa  <<< $'y'
cp /home/launcher_new/.ssh/id_rsa.pub  /home/launcher_new/.ssh/authorized_keys
cp /home/launcher_new/.ssh/id_rsa  /jfbcore/jf-bin/launcher_bins
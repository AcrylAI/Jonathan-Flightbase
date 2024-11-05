if jq -e '.["exec-opts"]' /etc/docker/daemon.json > /dev/null; then
    jq '.["exec-opts"] = ["native.cgroupdriver=systemd"]' /etc/docker/daemon.json > tmp.json && mv tmp.json /etc/docker/daemon.json
else
    jq '. + { "exec-opts": ["native.cgroupdriver=systemd"] }' /etc/docker/daemon.json > tmp.json && mv tmp.json /etc/docker/daemon.json
fi

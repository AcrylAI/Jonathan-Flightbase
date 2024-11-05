# Official Docs from https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/

# Download kubeadm, kubelet, kubectl
RELEASE="v1.17.4"
ARCH="amd64"
sudo curl -L --remote-name-all https://dl.k8s.io/release/${RELEASE}/bin/linux/${ARCH}/{kubeadm,kubelet,kubectl}
sudo chmod +x {kubeadm,kubelet,kubectl}
sudo mv kubeadm kubelet kubectl /usr/bin

# Get configs
RELEASE_VERSION="v0.16.2"
curl -sSL "https://raw.githubusercontent.com/kubernetes/release/${RELEASE_VERSION}/cmd/krel/templates/latest/kubelet/kubelet.service" | sudo tee /usr/lib/systemd/system/kubelet.service
sudo mkdir -p /usr/lib/systemd/system/kubelet.service.d
curl -sSL "https://raw.githubusercontent.com/kubernetes/release/${RELEASE_VERSION}/cmd/krel/templates/latest/kubeadm/10-kubeadm.conf" | sudo tee /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf

# Additional plugin binaries for container networking
sudo wget https://github.com/containernetworking/plugins/releases/download/v1.2.0/cni-plugins-linux-amd64-v1.2.0.tgz
sudo mkdir -p /opt/cni/bin
tar -xzf cni-plugins-linux-amd64-v1.2.0.tgz -C /opt/cni/bin ./host-local ./ipvlan ./macvlan
sudo rm cni-plugins-linux-amd64-v1.2.0.tgz

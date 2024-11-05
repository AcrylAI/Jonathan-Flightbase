#!/usr/bin/python

def add_sudoer():
    string_to_add = '''launcher ALL=(root) NOPASSWD: /jfbcore/jf-bin/launcher_bins/docker
launcher ALL=(root) NOPASSWD: /jfbcore/jf-bin/launcher_bins/kubeadm
launcher ALL=(root) NOPASSWD: /jfbcore/jf-bin/launcher_bins/kubectl
launcher ALL=(root) NOPASSWD: /jfbcore/jf-bin/launcher_bins/network_interfaces
launcher ALL=(root) NOPASSWD: /jfbcore/jf-bin/launcher_bins/ngc
launcher ALL=(root) NOPASSWD: /jfbcore/jf-bin/launcher_bins/rm_cni
launcher ALL=(root) NOPASSWD: /jfbcore/jf-bin/launcher_bins/dmidecode
'''
    with open('/etc/sudoers', 'r+') as sudoer_file:
        if 'launcher' in sudoer_file.read():
            print("launcher is already included in the sudoers file")
            return None
        sudoer_file.write(string_to_add)

def main():
    add_sudoer()

main()

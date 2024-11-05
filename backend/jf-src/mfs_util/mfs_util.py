#!/usr/bin/env python3
import subprocess
import shutil
import socket
import json
import sys
import re
import os

class MfsUtil():
    divide_by = float(1 << 30)

    def parse_findmnt(self):
        toReturn = list()
        try:
            for line in str(subprocess.check_output(
                    'findmnt -blo source,target,fstype,label,options,size,used,avail,use% -t ext4,xfs,zfs,btrfs',
                    shell=True, stderr=subprocess.STDOUT, universal_newlines=True)).splitlines():
                if line[0] == 'S':
                    continue
                split_line = line.split()
                toReturn.append(
                    {"name": split_line[0], "mountpoint": split_line[1], "fstype": split_line[2],
                     "total": split_line[4],
                     "used": split_line[5], "free": split_line[6], "percent": split_line[7]})
        except:  # CentOS 7에 포함된 findmnt 구버전 대응, 구버전은 -b 옵션이 없음
            for line in str(subprocess.check_output(
                    'findmnt -lo source,target,fstype,label,options,size,used,avail,use% -t ext4,xfs,zfs,btrfs',
                    shell=True, universal_newlines=True)).splitlines():
                if line[0] == 'S':
                    continue
                split_line = line.split()
                for i in range(4, 7):
                    number_to_convert = split_line[i]
                    if 'P' in number_to_convert:
                        split_line[i] = str(int(float(re.sub('[^0-9.]', '', number_to_convert)) * 1125899906842624))
                    elif 'T' in number_to_convert:
                        split_line[i] = str(int(float(re.sub('[^0-9.]', '', number_to_convert)) * 1099511627776))
                    elif 'G' in number_to_convert:
                        split_line[i] = str(int(float(re.sub('[^0-9.]', '', number_to_convert)) * 1073741824))
                    elif 'M' in number_to_convert:
                        split_line[i] = str(int(float(re.sub('[^0-9.]', '', number_to_convert)) * 1048576))
                    elif 'K' in number_to_convert:
                        split_line[i] = str(int(float(re.sub('[^0-9.]', '', number_to_convert)) * 1024))
                toReturn.append(
                    {"name": split_line[0], "mountpoint": split_line[1], "fstype": split_line[2],
                     "total": split_line[4],
                     "used": split_line[5], "free": split_line[6], "percent": split_line[7]})
        return toReturn

    def partitionList(self):
        return json.dumps(self.parse_findmnt())

    def python_version(self):
        ver = str(sys.version_info[0]) + '.' + str(sys.version_info[1])
        return ver

    def get_partition_type(self, path):
        try:
            return subprocess.check_output("df -T " + path, shell=True).decode('ascii').splitlines()[1].split()[1]
        except:
            return "N/A"

    def get_io_stat(self):
        partition_label = subprocess.check_output('''df /jfbcore | grep "dev"''', shell=True).decode('ascii').split()[0]
        disk_label = subprocess.check_output('''lsblk -no pkname ''' + partition_label, shell=True).decode(
            'ascii').rstrip()
        io_read = int(subprocess.check_output("cat /sys/block/" + disk_label + "/stat", shell=True).decode(
            'ascii').rstrip().split()[0])
        io_write = int(subprocess.check_output("cat /sys/block/" + disk_label + "/stat", shell=True).decode(
            'ascii').rstrip().split()[4])
        return json.dumps([io_read, io_write])

    def get_workspace_mount_stat(self):
        toReturn = []
        try:
            output = subprocess.check_output('df -h | grep "/jfbcore/jf-data/workspaces"', shell=True).decode(
                'ASCII').rstrip().split()
            toReturn.append([str(output[0]).split(':')[0], str(output[1]), str(output[2]), str(output[4])])
        except:
            toReturn.append(["", "", "", ""])
        return (json.dumps(toReturn))

    def chunk_mfs_mount(self, mountpoint: str):
        shutil.chown(mountpoint, user="mfs", group="mfs")
        os.chmod(mountpoint, 0o770)
        mfs_file = open("/etc/mfs/mfshdd.cfg", "a")
        mfs_file.write('\n')
        mfs_file.write(mountpoint)
        mfs_file.close()
        os.system("systemctl restart moosefs-chunkserver.service")

    def chunk_mfs_unmount(self, mountpoint: str):
        if mountpoint == '/':
            mountpoint = "//loop"
        with open('/etc/mfs/mfshdd.cfg', 'r') as file:
            data = file.readlines()
        count = 0
        toWrite = []
        while count < len(data):
            if data[count].startswith(mountpoint):
                pass
            else:
                toWrite.append(data[count])
            count = count + 1
        toWrite.append('\n')
        toWrite.append('*' + mountpoint)
        with open('/etc/mfs/mfshdd.cfg', 'w') as file:
            file.writelines(toWrite)
        os.system("systemctl restart moosefs-chunkserver.service")

    def chunk_mfs_mount_notempty(self, mountpoint: str):
        os.mkdir(mountpoint + "/loop")
        shutil.chown(mountpoint + "/loop", user="mfs", group="mfs")
        os.chmod(mountpoint + "/loop", 0o770)
        mfs_file = open("/etc/mfs/mfshdd.cfg", "a")
        mfs_file.write('\n')
        mfs_file.write(mountpoint + "/loop")
        mfs_file.close()
        os.system("systemctl restart moosefs-chunkserver.service")

    def chunk_set_master(self, master_to_add: str):
        this_host_name = socket.gethostname()
        if (this_host_name == master_to_add):
            print("Invalid master hostname")
            sys.exit()
        elif (master_to_add == "localhost"):
            print("Invalid master hostname")
            sys.exit()
        elif (master_to_add == "127.0.0.1"):
            print("Invalid master ip address")
            sys.exit()
        elif (master_to_add == "127.0.1.1"):
            print("Invalid master ip address")
            sys.exit()
        else:
            chunk_file = open("/etc/mfs/mfschunkserver.cfg", "a")
            chunk_file.write("MASTER_HOST = " + master_to_add)
            chunk_file.write('\n')
            chunk_file.close()
            os.chmod("/etc/mfs/mfschunkserver.cfg", 0o770)
            os.system("systemctl restart moosefs-chunkserver.service")

    def mount_workspaces(self, master_to_mount: str = ""):
        if len(os.listdir('/jfbcore/jf-data/workspaces')) == 0:
            if master_to_mount == "":
                os.system("mfsmount -S /workspaces /jfbcore/jf-data/workspaces")
            else:
                os.system("mfsmount -H " + master_to_mount + " -S /workspaces /jfbcore/jf-data/workspaces")
            print(1)
        else:
            print(0)

    def master_get_chunk_disksize(self):
        output_lines = list()
        output = {"total": [0, 0, 0]}
        # print(subprocess.check_output('mfscli -H mfsmaster -SHD | grep ""', shell=True).decode('ascii').splitlines())
        for out in subprocess.check_output('mfscli -H mfsmaster -SHD | grep ""', shell=True).decode(
                'ascii').splitlines():
            toPush = list()
            for item in out.split():
                toPush.append(item.split(":", 1)[0])
            if toPush[14] == '-':
                toPush[14] = 0
            try:
                if toPush[15] == '-':
                    toPush[15] = 0
            except:
                toPad = [toPush[13]] * (16 - len(toPush))
                toPush = toPush + toPad
            try:
                if toPush[1] not in output:
                    if toPush[3] == "no":
                        output[toPush[1]] = [int(toPush[14]), int(toPush[15]), 0]
                    else:
                        output[toPush[1]] = [int(toPush[14]), int(toPush[15]), 1]
                        output["total"][2] = 1
                    output["total"][0] += int(toPush[14])
                    output["total"][1] += int(toPush[15])
                else:
                    if toPush[3] == "no":
                        output[toPush[1]][0] = output[toPush[1]][0] + int(toPush[14])
                        output[toPush[1]][1] = output[toPush[1]][1] + int(toPush[15])
                    else:
                        output[toPush[1]][0] += int(toPush[14])
                        output[toPush[1]][1] += int(toPush[15])
                        output[toPush[1]][2] = 1
                        output["total"][2] = 1
                    output["total"][0] += int(toPush[14])
                    output["total"][1] += int(toPush[15])
                output_lines.append(toPush)  # reserved for later use
            except:
                sys.exit()
        return json.dumps(output)

    def verify_status(self):
        try:
            output = str(subprocess.check_output('systemctl | grep "moose"', shell=True))
            if 'chunk' in str(output):
                if 'chunk' in str(output):
                    return True
            return False
        except:
            return False

    def get_status(self):
        output = (subprocess.check_output('mfscli -H mfsmaster -SHD | grep ""', shell=True)).decode(
            'ascii').splitlines()
        toReturn = {"read": 0, "write": 0, "total": 0, "used": 0}
        for line in output:
            node = line.split('\t')
            if not (node[5] == '-'):
                toReturn["read"] = toReturn["read"] + int(node[5])
            if not (node[6] == '-'):
                toReturn["write"] = toReturn["write"] + int(node[6])
            toReturn["used"] = toReturn["used"] + int(node[13])
            toReturn["total"] = toReturn["total"] + int(node[14])
        return json.dumps(toReturn)

    def get_partitions(self):
        output = (subprocess.check_output('mfscli -H mfsmaster -SHD | grep ""', shell=True)).decode(
            'ascii').splitlines()
        toReturn = {}
        for line in output:
            node = line.split('\t')
            node_info = node[1].split(':')
            node_ip = node_info[0]
            node_partition = node_info[2]
            if 'loop' in node_partition:
                node_partition = '/'
            if not node_ip in toReturn:
                toReturn[node_ip] = [{"partition": node_partition, "used": (int(node[13]) / self.divide_by),
                                      "total": int(node[14]) / self.divide_by, "status": node[3]}]
            else:
                toReturn[node_ip].append([{"partition": node_partition, "used": int(node[13]) / self.divide_by,
                                           "total": int(node[14]) / self.divide_by, "status": node[3]}])
        return json.dumps(toReturn)

    def get_nfs_info(self):
        toReturn = {}
        try:
            output = \
                str(subprocess.check_output('nfsstat -m | grep "vers"', shell=True,
                                            universal_newlines=True)).splitlines()[
                    0].split(',')
        except:
            return (toReturn)
        for stuff in output:
            if ':' in stuff:
                toReturn["flag"] = stuff.split(':')[1][1:]
            elif '=' in stuff:
                split_stuff = stuff.split('=')
                toReturn[split_stuff[0]] = split_stuff[1]
        return (json.dumps(toReturn))

    def set_ws_quota(self, workspace_name, quota, unit):
        quota = float(int(quota) * 1.074)
        try:
            if os.path.exists("/jfbcore/jf-data/workspaces/" + workspace_name):
                (subprocess.check_output(
                    "mfssetquota -S " + str(quota) + unit + " /jfbcore/jf-data/workspaces/" + workspace_name,
                    shell=True, universal_newlines=True)).splitlines()[0].split('|')
            else:
                os.makedirs("/jfbcore/jf-data/workspaces/" + workspace_name)
                (subprocess.check_output(
                    "mfssetquota -S " + str(quota) + unit + " /jfbcore/jf-data/workspaces/" + workspace_name,
                    shell=True, universal_newlines=True)).splitlines()[0].split('|')
            output = subprocess.check_output("mfsgetquota -h /jfbcore/jf-data/workspaces/" + workspace_name,
                                             shell=True).splitlines()[3].decode("utf-8").split('|')
            used = output[1].strip()
            quota = output[3].strip().replace("i", "")
            return json.dumps({"size": {"used": used, "quota": quota}, "error": 0})
        except:
            return json.dumps({"size": {"used": "0B", "quota": "0B"}, "error": 1})

    def get_ws_quota(self, workspace_name):
        try:
            if os.path.exists("/jfbcore/jf-data/workspaces/" + workspace_name):
                output = subprocess.check_output("mfsgetquota -h /jfbcore/jf-data/workspaces/" + workspace_name,
                                                 shell=True).splitlines()[3].decode("utf-8").split('|')
                used = output[1].strip()
                quota = output[3].strip().replace("i", "")
                return json.dumps({"size": {"used": used, "quota": quota}, "error": 0})
            else:  # 해당 폴더 없음
                return json.dumps({"size": {"used": "0B", "quota": "0B"}, "error": 1})
        except:  # mfsgetquota 없음
            return json.dumps({"size": {"used": "0B", "quota": "0B"}, "error": 1})

    def get_ip(self):
        toReturn = []
        try: #GNU hostname의 ip 출력 사용
            output = subprocess.check_output("hostname -I", shell=True, stderr=subprocess.STDOUT).decode("ascii").rstrip().split()
        except: # GNU hostname이 없는 경우(UNIX 혹은 GNU 툴을 안 쓰는 리눅스)
            try:
                output = subprocess.check_output('''ifconfig | grep "inet " | grep -v 127.0.0.1 | cut -d\  -f2''', shell=True).decode("ascii").rstrip().split()
            except:
                output = []
        for ip in output:
            if not ':' in ip:
                toReturn.append(ip)
        if not len(toReturn) == 0:
            return json.dumps({"ip": toReturn, "error": 0})
        else:
            json.dumps({"ip": toReturn, "error": 1})

def main():
    mfs_util_instance = MfsUtil()
    try:
        mfs_mode = sys.argv[1]
    except:
        sys.stderr.write("mfs_util: missing operand\n")
        sys.stderr.write("Try 'mfs_util help' for more information.\n")
        sys.exit()
    if (mfs_mode == "list"):
        print(mfs_util_instance.partitionList())
    elif (mfs_mode == "python_ver"):
        print(mfs_util_instance.python_version())
    elif (mfs_mode == "mount"):
        mfs_util_instance.chunk_mfs_mount(sys.argv[2])
    elif (mfs_mode == "mount_and_set_master"):
        mfs_util_instance.chunk_mfs_mount(sys.argv[2])
        mfs_util_instance.chunk_set_master(sys.argv[3])
        print(mfs_util_instance.verify_status())
    elif (mfs_mode == "mount_nmt"):
        mfs_util_instance.chunk_mfs_mount_notempty(sys.argv[2])
    elif (mfs_mode == "mount_nmt_and_set_master"):
        mfs_util_instance.chunk_mfs_mount_notempty(sys.argv[2])
        mfs_util_instance.chunk_set_master(sys.argv[3])
        print(mfs_util_instance.verify_status())
    elif (mfs_mode == "set_master"):
        mfs_util_instance.chunk_set_master(sys.argv[2])
    elif (mfs_mode == "list_chunk"):
        print(mfs_util_instance.master_get_chunk_disksize())
    elif (mfs_mode == "get_ip"):
        print(mfs_util_instance.get_ip())
    elif (mfs_mode == "get_status"):
        print(mfs_util_instance.get_status())
    elif (mfs_mode == "get_iostat"):
        print(mfs_util_instance.get_io_stat())
    elif (mfs_mode == "get_workspace_mnt_stat"):
        print(mfs_util_instance.get_workspace_mount_stat())
    elif (mfs_mode == "get_partition"):
        print((mfs_util_instance.get_partitions()))
    elif (mfs_mode == "get_partition_type"):
        print(mfs_util_instance.get_partition_type(sys.argv[2]))
    elif (mfs_mode == "get_ws_quota"):
        try:
            print(mfs_util_instance.get_ws_quota(sys.argv[2]))
        except:
            sys.stderr.write("example: get_ws_quota workspace_name\n")
            sys.stderr.write(json.dumps({"size": {"used": "0B", "quota": "0B"}, "error": 1}))
            sys.exit()
    elif (mfs_mode == "set_ws_quota"):
        try:
            print(mfs_util_instance.set_ws_quota(sys.argv[2], sys.argv[3], sys.argv[4]))
        except:
            sys.stderr.write("example: set_ws_quota workspace_name 10 G\n")
            sys.stderr.write(json.dumps({"size": {"used": "0B", "quota": "0B"}, "error": 1}))
            sys.exit()
    elif (mfs_mode == "get_nfs_info"):
        print(mfs_util_instance.get_nfs_info())
    elif (mfs_mode == "mount_workspace"):
        try:
            master_ip = sys.argv[2]
            mfs_util_instance.mount_workspaces(master_ip)
        except:
            mfs_util_instance.mount_workspaces()
    elif (mfs_mode == "mark_umount"):
        try:
            to_unmount = sys.argv[2]
            mfs_util_instance.chunk_mfs_unmount(to_unmount)
        except:
            print("err: no input")
    elif (mfs_mode == "help"):
        print("-Valid Options-")
        print("list: list mountable partitions")
        print("mount: mount partition to MooseFS")
        print("mount_nmt: mount root directory to MooseFS")
        print("set_master: Set MooseFS Master")
        print("list_chunk: Chunkserver list(from master)")
    else:
        sys.stderr.write("mfs_util: invalid operand\n")
        sys.stderr.write("Try 'mfs_util help' for more information.\n")
        sys.exit()


main()

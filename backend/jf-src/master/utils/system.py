import platform
import traceback
import subprocess
import os
import time 
    

def get_host_name():
    host = "unknown"
    try:
        host = platform.node()
    except Exception as e: 
        traceback.print_exc()
    return host

def get_os_info():
    os = "unknown"
    try:
        with open('/host_etc_info/issue') as f: # have to host mount etc to host_etc_info
            os = f.read().split("\\")[0]
    except Exception as e: 
        traceback.print_exc()
        os = "-".join(platform.dist())
    return os

def get_current_os_info():
    os = "unknown"
    try:
        command = "hostnamectl | grep Operating | cut -d':' -f2-"
        os = subprocess.check_output(command, shell=True).strip().decode() 
        return os
    except Exception as e: 
        traceback.print_exc()
        return os

def get_memory_info():
    memory = int((os.sysconf('SC_PAGE_SIZE') * os.sysconf('SC_PHYS_PAGES')) /(1024.**1))
    return memory

def get_memory_usage_info():
    cmd = """cat /jf-bin/meminfo | grep 'Mem'"""
    returned_result = subprocess.check_output(cmd, shell=True).strip().decode()
    returned_result = returned_result.splitlines()
    memory_usage_info = dict()
    for line in returned_result:
        tempList = line.split(':')
        memory_usage_info[tempList[0]] = tempList[1].replace(" ","")
    return memory_usage_info

def get_memory_usage_info_for_pod(pod_name):
    import utils.common as common
    pod_cmd = """cat /sys/fs/cgroup/memory/memory.usage_in_bytes"""
    host_cmd = 'kubectl exec {pod_name} -- {pod_cmd}'.format(pod_name=pod_name, pod_cmd=pod_cmd)
    cmd_res, *_ = common.launch_on_host(host_cmd)
    cmd_res = cmd_res.replace("\n","") ## bytes
    return cmd_res

def get_cpu_info():
    cpu = "unknown"
    try:
        command = "lscpu | grep name | cut -d':' -f2-"
        cpu = subprocess.check_output(command, shell=True).strip().decode() 
        return cpu
    except Exception as e: 
        traceback.print_exc()
        return cpu
    return cpu

def get_cpu_cores_info():
    cores = "unknown"
    try:
        command = "nproc"
        cores = subprocess.check_output(command, shell=True).strip().decode() 
        return cores
    except Exception as e:
        traceback.print_exc()
        return cores
    return cores

def get_cpu_usage_info():
    from multiprocessing import cpu_count
    cmd = """grep 'cpu' /jf-bin/stat | head -1"""
    first = subprocess.check_output(cmd, shell=True).strip().decode()
    if(first == ""):
        raise RuntimeError('/jf-bin/stat not found, is it mounted?')
    first = first.split()[1:]
    time.sleep(1)
    second = subprocess.check_output(cmd, shell=True).strip().decode().split()[1:]
    delta_idle = float(second[3]) - float(first[3])
    delta_user = float(second[0]) - float(first[0])
    delta_system = float(second[2]) - float(second[2])
    cpu_usage = round((((delta_system + delta_user) / (delta_system + delta_user + delta_idle)) * 100),2)#*cpu_count()
    return cpu_usage 

def get_cpu_usage_info_for_pod(pod_name):
    import utils.common as common
    from multiprocessing import cpu_count
    # pod_cmd = """ps -A -o pcpu | tail -n+2"""
    pod_cmd = """ps -A -o pcpu"""
    host_cmd = 'kubectl exec {pod_name} -- {pod_cmd}'.format(pod_name=pod_name, pod_cmd=pod_cmd)
    cmd_res, *_ = common.launch_on_host(host_cmd)
    total = 0
    for u in cmd_res.split("\n")[1:]:
        if u == "":
            continue
        total += float(u)

    return round(total/cpu_count(), 2)


def get_partition_info():
    partitions = dict()
    cmd = "lsblk -isf -o NAME,FSTYPE,SIZE | grep -v '`'"
    returned = subprocess.run(cmd,shell=True, stdout=subprocess.PIPE).stdout.decode('utf-8')
    for line in returned.splitlines():
        splitLine = line.split()
        if(len(splitLine) > 2):
            partitions[splitLine[0]] = (splitLine[1],splitLine[2])
        else:
            partitions[splitLine[0]] = ('N/A',splitLine[1])
    return partitions

def get_storage_info():
    storages = list()
    cmd = "lsblk -isf -o NAME,FSTYPE,SIZE | grep '^`' | uniq | grep -v 'LVM' | cut -c3-"
    returned = subprocess.run(cmd,shell=True, stdout=subprocess.PIPE).stdout.decode('utf-8')
    for line in returned.splitlines():
        splitLine = line.split()
        storages.append((splitLine[0],splitLine[1]))
    return storages

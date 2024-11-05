import os
from multiprocessing import cpu_count
from multiprocessing import Pool
import subprocess
import time
import threading
import signal
from sys import getsizeof

cpu_limit = float(os.environ["JF_CPU"])
gpu_limit = os.environ["JF_GPU"]
memory_limit = int(float(os.environ["JF_MEMORY"].replace("Gi","")))

print("CPU ", cpu_limit, float(cpu_limit/int(cpu_count())))
print("GPU ", gpu_limit)
print("MEMORY ", memory_limit)

 
stop_loop = 0


def cpu_usage():
    for i in range(10):
        time.sleep(1)
        print("CPU USAGE (method1, method2) ", get_cpu_usage_info(), get_cpu_usage_info2())

def get_cpu_usage_info2():
    cmd = """ps -A -o pcpu"""
    result = subprocess.check_output(cmd, shell=True).strip().decode()
    total = 0
    for u in result.split("\n")[1:]:
        total += float(u)

    return round(total/cpu_count(), 2)
        
def get_cpu_usage_info():
    cmd = """grep 'cpu' /proc/stat | head -1"""
    first = subprocess.check_output(cmd, shell=True).strip().decode()
    first = first.split()[1:]
    time.sleep(1)
    second = subprocess.check_output(cmd, shell=True).strip().decode().split()[1:]
    delta_idle = float(second[3]) - float(first[3])
    delta_user = float(second[0]) - float(first[0])
    delta_system = float(second[2]) - float(second[2])
    cpu_usage = round((((delta_system + delta_user) / (delta_system + delta_user + delta_idle)) * 100),2)
    return cpu_usage 
 
def f(x):
    global stop_loop
    if x == 0:
        cpu_usage_thr = threading.Thread(target = cpu_usage)
        cpu_usage_thr.start()
        
    st = time.time()
    while not stop_loop:
        x*x
        if time.time() - st > 10:
            break
    
def cpu_run():
    processes = cpu_count()
    print('-' * 20)
    print('Running load on CPU(s)')
    print('Utilizing %d cores' % processes)
    print('-' * 20)
    pool = Pool(processes)
    pool.map(f, range(processes))

print("CPU RESOURCE CHECK")
cpu_run()


time.sleep(5)
def get_memory_usage_info():
    cmd = """cat /sys/fs/cgroup/memory/memory.usage_in_bytes"""
    returned_result = subprocess.check_output(cmd, shell=True).strip().decode()
    cmd_res = returned_result.replace("\n","")
    return int(cmd_res)/(1024*1024)

def mem_run(x):
    init = get_memory_usage_info()
    a = "a"
    mul = 1024 * 1024
    for i in range (x):
#         a = ""
        a += "a" * int(mul)
        if int(getsizeof(a)/ (mul))% 100 == 0:
            print("NODE USAGE : ", round(get_memory_usage_info() - init,2))
            print("RAM USAGE : ", round(getsizeof(a)/ (1024*1024),1),"MB")

print("MEMORY RESOURCE CHECK")
mem_run(memory_limit*1000+1)


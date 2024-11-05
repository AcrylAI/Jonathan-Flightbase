import subprocess
import traceback
import xml.etree.ElementTree as ET
import sys
import ctypes
import shelve
import dbm.dumb

ddb = dbm.dumb.open('smd')
smData = shelve.Shelf(ddb)

CUDA_SUCCESS = 0
CU_DEVICE_ATTRIBUTE_MULTIPROCESSOR_COUNT = 16
CU_DEVICE_ATTRIBUTE_MAX_THREADS_PER_MULTIPROCESSOR = 39
CU_DEVICE_ATTRIBUTE_CLOCK_RATE = 13
CU_DEVICE_ATTRIBUTE_MEMORY_CLOCK_RATE = 36
def get_mig_device_list(g_id):
    p = subprocess.Popen(["nvidia-smi","-L"], stdout=subprocess.PIPE)
    out, err = p.communicate()
    out = out.decode()
    #     out = """
    # GPU 0: A100-PCIE-40GB (UUID: GPU-0331fb2d-b90c-eef1-f692-2f8652095e87)
    #     MIG 2g.10gb Device 0: (UUID: MIG-GPU-0331fb2d-b90c-eef1-f692-2f8652095e87/3/0)
    #     MIG 2g.10gb Device 1: (UUID: MIG-GPU-0331fb2d-b90c-eef1-f692-2f8652095e87/5/0)
    #     MIG 2g.10gb Device 2: (UUID: MIG-GPU-0331fb2d-b90c-eef1-f692-2f8652095e87/6/0)
    # GPU 1: A100-PCIE-40GB (UUID: GPU-90836733-1e26-e5ca-66f9-d0f24ed4d903)
    #     MIG 2g.10gb Device 0: (UUID: MIG-GPU-90836733-1e26-e5ca-66f9-d0f24ed4d903/3/0)
    #     MIG 2g.10gb Device 1: (UUID: MIG-GPU-90836733-1e26-e5ca-66f9-d0f24ed4d903/4/0)
    #     MIG 2g.10gb Device 2: (UUID: MIG-GPU-90836733-1e26-e5ca-66f9-d0f24ed4d903/5/0)
    #         """
    dev_i = g_id
    dev_i_mig = False
    dev_i_mig_list = []
    for dev in out.split("\n")[:-1]:
        if dev[0:3] == "GPU": 
            if dev.split(":")[0] == "GPU " + str(dev_i):
                dev_i_mig = True
                continue 
            else :
                dev_i_mig = False
                continue

        if dev_i_mig == True:
            while True:
                if dev[0] == " ":
                    dev = dev[1:]
                else: 
                    break

            dev_i_mig_list.append(dev)
    
    return dev_i_mig_list

def get_gpu_info():
    def get_r_find(r, main_key, sub_key=None, not_found_value=""):
        value = "N/A"
        try:
            if sub_key is not None:
                value = r.find(main_key).find(sub_key).text
            else :
                value = r.find(main_key).text
        except Exception as e: 
            print(e)
            if not_found_value == "":
                value = "Not Found Key [{}]-[{}]".format(main_key, sub_key)
            else :
                value = not_found_value
            
        return value
        
    arr = []
    driver_version = "Unknown"
    cuda_version = "Unknown"
    #nvidia-smi topo -m
    try:
        with subprocess.Popen(['nvidia-smi', '-q', '-x'], stdout=subprocess.PIPE) as p:
            out, err = p.communicate()
            out = out.decode('utf-8')
            root = ET.fromstring(out)
        for r in root:
            if r.tag == 'cuda_version':
                cuda_version = r.text
            if r.tag == 'driver_version':
                driver_version = r.text
            if r.tag == 'gpu':
                info = {
                    "num": int(get_r_find(r, 'minor_number')),
                    "model": get_r_find(r, 'product_name'),
                    "mem_total": get_r_find(r, 'fb_memory_usage', 'total'),
                    "mem_used": get_r_find(r, 'fb_memory_usage', 'used'),
                    "mem_free": get_r_find(r, 'fb_memory_usage', 'free'),
                    "gpu_util": get_r_find(r, 'utilization', 'gpu_util'),
                    "mem_util": get_r_find(r, 'utilization', 'memory_util'), 
                    "temperature": get_r_find(r, 'temperature', 'gpu_temp'),
                    "mig_mode": get_r_find(r, 'mig_mode', 'current_mig', "None"),
                    "mig_list": []
                }
                # mig_mode ( 
                #     0 : 'None', (nvidia-driver가 옛날 버전)
                #     1 : 'N/A' , (지원 불가 장치)
                #     2 : 'Disabled' , 
                #     3 : 'Enabled'
                # )
                p = subprocess.Popen(['nvidia-smi', 'nvlink', '-s', '-i',str(info["num"])], stdout=subprocess.PIPE)
                out, err = p.communicate()
                out = out.decode()
                print("OUT", out )
                print("err", err)
                if out != "" and "inactive" not in out:
                    info["nvlink"] = "Enabled"
                else :
                    info["nvlink"] = "Disabled"
                
                try:
                    info["mig_list"] = get_mig_device_list(int(r.find('minor_number').text))
                except Exception as e:
                    print(e)
                    
                arr.append(info)
    except Exception as e:
        print (e)
        traceback.print_exc()
        return {"status": 0, "message": str(e), "num_gpus": len(arr), "cuda_version": cuda_version, "driver_version": driver_version, "gpu_list": arr}
    arr.sort(key=lambda a: a["num"], reverse=False)
    return {"status": 1, "message": "", "num_gpus": len(arr), "cuda_version": cuda_version, "driver_version": driver_version, "gpu_list": arr}

"""Updates a shelve that stores the data for Nvidia SM 

:param targetShelve: Shelve object that is used to store data to dbm(recommends dbm.dumb for compatibility)
:param csvName: String value that represents a name or location of a CSV file
:returns: formatted string
"""
def updateSMDataDB(targetShelve, csvName):
    data = list()
    try:
        with open(csvName, newline='') as csvfile:
            reader = csv.reader(csvfile)
            data = list(reader)
    except:
        print("Failed: Error occurred while opening the given CSV file")
    if not data:
        print("Failed: Error: Empty CSV file")
    else:
        for line in data:
            keyTuple = (int(line[0]),int(line[1]))
            valueList = [int(line[2]),line[3]]
            targetShelve[repr(keyTuple)] = valueList
            print("Success: Updated Successfully")

"""Convert a given Nvidia compute capability version to # of cores per SM and an arch 

:param major: Int value that represents a major version of a Nvidia compute capability version to check
:param minor: Int value that represents a minor version of a Nvidia compute capability version to check
:returns: a list of data that represent # of cores per SM and an arch that corresponds to a given Nvidia compute capability 
"""
def ConvertSMVer2CoresWithDB(major, minor):
    try:
        return smData[repr((major,minor))]
    except:
        return [64, "Unknown"]

def ConvertSMVer2Cores(major, minor):
    # Returns the number of CUDA cores per multiprocessor for a given
    # Compute Capability version. There is no way to retrieve that via
    # the API, so it needs to be hard-coded.
    # https://github.com/NVIDIA/cuda-samples/blob/master/Common/helper_cuda.h
    return {
    # Tesla
      (1, 0):   [8, "Tesla"],      # SM 1.0
      (1, 1):   [8, "Tesla"],      # SM 1.1
      (1, 2):   [8, "Tesla"],      # SM 1.2
      (1, 3):   [8, "Tesla"],      # SM 1.3
    # Fermi
      (2, 0):  [32, "Fermi"],      # SM 2.0: GF100 class
      (2, 1):  [48, "Fermi"],      # SM 2.1: GF10x class
    # Kepler
      (3, 0): [192, "Kepler"],      # SM 3.0: GK10x class
      (3, 2): [192, "Kepler"],      # SM 3.2: GK10x class
      (3, 5): [192, "Kepler"],      # SM 3.5: GK11x class
      (3, 7): [192, "Kepler"],      # SM 3.7: GK21x class
    # Maxwell
      (5, 0): [128, "Maxwell"],      # SM 5.0: GM10x class
      (5, 2): [128, "Maxwell"],      # SM 5.2: GM20x class
      (5, 3): [128, "Maxwell"],      # SM 5.3: GM20x class
    # Pascal
      (6, 0):  [64, "Pascal"],      # SM 6.0: GP100 class
      (6, 1): [128, "Pascal"],      # SM 6.1: GP10x class
      (6, 2): [128, "Pascal"],      # SM 6.2: GP10x class
    # Volta
      (7, 0):  [64, "Volta"],      # SM 7.0: GV100 class
      (7, 2):  [64, "Volta"],      # SM 7.2: GV11b class
    # Turing
      (7, 5):  [64, "Turing"],      # SM 7.5: TU10x class
    # Ampere
      (8, 0):  [64, "Ampere"],      # SM 8.0: GA100 class
      (8, 6):  [64, "Ampere"],      # SM 8.6: GA10x class
    }.get((major, minor), [64, "Unknown"])   # unknown architecture, return a default value

def get_gpu_more_info(gpu_info):
    libnames = ('libcuda.so', 'libcuda.dylib', 'cuda.dll')
    for libname in libnames:
        try:
            cuda = ctypes.CDLL(libname)
        except OSError:
            continue
        else:
            break
    else:
        # raise OSError("could not load any of: " + ' '.join(libnames))
        return 0, "could not load any of: " + ' '.join(libnames)

    nGpus = ctypes.c_int()
    name = b' ' * 100
    cc_major = ctypes.c_int()
    cc_minor = ctypes.c_int()
    cores = ctypes.c_int()
    threads_per_core = ctypes.c_int()
    clockrate = ctypes.c_int()
    freeMem = ctypes.c_size_t()
    totalMem = ctypes.c_size_t()

    result = ctypes.c_int()
    device = ctypes.c_int()
    context = ctypes.c_void_p()
    error_str = ctypes.c_char_p()
    result = cuda.cuInit(0)
    if result != CUDA_SUCCESS:
        cuda.cuGetErrorString(result, ctypes.byref(error_str))
        gpu_info["status"] = 0
        gpu_info["message"] = "cuInit failed with error code {}: {}".format(result, error_str.value.decode())
        return 0, "cuInit failed with error code {}: {}".format(result, error_str.value.decode())
    result = cuda.cuDeviceGetCount(ctypes.byref(nGpus))
    if result != CUDA_SUCCESS:
        cuda.cuGetErrorString(result, ctypes.byref(error_str))
        gpu_info["status"] = 0
        gpu_info["message"] = "cuDeviceGetCount failed with error code {}: {}".format(result, error_str.value.decode())
        return 0, "cuDeviceGetCount failed with error code {}: {}".format(result, error_str.value.decode())

    gpu_list = gpu_info["gpu_list"]
    
    
    # for i in range(nGpus.value):
    for i in range(gpu_info["num_gpus"]):
        gpu_info = gpu_list[i]
        info_ = {"computer_capability": "unknown", "cuda_cores": "unknown", "architecture": "unknown"}
        result = cuda.cuDeviceGet(ctypes.byref(device), i)
        if result != CUDA_SUCCESS:
            if gpu_list[0]["model"] == gpu_info["model"]:
                info_ = {
                     "computer_capability": gpu_list[0]["computer_capability"], 
                     "cuda_cores": gpu_list[0]["cuda_cores"], 
                     "architecture": gpu_list[0]["architecture"]
                    }
                gpu_list[i] = {**gpu_info, **info_}
            else:
                gpu_info["status"] = 0
                # gpu_info["message"] = "cuDeviceGet failed with error code %d: %s".format(result, error_str.value.decode())
                gpu_list[i] = {**gpu_info, **info_}
                cuda.cuGetErrorString(result, ctypes.byref(error_str))
            continue
            # return 0, "cuDeviceGet failed with error code %d: %s".format(result, error_str.value.decode())



        if cuda.cuDeviceComputeCapability(ctypes.byref(cc_major), ctypes.byref(cc_minor), device) == CUDA_SUCCESS:
            info_["computer_capability"] = "{}.{}".format(cc_major.value, cc_minor.value)

        if cuda.cuDeviceGetAttribute(ctypes.byref(cores), CU_DEVICE_ATTRIBUTE_MULTIPROCESSOR_COUNT, device) == CUDA_SUCCESS:
            # gpu_info["multiprocessors"] = cores.value
            info_["cuda_cores"] = cores.value * ConvertSMVer2Cores(cc_major.value, cc_minor.value)[0]
            info_["architecture"] = ConvertSMVer2Cores(cc_major.value, cc_minor.value)[1]
            #gpu_info["threads"] = cores.value * threads_per_core.value
        gpu_list[i] = {**gpu_info, **info_}
        
def getNvidiaDockerStats():
    output = subprocess.check_output(['python3', '/jfbcore/gpl-code/nvidiadockerstats.py'])
    return output.decode('ascii')


# nvidia-smi topo -m # nvlink
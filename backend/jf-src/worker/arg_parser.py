import utils.nvidia as nvidia
import utils.system as system
import traceback

jf_ip = None
jf_port = None
#jf_nif = None
jf_gpu = None
gpu_info = None
system_info = None # os, cpu, ram


def init_arg(parser):    
    global jf_ip, jf_port, gpu_info, jf_gpu, system_info

    parser.add_argument('--port', default=None)
    #parser.add_argument('--pub-ip', default=None)
    parser.add_argument('--jf-ip', default=None)
    #parser.add_argument('--jf-nif', default=None)
    gpu_info = nvidia.get_gpu_info()
    nvidia.get_gpu_more_info(gpu_info)
    jf_gpu = gpu_info["num_gpus"]
    system_info = { 
        "os": system.get_os_info(),
        "cpu": system.get_cpu_info(),
        "cpu_cores": system.get_cpu_cores_info(),
        "ram": system.get_memory_info(),
        "node_name": system.get_host_name(),
        "driver_version": gpu_info["driver_version"] 
    }
    
    args, unknown = parser.parse_known_args()
    params = vars(args)     
    jf_ip = params['jf_ip']
    jf_port = params['port']
    #jf_nif = params['jf-nif']   

    return jf_ip, jf_port, gpu_info, jf_gpu, system_info
    



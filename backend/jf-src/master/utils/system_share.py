from utils.system import *
class ShareUsageCounter():
    def __init__(self):
        self.cpu_usage = get_cpu_usage_info()
        self.mem_usage = get_memory_usage_info()

    def get_cpu_usage(self):
        return self.cpu_usage

    def get_mem_usage(self):
        return self.mem_usage

    def update_all(self):
        self.update_cpu_usage()
        self.update_mem_usage()

    def update_cpu_usage(self):
        self.cpu_usage = get_cpu_usage_info()
        pass
    
    def update_mem_usage(self):
        self.mem_usage = get_memory_usage_info()
        pass
    
share_usage_counter = ShareUsageCounter()
#from multiprocessing import Lock
#from threading import Lock
import multiprocessing
import threading
import traceback
class MultiProcessingLock:
    def __init__(self, lock):
        self.lock = lock

    def __enter__(self):
        self.lock.acquire()

    def __exit__(self, t, v, tb):
        self.lock.release()
        if tb is not None:
            traceback.print_exception(t, v, tb)
            raise v
        return True

jf_scheduler_lock = MultiProcessingLock(multiprocessing.Lock())
jf_pod_update_lock = MultiProcessingLock(multiprocessing.Lock())
jf_user_limit_check_lock = MultiProcessingLock(multiprocessing.Lock())
jf_plock = MultiProcessingLock(multiprocessing.Lock())
jf_resource_log_lock = MultiProcessingLock(multiprocessing.Lock())
jf_thread_name_update_lock = MultiProcessingLock(multiprocessing.Lock())
jf_benchmark_storage_lock = MultiProcessingLock(multiprocessing.Lock())

manager = multiprocessing.Manager()
main_container = manager.dict()

class ThreadingLock:
    def __init__(self, lock):
        self.lock = lock

    def __enter__(self):
        self.lock.acquire()

    def __exit__(self, t, v, tb):
        self.lock.release()
        if tb is not None:
            traceback.print_exception(t, v, tb)
        return True

jf_tlock = ThreadingLock(threading.Lock())
jf_dataset_lock = ThreadingLock(threading.Lock())
# Threading lock으로는 worker간의 lock 처리가 불가능 single worker라면 가능

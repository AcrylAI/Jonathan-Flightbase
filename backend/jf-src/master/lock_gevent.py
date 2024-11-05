#TODO gunicorn worker 타입에 따라서 lock 가변적으로 할당하기 위한 파일
# worker 타입에 따라
# worker : gevent 
# lock.py -> lock_gevent.py # nameatomiclock
# worker : other
# lock.py -> lock_others.py # threading, multiprocessing lock

from NamedAtomicLock import NamedAtomicLock as ntl

class MyLock:
    def __init__(self, lock):
        self.lock = lock

    def __enter__(self):
        self.lock.acquire()

    def __exit__(self, t, v, tb):
        self.lock.release()
        if tb is not None:
            traceback.print_exception(t, v, tb)
        return True


# my_lock = MyLock(ntl("myLock"))

jf_scheduler_lock = MyLock(ntl("jf_scheduler_lock"))
jf_pod_update_lock = MyLock(ntl("jf_pod_update_lock"))
jf_user_limit_check_lock = MyLock(ntl("jf_user_limit_check_lock"))
jf_plock = MyLock(ntl("jf_plock"))
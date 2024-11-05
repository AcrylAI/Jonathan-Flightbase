"""
    비동기 처리 후 Thread/Process 진행 상태를 체크하거나 진행 여부에 따라 중복 실행 방지 등을 용이하고 공통되게 관리하기 위한 용도

    주요 기능 -
        Thread/Process | 이미 생성된 Ojbect/만들어서 사용할지에 대한 run 함수는 각각 구분되어 있음
            Thread/Process Object를 생성한 뒤 run 함수에 입력으로 사용
            Thread/Process에 필요한 (*args, **kwargs) 를 입력으로 사용
            
        이름을 지정해서 run 관련 함수를 실행시키면 중복된 이름이 있는 경우 에러 raise 
        
        이미 실행중에 있는지 확인하는 함수 제공
            RunnableObjectController를 통해서 실행시킨 것들만 확인함
"""
import threading
import multiprocessing
import time
import os
import sys
sys.path.insert(0, os.path.abspath('..'))
from lock import jf_thread_name_update_lock

RUNNABLE_OBJECT_THREAD_TYPE = "Thread"
RUNNABLE_OBJECT_PROCESS_TYPE = "Process"

# TODO name을 지정하지 않은 Thread도 여기서 실행할 수 있게 할것인가 ?
# TODO 특정 기능을 Thread/Process를 혼합해서 사용하는 경우가 있는가 ?
# TODO 이름이 같은게 이미 동작중이더라도 강제 실행 ?
# TODO add 시 Label 을 추가하여 동작중인지 확인할 때 name 이외에 키를 활용할 수 있도록 추가 
class RunnableObjectAlreadyRunningError(Exception):
    def __init__(self, object_type, name):
        self.object_type = object_type
        self.name = name 

    def __str__(self):
        return "{} {} Already Running.".format(self.object_type, self.name)

class RunnableObjectAttributeError(Exception):
    def __init__(self, key):
        self.key = key

    def __str__(self):
        return "Does not have [{}] attribute.".format(self.key)



class Base():
    _instance = None
    def __new__(cls):
        if not isinstance(cls._instance, cls):
            cls._instance = object.__new__(cls)
            
        return cls._instance

"""
    PID_THREAD_NAME_DICT, PID_PROCESS_NAME_DICT 을 {} 사용했을 때 
        API에서 Thread/Process 실행 및 실행 시켜준 pid 정보
        {"result": null, "message": "OK", "status": 1, "pid": 106}
        {"result": null, "message": "OK", "status": 1, "pid": 111}
        {"result": null, "message": "OK", "status": 1, "pid": 112}
        {"result": null, "message": "OK", "status": 1, "pid": 108}
        {"result": null, "message": "OK", "status": 1, "pid": 106}
        {"result": null, "message": "OK", "status": 1, "pid": 108}
        {"result": null, "message": "OK", "status": 1, "pid": 106}
        {"result": null, "message": "OK", "status": 1, "pid": 105}
        {"result": null, "message": "OK", "status": 1, "pid": 111}
        {"result": null, "message": "OK", "status": 1, "pid": 109}
        
        API에서 실행중인 Thread/Process 이름 목록 조회 및 실행 시켜준 pid 정보
        {"result": [], "message": null, "status": 1, "pid": 110}
        {"result": ["test1", "test8"], "message": null, "status": 1, "pid": 111}
        {"result": ["test1", "test8"], "message": null, "status": 1, "pid": 111}
        {"result": ["test2"], "message": null, "status": 1, "pid": 112}
        {"result": [], "message": null, "status": 1, "pid": 102}
        {"result": [], "message": null, "status": 1, "pid": 101}
        {"result": [], "message": null, "status": 1, "pid": 101}
        {"result": ["test9"], "message": null, "status": 1, "pid": 109}
        {"result": ["test2"], "message": null, "status": 1, "pid": 112}
        {"result": ["test1", "test8"], "message": null, "status": 1, "pid": 111}
        
        --> 단순 {} 를 사용하는 경우 각 pid 마다 정보를 관리하게 됨
        
    PID_THREAD_NAME_DICT, PID_PROCESS_NAME_DICT 을 multiprocessing.Manager().dict()사용했을 때 
        API에서 Thread/Process 실행 및 실행 시켜준 pid 정보
        {"result": null, "message": "OK", "status": 1, "pid": 130}
        {"result": null, "message": "OK", "status": 1, "pid": 130}
        {"result": null, "message": "OK", "status": 1, "pid": 126}
        {"result": null, "message": "OK", "status": 1, "pid": 119}
        {"result": null, "message": "OK", "status": 1, "pid": 129}
        {"result": null, "message": "OK", "status": 1, "pid": 127}
        {"result": null, "message": "OK", "status": 1, "pid": 129}
        {"result": null, "message": "OK", "status": 1, "pid": 130}
        {"result": null, "message": "OK", "status": 1, "pid": 123}
        {"result": null, "message": "OK", "status": 1, "pid": 127}

        API에서 실행중인 Thread/Process 이름 목록 조회 및 실행 시켜준 pid 정보
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 130}
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 130}
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 130}
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 130}
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 130}
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 124}
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 130}
    {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 128}
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 129}
        {"result": ["test1", "test2", "test7", "test0", "test3", "test4", "test6", "test5", "test9", "test8"], "message": null, "status": 1, "pid": 130}

        --> 어느 PID에서 조회를 하더라도 동일한 값을 공유함
"""

class RunnableObjectController(Base):
    PID_THREAD_NAME_DICT = multiprocessing.Manager().dict()
    PID_PROCESS_NAME_DICT =  multiprocessing.Manager().dict()
    def __init__(self):
        pass 

    # 실행 관련 함수
    def run_with_thread_create(self, *args, **kwargs):
        """
            Description : threading.Thread(*args, **kwargs) 를 생성 후 start() 시켜주는 함수
            
            Input :
                *args : For threading.Thread(*args, **kwargs)
                **kwargs : For threading.Thread(*args, **kwargs)
                
            Return :
                (Thread) - 생성 된 Thread object
        """
        thread = threading.Thread(*args, **kwargs)
        with jf_thread_name_update_lock:
            self._run_background(runnable_object=thread, object_type=RUNNABLE_OBJECT_THREAD_TYPE)
        
        return thread

    def run_with_process_create(self, *args, **kwargs):
        """
            Description : multiprocessing.Process(*args, **kwargs) 를 생성 후 start() 시켜주는 함수
            
            Input :
                *args : For multiprocessing.Process(*args, **kwargs)
                **kwargs : For multiprocessing.Process(*args, **kwargs)
                
            Return :
                (Process) - 생성 된 Process object
        """
        process = multiprocessing.Process(*args, **kwargs)
        
        with jf_thread_name_update_lock:
            self._run_background(runnable_object=process, object_type=RUNNABLE_OBJECT_PROCESS_TYPE)
        
        return process

    def run_created_thread(self, thread):
        """
            Description : 별도로 생성한 Thread Object를 받아서 start() 시켜주는 함수

            Input :
                

            Return :
                (Thread) - 생성 된 Thread object
        """
        self._attribute_check(runnable_object=thread)
        
        with jf_thread_name_update_lock:
            self._run_background(runnable_object=thread, object_type=RUNNABLE_OBJECT_THREAD_TYPE)
        
        return thread

    def run_created_process(self, process):
        """
            Description : 별도로 생성한 Process Object를 받아서 start() 시켜주는 함수

            Input :
                process (object) : .start() 를 가지고 있는 multiprocessing.Process 관련 Object

            Return :
                (Object) : 입력으로 사용한 Process
        """
        self._attribute_check(runnable_object=process)
        
        with jf_thread_name_update_lock:
            self._run_background(runnable_object=process, object_type=RUNNABLE_OBJECT_PROCESS_TYPE)
        
        return process

    # 내부 기능 함수 
    def _attribute_check(self, runnable_object):
        check_list = ["start", "join", "name"]
        for key in check_list:
            if not hasattr(runnable_object, key):
                raise RunnableObjectAttributeError(key=key)

    def _run_background(self, runnable_object, object_type):
        """
            Description: 요청한 thread를 실행시키고 종료 시 업데이트를 한번 해줘야 thread name list에서 종료된 thread가 반영
                        * PID 마다 각자의 thread pool을 가지고 있기 때문에 thread를 실행 시켰던 PID에서 업데이트 시켜줘야 이름이 서로 공유될 수 있음

            Input :
                runnable_object (Object) : Thread, Process 중 하나의 Object
                object_type (str) : Thread | Process
        """
        def do(runnable_object, del_func):
            try:
                runnable_object.start()
                runnable_object.join()
            except:
                pass
            
            # TODO join() <> del_func 사이에 create가 수행된다면 -> 이미 동작중임
            # 실제 동작이 완전히 종료 된건 아니므로 동작중이니까 중복 생성 방지하는 의미에서는 문제 없음
            # 문제의 상황은 
            # - 특정 이름을 가진 스레드가 필요할 땐 떠있어야 하는 상황일때 발생
            # 작업 할 내용이 없으면 종료하고 작업할 내용이 있으면 계속 진행하며
            # 종료 되어 있을 땐 스레드를 실행 시켜서 진행하는 구조라면
            # 종료 되어 이름 삭제를 기다리는 시점에 추가 요청이 온다면 ..
            # 위의 문제는 LoopFunction을 사용해서 복원하는 형태로 접근하는 것이 최선으로 보임
            with jf_thread_name_update_lock:
                del_func(name=runnable_object.name) # 동작 종료 후 이름 제거      
        
        callback = None
        add_func = None
        is_running = None
        if object_type == RUNNABLE_OBJECT_THREAD_TYPE:
            del_func = self._del_thread_name
            add_func = self._add_thread_name
            is_running = self.is_thread_running
        elif object_type == RUNNABLE_OBJECT_PROCESS_TYPE:
            del_func = self._del_process_name
            add_func = self._add_process_name
            is_running = self.is_process_running
        else :
            raise Exception("Unknown Object Type. {}".format(object_type))

        if is_running(name=runnable_object.name):
            raise RunnableObjectAlreadyRunningError(object_type=object_type, name=runnable_object.name)

        add_func(name=runnable_object.name) # 시작과 동시에 업데이트

        threading.Thread(target=do, args=(runnable_object, del_func)).start()

    
    def _add(self, manager_dict, name):
        name_list = manager_dict.get(os.getpid())
        if name_list is None:
            # 초기화
            manager_dict[ os.getpid() ] = [ name ]
        else :
            name_list.append(name)
            manager_dict[ os.getpid() ] = name_list

    def _del(self, manager_dict, name):
        name_list = manager_dict.get(os.getpid())
        name_list.remove(name)
        manager_dict[ os.getpid() ] = name_list

    def _add_thread_name(self, name):
        self._add(manager_dict=RunnableObjectController.PID_THREAD_NAME_DICT, name=name)

    def _del_thread_name(self, name):
        self._del(manager_dict=RunnableObjectController.PID_THREAD_NAME_DICT, name=name)

    def _add_process_name(self, name):
        self._add(manager_dict=RunnableObjectController.PID_PROCESS_NAME_DICT, name=name)
    
    def _del_process_name(self, name):
        self._del(manager_dict=RunnableObjectController.PID_PROCESS_NAME_DICT, name=name)

    # 정보 조회용 함수
    def is_thread_running(self, name):
        return name in self.get_thread_name_list()

    def is_process_running(self, name):
        return name in self.get_process_name_list()
    
    def get_thread_name_list(self):
        thread_name_list = []
        for key, value in RunnableObjectController.PID_THREAD_NAME_DICT.items():
            thread_name_list += value
            
        return thread_name_list

    def get_process_name_list(self):
        process_name_list = []
        for key, value in RunnableObjectController.PID_PROCESS_NAME_DICT.items():
            process_name_list += value

        return process_name_list


def _test():
    class CustomRunnable1():
        def __init__(self):
            # DUMMY
            pass

    class CustomRunnable2():
        def __init__(self):
            # DUMMY
            self.name = None

        def start():
            pass

        def join():
            pass


    roc = RunnableObjectController()
    import time
    import threading
    import multiprocessing
    def test_func():
        for i in range(10):
            print("Func Run !!")
            time.sleep(1)
            
        return 0
    
    # 정상 Run
    th = threading.Thread(target=test_func, name="th-test1")
    pc = multiprocessing.Process(target=test_func, name="pc-test1")
    
    roc.run_created_process(process=pc)
    roc.run_with_process_create(target=test_func, name="pc-test2")
    roc.run_created_thread(thread=th)
    roc.run_with_thread_create(target=test_func, name="th-test2")

    # 중복 Run
    th = threading.Thread(target=test_func, name="th-test1")
    pc = multiprocessing.Process(target=test_func, name="pc-test1")
    try:
        roc.run_created_process(process=pc)
    except RunnableObjectAlreadyRunningError as e:
        print(e)
    
    try:
        roc.run_with_process_create(target=test_func, name="pc-test2")
    except RunnableObjectAlreadyRunningError as e:
        print(e)

    try:
        roc.run_created_thread(thread=th)
    except RunnableObjectAlreadyRunningError as e:
        print(e)

    try:
        roc.run_with_thread_create(target=test_func, name="th-test2")
    except RunnableObjectAlreadyRunningError as e:
        print(e)

    # Attribute Error - 필요 attribute가 없는 경우
    dummy_ro1 = CustomRunnable1()

    try:
        roc.run_created_thread(thread=dummy_ro1)
    except RunnableObjectAttributeError as e:
        print(e)

    try:
        roc.run_created_process(process=dummy_ro1)
    except RunnableObjectAttributeError as e:
        print(e)
    
    # Attribute Error - 만족은 시키나 완전 더미인 경우
    dummy_ro2 = CustomRunnable2()
    try:
        roc.run_created_thread(thread=dummy_ro2)
    except RunnableObjectAttributeError as e:
        print(e)

    try:
        roc.run_created_process(process=dummy_ro2)
    except RunnableObjectAttributeError as e:
        print(e)
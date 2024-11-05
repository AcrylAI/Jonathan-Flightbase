
import settings
from settings import *
import traceback
def docker_registry_check():
    from utils.common import launch_on_host
    """
    # 정상
    root@jf-node-06:/jfbcore/jf-bin/launcher_bins# docker pull 192.168.1.16:5000/test
    Using default tag: latest
    Error response from daemon: manifest for 192.168.1.16:5000/test:latest not found: manifest unknown: manifest unknown

    # ADDR 틀림 (IP)
    root@jf-node-06:/jfbcore/jf-bin/launcher_bins# docker pull 192.168.1.17:5000/test
    Using default tag: latest
    Error response from daemon: Get https://192.168.1.17:5000/v2/: dial tcp 192.168.1.17:5000: connect: connection refused

    # ADDR 틀림 (PORT)
    root@jf-node-06:/jfbcore/jf-bin/launcher_bins# docker pull 192.168.1.16:5001/test
    Using default tag: latest
    Error response from daemon: Get https://192.168.1.16:5001/v2/: dial tcp 192.168.1.16:5001: connect: connection refused
    
    # Docker deamon.json 문제
    root@jf-node-06:/jfbcore/jf-bin/launcher_bins# docker pull 192.168.1.16:5000/test
    Using default tag: latest
    Error response from daemon: Get https://192.168.1.16:5000/v2/: http: server gave HTTP response to HTTPS client
    "insecure-registries": ["192.168.1.16:5000"],
    """
    
    _, err = launch_on_host('docker pull {}test'.format(settings.DOCKER_REGISTRY_URL), ignore_stderr=True)
    REGISTRY_URL = settings.DOCKER_REGISTRY_URL[:-1] if settings.DOCKER_REGISTRY_URL[-1] == "/" else settings.DOCKER_REGISTRY_URL
    if "manifest unknown: manifest unknown" in err:
        pass
    elif "connect: connection refused" in err:
        raise RuntimeError('Docker registry : [{0}] is not working. \n \
                            check registry URL (IP and Port). \n\
                            1. DOCKER_REGISTRY_URL value in settings.ini. \n\
                            2. "docker ps | grep JFB-Docker-REGISTRY" status. \n\
                            3. check "/jfbcore/jf-bin/docker.crt, docker.key" is file or folder '.format(REGISTRY_URL))

    elif "server gave HTTP response to HTTPS client" in err:
        raise RuntimeError('Docker registry : [{0}] is not working. \n \
                            check registry URL (IP and Port). \n \
                            1. cat /etc/docker/daemon.json -- "insecure-registries" : ["{0}"]. \n \
                            if not exist, please add "insecure-registries" : ["{0}"] in /etc/docker/daemon.json" and "service docker restart". '.format(REGISTRY_URL))
    else :
        raise RuntimeError('Docker registry : ["{0}"] is not working. \n \
                            Error message : {1} \n \
                            check registry image, It could exist [ {0}/test ] in registry \n \
                            1. "docker exec -it JFB-Docker-REGISTRY /bin/sh" \n \
                            2. "cd /var/lib/registry/docker/registry/v2/repositories", "ls" \n \
                            3. check that test folder exist. if exist, please delete "test" folder, and restart master'.format(REGISTRY_URL, err))

def db_connection_check():
    import utils.db as db

    def check_conn_db_top():
        conn, mode = db.get_conn_db_top()
        return mode

    def check_conn_db():
        conn, mode = db.get_conn_db()
        return mode
        
    def check_conn_dummy_db():
        conn, mode = db.get_conn_dummy_db()
        return mode

    def check_db(func):
        try:
            mode = func()
            if mode == db.CONN_MODE_SOCKET:
                print("DB CONNECT BY : {}. OK".format(mode))
            elif mode == db.CONN_MODE_PORT:
                print("[Warn] DB CONNECT BY : {}. OK - A socket connection is recommended.".format(mode))
        except Exception as e:
            raise RuntimeError("""DB CONNECT ERROR : {error} -  
                                1. Check the DB container status (docker -a | grep {jf_docker})
                                2. Check the DB connection info (settings.ini - [Maria DB Settings])
                                    - Check DB host / port or DB Unix Socket file exist.
                                    - Check user / password
                            """.format(error=e, jf_docker=JF_DB_DOCKER))


    check_db(func=check_conn_db_top)

def db_schema_check():
    import utils.db as db
    from utils.common import get_add_del_item_list, get_line_print


    def table_list_compare(new, old, logs):
        add_list, del_list = get_add_del_item_list(new, old)
        # print("Table to add : ", add_list)
        logs.append("Table to add : " + str(add_list))
        # print("Table to del : ", del_list)
        logs.append("Table to del : " + str(del_list))
        return add_list, del_list

    def table_describe_compare(new, old):
        logs = []
        match = True
        def get_table_field_list(cols):
            table_field_list = [ col['Field'] for col in cols ] 
            return table_field_list
        
        def get_field_detail(field_name, cols):
            field_detail = None
            for field in cols:  
                if field["Field"] == field_name:
                    field_detail = field
                    
            return field_detail
        
        def compare_col_detail(new_field, old_field):
            match = True
            compare_key_list = ["Type", "Null", "Key", "Default", "Extra"]
            for key in compare_key_list:
                if new_field.get(key) != old_field.get(key):
                    match = False
                    # print("Field [{}]'s detail [{}] that does not match : New [{}] != Old [{}] ".format(new_field.get("Field"), key, new_field.get(key), old_field.get(key)))
                    logs.append("Field [{}]'s detail [{}] that does not match : New [{}] != Old [{}] ".format(new_field.get("Field"), key, new_field.get(key), old_field.get(key)))
            return match
        
        """
        new = [
            {'Field': 'id', 'Type': 'int(11)', 'Null': 'NO', 'Key': 'PRI', 'Default': None, 'Extra': 'auto_increment'}
            {'Field': 'user', 'Type': 'varchar(50)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'request', 'Type': 'varchar(50)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'method', 'Type': 'varchar(50)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'body', 'Type': 'varchar(10000)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'success_check', 'Type': 'char(1)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'datetime', 'Type': 'varchar(20)', 'Null': 'YES', 'Key': '', 'Default': 'current_timestamp()', 'Extra': ''}
        ]
        """
        # 1. compare field
        # 2. compare type, Null, Key, Default, 'Extra'
        new_table_field_list = get_table_field_list(new)
        old_table_field_list = get_table_field_list(old)
        
        add_list, del_list = get_add_del_item_list(new=new_table_field_list, old=old_table_field_list)
        # Field_a -> Field_b 가 된 경우에는 _a 가 _b가 되었다는 것은 알 수 없음
        if len(add_list) > 0:
            # 설치 된 서버에서 추가 해야 할 필드
            # print("Field to add : ", add_list)
            logs.append("Field to add : " + str(add_list))
            match = False
        if len(del_list) > 0:
            # 설치 된 서버에서 삭제 해야 할 필드
            # print("Field to del : ", del_list)
            logs.append("Field to del : " + str(del_list))
            match = False
        
        for field_name in new_table_field_list:
            # 삭제 되거나 추가 된 필드는 비교 할 수 없기에
            if field_name in del_list:
                # print("Not match Field [{}] : This field removed".format(field_name))
                logs.append("Not match Field [{}] : This field removed".format(field_name))
                continue
            if field_name in add_list:
                # print("Not match Field [{}] : have to add to the installed DB.".format(field_name))
                logs.append("Not match Field [{}] : have to add to the installed DB.".format(field_name))
                continue
                
            new_field = get_field_detail(field_name, new)
            old_field = get_field_detail(field_name, old)
            if not compare_col_detail(new_field=new_field, old_field=old_field):
                match = False
        
        return match, logs
    
    def constraint_check(old_db_info, new_db_info):
        """
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'PRIMARY', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_training_tool', 'CONSTRAINT_TYPE': 'PRIMARY KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_training_tool_ibfk_1', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_training_tool', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_training_tool_ibfk_2', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_training_tool', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'PRIMARY', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_jupyter', 'CONSTRAINT_TYPE': 'PRIMARY KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_jupyter_ibfk_1', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_jupyter', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_jupyter_ibfk_2', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_jupyter', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'PRIMARY', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_hyperparamsearch', 'CONSTRAINT_TYPE': 'PRIMARY KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_hyperparamsearch_ibfk_1', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_hyperparamsearch', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_hyperparamsearch_ibfk_2', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_hyperparamsearch', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_hyperparamsearch_ibfk_3', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_hyperparamsearch', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'FK_deployment_worker_jfb.deployment', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'deployment_worker', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'PRIMARY', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_job', 'CONSTRAINT_TYPE': 'PRIMARY KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_job_ibfk_1', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_job', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_job_ibfk_2', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_job', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_job_ibfk_3', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_job', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'PRIMARY', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_deployment', 'CONSTRAINT_TYPE': 'PRIMARY KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_deployment_ibfk_1', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_deployment', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_deployment_ibfk_2', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_deployment', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_deployment_ibfk_3', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_deployment', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb', 'CONSTRAINT_NAME': 'record_deployment_ibfk_4', 'TABLE_SCHEMA': 'jfb', 'TABLE_NAME': 'record_deployment', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb_dummy', 'CONSTRAINT_NAME': 'unique_key_2', 'TABLE_SCHEMA': 'jfb_dummy', 'TABLE_NAME': 'training_port', 'CONSTRAINT_TYPE': 'UNIQUE'}
        {'CONSTRAINT_CATALOG': 'def', 'CONSTRAINT_SCHEMA': 'jfb_dummy', 'CONSTRAINT_NAME': 'deployment_worker_ibfk_6', 'TABLE_SCHEMA': 'jfb_dummy', 'TABLE_NAME': 'deployment_worker', 'CONSTRAINT_TYPE': 'FOREIGN KEY'}
        """
        def is_exist(table_name, constraint_name, target):
            for info in target:
                if info["TABLE_NAME"] == table_name and info["CONSTRAINT_NAME"] == constraint_name:
                    return True
            return False
        
        # 삭제 해야하는 부분 (없어지는 데이터)
        last_table_name = ""
        
        print("----Have To Delete item List----")
        for info in old_db_info:
            if is_exist(table_name=info["TABLE_NAME"], constraint_name=info["CONSTRAINT_NAME"], target=new_db_info) == False:
                if last_table_name != info["TABLE_NAME"]:
                    print("Table [{}]\n  Name [{}]. Type [{}]".format(info["TABLE_NAME"], info["CONSTRAINT_NAME"], info["CONSTRAINT_TYPE"]))
                else:
                    print("  Name [{}]. Type [{}]".format(info["CONSTRAINT_NAME"], info["CONSTRAINT_TYPE"]))
                last_table_name = info["TABLE_NAME"]
        
        print("\n\n\n")
        # 추가 해야하는 부분 
        print("----Have To Add item List----")
        for info in new_db_info:
            if is_exist(table_name=info["TABLE_NAME"], constraint_name=info["CONSTRAINT_NAME"], target=old_db_info) == False:
                if last_table_name != info["TABLE_NAME"]:
                    print("Table [{}]\n  Name [{}]. Type [{}]".format(info["TABLE_NAME"], info["CONSTRAINT_NAME"], info["CONSTRAINT_TYPE"]))
                else:
                    print("  Name [{}]. Type [{}]".format(info["CONSTRAINT_NAME"], info["CONSTRAINT_TYPE"]))
                last_table_name = info["TABLE_NAME"]
    
    print(get_line_print("DB TABLE AND TABLE DETAIL CHECKING SKIP")[0])
    if settings.JF_DB_ATTEMP_TO_CREATE == False:
        print("CHECKING SKIP.  settings - JF_DB_ATTEMP_TO_CREATE = {}".format(settings.JF_DB_ATTEMP_TO_CREATE))
        print(get_line_print("DB TABLE AND TABLE DETAIL CHECKING SKIP")[1],"\n\n\n")
        return 
    
    



    jfb_table_list, jfb_table_describe = db.get_jfb_DB_table_list_and_describe()
    jfb_dummy_table_list, jfb_dummy_table_describe  = db.get_jfb_dummy_DB_table_list_and_describe()
    logs = []
    add_list, del_list = table_list_compare(new=jfb_dummy_table_list, old=jfb_table_list, logs=logs)
    
    print(get_line_print("DB TABLE CHECKING")[0])
    for log in logs:    
        print(log)
    print(get_line_print("DB TABLE CHECKING")[1],"\n\n\n")


    print(get_line_print("TABLE DETAIL CHECKING")[0])
    logs_match = []
    logs_no_match = []
    for table_name in jfb_dummy_table_list:
        # print("Start table [{}] comparison. ".format(table_name))
        match, logs = table_describe_compare(new=jfb_dummy_table_describe.get(table_name), old=jfb_table_describe.get(table_name))
        if match:
            logs_match.append("Table [{}] comparison. Version match OK.".format(table_name))
            # print("[{}] Version match OK.".format(table_name))
        else :
            logs_no_match.append("Table [{}] comparison.".format(table_name))
            for log in logs:
                # print("Warining : ", log)
                logs_no_match.append("Warining : {}".format(log))
            logs_no_match.append("")

    print("----DESCRIBE NO MATCH LIST----")
    for logs in logs_no_match:
        print(logs)
    
    print("----DESCRIBE MATCH LIST----")
    for logs in logs_match:
        print(logs)
    
    print("\n\n\n")
    
    print("----CONSTRAINT CHECK LIST----")
    jfb_dummy_info = db.get_table_constraint_info(settings.JF_DUMMY_DB_NAME)
    jfb_info = db.get_table_constraint_info(settings.JF_DB_NAME)

    constraint_check(old_db_info=jfb_info, new_db_info=jfb_dummy_info)

    print(get_line_print("TABLE DETAIL CHECKING")[1])
    #TODO 단순 경고로만 할 것인지, RuntimeError로 할 것 인지?
    #Force Running이 있기에 RuntimeError 로?
    #추가 해야 할 Table이 있거나, 추가 해야할 Field가 있을 경우에는 RuntimeError
    #타입 변경은 경고 ?
    #삭제 해야 할 부분들은 경고 수준에서 가능
    pass

def kube_network_attachment_definitions_check():
    import utils.kube_network_attachment_definitions as kube_nad
    import utils.kube as kube
    import utils.kube_parser as kube_parser
    # Case Multus CNI Not exist 
    # Case Whereabouts CNI
    # Case Role Not exist 
    # + INFINIBAND
    if settings.KUBER_NETWORK_ATTACHMENT_DEFINITION_USE != True:
        print("Kubernetes KUBER_NETWORK_ATTACHMENT_DEFINITION_USE = [{}]. SKIP Check.".format(settings.KUBER_NETWORK_ATTACHMENT_DEFINITION_USE))
        return

    print("Kubernetes Custom Resource Check")
    req_resource_list = [
        "ippools.whereabouts.cni.cncf.io",
        "network-attachment-definitions.k8s.cni.cncf.io",
        "overlappingrangeipreservations.whereabouts.cni.cncf.io",
    ]
    print("Req Resoure List")
    for req_resource in req_resource_list:
        print("  - {}".format(req_resource))
    print("\n\n")


    custom_resource_list = kube.get_list_custom_resource()
    print("Current Custom Resource Check")
    for custom_resource in custom_resource_list.items:
        item_name = kube_parser.parsing_item_name(custom_resource)
        print("  - {}  [{}]".format(item_name, item_name in req_resource_list))

 
    print("Kubernetes network attachment definitions API connect test. ")
    print("Maybe Check result (None) is fine.")

    def error_check(code, method, role_error_list, token_error_list, unknown_error_list):
        code = result.get("code")
        if code == 403:
            role_error_list.append((method, code))
        elif code == 401:
            token_error_list.append((method, code))
        elif code != 200 and code != None:
            unknown_error_list.append((method, code))

    role_error_list = []
    token_error_list = []
    unknown_error_list = []
    result = kube_nad.get_list_network_attachment_definition()
    print("GET CHECK : ", result.get("code"))
    error_check(code=result.get("code"), method="get", role_error_list=role_error_list, token_error_list=token_error_list, unknown_error_list=unknown_error_list)

    # body = kube_nad.get_network_attachment_definitions_body_for_ethernet(node_name="test_node", network_interface_type="test_type", interface_name="test_name", nad_name="test-nad")
    body = kube_nad.get_network_attachment_definitions_body_for_ethernet(nad_name="test-nad", nad_labels={}, cni_config={}, node_interface="host-interface")
    result = kube_nad.create_network_attachment_definition(body=body)
    print("CREATE CHECK : ", result.get("code"))
    error_check(code=result.get("code"), method="create", role_error_list=role_error_list, token_error_list=token_error_list, unknown_error_list=unknown_error_list)

    result = kube_nad.patch_network_attachment_definition(name="test-nad",body=body)
    print("PATCH CHECK : ", result.get("code"))
    error_check(code=result.get("code"), method="patch", role_error_list=role_error_list, token_error_list=token_error_list, unknown_error_list=unknown_error_list)

    result = kube_nad.delete_network_attachment_definition(name="test-nad")
    print("DELETE CHECK : ", result.get("code"))
    error_check(code=result.get("code"), method="delete", role_error_list=role_error_list, token_error_list=token_error_list, unknown_error_list=unknown_error_list)

    if len(role_error_list) > 0 and settings.KUBER_NETWORK_ATTACHMENT_DEFINITION_USE:
        # 403 Error
        raise RuntimeError('Check Kubernetes role. This verb is cannot access. \n \
                            Error list (Method, Error Code) [{}] \n \
                            1. kubectl get role  \n \
                            2. kubectl get rolebinding \n \
                            3. if not exist. \n \
                               option 1 - run cd /jfbcore/installer/setting/kubernetes-plugin && ./init.sh \n \
                               option 2 - set settings.ini [KUBER_NETWORK_ATTACHMENT_DEFINITION_USE = False]'.format(role_error_list))

    if len(token_error_list) > 0 and settings.KUBER_NETWORK_ATTACHMENT_DEFINITION_USE:
        # 401 Error
        raise RuntimeError('Check Kubernetes API access Token. \n \
                            Error list (Method, Error Code) [{}] \n \
                            Option 1 - Try restarting the JF-master \n \
                            Option 2 - Try Reset Kubernetes and Try Option 1'.format(token_error_list))

    if len(unknown_error_list) > 0 and settings.KUBER_NETWORK_ATTACHMENT_DEFINITION_USE:
        # 200을 제외한 Error
        raise RuntimeError('Contact your administrator with this information. \n \
                            Error list (Method, Error Code) [{}]'.format(unknown_error_list))

def launch_on_host_check():
    from utils.common import launch_on_host, execute_command_ssh
    import paramiko
    """
    launch on host로 명령어가 잘 날아가는지 
    사용 하는 bin들이 있는지
    """ 
    error = ""
    try:
        execute_command_ssh(
            address=settings.LAUNCHER_DEFAULT_ADDR, 
            username=settings.LAUNCHER_ID, 
            password=settings.LAUNCHER_PW, 
            key_file_name=settings.LAUNCHER_PRIVATE_KEY,
            command=" ",
            error_raise=True
        )
        print("Launcher Access Check OK.")
    except paramiko.ssh_exception.AuthenticationException as e:
        error = e
        # 비밀번호 틀리거나 잘못 된 Key 일 때
    except IndexError as e:
        error = e
        # Key 파일이 이상할 때

    except Exception as e:
        error = e 
        # private key notfound = FileNotFoundError
        traceback.print_exc()
    finally :
        if error != "":
            raise RuntimeError("Auth error [{error}]. \n \
                        1. Check Launcher username [{username}] \n \
                        2. Check password [{password}] or key_file [{key_file_name}] \n \
                            Login MODE Key login - [{key_login}] \n \
                        3. Test - ssh {username}@{address} or ssh -i {key_file_name} {username}@{address} \n \
                        option - 1. change settings.ini LAUNCHER_* Setting \n \
                        option - 2. run /jfbcore/installer/setting/launcher-user-create/create.sh ".format(
                        error=error, username=settings.LAUNCHER_ID, password=settings.LAUNCHER_PW, key_file_name=settings.LAUNCHER_PRIVATE_KEY,
                        key_login=settings.LAUNCHER_KEY_LOGIN, address=settings.LAUNCHER_DEFAULT_ADDR
                        ))

    try:
        # 기본 Binary 체크
        launch_on_host('docker images')
        launch_on_host('kubectl get nodes')
        launch_on_host('kubeadm token list')
        print("Launcher Binary [docker, kubectl, kubeadm] - OK")
    except Exception as e:
        raise RuntimeError("Launcher binary Error. \n \
                            {} \n \
                            option 1 - check launcher binary files. (default = /jfbcore/jf-bin/launcher_bins/) \n \
                            option 2 - if not exist bin. run /jfbcore/installer/setting/launcher-binary-build/build.sh \n \
                            option 3 - check directory permission if using link file. change permission (ex - chmod 555 .) ".format(e))

def db_item_and_dir_check():
    import utils.db as db
    import os
    import utils.common as common
    import workspace 
    import traceback
    """
        Description : 
            DB 정보 기반으로 
            생성 해야하는 데이터 | 없어져야 하는 데이터 구분
            
            1 DB에만 존재
            
            1.1 자동 생성 해야하는 데이터
                
                대상 데이터 - workspace
                동작 - API에서 폴더구조 자동 생성 (빈 폴더)
                
            1.2 무시해도 괜찮은 데이터
            
                대상 데이터 - training, deployment
                동작 - 따로 관리 X. 실행 시 필요한 폴더 구조 자동 생성. 없는 부분에서 에러 나는 부분은 예외 처리 (어차피 빈 데이터).
            
            2. DIR로만 존재
            
            2.1 없어져야 하는 데이터 
            
                대상 데이터 - workspace, training, deployment
                동작 - 시작 시 알림. 관리자 판단하에 제거 ( DB 백업 복원 사이에 문제로 DB 데이터가 날아가면 자동 삭제는 위험함 )
                       로컬에 남아 있으면 동일 이름으로 생성 시 문제 발생
        
        Args :
            
        Returns : 
            None
    """
    
    # Workspace 확인
    workspace_dir_list = [ name for name in os.listdir(JF_WS_DIR) if os.path.isdir(os.path.join(JF_WS_DIR, name)) ]
    workspace_name_list = [ workspace_info["workspace_name"] for workspace_info in db.get_workspace_list() ]
    
    # add_item_list - 폴더 존재 X DB 존재 O -> base dir 추가
    # del_item_list - 폴더 존재 O DB 존재 X -> 관리자 확인 필요
    workspace_add_item_list, workspace_del_item_list = common.get_add_del_item_list(new=workspace_name_list, old=workspace_dir_list)
    
    print("Workspace Auto Check. (PATH - {})".format(JF_WS_HOST_DIR))
    print("----------------------------------")
    print("Workspace auto create list. It exists in the DB, but it does not exist as a dir.")
    
    if len(workspace_add_item_list) == 0:
        print("OK")
    else :
        for workspace_add_item in workspace_add_item_list:
            # 자동 생성
            print("Workspace [{}] Dir Auto Create".format(workspace_add_item))
            workspace.create_workspace_base_structure(workspace_name=workspace_add_item, force=True)
    
    print("----------------------------------\n\n")
    print("----------------------------------")
    print("Workspace Dir List not in database. Delete or move data after creating Workspace. ")
    
    if len(workspace_del_item_list) == 0:
        print("OK")
    else:
        for workspcae_del_item in workspace_del_item_list:
            # DB에 없는 폴더 전달
            print("Workspace [{}] Need to be confirmed.".format(workspcae_del_item))
            
    print("----------------------------------\n\n")
    
    # Training 확인
    training_dir_list = []
    training_db_list = [ {"workspace_name": training_info["workspace_name"], "training_name": training_info["training_name"]} for training_info in db.get_training_list() ]

    # 실제 폴더로 존재하는 training list
    for workspace_dir in workspace_dir_list:
        training_base_path = JF_TRAINING_PATH.format(workspace_name=workspace_dir, training_name="")
        temp_training_dir_list = []
        
        try:
            workspace_base_training_dir_list = os.listdir(training_base_path)
        except FileNotFoundError as fne:
            continue
        except Exception as e:
            traceback.print_exc()
            
        for name in workspace_base_training_dir_list:
            if os.path.isdir(JF_TRAINING_PATH.format(workspace_name=workspace_dir, training_name=name)):
                training_dir_list.append({"workspace_name": workspace_dir, "training_name": name})

    temp_training_dir_list= [ "{}/{}".format(training_dir["workspace_name"], training_dir["training_name"]) for training_dir in training_dir_list ]
    temp_training_db_list= [ "{}/{}".format(training_db["workspace_name"], training_db["training_name"]) for training_db in training_db_list ]

    training_add_item_list, training_del_item_list = common.get_add_del_item_list(new=temp_training_db_list, old=temp_training_dir_list)

    print("Training Auto Check (PATH - {})".format(JF_TRAINING_HOST_PATH))
    print("----------------------------------")
    print("Training list (Warn - Automatically generated when used.). It exists in the DB, but it does not exist as a dir. ")
    
    if len(training_add_item_list) == 0:
        print("OK")
    
    for training_add_item in training_add_item_list:
        workspace_name, training_name = training_add_item.split("/")
        print("Workspace [{}] Training [{}] Dir not exist.".format(workspace_name, training_name))
    
    print("----------------------------------\n\n")
    
    print("----------------------------------")
    print("Training Dir List not in database. Delete or move data after creating Training.")
    
    if len(training_del_item_list) == 0:
        print("OK")
    # Del Item 은 디스플레이만
    for training_del_item in training_del_item_list:
        workspace_name, training_name = training_del_item.split("/")
        print("Workspace [{}] Training [{}] Need to be confirmed.".format(workspace_name, training_name))
    print("----------------------------------\n\n")
    
    # Deployment 확인
    deployment_dir_list = []
    deployment_db_list = [ {"workspace_name": deployment_info["workspace_name"], "deployment_name": deployment_info["name"]} for deployment_info in db.get_deployment_list() ]

    # 실제로 폴더로 존재하는 deployment list
    for workspace_dir in workspace_dir_list:
        deployment_base_path = JF_DEPLOYMENT_PATH.format(workspace_name=workspace_dir, deployment_name="")
        temp_deployment_dir_list = []
        
        try:
            workspace_base_deployment_dir_list = os.listdir(deployment_base_path)
        except FileNotFoundError as fne:
            continue
        except Exception as e:
            traceback.print_exc()
            
        for name in workspace_base_deployment_dir_list:
            if os.path.isdir(JF_DEPLOYMENT_PATH.format(workspace_name=workspace_dir, deployment_name=name)):
                deployment_dir_list.append({"workspace_name": workspace_dir, "deployment_name": name})
                
                
        for deployment_dir in [ name for name in os.listdir(deployment_base_path) if os.path.isdir(JF_DEPLOYMENT_PATH.format(workspace_name=workspace_dir, deployment_name=name)) ]:
            deployment_dir_list.append({"workspace_name": workspace_dir, "deployment_name": deployment_dir})

    temp_deployment_dir_list= [ "{}/{}".format(deployment_dir["workspace_name"], deployment_dir["deployment_name"]) for deployment_dir in deployment_dir_list ]
    temp_deployment_db_list= [ "{}/{}".format(deployment_db["workspace_name"], deployment_db["deployment_name"]) for deployment_db in deployment_db_list ]

    deployment_add_item_list, deployment_del_item_list = common.get_add_del_item_list(new=temp_deployment_db_list, old=temp_deployment_dir_list)
    
    print("Deployment Auto Check. (PATH - {})".format(JF_DEPLOYMENT_HOST_PATH))
    print("----------------------------------")
    print("Deployment list (Warn - Automatically generated when used.). It exists in the DB, but it does not exist as a dir.")
    
    if len(deployment_add_item_list) == 0:
        print("OK")
    
    for deployment_add_item in deployment_add_item_list:
        workspace_name, deployment_name = deployment_add_item.split("/")
        print("Workspace [{}] Deployment [{}] Dir not exist.".format(workspace_name, deployment_name))
    
    print("----------------------------------\n\n")
    
    print("----------------------------------")
    print("Deployment Dir List not in database. Delete or move data after creating Deployment.")
    
    if len(deployment_del_item_list) == 0:
        print("OK")
    
    for deployment_del_item in deployment_del_item_list:
        workspace_name, deployment_name = deployment_del_item.split("/")
        print("Workspace [{}] Deployment [{}] Need to be confirmed.".format(workspace_name, deployment_name))
    
    print("----------------------------------\n\n")
    
def sys_check():
    from utils.common import launch_on_host, ensure_path, writable_path
    """System checking when starting the app."""
    # Ensure the upload dir and workspace dir is exist and writable.
    print("\n\n\n============== System Checking ==============")
    ensure_path(settings.JF_WS_DIR)
    ensure_path(settings.JF_UPLOAD_DIR)
    ensure_path(settings.JF_LOG_DIR)
    if not writable_path(settings.JF_WS_DIR):
        raise RuntimeError('{} is not writable. check permission.'.format(settings.JF_WS_DIR))
    if not writable_path(settings.JF_UPLOAD_DIR):
        raise RuntimeError('{} is not writable. check permission.'.format(settings.JF_UPLOAD_DIR))
    if not writable_path(settings.JF_LOG_DIR):
        raise RuntimeError('{} is not writable. check permission.'.format(settings.JF_LOG_DIR))

    # Ensure jf-ip is given and launcher system works well.
    # Permission check
    launch_on_host_check()

    db_connection_check() 
    try:
        db_item_and_dir_check()
    except:
        traceback.print_exc()
    #TODO kube plugin check

    # system running check
    # docker registry 관련
    docker_registry_check()
    
    # ngc 관련
    # launch_on_host('ngc --version')  # not critical

    # TODO mysql running, mysql schema
    db_schema_check()
    kube_network_attachment_definitions_check()
    print("\n\n\n==========================================\n\n\n")
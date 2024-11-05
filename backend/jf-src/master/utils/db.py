from datetime import date, datetime, timedelta
from threading import Timer
import os.path
import sqlite3
import pwd
import crypt
import os
import pymysql
import json
import time
from collections import OrderedDict
import re

from utils.common import log_function_call
import utils.common as common
from utils.db_items import *

import sys
sys.path.insert(0, os.path.abspath('..'))
from settings import JF_DB_DIR
import settings

import traceback
from TYPE import *
# BASE_DIR = JF_DB_DIR
# db_path = os.path.join(BASE_DIR, "jfb.db")

# try:
#     db_host = settings.JF_DB_HOST
# except AttributeError:
#     db_host = '192.168.1.13'
# try:
#     db_port = settings.JF_DB_PORT
# except AttributeError:
#     db_port = 3306

# try:
#     db_unix_socket = settings.JF_DB_UNIX_SOCKET
# except AttributeError:
#     db_unix_socket = '/jf-src/master/conf/db/mysqld.sock'
# try:
#     db_user = settings.JF_DB_USER
# except AttributeError:
#     db_user = 'root'
# try:
#     db_pw = settings.JF_DB_PW
# except AttributeError:
#     db_pw = '1234'
# try:
#     db_name = settings.JF_DB_NAME
# except AttributeError:
#     db_name = 'jfb'
# try:
#     db_charset = settings.JF_DB_CHARSET
# except AttributeError:
#     db_charset = 'utf8'

# db_dummy_name = db_name + "_dummy"

# conn = None

# from flask import g
# from contextlib import contextmanager

# @contextmanager
# def get_db_top():
#     try:
#         conn = None
#         try:
#             conn = pymysql.connect(unix_socket=db_unix_socket, user=db_user, password=db_pw, charset=db_charset,
#                 cursorclass=pymysql.cursors.DictCursor)
#         except Exception as e:
#             # print("DB CONN ERROR : ", str(e))
#             conn = pymysql.connect(host=db_host, port=db_port, user=db_user, password=db_pw, charset=db_charset,
#                 cursorclass=pymysql.cursors.DictCursor)

#         yield conn
#     finally:
#         conn.close()
#         pass

# @contextmanager
# def get_db():
#     try:
#         conn = None
#         try:
#             conn = pymysql.connect(unix_socket=db_unix_socket, user=db_user, password=db_pw, db=db_name, charset=db_charset,
#                 cursorclass=pymysql.cursors.DictCursor)
#         except Exception as e:
#             # print("DB CONN ERROR : ", str(e))
#             conn = pymysql.connect(host=db_host, port=db_port, user=db_user, password=db_pw, db=db_name, charset=db_charset,
#                 cursorclass=pymysql.cursors.DictCursor)

#         yield conn
#     finally:
#         conn.close()
#         pass

# @contextmanager
# def get_dummy_db():
#     try:
#         conn = None
#         try:
#             conn = pymysql.connect(unix_socket=db_unix_socket, user=db_user, password=db_pw, db=db_dummy_name, charset=db_charset,
#                 cursorclass=pymysql.cursors.DictCursor)
#         except Exception as e:
#             # print("DB CONN ERROR : ", str(e))
#             conn = pymysql.connect(host=db_host, port=db_port, user=db_user, password=db_pw, db=db_dummy_name, charset=db_charset,
#                 cursorclass=pymysql.cursors.DictCursor)

#         yield conn
#     finally:
#         conn.close()
#         pass

def get_table_describe_info(conn):
    table_list = []
    table_describe = {}
    """
    table_describe = {
        "TABLE_NAME_a" : [
            {'Field': 'id', 'Type': 'int(11)', 'Null': 'NO', 'Key': 'PRI', 'Default': None, 'Extra': 'auto_increment'}
            {'Field': 'user', 'Type': 'varchar(50)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'request', 'Type': 'varchar(50)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'method', 'Type': 'varchar(50)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'body', 'Type': 'varchar(10000)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'success_check', 'Type': 'char(1)', 'Null': 'YES', 'Key': '', 'Default': None, 'Extra': ''}
            {'Field': 'datetime', 'Type': 'varchar(20)', 'Null': 'YES', 'Key': '', 'Default': 'current_timestamp()', 'Extra': ''}
        ],
        "TABLE_NAME_b" : [{..}..]
    }
    """
    
    cur = conn.cursor()
    sql = '''SHOW TABLES'''
    cur.execute(sql)
    res = cur.fetchall()
    
    table_list = [ list(table.values())[0] for table in res ]
    
    for table in table_list:
        sql = '''DESCRIBE {}'''.format(table)
        cur.execute(sql)
        res = cur.fetchall()
        
        table_describe[table] = res
        
    return table_list, table_describe

def get_table_constraint_info(db_name):
    with get_db() as conn:
        cur = conn.cursor()
        sql = """
            SELECT *
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS TC
            WHERE TC.CONSTRAINT_SCHEMA = '{}' 
        """.format(db_name)
        cur = conn.cursor()
        cur.execute(sql)
        res = cur.fetchall()
        
    return res

def get_jfb_DB_table_list_and_describe():
    with get_db() as conn:
        table_list, table_describe = get_table_describe_info(conn)
    return table_list, table_describe

def get_jfb_dummy_DB_table_list_and_describe():
    with get_dummy_db() as conn:
        dummy_table_list, dummy_table_describe = get_table_describe_info(conn)
    return dummy_table_list, dummy_table_describe

def check_exist_user_from_linux(new_user_name):
    flag = False
    for p in pwd.getpwall():
        if new_user_name == p[0]:
            return True
    return flag


def init_create_db(conn):
    import utils.schema as schema
    sql_list= schema.schema.split(";")
    # sqls = open(BASE_DIR+'/schema.sql', 'r').read()
    # sql_list = sqls.split(';')
    for sql in sql_list:
        if sql != '' and sql != '\n':
            try:
                conn.cursor().execute(sql)
            except:
                traceback.print_exc()
        #conn.cursor().executescript(f.read())
    # conn.cursor().execute()
    conn.commit()

def get_delete_db_trigger_sql(db_name):
    """
        트리거 삭제 쿼리 리스트
    """
    with get_db() as conn:
        cur = conn.cursor()
        sql = """
            SELECT Concat('DROP TRIGGER ', Trigger_Name, ';') as drop_lines
            FROM  information_schema.TRIGGERS 
            WHERE TRIGGER_SCHEMA = '{}';
        """.format(db_name)
        cur = conn.cursor()
        cur.execute(sql)
        res = cur.fetchall()
    return res

def init_create_db_trigger(conn, db_name):
    import utils.db_trigger as trigger
    # 트리거 삭제 쿼리 리스트
    sql_trigger_delete_info = get_delete_db_trigger_sql(db_name)
    sql_trigger_delete_list = [info["drop_lines"] for info in sql_trigger_delete_info]
    # 트리거 생성 쿼리 리스트
    sql_trigger_list= trigger.trigger.split("//")
    
    # 전체 트리거 쿼리 리스트 = 삭제 + 생성
    sql_list = sql_trigger_delete_list + sql_trigger_list
    for sql in sql_list:
        if sql != '' and sql != '\n':
            try:
                conn.cursor().execute(sql)
            except:
                traceback.print_exc()
        #conn.cursor().executescript(f.read())
    # conn.cursor().execute()
    conn.commit()

def init_node():
    # NODE 이름은 같은데 IP가 다르면 여기서 한번 잡기는 함
    with get_db() as conn:
        from nodes import update_node_info
        from settings import JF_WORKER_PORT
        import utils.kube as kube
        import requests
        JF_WORKER_PORT = common.get_args().jf_worker_port if common.get_args().jf_worker_port is not None else JF_WORKER_PORT

        node_gpu_info_list = kube.get_select_node_gpu_info_list(gpu_mode=GPU_ALL_MODE, _init=True)
        print("!!!!!!!",node_gpu_info_list)
        for node in node_gpu_info_list:
            sql = "SELECT count(id) as count, id, ip FROM node WHERE LOWER(`name`) = %s"
            cursor = conn.cursor()
            # cursor.execute(sql,(node["ip"],))
            cursor.execute(sql,(node["name"],))
            node_chk = cursor.fetchone()
            if node_chk["count"] == 0:
                print("INIT NODE - NEW KUBER NODE ADD TO DB ..... ", node["ip"])
                # ip = kube.get_node_ip(node_name=node["node"])
                ip = node["ip"]
                get_status, device_info = common.get_worker_device_info(ip=ip)
                if get_status == True:
                    insert_node_from_device_info(ip=ip, device_info=device_info)
                    node_id = get_node_using_ip(ip=ip)["id"]
                    insert_node_gpu_from_device_info(node_id=node_id, device_info=device_info)

                get_status, interfaces = common.get_worker_network_interfaces(ip=ip)
                if get_status == True:
                    insert_node_interface(node_id, interfaces=interfaces)

            else :
                kuber_node_internal_ip = kube.get_node_ip(node_name=node["name"])
                print("INIT NODE - NODE DB INFO SYNC..... ", node_chk["ip"])
                node_ip = node_chk["ip"]
                if kuber_node_internal_ip != node_chk["ip"]:
                    print("INIT NODE - NODE DB INFO SYNC..... NODE IP {} -> {}".format(node_chk["ip"], kuber_node_internal_ip))
                    update_node_ip(node_id=node_chk["id"], node_ip=kuber_node_internal_ip)
                    node_ip = kuber_node_internal_ip

                db_node_info = get_node(node_ip=node["ip"])
                #     "is_cpu_server": is_cpu_server,
                #     "is_gpu_server": is_gpu_server,
                #     "no_use_server": no_use_server,
                #     "cpu_cores_limit_per_pod": cpu_cores_limit_per_pod,
                #     "cpu_cores_lock_per_pod": cpu_cores_lock_per_pod,
                #     "cpu_cores_limit_per_gpu": cpu_cores_limit_per_gpu,
                #     "cpu_cores_lock_per_gpu": cpu_cores_lock_per_gpu,
                #     "ram_limit_per_pod": ram_limit_per_pod,
                #     "ram_lock_per_pod": ram_lock_per_pod,
                #     "ram_limit_per_gpu": ram_limit_per_gpu,
                #     "ram_lock_per_gpu": ram_lock_per_gpu,
                #     "ephemeral_storage_limit": ephemeral_storage_limit
                options = { }
                cpu_check_list = [NODE_CPU_LIMIT_PER_POD_DB_KEY, NODE_CPU_LIMIT_PER_GPU_DB_KEY]
                ram_check_list = [NODE_MEMORY_LIMIT_PER_POD_DB_KEY, NODE_MEMORY_LIMIT_PER_GPU_DB_KEY]
                lock_check_list = [NODE_CPU_CORE_LOCK_PER_POD_DB_KEY, NODE_CPU_CORE_LOCK_PER_GPU_DB_KEY, 
                                    NODE_MEMORY_LOCK_PER_POD_DB_KEY, NODE_MEMORY_LOCK_PER_GPU_DB_KEY]
                
                # 비어있는 OPTION 정보를 노드 최대값으로 맞춰줌
                for key in cpu_check_list:
                    if db_node_info[key] is None:
                        options[key] = db_node_info["cpu_cores"]
                
                for key in ram_check_list:
                    if db_node_info[key] is None:
                        options[key] = int(float(db_node_info["ram"].replace("GB","")))

                for key in lock_check_list:
                    if db_node_info[key] is None:
                        options[key] = 0
                if len(options) > 0:
                    update_node_options(node_id=db_node_info["id"], options=options)
                update_node_info(node=db_node_info)

def init_root():
    with get_db() as conn:
        sql = 'SELECT count(id) as count FROM user WHERE name="root"'
        cursor = conn.cursor()
        cursor.execute(sql)
        root_chk = cursor.fetchone()
        if root_chk['count'] == 0:
            sql = "INSERT INTO user (name, uid, user_type) VALUES ('root', '0', '0')"
            conn.cursor().execute(sql)
            conn.commit()

def init_built_in_model_back():
    with get_db() as conn:
        def get_column_keys(sql):
            cursor = conn.cursor()
            cursor.execute(sql)
            columns = cursor.fetchall()
            return columns

        try:
            built_in_model_columns_key = get_column_keys(sql='SHOW COLUMNS FROM jfb.built_in_model')
            columns_key = {
                "training_input_data_form_list":[],
                "deployment_input_data_form_list":[],
                "parameters": {}, # paramter, default_value
                "parameters_description": None
            }
            for key in built_in_model_columns_key:
                columns_key[key["Field"]] = None

            training_form_columns_key = get_column_keys(sql='SHOW COLUMNS FROM jfb.built_in_model_data_training_form')
            training_columns_key = {}
            for key in training_form_columns_key:
                training_columns_key[key["Field"]] = None

            deployment_form_columns_key = get_column_keys(sql='SHOW COLUMNS FROM jfb.built_in_model_data_deployment_form')
            deployment_columns_key = {}
            for key in deployment_form_columns_key:
                deployment_columns_key[key["Field"]] = None

            built_in_parameter_columes_key = get_column_keys(sql='SHOW COLUMNS FROM jfb.built_in_model_parameter')
            parameter_columns_key = {}
            for key in built_in_parameter_columes_key:
                parameter_columns_key[key["Field"]] = None

            models_path = settings.JF_BUILT_IN_MODELS_PATH
            models = os.listdir(models_path)
            model_info_list = []
            for model in models:
                try:
                    info_file = "{}/{}/info.json".format(models_path, model)
                    with open(info_file, encoding="utf-8") as json_file:
                        json_data = json.load(json_file)
                        # model_info = {"path": model}
                        model_info = dict(columns_key)
                        model_info["path"] = model
                        for k, v in json_data.items():
                            if k in columns_key:
                                # if k == "parameters" and type(v) == type({}):
                                #     parameters = ""
                                #     for item in v.items():
                                #         parameters += "--{} {} ".format(item[0], item[1])
                                #     v = parameters
                                if (k == "parameters" or k == "parameters_description") and type(v) == type({}):
                                    m_v = dict(model_info["parameters"])
                                    if k == "parameters":
                                        for p_k, p_v in v.items():
                                            if m_v.get(p_k) is None:
                                                m_v[p_k] = { "parameter" : p_k, "default_value" : p_v }
                                            else :
                                                m_v[p_k]["parameter"] = p_k
                                                m_v[p_k]["default_value"] = p_v

                                    elif k == "parameters_description":
                                        for p_k, p_v in v.items():
                                            if m_v.get(p_k) is None:
                                                m_v[p_k] = { "parameter" : p_k, "parameter_description" : p_v }
                                            else :
                                                m_v[p_k]["parameter"] = p_k
                                                m_v[p_k]["parameter_description"] = p_v
                                    k = "parameters"
                                    v = m_v
                                    # print(k, v)

                                elif k == "training_input_data_form_list" and type(v) == type([]):
                                    for i, training_input_data_form in enumerate(v):
                                        t_info = dict(training_columns_key)
                                        for t_k, t_v in training_input_data_form.items():
                                            if t_k in training_columns_key:
                                                t_info[t_k] = t_v
                                        for t_k in list(training_columns_key.keys()):
                                            if t_info[t_k] is None:
                                                del t_info[t_k]
                                        v[i] = t_info
                                    for i, training_input_data_form in reversed(list(enumerate(v))):
                                        if len(set(["type", "name", "category"])-(set(training_columns_key)-set(training_input_data_form)))< 3:
                                        # if training_input_data_form["type"]==None or training_input_data_form["name"]==None or training_input_data_form["category"]==None:
                                            # print("====training_input_data_form{}".format(training_input_data_form))
                                            del v[i]
                                            
                                elif k == "deployment_input_data_form_list" and type(v) == type([]):
                                    for i, deployment_input_data_form in enumerate(v):
                                        d_info = dict(deployment_columns_key)
                                        # print("====d_info{}".format(d_info))
                                        for d_k, d_v in deployment_input_data_form.items():
                                            if d_k in deployment_columns_key:
                                                d_info[d_k] = d_v
                                        for d_k in list(deployment_columns_key.keys()):
                                            if d_info[d_k] is None:
                                                del d_info[d_k]
                                        v[i] = d_info
                                    for i, deployment_input_data_form in reversed(list(enumerate(v))):
                                        if len(set(["api_key", "location"])-(set(deployment_columns_key)-set(deployment_input_data_form)))<2:
                                        # if deployment_input_data_form["location"]==None or deployment_input_data_form["api_key"]==None:
                                            # print("====deployment_input_data_form{}".format(deployment_input_data_form))
                                            del v[i]
                                            
                                # elif k == "deployment_input_data_form_list" and type(v) == type([]):
                                #     for d_c_k in deployment_columns_key:
                                #         model_info["deployment_input_data_form_list"].append(item)
                                elif k == "input_data_dirs" and type(v) == type([]):
                                    v = ",".join(v)
                                elif k == "deployment_output_types" and type(v) == type([]):
                                    v = ",".join(v)

                                model_info[k] = v


                        for k in list(model_info.keys()):
                            if model_info[k] is None:
                                del model_info[k]
                        # if model_info["id"] is None:
                        #     del model_info["id"]
                        model_info_list.append(model_info)
                    print("Built_in model : [{}] loaded".format(info_file))
                except FileNotFoundError:
                    print("Built_in model : [{}] Not loaded : info.json file not found".format(info_file))
                except NotADirectoryError:
                    pass
                except :
                    print("Built_in model : [{}] Error".format(info_file))
                    traceback.print_exc()


            for model_info in model_info_list:
                training_input_data_form_list = []
                deployment_input_data_form_list = []
                built_in_model_parameter_list = []
                if len(model_info.get("training_input_data_form_list")) > 0:
                    training_input_data_form_list = model_info.get("training_input_data_form_list")
                if len(model_info.get("deployment_input_data_form_list")) > 0:
                    deployment_input_data_form_list = model_info.get("deployment_input_data_form_list")
                if "parameters" in model_info.keys():
                    if model_info.get("parameters") is not None and len(list(model_info.get("parameters").values())) > 0:
                        built_in_model_parameter_list = list(model_info.get("parameters").values())
                    del model_info["parameters"]
                del model_info["training_input_data_form_list"]
                del model_info["deployment_input_data_form_list"]
                

                cur = conn.cursor()
                keys = ",".join(list(model_info.keys()))
                values =  ",".join([ "'{}'".format(value) if type(value) == type("") else "{}".format(value) for value in list(model_info.values()) ])
                print("=======\nvalues: ".format(values))
                sql = """
                    INSERT INTO built_in_model ({}) VALUES ({})
                """.format(keys, values)
                try:
                    cur.execute(sql)
                    conn.commit()
                except pymysql.err.IntegrityError as e:
                    pass
                except Exception as e:
                    traceback.print_exc()
                    print("Built_in model : [{0}] insert Error : {0} ".format(model_info["path"], str(e)))
                    continue

                try:
                    # TODO 기존에 있던 form 과 변경 될 form이 다른 경우에 기존에 생성 했던 form이 남아 있음 (2022-04-12)
                    if len(training_input_data_form_list) > 0:
                        built_in_model_id = get_built_in_model(model_name=model_info["name"])["id"]
                        keys = ""
                        values = []
                        for item in training_input_data_form_list:
                            item["built_in_model_id"] = built_in_model_id
                            keys = ",".join(list(item.keys()))
                            values = ",".join([ "'{}'".format(value) if type(value) == type("") else "{}".format(value) for value in list(item.values()) ])
                            sql = """
                                INSERT INTO built_in_model_data_training_form ({}) VALUES({})
                            """.format(keys, values)
                            try:
                                cur.execute(sql)
                                conn.commit()
                            except pymysql.err.IntegrityError as e:
                                pass
                            except Exception as e:
                                traceback.print_exc()
                except Exception as e:
                    traceback.print_exc()
                    print("Built_in model : [{0}] insert Error : {0} ".format(model_info["path"]), str(e))
                    continue
                try:
                    if len(deployment_input_data_form_list) > 0:
                        built_in_model_id = get_built_in_model(model_name=model_info["name"])["id"]
                        keys = ""
                        values = []

                        for item in deployment_input_data_form_list:
                            item["built_in_model_id"] = built_in_model_id
                            keys = ",".join(list(item.keys()))
                            values = ",".join([ "'{}'".format(value) for value in list(item.values()) ])
                            sql = """
                                INSERT INTO built_in_model_data_deployment_form ({}) VALUES({})
                            """.format(keys, values)
                            try:
                                cur.execute(sql)
                                conn.commit()
                            except pymysql.err.IntegrityError as e:
                                pass
                            except Exception as e:
                                traceback.print_exc()
                except Exception as e:
                    traceback.print_exc()
                    print("Built_in model : [{0}] insert Error : {0} ".format(model_info["path"]), str(e))
                    continue

                try:

                    if len(built_in_model_parameter_list) > 0:
                        # print(built_in_model_parameter_list, model_info["name"])
                        built_in_model_id = get_built_in_model(model_name=model_info["name"])["id"]
                        keys = ""
                        values = []

                        for item in built_in_model_parameter_list:
                            item["built_in_model_id"] = built_in_model_id
                            keys = ",".join(list(item.keys()))
                            values = ",".join([ "'{}'".format(value) for value in list(item.values()) ])
                            sql = """
                                INSERT INTO built_in_model_parameter ({}) VALUES({})
                            """.format(keys, values)
                            try:
                                cur.execute(sql)
                                conn.commit()
                            except pymysql.err.IntegrityError as e:
                                pass
                            except Exception as e:
                                traceback.print_exc()
                except Exception as e:
                    traceback.print_exc()
                    print("Built_in model : [{0}] insert Error : {0} ".format(model_info["path"]), str(e))
                    continue

                print("Built_in model : [{}] insert".format(model_info["path"]))
        except:
            traceback.print_exc()


# TODO 버그 케이스 대응 필요 (2022-12-19 Yeobie)
# 버그 사항 
# 1. 서로 다른 폴더 (A,B)에 info.json이 있음
# 2. info.json 내용 중 model name이 일치함
# 3. A, B 중 하나는 정상적으로 만들어지지 못함 (model name이 유니크이기 때문) 
#   - A가 만들어지고 B가 만들어지지 않았다고 가정
# 4. init 시 B의 training_form이 A에 반영될 수 있음 
#   - built_in_model_id를 model_name으로 찾는데 B의 model_name이 A이기 때문에 이때 B는 A의 ID를 가져오게 됨
#   - 주의점
#      - info.json에 있는 ID값을 가져오는걸로 변경 시 
#           - build_in_model_id를 지정하지 않는 경우도 있기 때문에 json에 항상 id가 있다고 할 수 없음
#           - info.json에 있는 ID 값이 이미 사용중인 ID 값일 수 있음
# 필요 사항은 B가 A에 간섭할 수 없도록 로직 추가 필요.

def init_built_in_model():
    def find_infojson(file_name_list):
        result=[]
        for s in file_name_list:
            s_list=s.split('.')
            try:
                if s_list[-1]==INFO_JSON_EXTENSION:
                    result.append(s)
                elif s=='info.json':
                    result.append(s)
            except:
                pass
        return result

    with get_db() as conn:
        def get_column_keys(sql):
            cursor = conn.cursor()
            cursor.execute(sql)
            columns = cursor.fetchall()
            return columns

        try:
            built_in_model_columns_key = get_column_keys(sql='SHOW COLUMNS FROM jfb.built_in_model')
            columns_key = {
                "training_input_data_form_list":[],
                "deployment_input_data_form_list":[],
                "parameters": {}, # paramter, default_value
                "parameters_description": None
            }
            for key in built_in_model_columns_key:
                columns_key[key["Field"]] = None

            training_form_columns_key = get_column_keys(sql='SHOW COLUMNS FROM jfb.built_in_model_data_training_form')
            training_columns_key = {}
            for key in training_form_columns_key:
                training_columns_key[key["Field"]] = None

            deployment_form_columns_key = get_column_keys(sql='SHOW COLUMNS FROM jfb.built_in_model_data_deployment_form')
            deployment_columns_key = {}
            for key in deployment_form_columns_key:
                deployment_columns_key[key["Field"]] = None

            built_in_parameter_columes_key = get_column_keys(sql='SHOW COLUMNS FROM jfb.built_in_model_parameter')
            parameter_columns_key = {}
            for key in built_in_parameter_columes_key:
                parameter_columns_key[key["Field"]] = None

            models_path = settings.JF_BUILT_IN_MODELS_PATH
            models = os.listdir(models_path)
            model_info_list = []
            info_model_dic={}
            for model in models:
                try:
                    model_file_list=os.listdir("{}/{}".format(models_path, model))
                    file_name_list=find_infojson(model_file_list)
                    for file in file_name_list:
                        # info_model_dic[file]=model
                        if os.path.isfile("{}/{}/{}".format(models_path, model, file)):
                            info_model_dic["{}/{}/{}".format(models_path, model, file)]={"path":model,"infojson_path":file}
                except:
                    pass
            # print("info_model_dic:",info_model_dic)
            # for model in models:
            for info_file in list(info_model_dic.keys()):
                try:
                    # model=info_model_dic[info_file]["model"]
                    # info_file = "{}/{}/{}".format(models_path, model, info_file)
                    json_data = common.load_json_file(info_file)
                    # with open(info_file, encoding="utf-8") as json_file:
                    #     json_data = json.load(json_file)
                    # model_info = {"path": model}
                    model_info = dict(columns_key)
                    model_info["path"] = info_model_dic[info_file]["path"]
                    model_info["infojson_path"] = info_model_dic[info_file]["infojson_path"]
                    for k, v in json_data.items():
                        if k in columns_key:
                            # if k == "parameters" and type(v) == type({}):
                            #     parameters = ""
                            #     for item in v.items():
                            #         parameters += "--{} {} ".format(item[0], item[1])
                            #     v = parameters
                            if (k == "parameters" or k == "parameters_description") and type(v) == type({}):
                                m_v = dict(model_info["parameters"])
                                if k == "parameters":
                                    for p_k, p_v in v.items():
                                        if m_v.get(p_k) is None:
                                            m_v[p_k] = { "parameter" : p_k, "default_value" : p_v }
                                        else :
                                            m_v[p_k]["parameter"] = p_k
                                            m_v[p_k]["default_value"] = p_v

                                elif k == "parameters_description":
                                    for p_k, p_v in v.items():
                                        if m_v.get(p_k) is None:
                                            m_v[p_k] = { "parameter" : p_k, "parameter_description" : p_v }
                                        else :
                                            m_v[p_k]["parameter"] = p_k
                                            m_v[p_k]["parameter_description"] = p_v
                                k = "parameters"
                                v = m_v
                                # print(k, v)

                            elif k == "training_input_data_form_list" and type(v) == type([]):
                                for i, training_input_data_form in enumerate(v):
                                    t_info = dict(training_columns_key)
                                    for t_k, t_v in training_input_data_form.items():
                                        if t_k in training_columns_key:
                                            t_info[t_k] = t_v
                                    for t_k in list(training_columns_key.keys()):
                                        if t_info[t_k] is None:
                                            del t_info[t_k]
                                    v[i] = t_info
                                for i, training_input_data_form in reversed(list(enumerate(v))):
                                    if len(set(["type", "name", "category"])-(set(training_columns_key)-set(training_input_data_form)))< 3:
                                    # if training_input_data_form["type"]==None or training_input_data_form["name"]==None or training_input_data_form["category"]==None:
                                        # print("====training_input_data_form{}".format(training_input_data_form))
                                        del v[i]
                                        
                            elif k == "deployment_input_data_form_list" and type(v) == type([]):
                                for i, deployment_input_data_form in enumerate(v):
                                    d_info = dict(deployment_columns_key)
                                    # print("====d_info{}".format(d_info))
                                    for d_k, d_v in deployment_input_data_form.items():
                                        if d_k in deployment_columns_key:
                                            d_info[d_k] = d_v
                                    for d_k in list(deployment_columns_key.keys()):
                                        if d_info[d_k] is None:
                                            del d_info[d_k]
                                    v[i] = d_info
                                for i, deployment_input_data_form in reversed(list(enumerate(v))):
                                    if len(set(["api_key", "location"])-(set(deployment_columns_key)-set(deployment_input_data_form)))<2:
                                    # if deployment_input_data_form["location"]==None or deployment_input_data_form["api_key"]==None:
                                        # print("====deployment_input_data_form{}".format(deployment_input_data_form))
                                        del v[i]
                                        
                            # elif k == "deployment_input_data_form_list" and type(v) == type([]):
                            #     for d_c_k in deployment_columns_key:
                            #         model_info["deployment_input_data_form_list"].append(item)
                            elif k == "input_data_dirs" and type(v) == type([]):
                                v = ",".join(v)
                            elif k == "deployment_output_types" and type(v) == type([]):
                                v = ",".join(v)

                            model_info[k] = v


                    for k in list(model_info.keys()):
                        if model_info[k] is None:
                            del model_info[k]
                    # if model_info["id"] is None:
                    #     del model_info["id"]
                    model_info_list.append(model_info)
                    print("Built_in model : [{}] loaded".format(info_file))
                except FileNotFoundError:
                    print("Built_in model : [{}] Not loaded : info.json file not found".format(info_file))
                except NotADirectoryError:
                    pass
                except :
                    print("Built_in model : [{}] Error".format(info_file))
                    traceback.print_exc()

            built_in_model_id_set=set()
            for model_info in model_info_list:
                training_input_data_form_list = []
                deployment_input_data_form_list = []
                built_in_model_parameter_list = []
                if len(model_info.get("training_input_data_form_list")) > 0:
                    training_input_data_form_list = model_info.get("training_input_data_form_list")
                if len(model_info.get("deployment_input_data_form_list")) > 0:
                    deployment_input_data_form_list = model_info.get("deployment_input_data_form_list")
                if "parameters" in model_info.keys():
                    if model_info.get("parameters") is not None and len(list(model_info.get("parameters").values())) > 0:
                        built_in_model_parameter_list = list(model_info.get("parameters").values())
                    del model_info["parameters"]
                del model_info["training_input_data_form_list"]
                del model_info["deployment_input_data_form_list"]
                

                cur = conn.cursor()
                keys = ",".join(list(model_info.keys()))
                
                values =  ",".join([ "'{}'".format(value) if type(value) == type("") else "{}".format(value) for value in list(model_info.values()) ])
                print("=======\nvalues: ".format(values))
                sql = """
                    INSERT INTO built_in_model ({}) VALUES ({})
                """.format(keys, values)
                built_in_model_id = model_info.get("id")
                try:
                    cur.execute(sql)
                    if built_in_model_id==None:
                        built_in_model_id = cur.lastrowid
                    conn.commit()
                except pymysql.err.IntegrityError as e:
                    pass
                except Exception as e:
                    traceback.print_exc()
                    print("Built_in model : [{0}] insert Error : {0} ".format(model_info["path"], str(e)))
                    continue
                
                if built_in_model_id == None:
                    continue

                if built_in_model_id in built_in_model_id_set:
                    print("Built_in_model : Duplicate ID in [{}/{}] file".format(model_info["path"], model_info["infojson_path"]))
                    continue
                
                built_in_model_id_set.add(built_in_model_id)

                try:
                    # TODO TRAINING INPUT FORM 이 없는 경우 해당 부분 거치지 않도록
                    if len(training_input_data_form_list) > 0:
                        # built_in_model_id = get_built_in_model(model_name=model_info["name"])["id"]
                        keys = ""
                        values = []
                        for item in training_input_data_form_list:
                            item["built_in_model_id"] = built_in_model_id
                            keys = ",".join(list(item.keys()))
                            values = ",".join([ "'{}'".format(value) if type(value) == type("") else "{}".format(value) for value in list(item.values()) ])
                            sql = """
                                INSERT INTO built_in_model_data_training_form ({}) VALUES({})
                            """.format(keys, values)
                            try:
                                cur.execute(sql)
                                conn.commit()
                            except pymysql.err.IntegrityError as e:
                                pass
                            except Exception as e:
                                traceback.print_exc()
                except Exception as e:
                    traceback.print_exc()
                    print("Built_in model : [{0}] insert Error : {0} ".format(model_info["name"]), str(e))
                    continue
                try:
                    if len(deployment_input_data_form_list) > 0:
                        # built_in_model_id = get_built_in_model(model_name=model_info["name"])["id"]
                        keys = ""
                        values = []

                        for item in deployment_input_data_form_list:
                            item["built_in_model_id"] = built_in_model_id
                            keys = ",".join(list(item.keys()))
                            values = ",".join([ "'{}'".format(value) for value in list(item.values()) ])
                            sql = """
                                INSERT INTO built_in_model_data_deployment_form ({}) VALUES({})
                            """.format(keys, values)
                            try:
                                cur.execute(sql)
                                conn.commit()
                            except pymysql.err.IntegrityError as e:
                                pass
                            except Exception as e:
                                traceback.print_exc()
                except Exception as e:
                    traceback.print_exc()
                    print("Built_in model : [{0}] insert Error : {0} ".format(model_info["path"]), str(e))
                    continue

                try:

                    if len(built_in_model_parameter_list) > 0:
                        # print(built_in_model_parameter_list, model_info["name"])
                        # built_in_model_id = get_built_in_model(model_name=model_info["name"])["id"]
                        keys = ""
                        values = []

                        for item in built_in_model_parameter_list:
                            item["built_in_model_id"] = built_in_model_id
                            keys = ",".join(list(item.keys()))
                            values = ",".join([ "'{}'".format(value) for value in list(item.values()) ])
                            sql = """
                                INSERT INTO built_in_model_parameter ({}) VALUES({})
                            """.format(keys, values)
                            try:
                                cur.execute(sql)
                                conn.commit()
                            except pymysql.err.IntegrityError as e:
                                pass
                            except Exception as e:
                                traceback.print_exc()
                except Exception as e:
                    traceback.print_exc()
                    print("Built_in model : [{0}] insert Error : {0} ".format(model_info["path"]), str(e))
                    continue

                print("Built_in model : [{}] insert".format(model_info["path"]))
        except:
            traceback.print_exc()

def init_default_image():
    def set_default_image(db_name, image_name_tag):
        with get_db() as conn:
            try:
                #TODO DB에 넣거나 settings를 kuber에다가 바로 사용하거나 결정
                sql = 'SELECT count(id) as count FROM image WHERE name="{}"'.format(db_name)
                cursor = conn.cursor()
                cursor.execute(sql)
                default_chk = cursor.fetchone()

                if default_chk['count'] == 0:
                    if image_name_tag is None:
                        print("Default Image [{}] Insert Skip".format(db_name))
                    else :
                        user_id = 1
                        name = db_name
                        real_name = image_name_tag
                        status = 2
                        access = 1
                        sql = """
                            INSERT INTO image (user_id, name, real_name, status, access) VALUES ('{}', '{}', '{}', '{}', '{}')
                            """.format(user_id, name, real_name, status, access)
                        conn.cursor().execute(sql)
                        conn.commit()

                elif default_chk['count'] > 0:
                    # Update
                    if image_name_tag is None:
                        print("Default Image [{}] set access 0".format(db_name))
                        sql = """
                            UPDATE image set real_name = '{}', access = 0 where name = '{}'
                            """.format(real_name, name)
                    else :
                        user_id = 1
                        name = db_name
                        real_name = image_name_tag
                        status = 2
                        access = 1
                        sql = """
                            UPDATE image set real_name = '{}' where name = '{}'
                            """.format(real_name, name)
                    conn.cursor().execute(sql)
                    conn.commit()
            except:
                traceback.print_exc()

    set_default_image(db_name=JF_DEFAULT_IMAGE_NAME, image_name_tag=settings.JF_DEFAULT_IMAGE)
    set_default_image(db_name=JF_GPU_TF2_IMAGE_NAME, image_name_tag=settings.JF_GPU_TF2_IMAGE)
    set_default_image(db_name=JF_GPU_TORCH_IMAGE_NAME, image_name_tag=settings.JF_GPU_TORCH_IMAGE)
    set_default_image(db_name=JF_CPU_DEFAULT_IMAGE_NAME, image_name_tag=settings.JF_CPU_DEFAULT_IMAGE)
    # def set_default_tf2_image():
    # def set_default_torch_image():

def init_dummy_db():
    with get_db_top() as conn:
        try:
            cur = conn.cursor()
            sql = "DROP DATABASE {}".format(db_dummy_name)
            cur.execute(sql)
            conn.commit()
        except pymysql.err.OperationalError as e:
            if "database doesn't exist" in str(e):
                pass
            else:
                raise RuntimeError(e)

        try:
            cur = conn.cursor()
            sql = "CREATE DATABASE {} default character set utf8 collate utf8_general_ci".format(db_dummy_name)
            cur.execute(sql)
            conn.commit()
        except pymysql.err.ProgrammingError as e:
            if "database exists" in str(e):
                pass
            else:
                raise RuntimeError(e)



    with get_dummy_db() as conn:
        cur = conn.cursor()
        try:
            sql = '''SHOW TABLES'''
            cur.execute(sql)
            
            res = cur.fetchall()
            for v in res:
                for table_name in v.values():
                    sql = '''DROP TABLE  {}'''.format(table_name)
                    print(sql)
                    cur.execute(sql)
            
            conn.commit()
        except pymysql.err.OperationalError as e:
            print(e)
            pass


        init_create_db(conn)

## FOR VERSION COMPATIBILITY
def init_db_jupyter_update():
    # import sys
    # sys.path.insert(0, os.path.abspath('..'))
    from training_tool import create_tool_item
    # TRAINING TYPE CHANGE jupyter, basic  -> advanced
    # CREATE TRAINING TOOL
    with get_db() as conn:
        try:
            cur = conn.cursor()

            
            sql = """
                UPDATE training 
                set type = "advanced"
                where type in ("jupyter","basic")
                """
            cur.execute(sql)

            conn.commit()

            sql = """
                SELECT t.id, t.type
                FROM training t
            """
            cur.execute(sql)
            res = cur.fetchall()
        except pymysql.err.IntegrityError:
            pass
        except :
            traceback.print_exc()

    for training in res:
        create_tool_item(training_id=training["id"], only_default=True)
                
        
        
    # with get_db() as conn:
    #     cur = conn.cursor()
    #     sql = """
    #         ALTER TABLE `jupyter_copy`
	#         CHANGE COLUMN `editor` `editor` TINYINT(1) NOT NULL DEFAULT 0 COLLATE 'utf8_general_ci' AFTER `training_id`;
    #     """
    #     print(sql)
    #     cur.execute(sql)
    #     conn.commit()

#TODO REMOVE - def init_db_jupyter_update 에서 create_tool_item이 해당 부분 역할도 동시에 함
def init_db_port_forwarding():
    # SET PORT FORWARDING DEFAULT VALUE
    try:
        training_tool_list = get_training_tool_list()
        rows = []
        for training_tool in training_tool_list: 
            default_port_list = TOOL_DEFAULT_PORT[TOOL_TYPE[training_tool["tool_type"]]]
            for port in default_port_list:
                rows.append((training_tool["training_id"], training_tool["id"], port["name"], port["port"], None, port["protocol"], "Default", 1, port["type"], 1))

        insert_training_tool_port_list(port_list=rows)
           
    except pymysql.err.IntegrityError:
        pass
    except :
        traceback.print_exc()


def init_db_deployment_api_path():
    # deployment default api path
    from utils.kube_create_func import PodName
    with get_db() as conn:
        try:
            cur = conn.cursor()
            sql = """
                SELECT d.id, d.name as deployment_name, w.name as workspace_name
                FROM deployment d
                LEFT JOIN workspace w on d.workspace_id = w.id
                WHERE d.api_path is NULL
            """
            cur.execute(sql)
            res = cur.fetchall()
            for set_item in res:
                api_path = PodName(workspace_name=set_item["workspace_name"], item_name=set_item["deployment_name"], item_type=DEPLOYMENT_ITEM_A).get_base_pod_name() # get_pod_name(workspace_name=set_item["workspace_name"], item_name=set_item["deployment_name"], item_sub_name=DEPLOYMENT_FLAG)
                sql = """
                    UPDATE deployment
                    set api_path = %s
                    WHERE id = %s
                    """
                cur.execute(sql, (api_path, set_item["id"]))
            conn.commit()
        except:
            traceback.print_exc()


# TODO REMOVE
def add_demo():
    try:
        enc_pw = crypt.crypt('acryl', '22') # pw encrypt
        os.system('useradd -s /bin/bash -p {} {}'.format(enc_pw, 'demo')) # create user, pw
        uid = pwd.getpwnam('demo').pw_uid # get new pid
        # os.system('cp /etc/group /etc/gshadow /etc/passwd /etc/shadow /etc_host/') #etc backup
        return uid

    except Exception as e:
        # create error rollback
        traceback.print_exc()

# TODO REMOVE
def insert_demo(db, uid):
    sql = 'SELECT count(id) as count FROM user WHERE name="demo"'
    cursor = db.cursor()
    cursor.execute(sql)
    demo_chk = cursor.fetchone()

    if demo_chk['count'] == 0:
        sql = "INSERT INTO user (name, uid, user_type) VALUES ('demo', '{}', '4')".format(uid)
        db.cursor().execute(sql)
        db.commit()

def init_db_table():
    # 가장 먼저
    print('+++++++++++++++++++++++')
    if settings.JF_DB_ATTEMP_TO_CREATE == False:
        return 
    print('-----------------------')
    with get_db() as conn:
        common.run_func_with_print_line(func=init_create_db, line_message="CREATE jfb TABLE", conn=conn)
        common.run_func_with_print_line(func=init_create_db_trigger, line_message="INIT DB TRIGGER", conn=conn, db_name=settings.JF_DB_NAME)

    common.run_func_with_print_line(func=init_dummy_db, line_message="INIT DUMMY DB")


def init_db_others():
    common.run_func_with_print_line(func=init_root, line_message="INIT ROOT USER")
    
    common.run_func_with_print_line(func=init_node, line_message="INIT NODE INFO")
    
    common.run_func_with_print_line(func=init_built_in_model, line_message="INIT BUILT IN MODEL")

    common.run_func_with_print_line(func=init_default_image, line_message="INIT DEFAULT IMAGE")

    common.run_func_with_print_line(func=init_db_jupyter_update, line_message="JUPYTER VER UPDATE")

    # common.run_func_with_print_line(func=init_db_port_forwarding, line_message="PORT VER UPDATE")

    # common.run_func_with_print_line(func=init_db_node_setting, line_message="NODE DB INTERFACE SETTING UPDATE")

    common.run_func_with_print_line(func=init_db_deployment_api_path, line_message="DEPLOYMENT DEFAULT API PATH SETTING")


# # from io import StringIO
# def init_db():
#     print("\n\n\n============== INIT DB ==============")
#     #conn = get_db()
#     with get_db() as conn:
#         print("\n\n============== CREATE jfb TABLE ==============")
#         init_create_db(conn)
#         print("==========================================")

#         print("\n\n============== INIT ROOT USER ==============")
#         init_root(conn)
#         print("==========================================")

#         print("\n\n============== INIT NODE INFO ==============")
#         init_node(conn)
#         print("==========================================")

#         print("\n\n============== INIT BUILT IN MODEL ==============")
#         init_built_in_model(conn)
#         print("==========================================")

#         print("\n\n============== INIT JF DEFAULT DOCKER IMAGE ==============")
#         init_default_image(conn)
#         print("==========================================")
#         # if not check_exist_user_from_linux('demo'):
#         #     add_demo()
#         # uid = pwd.getpwnam('demo').pw_uid
#         # insert_demo(conn, uid)
    
#     print("\n\n============== INIT DUMMY DB ==============")
#     init_dummy_db()
#     print("==========================================\n\n")


def request_logging(user, request, method, body, success_check):

    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "INSERT into api_log (user, request, method ,body, success_check) VALUES (%s, %s, %s, %s, %s)"
            # print(user, request, method, body, success_check)
            cur.execute(sql,(user, request, method, body, success_check))
            conn.commit()
    except Exception as e:
        traceback.print_exc()


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def get_job(job_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            job_info = {}
            sql = '''SELECT j.*, w.id as workspace_id, w.name as workspace_name, t.name as training_name
                    from job j
                    INNER JOIN training t ON t.id=j.training_id
                    INNER JOIN workspace w ON w.id = t.workspace_id
                    WHERE j.id={}'''.format(job_id)
            cur.execute(sql)
            res = cur.fetchone()

            return res
    except Exception as e:
        traceback.print_exc()

def get_job_id_by_job_group_number(training_id, job_group_number):
    """
        Description : job group number를 이용해 job id 조회. (권한 체크 시 사용)
                    group_number만으로는 유니크하지 않기 때문에 training_id를 추가 사용

        Args :
            training_id (int)
            job_group_number (int)

        Returns :
            (dict) or None (error, not found)
    """
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = '''
                SELECT j.id as id
                FROM job j
                WHERE j.training_id={} AND j.group_number={} 
                '''.format(training_id, job_group_number)
            cur.execute(sql)
            res = cur.fetchone()
            return res
    except Exception as e:
        traceback.print_exc()
        return None



def get_job_graph_info(job_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            job_info = {}
            sql = '''SELECT w.name as workspace_name, p.name as training_name, j.group_number, j.job_group_index from job j
                    INNER JOIN training p ON p.id=j.training_id
                    INNER JOIN workspace w ON w.id = p.workspace_id
                    WHERE j.id={}'''.format(job_id)
            cur.execute(sql)
            res = cur.fetchone()

            return res
    except Exception as e:
        traceback.print_exc()


def get_admin_dashboard_total_count():
    mappings=[
            ['Workspaces', 'workspace', 'workspace_count'],
            ['Trainings', 'training', 'training_count'],
            ['Deployments', 'deployment', 'deployment_count'],
            ['Docker Images', 'image', 'image_count'],
            ['Datasets', 'dataset', 'dataset_count'],
            ['Nodes', 'node', 'node_count'],
            #['Users', 'user', 'total_user_count'],
            ]
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT *
		FROM record_all_workspaces_variation
		WHERE log_create_datetime BETWEEN '{}' AND '{}'""".format(
                        date.today().strftime("%Y-%m-%d"),
                        (date.today() + timedelta(days=1)).strftime("%Y-%m-%d"))

            cur.execute(sql)
            log_res = cur.fetchone()

            total_count= []
            for table_name in mappings:
                sql = """SELECT count(*)
                    FROM {} """.format(table_name[1])

                cur.execute(sql)
                res = cur.fetchone()

                if log_res is not None:
                    total_count.append({'name':table_name[0], 'total':res['count(*)'] , 'variation': str(int(res['count(*)']) - int(log_res[table_name[2]])) })
                else:
                    total_count.append({'name':table_name[0], 'total':res['count(*)'] , 'variation': 0 })

            if log_res is None:
                fields = [table_name[2] for table_name in mappings]
                sql = """INSERT INTO {} ({})
                    VALUES ({})""".format('record_all_workspaces_variation', ', '.join(fields), ', '.join(['%s']*len(fields)))

                val = ([str(count['total']) for count in total_count])
                cur.execute(sql, val)

                conn.commit()

            return total_count
    except Exception as e:
        traceback.print_exc()


def get_user_dashboard_info(workspace_id):

    try:
        with get_db() as conn:

            cur = conn.cursor()

            info = {}
            sql = """SELECT *
                FROM workspace
                WHERE id = {}""".format(workspace_id)

            cur.execute(sql)
            res = cur.fetchone()
            info['description'] = res['description']
            info['name'] = res['name']

            cur_time_ts = time.time()
            start_datetime_ts = common.date_str_to_timestamp(res["start_datetime"])
            end_datetime_ts = common.date_str_to_timestamp(res["end_datetime"])
            info['status'] = "Unknwon"
            info['period'] = res["start_datetime"] + " ~ " + res["end_datetime"]
            info['start_datetime'] = res["start_datetime"]
            info['end_datetime'] = res["end_datetime"]
            info['guaranteed_gpu'] = res["guaranteed_gpu"]
            owner_id = res['manager_id']

            if cur_time_ts < start_datetime_ts or cur_time_ts > end_datetime_ts:
                info['status'] = "Reserved" if cur_time_ts < start_datetime_ts else "Expired"
            else :
                info['status'] = "Active"

            sql = """SELECT uw.user_id, name
                FROM user u
                INNER JOIN user_workspace uw ON u.id = uw.user_id
                WHERE workspace_id = {}""".format(workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
            users=[]
            for _res in res:
                if _res['user_id'] == owner_id:
                    info['owner'] = _res['name']
                else:
                    users.append(_res['name'])
            info['users'] = users

            return info
    except Exception as e:
        traceback.print_exc()
        return info


def get_user_dashboard_total_count(workspace_id, user_id):
    try:
        total_count= []
        with get_db() as conn:
            cur = conn.cursor()
            sql = """SELECT *
                FROM record_workspace_variation
                WHERE workspace_id = {} AND log_create_datetime
                BETWEEN '{}' AND '{}'""".format(workspace_id, date.today().strftime("%Y-%m-%d"), (date.today() + timedelta(days=1)).strftime("%Y-%m-%d"))

            cur.execute(sql)
            log_res = cur.fetchone()

            image_sql = """SELECT COUNT(*)
                FROM image i
                LEFT JOIN image_workspace iw ON i.id = iw.image_id
                WHERE workspace_id = {} OR access = 1""".format(workspace_id)

            cur.execute(image_sql)
            res = cur.fetchone()
            if log_res is not None:
                total_count.append({'name':"Docker Images", 'total':res['COUNT(*)'] , 'variation': str(int(res['COUNT(*)']) - int(log_res['image_count'])) })
            else:
                total_count.append({'name':"Docker Images", 'total':res['COUNT(*)'] , 'variation':0})

            dataset_sql = """SELECT COUNT(*)
                FROM dataset
                WHERE workspace_id = {}""".format(workspace_id, user_id)

            cur.execute(dataset_sql)
            res = cur.fetchone()
            if log_res is not None:
                total_count.append({'name':"Datasets", 'total':res['COUNT(*)'] , 'variation': str(int(res['COUNT(*)']) - int(log_res['dataset_count'])) })
            else:
                total_count.append({'name':"Datasets", 'total':res['COUNT(*)'] , 'variation':0})

            training_sql = """SELECT COUNT(*)
                FROM training
                WHERE workspace_id = {}""".format(workspace_id)

            cur.execute(training_sql)
            res = cur.fetchone()
            if log_res is not None:
                total_count.append({'name':"Trainings", 'total':res['COUNT(*)'] , 'variation': str(int(res['COUNT(*)']) - int(log_res['training_count'])) })
            else:
                total_count.append({'name':"Trainings", 'total':res['COUNT(*)'] , 'variation':0})

            deployment_sql = """SELECT COUNT(*)
                FROM deployment
                WHERE workspace_id = {}""".format(workspace_id)

            cur.execute(deployment_sql)
            res = cur.fetchone()
            if log_res is not None:
                total_count.append({'name':"Deployments", 'total':res['COUNT(*)'] , 'variation': str(int(res['COUNT(*)']) - int(log_res['deployment_count'])) })
            else:
                total_count.append({'name':"Deployments", 'total':res['COUNT(*)'] , 'variation':0})

            if log_res is None:
                fields = ['workspace_id', 'training_count', 'dataset_count', 'image_count', 'deployment_count']
                sql = """INSERT INTO {} ({})
                    VALUES ({})""".format('record_workspace_variation', ', '.join(fields), ', '.join(['%s']*len(fields)))

                val = (str(workspace_id), str(total_count[0]['total']), str(total_count[1]['total']), str(total_count[2]['total']), str(total_count[3]['total']))
                cur.execute(sql, val)

                conn.commit()

            return total_count

    except Exception as e:
        traceback.print_exc()
        return total_count

def get_user_dashboard_usage(workspace_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT *
                FROM workspace
                WHERE id = {}""".format(str(workspace_id))

            cur.execute(sql)
            res = cur.fetchone()

            usage = {'gpu' : []}
            usage['gpu'].append({'type':'Training','total':res['gpu_training_total'],'used':res['gpu_training_used']})
            usage['gpu'].append({'type':'Deployment','total':res['gpu_deployment_total'],'used':res['gpu_deployment_used']})

            return usage
    except Exception as e:
        traceback.print_exc()

def get_user_dashboard_jobs(workspace_id, pod_list, queue_list):
    import utils.kube as kube
    from utils.kube import kube_data

    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT j.name AS job_name, t.id AS training_id, t.name AS training_name, j.id AS job_id,
                    j.create_datetime
                    FROM training t
                    INNER JOIN job j ON j.training_id = t.id
                    WHERE t.workspace_id = {}
                    GROUP BY j.training_id, job_name
                    ORDER BY j.create_datetime DESC
                    LIMIT 10""".format(str(workspace_id))

            cur.execute(sql)
            res = cur.fetchall()


            jobs=[]
            for _res in res:
                job={}
                job["create_datetime"] = common.date_str_to_timestamp(_res["create_datetime"])
                job["type"] = "job"
                job['name'] = _res['job_name']
                job['training_id'] = _res['training_id']
                job['training_name'] = _res['training_name']
                job['count'] = {
                        'done':0,
                        'pending':0,
                        'running':0,
                        'total':0
                        }
                jobs.append(job)
            if len(jobs) == 0:
                return None

            condition=" OR ".join(["(j.name='{}' AND j.training_id='{}')".format(job['name'], job['training_id']) for job in jobs])
            sql = """SELECT id, name, training_id
                    FROM job j
                    WHERE {}""".format(condition)
            cur.execute(sql)
            res = cur.fetchall()
            for _res in res:
                for job in jobs:
                    if job['name'] == _res['name'] and job['training_id'] == _res['training_id']:
                        status = kube.get_job_status(job_id=_res['id'], pod_list=pod_list, queue_list=queue_list)
                        if status['status'] == "error":
                            status['status'] = "running"
                        job['count'][status['status']] += 1
                        job['count']['total'] += 1
            for job in jobs:
                job['status'] = "done"
                if job['count']['running'] > 0:
                    job['status'] = "running"
                elif job['count']['pending'] > 0:
                    job['status'] = 'pending'

                try:
                    job['progress'] = int(round(job['count']['done']/job['count']['total'] ,2)*100)
                except Exception as e:
                    job['progress'] = 0


            return jobs
    except Exception as e:
        traceback.print_exc()

def get_user_dashboard_hyperparamsearchs(workspace_id, pod_list, queue_list):
    import utils.kube as kube
    from utils.kube import kube_data
    # import sys
    # sys.path.insert(0, os.path.abspath('..'))
    from training_hyperparam import get_hyperparam_log_sub_file_path, get_hyperparam_log_file_data, get_hyperparam_num_of_last_log_item

    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT hps_g.name AS hps_name, t.id AS training_id, t.name AS training_name, hps.id AS hps_id,
                    hps.search_count, hps.init_points, w.name AS workspace_name, hps.create_datetime, hps.hps_group_index
                    FROM training t
                    INNER JOIN hyperparamsearch_group hps_g ON hps_g.training_id = t.id
                    INNER JOIN hyperparamsearch hps ON hps.hps_group_id = hps_g.id
                    INNER JOIN workspace w ON w.id = t.workspace_id
                    WHERE t.workspace_id = {}
                    # GROUP BY hps_g.training_id, hps_name
                    ORDER BY hps.create_datetime DESC
                    LIMIT 10""".format(str(workspace_id))

            cur.execute(sql)
            res = cur.fetchall()

            # pod_list = kube_data.get_pod_list(try_update=True)

            hpss=[]
            for _res in res:
                hps={}
                hps["create_datetime"] = common.date_str_to_timestamp(_res["create_datetime"])
                hps["type"] = "hps"
                hps['name'] = _res['hps_name'] + "-{}".format(_res["hps_group_index"])
                hps['training_id'] = _res['training_id']
                hps['training_name'] = _res['training_name']
                hps['count'] = {
                        'done':0,
                        'pending':0,
                        'running':0,
                        'total':0
                        }                        
                hps_status = kube.get_hyperparamsearch_status(hps_id=_res["hps_id"], pod_list=pod_list, queue_list=queue_list)
                if hps_status["status"] == "running":
                    last_items = 0
                    log_item_list = get_hyperparam_log_file_data(hps_id=_res["hps_id"], workspace_name=_res["workspace_name"], training_name=_res["training_name"], log_type="json")
                    last_items = get_hyperparam_num_of_last_log_item(log_item_list=log_item_list, current_hps_id=_res["hps_id"])

                    search_count = _res["search_count"] or 0
                    init_points = _res["init_points"] or 0
                    search_count = search_count + init_points
                    hps['count']["running"] = 1
                    hps['count']["done"]  = len(log_item_list) - last_items
                    hps['count']["pending"] = search_count - hps['count']["done"]
                    hps['count']["total"] = search_count
                elif hps_status["status"] == "pending":
                    try:
                       num_search_item = len(os.listdir(get_hyperparam_log_sub_file_path(hps_id=_res["hps_id"], workspace_name=_res["workspace_name"], training_name=_res["training_name"])))
                    except:
                        num_search_item = 0
                    search_count = _res["search_count"] or 0
                    init_points = _res["init_points"] or 0
                    search_count = search_count + init_points
                    hps['count']["done"]  = num_search_item
                    hps['count']["pending"] = search_count - num_search_item
                    hps['count']["total"] = search_count
                else:
                    log_item_list = get_hyperparam_log_file_data(hps_id=_res["hps_id"], workspace_name=_res["workspace_name"], training_name=_res["training_name"], log_type="json")
                    last_items = get_hyperparam_num_of_last_log_item(log_item_list=log_item_list, current_hps_id=_res["hps_id"])
                    search_count = _res["search_count"] or 0
                    init_points = _res["init_points"] or 0
                    search_count = search_count + init_points
                    hps['count']["done"]  = len(log_item_list) - last_items
                    hps['count']["pending"] = 0
                    hps['count']["total"] = search_count

                try:
                    hps['progress'] = int(round(hps['count']['done']/hps['count']['total'] ,2)*100)
                except Exception as e:
                    hps['progress'] = 0
                hps["status"] = hps_status["status"]
                hpss.append(hps)
            if len(hpss) == 0:
                return None


            return hpss
    except Exception as e:
        traceback.print_exc()

def get_name(target, table):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            target_join = ','.join(map(str, target))
            target_list = []

            sql = """SELECT name
                FROM {}
                WHERE id in ({})""".format(table, target_join)

            cur.execute(sql)
            res = cur.fetchall()
            for r in res:
                target_list.append(r['name'])
            target_string = ','.join(target_list)
            return target_string
    except Exception as e:
        traceback.print_exc()
        return None

def logging_history(user=None, task=None, action=None, workspace_id=None, task_name='-', update_details='-'):
    """Save user action information by task and action with workspace_id.

    :param user: string, user name
    :param task: string, one of workspace, training, job, hyperparams, image, or dataset
    :param action: string, one of add, create, update, delete, auto_labeling, download, uploadData or deleteDate
    :param workspace_id: int, workspace id
    :param task_name: string, name of task
    :param update_details: stirng, updated detailed information

    NOTE:
        Task_name value has to follow a certain format for front-end.
        Logging data will be deleted when workspace is deleted.
    """
    try:
        with get_db() as conn:
            cur = conn.cursor()
            fields = [
                'task', 'action', 'workspace_id', 'task_name', 'update_details', 'user'
            ]

            sql = """INSERT INTO {} ({})
                VALUES({})""".format('history', ', '.join(fields), ', '.join(['%s']*len(fields)))
            cur.execute(sql, (task, action, workspace_id, task_name, update_details, user))
            conn.commit()
    except Exception as e:
        traceback.print_exc()

def execute_and_fetch(*args, **kwargs):
    """Excute and fetch all.

    Returns None on error.

    """
    result = None
    try:
        with get_db() as connection:
            cursor = connection.cursor()

            cursor.execute(*args, **kwargs)
            connection.commit()
            result = cursor.fetchall()
    except:
        traceback.print_exc()
    return result

def execute_and_get_lastrowid(*args, **kwargs):
    """Excute and fetch all.

    Returns None on error.
    """
    lastrowid = None
    try:
        with get_db() as connection:

            cursor = connection.cursor()

            cursor.execute(*args, **kwargs)
            connection.commit()
            cursor.fetchall()
            lastrowid = cursor.lastrowid
    except:
        traceback.print_exc()
    return lastrowid

def executemany(*args, **kwargs):
    try:
        with get_db() as connection:

            cursor = connection.cursor()

            cursor.executemany(*args, **kwargs)
            connection.commit()
        return True
    except:
        traceback.print_exc()
        return False

def executescript(*args, **kwargs):
    try:
        with get_db() as connection:

            cursor = connection.cursor()

            cursor.executescript(*args, **kwargs)
            connection.commit()
        return True
    except:
        traceback.print_exc()
        return False


def get_workspace(workspace_name=None, workspace_id=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT w.id, w.name as workspace_name, w.gpu_deployment_total, w.gpu_training_total,
                w.start_datetime, w.end_datetime, w.create_datetime, w.manager_id, u.name as manager_name, 
                w.description, w.guaranteed_gpu
                FROM workspace w
                INNER JOIN user u ON w.manager_id = u.id
            """

            if workspace_name is not None:
                cur.execute("{} where w.name = %s".format(sql), (workspace_name,))
            elif workspace_id is not None:
                cur.execute("{} where w.id = %s".format(sql), (workspace_id,))
            res = cur.fetchone()

    except:
        traceback.print_exc()
    return res


def get_workspace_id_list():
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT id
                FROM workspace"""

            cur.execute(sql)
            res = cur.fetchall()
    except:
        res = None
        traceback.print_exc()
    finally:
        return res


def get_workspaces(workspaces_id=[]):
    if len(workspaces_id) == 0:
        return None
    try:
        with get_db() as conn:
        # with get_db() as conn:

            cur = conn.cursor()

            workspaces_id_ = [str(id) for id in workspaces_id]
            workspaces_id_ = ','.join(workspaces_id_)

            sql = """
                SELECT w.id, w.name as workspace_name, w.gpu_deployment_total, w.gpu_training_total,
                w.start_datetime, w.end_datetime, w.create_datetime, w.manager_id, u.name as manager_name,
                w.guaranteed_gpu
                FROM workspace w
                INNER JOIN user u ON w.manager_id = u.id
            """

            if workspaces_id_ != '':
                sql+= " where w.id in ({})".format(workspaces_id_)
            cur.execute(sql)
            res = cur.fetchall()

    except:
        res = None
        traceback.print_exc()
    finally:
        return res


def get_workspace_list(page=None, size=None, search_key=None, search_value=None, workspaces_id=None, user_id=None, sort=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT DISTINCT ws.id, ws.name as workspace_name, ws.gpu_deployment_total, ws.gpu_training_total, 
                ws.start_datetime, ws.end_datetime, ws.create_datetime, u.name as manager_name, ws.description,
                ws.guaranteed_gpu
                FROM workspace as ws
                INNER JOIN user as u ON ws.manager_id = u.id
                INNER JOIN user_workspace uw ON uw.workspace_id = ws.id"""

            if workspaces_id is not None and workspaces_id != []:
                workspaces_id = [str(id) for id in workspaces_id]
                workspaces_id = ','.join(workspaces_id)
                sql += " where ws.id in ({}) ".format(workspaces_id)

            if search_key != None and search_value != None:
                sql += " and " if "where" in sql else " where "
                if search_key == "name":
                    sql += " ws.{} like '%{}%' ".format(search_key, search_value)
                elif search_key == "user_id":
                    sql += " ws.manager_id = {} or uw.user_id = {} ".format(search_value, search_value)
                else:
                    sql += " {} = {} ".format(search_key, search_value)

            if user_id is not None:
                if not "where" in sql:
                    sql += " where "
                else:
                    sql += "and "
                sql += " ws.id in (select workspace_id from user_workspace WHERE user_id={}) ".format(user_id,user_id)

            if sort is not None:
                if sort == "created_datetime":
                    sql += " ORDER BY ws.create_datetime desc "
                elif sort == "last_run_datetime":
                    sql += " ORDER BY p.last_run_datetime desc "
            else :
                sql += " ORDER BY ws.create_datetime desc, ws.id asc "

            if page is not None and size is not None:
                sql += " limit {}, {} ".format((page-1)*size, size)

            cur.execute(sql)
            res = cur.fetchall()


    except Exception as e:
        traceback.print_exc()
    return res

def get_workspace_users(workspace_id=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """SELECT u.id, u.name as user_name, uw.favorites, uw.workspace_id as workspace_id
                FROM user_workspace uw
                INNER JOIN user u ON uw.user_id = u.id
            """
            if workspace_id is not None:
                sql += "WHERE workspace_id = {}".format(workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_workspace_training_list(workspace_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """ SELECT p.name AS training_name, w.name AS workspace_name, u.name AS user_name, p.access, p.id
                FROM workspace w
                RIGHT JOIN training p ON w.id = p.workspace_id
                RIGHT JOIN user u ON u.id = p.user_id
                WHERE w.id = {}
            """.format(workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_workspace_count_info_list():
    """
    Description : Workspace 의 학습, 배포, 도커 이미지, 데이터 셋 개수 정보 제공용 함수 + 유저 id, name
    """
    
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                    SELECT 
                        w.id as workspace_id,
                        (
                        SELECT COUNT(i.id) 
                        FROM image i 
                        LEFT JOIN image_workspace iw ON i.id = iw.image_id
                        WHERE i.access = 1 OR iw.workspace_id = w.id
                        )
                        AS image_count,
                        (SELECT COUNT(d.id) FROM dataset d WHERE d.workspace_id = w.id) AS dataset_count,
                        (SELECT COUNT(d.id) FROM deployment d WHERE d.workspace_id = w.id) AS deployment_count,
                        (SELECT COUNT(t.id) FROM training t WHERE t.workspace_id = w.id) AS training_count
                    FROM workspace w
                """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def insert_workspace(manager_id, workspace_name, training_gpu, deployment_gpu, start_datetime, end_datetime, description, guaranteed_gpu):
    #TODO workspace record 관련 guaranteed_gpu 컬럼 필요 여부 확인
    try:
        with get_db() as conn:
            cur = conn.cursor()

            fields = ['manager_id', 'name', 'gpu_deployment_total', 'gpu_training_total', 'start_datetime', 'end_datetime', 'description', 'guaranteed_gpu']
            sql = """INSERT INTO {} ({})
                VALUES ({})""".format('workspace', ', '.join(fields), ', '.join(['%s']*len(fields)))

            cur.execute(sql, (manager_id, workspace_name, deployment_gpu, training_gpu, start_datetime, end_datetime, description, guaranteed_gpu))

            conn.commit()

            insert_record_workspace(record={
                'id': cur.lastrowid,
                'name': workspace_name,
                'manager_id': manager_id,
                'gpu_deployment_total': deployment_gpu,
                'gpu_training_total': training_gpu,
                'start_datetime': start_datetime,
                'end_datetime': end_datetime,
                'description': description,
                'guaranteed_gpu': guaranteed_gpu
            })

        return True
    except:
        traceback.print_exc()
        return False


def update_workspace(workspace_id, workspace_name, training_gpu, deployment_gpu, start_datetime, end_datetime, manager_id, description, guaranteed_gpu):
    #TODO guaranteed_gpu 정보 관련
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """UPDATE workspace
                SET gpu_deployment_total = %s, gpu_training_total = %s, start_datetime = %s, end_datetime = %s, manager_id = %s, description = %s, guaranteed_gpu = %s
                WHERE id = %s"""

            cur.execute(sql, (deployment_gpu, training_gpu, start_datetime, end_datetime, manager_id, description, guaranteed_gpu, workspace_id))
            conn.commit()

            insert_record_workspace(record={
                'id': workspace_id,
                'name': workspace_name,
                'manager_id': manager_id,
                'gpu_deployment_total': deployment_gpu,
                'gpu_training_total': training_gpu,
                'start_datetime': start_datetime,
                'end_datetime': end_datetime,
                'description': description
            })

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, str(e)

def update_workspace_description(workspace_id, description):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """UPDATE workspace
                SET description = %s
                WHERE id = %s"""

            cur.execute(sql, (description, workspace_id))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        raise

def update_workspace_gpu(workspace_id, training_gpu, deployment_gpu):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """UPDATE workspace
                SET gpu_training_total = %s, gpu_deployment_total = %s
                WHERE id = %s"""

            cur.execute(sql, (training_gpu, deployment_gpu, workspace_id))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        raise

def get_running_training_check(workspace_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """SELECT ut.user_id
                FROM user_training up
                where ut.training_id in (SELECT id from training where workspace_id={})
                """.format(workspace_id)

            cur.execute(sql, (workspace_id,))
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def delete_workspace(workspace_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """DELETE
                FROM workspace
                WHERE id = %s"""
            cur.execute(sql, (workspace_id,))
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False

def delete_workspace_user(workspace_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """DELETE
                FROM user_workspace"""
            cur.execute(sql)

    except Exception as e:
        raise e


def get_users_with_workspaces_trainings(users_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """SELECT u.id as user_id, u.name as user_name, u.user_type, u.uid,
                    uw.workspace_id, w.name as workspace_name,
                    t.id as training_id, t.name as training_name
                FROM user u
                LEFT OUTER JOIN user_workspace uw ON uw.user_id = u.id
                LEFT OUTER JOIN workspace w ON w.id = uw.workspace_id
                LEFT OUTER JOIN user_training ut ON ut.user_id = u.id
                LEFT OUTER JOIN training t ON t.id = ut.training_id OR t.user_id = u.id"""

            if users_id is not None:
                users_id = [str(id) for id in users_id]
                users_id = ','.join(users_id)
                sql+= "WHERE u.id IN ({})".format(users_id)
            cur.execute(sql)
            res = cur.fetchall()

    except:
        traceback.print_exc()
    return res

# Traceback (most recent call last):
# File "./utils/db.py", line 581, in get_user
#     row = cur.execute("SELECT * from user where name = %s", (user_name,)).fetchone()
#     sqlite3.OperationalError: database is locked
def get_user(user_id=None, user_name=None):
    res = None
    try:
        with get_db() as conn:
        # with get_db() as conn:

            cur = conn.cursor()

            if user_id is not None:

                sql = """SELECT u.*,
                    ug.name AS group_name, ug.id AS group_id
                    FROM user u
                    LEFT JOIN user_usergroup uug ON uug.user_id = u.id
                    LEFT JOIN usergroup ug ON uug.usergroup_id = ug.id
                    WHERE u.id = %s"""

                cur.execute(sql, (user_id,))
            elif user_name is not None:

                sql = """SELECT u.*,
                    ug.name AS group_name, ug.id AS group_id
                    FROM user u
                    LEFT JOIN user_usergroup uug ON uug.user_id = u.id
                    LEFT JOIN usergroup ug ON uug.usergroup_id = ug.id
                    WHERE u.name = %s"""

                cur.execute(sql, (user_name,))

            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_user_list(search_key=None, size=None, page=None, search_value=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            # sql = "SELECT u.*, "\
            #         "(select count(*) from user_workspace uw where uw.user_id = u.id) as workspaces , "\
            #         "(select count(*) from user_training ut where ut.user_id = u.id) as trainings , "\
            #         "(select count(*) from image i where i.user_id = u.id) as images, "\
            #         "(select count(*) from dataset d where d.create_user_id = u.id) as datasets ,"\
            #         "case u.user_type "\
            #         "WHEN 0 "\
            #             "THEN 0 "\
            #         "WHEN 3 "\
            #             "THEN "\
            #                 "case (select (case when count(w.manager_id)>0 THEN 1 ELSE 0 end) as w_chk  from workspace as w where w.manager_id=u.id) "\
            #                 "WHEN 0 "\
            #                     "THEN (select (case when count(t.user_id)>0 THEN 2 ELSE 3 end) as p_chk  from training as t where t.user_id=u.id) "\
            #                 "WHEN 1 "\
            #                     "THEN 1 "\
            #                 "end "\
            #         "end as real_user_type "\
            #         "FROM user as u "
            sql = """
                SELECT u.*,
                (select count(*) from user_workspace uw where uw.user_id = u.id) as workspaces ,
                (SELECT count(DISTINCT t.id) FROM training t
                RIGHT JOIN user_workspace uw ON uw.workspace_id = t.workspace_id
                RIGHT JOIN user_training ut ON ut.training_id = t.id
                WHERE uw.user_id = u.id AND (t.access = 1 OR (t.access=0 AND ut.user_id = u.id))) as trainings ,
                (SELECT count(DISTINCT d.id) FROM deployment d
                RIGHT JOIN user_workspace uw ON uw.workspace_id = d.workspace_id
                RIGHT JOIN user_deployment ud ON ud.deployment_id = d.id
                WHERE uw.user_id = u.id AND (d.access = 1 OR (d.access=0 AND ud.user_id = u.id))) as deployments ,
                (select count(*) from image i where i.user_id = u.id) as images,
                (select count(*) from dataset d where d.create_user_id = u.id) as datasets ,
                case u.user_type
                WHEN 0
                THEN 0
                    WHEN 3
                        THEN
                            case (select (case when count(w.manager_id)>0 THEN 1 ELSE 0 end) as w_chk  from workspace as w where w.manager_id=u.id)
                        WHEN 0
                            THEN (select (case when count(t.user_id)>0 THEN 2 ELSE 3 end) as p_chk  from training as t where t.user_id=u.id)
                        WHEN 1
                            THEN 1
                end
                end as real_user_type,
                ug.name AS group_name
                FROM user as u
                LEFT JOIN user_usergroup uug ON uug.user_id = u.id
                LEFT JOIN usergroup ug ON ug.id = uug.usergroup_id
            """

            if search_key is not None and search_value is not None:
                search_value = '"%{}%"'.format(search_value)
                sql += "where u.{} like {} ".format(search_key, search_value)

            if size is not None and page is not None:
                sql += "limit {}, {}".format((page-1)*size, size)

            cur.execute(sql)
            res = cur.fetchall()

    except:
        traceback.print_exc()
    return res

def get_manager_workspace(user_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT name
                FROM workspace
                WHERE manager_id = {}""".format(user_id)

            cur.execute(sql)
            res = cur.fetchall()

    except:
        traceback.print_exc()
    return res

def get_users_id(users_name):
    # [test1,test2,test3..]
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            users_name = ['"'+user_name+'"' for user_name in users_name]
            users_name = ','.join(users_name)
            sql = """SELECT id
                FROM user
                WHERE name in ({})""".format(users_name)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_user_name(user_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT name
                FROM user
                WHERE id = {}""".format(user_id)

            cur.execute(sql)
            res = cur.fetchone()

    except:
        traceback.print_exc()
    return res

def get_user_by_uid(uid):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT *
                FROM user
                WHERE uid = {}""".format(uid)

            cur.execute(sql)
            res = cur.fetchone()

        return res
    except:
        traceback.print_exc()


def get_user_id(user_name):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT id, user_type
                FROM user
                WHERE name = '{}'""".format(user_name)

            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_user_name_and_id_list(users_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            users_id = [str(id) for id in users_id]
            users_id = ','.join(users_id)

            sql = """SELECT id, name
                FROM user
                WHERE id in ({})

                """.format(users_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_user_docker_image(user_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT DISTINCT *
                FROM image i
                WHERE i.user_id = {}
                """.format(user_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_user_dataset(user_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT DISTINCT *
                FROM dataset d
                WHERE d.create_user_id = {}
                """.format(user_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_user_training(user_id, only_owner=None, only_users=None):
    # owner | users  = same
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT DISTINCT *
                FROM training t
                LEFT OUTER JOIN user_training ut ON ut.training_id = t.id
                """
                
            if only_owner == True:
                sql += " WHERE t.user_id = {} ".format(user_id)
            elif only_users == True:
                sql += " WHERE ut.user_id = {} ".format(user_id)
            elif only_owner is None and only_users is None:
                sql += " WHERE t.user_id = {} OR ut.user_id = {} ".format(user_id, user_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_users_training(user_id_list, only_owner=None, only_users=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT DISTINCT *
                FROM training t
                LEFT OUTER JOIN user_training ut ON ut.training_id = t.id
                """
            
            user_id_list = [str(id) for id in user_id_list]
            user_id_list = ','.join(user_id_list)

            if only_owner == True:
                sql += " WHERE t.user_id in ({}) ".format(user_id_list)
            elif only_users == True:
                sql += " WHERE ut.user_id in ({}) ".format(user_id_list)
            elif only_owner is None and only_users is None:
                sql += " WHERE t.user_id in ({}) OR ut.user_id in ({}) ".format(user_id_list, user_id_list)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def get_user_deployment(user_id, only_owner=None, only_users=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT DISTINCT *
                FROM deployment d
                LEFT OUTER JOIN user_deployment ud ON ud.deployment_id = d.id
                """
            if only_owner == True:
                sql += " WHERE d.user_id = {} ".format(user_id)
            elif only_users == True:
                sql += " WHERE ud.user_id = {} ".format(user_id)
            elif only_owner is None and only_users is None:
                sql += " WHERE d.user_id = {} OR ud.user_id = {} ".format(user_id, user_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def get_user_workspace(user_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT DISTINCT w.id, w.name as workspace_name
                FROM user_workspace uw
                INNER JOIN workspace w ON uw.workspace_id = w.id
                WHERE uw.user_id in (%s) OR w.manager_id in (%s)"""

            cur.execute(sql, (user_id,user_id,))
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_user_workspace_training(user_id, workspace_id, only_owner=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            if only_owner is None:
                sql = """
                        SELECT DISTINCT t.* FROM training t
                        RIGHT JOIN user_workspace uw ON uw.workspace_id = t.workspace_id
                        RIGHT JOIN user_training ut ON ut.training_id = t.id
                        WHERE (uw.user_id = {0} AND (t.access = 1 OR (t.access=0 AND ut.user_id = {0}))) AND t.workspace_id = {1}
                    """.format(user_id, workspace_id)
            else :
                sql = """
                        SELECT DISTINCT t.* FROM training t
                        WHERE t.user_id = {0} AND t.workspace_id = {1}
                    """.format(user_id, workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_user_workspace_deployment(user_id, workspace_id, only_owner=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            if only_owner is None:
                sql = """
                        SELECT DISTINCT d.* FROM deployment d
                        RIGHT JOIN user_workspace uw ON uw.workspace_id = d.workspace_id
                        RIGHT JOIN user_deployment ud ON ud.deplyoment_id = d.id
                        WHERE (uw.user_id = {0} AND (d.access = 1 OR (d.access=0 AND ud.user_id = {0}))) AND t.workspace_id = {1}
                    """.format(user_id, workspace_id)
            else :
                sql = """
                        SELECT DISTINCT d.* FROM deployment d
                        WHERE d.user_id = {0} AND d.workspace_id = {1}
                    """.format(user_id, workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_user_workspace_dataset(user_id, workspace_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """SELECT DISTINCT *
                FROM dataset d
                WHERE d.create_user_id = {} and d.workspace_id = {}
                """.format(user_id, workspace_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def get_user_list_has_group():
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT DISTINCT user_id
                FROM user_usergroup
            """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
        raise
    return res

def insert_user_s(create_user_list, create_datetime):
    # key : [{ new_user_name, uid, user_type,  }]
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for i in range(len(create_user_list)):
                new_user_name = create_user_list[i]["new_user_name"]
                uid = create_user_list[i]["uid"]
                user_type = create_user_list[i]["user_type"]
                rows.append((new_user_name, uid, user_type, create_datetime, create_datetime))
            sql = "INSERT into user(name, uid, user_type, create_datetime, update_datetime) values (%s,%s,%s,%s,%s)"
            cur.executemany(sql, rows)
            conn.commit()

        return True
    except:
        traceback.print_exc()
    return None

def insert_user(user_id, uid, user_type, create_datetime):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "INSERT into user(name, uid, user_type, create_datetime) values (%s,%s,%s,%s)"
            cur.execute(sql, (user_id, uid, user_type, create_datetime))
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False
    return


def update_user(user_id, user_type):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE user set user_type = %s "
            sql+= "where id = %s"
            cur.execute(sql, (user_type, user_id))
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def update_users(update_user_list):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for i in range(len(update_user_list)):
                user_type = update_user_list[i]["user_type"]
                user_id = update_user_list[i]["SELECT_user_id"]
                rows.append((user_type, user_id))

            sql = "UPDATE user set user_type = %s where id = %s"
            cur.executemany(sql,rows)
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False
    return False

def update_user_login_counitng(user_id, set_default=False):
    """
    Description: 유저의 login_counting column 값을 1 더하는 기능
    """
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if not set_default:
                sql = """
                    UPDATE user set login_counting = login_counting + 1
                    where id = {}
                """.format(user_id)
            else:
                sql = """
                    UPDATE user set login_counting = 0
                    where id = {}
                """.format(user_id)

            cur.execute(sql)
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e
    # return False, ""

def update_user_login_counting_set(user_id, value=None):
    """
    Description: 유저의 login_counting column 값을 특정 값으로 수정하는 기능
    """
    try:
        if value is None:
            value = MAX_NUM_OF_LOGINS
        with get_db() as conn:
            cur = conn.cursor()
            sql = f"""
                UPDATE user SET login_counting = {value}
                WHERE id = {user_id}
            """
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_user(user_id=None, user_name=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            if user_id is not None:
                cur.execute("delete from user where id = {}".format(user_id))
            elif user_name is not None:
                cur.execute("delete from user where user_name = {}".format(user_name))
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False
    return False

def delete_users(users_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            users_id = [str(id) for id in users_id]
            users_id = ','.join(users_id)
            cur.execute("DELETE from user where id in ({})".format(users_id))
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False
    return False


def insert_user_workspace_s(workspaces_id: [], users_id: []):
    # workspaces_id = [[1,2,3],[1],[],[1,3]]
    # users_id = [1,2,3]
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for i in range(len(workspaces_id)):
                for workspace_id in workspaces_id[i]:
                    rows.append((workspace_id,users_id[i]))
            sql = "INSERT into user_workspace(workspace_id,user_id) values (%s,%s)"
            # cur.execute(sql, (workspace_id, user_id))
            cur.executemany(sql, rows)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False

def insert_user_workspace(workspace_id, user_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "INSERT IGNORE into user_workspace(workspace_id, user_id) values (%s,%s)"
            cur.execute(sql, (workspace_id, user_id))
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False

def delete_user_workspace_s(workspaces_id: [], users_id: []):
    # workspaces_id = [[1,2,3],[1],[],[1,3]]
    # users_id = [1,2,3]
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for i in range(len(workspaces_id)):
                for workspace_id in workspaces_id[i]:
                    rows.append((workspace_id,users_id[i]))
            sql = "DELETE from user_workspace where workspace_id = %s and user_id = %s"
            # cur.execute(sql, (workspace_id, user_id))
            cur.executemany(sql, rows)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False

def delete_user_workspace(workspace_id=None, user_id=None):
    #TODO user workspace에서 지워지면 user trainings에서도 삭제
    try:
        with get_db() as conn:

            cur = conn.cursor()

            if workspace_id is not None and user_id is not None:
                sql = "DELETE from user_workspace where workspace_id = %s and user_id = %s"
                cur.execute(sql, (workspace_id, user_id))
            elif workspace_id is not None and user_id is None:
                sql = "DELETE from user_workspace where workspace_id = %s"
                cur.execute(sql, (workspace_id,))
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False



def insert_user_training_s(trainings_id: [], users_id: []):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for i in range(len(trainings_id)):
                    rows.append((trainings_id[i],users_id[i]))
            sql = "INSERT IGNORE into user_training(training_id, user_id) values (%s,%s)"
            # cur.execute(sql, (workspace_id, user_id))
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def insert_user_training(training_id, user_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "INSERT or ignore into user_training(training_id, user_id) values (%s,%s)"
            cur.execute(sql, (training_id, user_id))
            conn.commit()

        return cur.lastrowid, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def update_user_training(training_id, user_id):

    return


def delete_user_training(training_id, user_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "DELETE from user_training where training_id = %s and user_id = %s"
            cur.execute(sql, (training_id,user_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        # raise
        return False, e



def insert_training_port_list(training_id, port_list: []):
    # port_list = [
    #     {"name":"ssh","target_port":22,"protocol":"TCP","node_port": 31231, "description": "QWEQWRWQR"}, 
    #     {"name":"ssh","target_port":22,"protocol":"TCP","node_port": 31231, "description": "QWEQWRWQR"}
    # ]
    # from utils.db_training_tool import get_training_tool_list 
    try:
        training_tool_id = None
        for tool in get_training_tool_list(training_id):
            if tool["tool_type"] == 1:
                training_tool_id = tool["id"]

        with get_db() as conn:
            cur = conn.cursor()
            rows = []
            for item in port_list:
                rows.append((training_id, training_tool_id, item["name"], item["target_port"], item["protocol"], item["node_port"], item["description"]))
            
            sql = "INSERT into training_port(training_id, training_tool_id, name, target_port, protocol, node_port, description) values (%s,%s,%s,%s,%s,%s,%s)"
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def delete_training_port(training_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "DELETE from training_port where training_id = %s AND system_definition = 0"
            cur.execute(sql, (training_id,))
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        # raise
        return False, e

def update_training_port():

    return


def get_usergroup(usergroup_id=None, usergroup_name=None):
    # SELECT GROUP_concat(uug.user_id), GROUP_CONCAT(u.name)
    # FROM user_usergroup uug
    # LEFT JOIN user u ON u.id = uug.user_id
    # WHERE uug.usergroup_id = 4
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            if usergroup_id is not None:
                sql = """
                    SELECT ug.*, 
                        (SELECT GROUP_concat(uug.user_id) FROM user_usergroup uug WHERE uug.usergroup_id = ug.id) AS user_id_list,
                        (SELECT GROUP_concat(u.name) FROM user_usergroup uug JOIN user u ON uug.user_id = u.id WHERE uug.usergroup_id = ug.id) AS user_name_list
                    FROM usergroup ug
                    WHERE id = {id}
                """.format(id=usergroup_id)
            elif usergroup_name is not None:
                sql = """
                    SELECT ug.*, (SELECT GROUP_concat(uug.user_id) FROM user_usergroup uug WHERE uug.usergroup_id = ug.id) AS user_id_list,
                    (SELECT GROUP_concat(u.name) FROM user_usergroup uug JOIN user u ON uug.user_id = u.id WHERE uug.usergroup_id = ug.id) AS user_name_list
                    FROM usergroup ug
                    WHERE name = "{name}"
                """.format(name=usergroup_name)
            cur.execute(sql)
            res = cur.fetchone()
            if res is not None:
                res["user_id_list"] = list(map(int, res["user_id_list"].split(","))) if res["user_id_list"] is not None else []
                res["user_name_list"] = list(map(str, res["user_name_list"].split(","))) if res["user_name_list"] is not None else []
        return res, ""
    except Exception as e:
        traceback.print_exc()
        return res, e

def get_usergroup_list(search_key=None, size=None, page=None, search_value=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ug.*, 
                    (SELECT GROUP_concat(uug.user_id) FROM user_usergroup uug WHERE uug.usergroup_id = ug.id) AS user_id_list,
                    (SELECT GROUP_concat(u.name) FROM user_usergroup uug JOIN user u ON uug.user_id = u.id WHERE uug.usergroup_id = ug.id) AS user_name_list
                FROM usergroup ug
            """

            if search_key is not None and search_value is not None:
                search_value = '"%{}%"'.format(search_value)
                sql += " where ug.{} like {} ".format(search_key, search_value)

            if size is not None and page is not None:
                sql += " limit {}, {}".format((page-1)*size, size)

            cur.execute(sql)
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
        raise


def get_usergroup_list_with_users():
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT
                    u.id as user_id, u.name as user_name, ug.id as group_id
                FROM 
                    user_usergroup uug
                JOIN
                    user u ON u.id = uug.user_id
                JOIN
                    usergroup ug ON ug.id = uug.usergroup_id
            """

            cur.execute(sql)
            res = cur.fetchall()
        return res, ""
    except Exception as e:
        traceback.print_exc()
        return res, e


def insert_usergroup(usergroup_name, description):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
            INSERT into usergroup(name, description)
            values (%s, %s)
            """
            cur.execute(sql, (usergroup_name, description))
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def update_usergroup(usergroup_id, usergroup_name, description):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
            UPDATE usergroup
            SET name = %s, description = %s, update_datetime = %s 
            WHERE id = %s
            """
            cur.execute(sql, (usergroup_name, description, datetime.today().strftime("%Y-%m-%d %H:%M:%S"), usergroup_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_usergroup(usergroup_id):
    return

def delete_usergroup_list(usergroup_id_list):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            rows = []
            for i in range(len(usergroup_id_list)):
                rows.append((usergroup_id_list[i]))

            sql = """
                DELETE from usergroup
                WHERE id = %s
            """
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e
def insert_user_usergroup(usergroup_id, user_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "INSERT or ignore into user_training(training_id, user_id) values (%s,%s)"
            cur.execute(sql, (training_id, user_id))
            conn.commit()

        return cur.lastrowid, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def insert_user_usergroup_list(usergroup_id_list: [], user_id_list: []):
    if len(user_id_list) == 0:
        return True, ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            rows = []
            for i in range(len(usergroup_id_list)):
                rows.append((usergroup_id_list[i], user_id_list[i]))

            sql = "INSERT IGNORE into user_usergroup(usergroup_id, user_id) values (%s,%s)"
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def delete_user_usergroup_list(usergroup_id_list: [], user_id_list: []):
    if len(user_id_list) == 0:
        return True, ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            rows = []
            for i in range(len(usergroup_id_list)):
                rows.append((usergroup_id_list[i], user_id_list[i]))

            sql = """
                DELETE from user_usergroup
                WHERE usergroup_id = %s AND user_id = %s
            """
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_user_usergroup(user_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                DELETE from user_usergroup
                WHERE user_id = %s
            """
            cur.execute(sql, (user_id,))
            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        raise

def training_sql():
    # sql = """
    #     SELECT DISTINCT t.id,
    #     t.name as training_name, t.workspace_id, w.name as workspace_name, w.start_datetime, w.end_datetime, t.gpu_count, t.type, t.description,
    #     t.access, t.user_id, u.name as user_name, t.create_datetime, t.last_run_datetime,
    #     i.name as image, i.id as image_id, 
    #     bm.name as built_in_model_name, bm.id as built_in_model_id, bm.description as built_in_model_description,
    #     (SELECT u.name FROM user u WHERE u.id = w.manager_id) AS manager_name,
    #     te.id AS tool_editor_id, te.configurations AS tool_editor_configurations, te.tool_type AS tool_editor_type,
    #     tj.id AS tool_jupyter_id, tj.configurations AS tool_jupyter_configurations, tj.tool_type AS tool_jupyter_type
    #     from training t
    #     INNER JOIN user_training ut ON t.id = ut.training_id
    #     INNER JOIN workspace w on w.id = t.workspace_id
    #     LEFT JOIN user u on u.id = t.user_id
    #     LEFT JOIN image i on t.docker_image_id = i.id
    #     LEFT JOIN built_in_model bm on bm.id = t.built_in_model_id
    #     LEFT JOIN training_tool te on te.training_id = t.id AND te.tool_type = 0 
    #     LEFT JOIN training_tool tj on tj.training_id = t.id AND tj.tool_type = 1
    # """
    sql = """
        SELECT DISTINCT t.id,
        t.name as training_name, t.workspace_id, w.name as workspace_name, w.start_datetime, w.end_datetime, 
        t.gpu_count, t.gpu_model, t.node_mode, t.node_name,
        t.type, t.description,
        t.access, t.user_id, u.name as user_name, t.create_datetime, t.last_run_datetime,
        i.name as image_name, i.id as image_id, 
        bm.name as built_in_model_name, bm.id as built_in_model_id, bm.description as built_in_model_description,
        (SELECT u.name FROM user u WHERE u.id = w.manager_id) AS manager_name,
        te.id AS tool_editor_id, te.configurations AS tool_editor_configurations, te.tool_type AS tool_editor_type,
        tj.id AS tool_jupyter_id, tj.configurations AS tool_jupyter_configurations, tj.tool_type AS tool_jupyter_type,
        tj.gpu_count AS tool_jupyter_gpu_count, (SELECT i.name FROM image i WHERE i.id = tj.docker_image_id) AS tool_jupyter_image_name
        from training t
        LEFT JOIN user_training ut ON t.id = ut.training_id
        LEFT JOIN workspace w on w.id = t.workspace_id
        LEFT JOIN user u on u.id = t.user_id
        LEFT JOIN image i on t.docker_image_id = i.id
        LEFT JOIN built_in_model bm on bm.id = t.built_in_model_id
        LEFT JOIN training_tool te on te.training_id = t.id AND te.tool_type = 0 
        LEFT JOIN training_tool tj on tj.training_id = t.id AND tj.tool_type = 1 AND tj.tool_replica_number = 0
    """
    return sql

def get_training_list(search_key=None, size=None, page=None, search_value=None, workspace_id=None, user_id=None, sort=None, training_type=None):
    res = None
    try:
        with get_db() as conn:
        # with get_db() as conn:

            cur = conn.cursor()
            sql = training_sql()

            if search_key is not None and search_value is not None:
                if search_key == "user_id":
                    sql += " where u.id = {} or ut.user_id = {} ".format(search_value, search_value)
                else :
                    search_value = '"%{}%"'.format(search_value)
                    sql += " where t.{} like {} ".format(search_key, search_value)


            if workspace_id is not None:
                if not "where" in sql:
                    sql += " where "
                else:
                    sql += "and "
                sql += "w.id = {} ".format(workspace_id)


            if training_type is not None:
                if not "where" in sql:
                    sql += "where "
                else:
                    sql += "and "
                sql += "t.type ='{}' ".format(training_type)
            #access 0 이여도 화면상에는 보이도록
            # if user_id is not None:
            #     if not "where" in sql:
            #         sql += " where "
            #     else:
            #         sql += "and "
            #     sql += " (ut.user_id={} or t.access=1) ".format(user_id)

            if sort is not None:
                if sort == "created_datetime":
                    sql += " ORDER BY t.create_datetime desc"
                elif sort == "last_run_datetime":
                    sql += " ORDER BY t.last_run_datetime desc"

            if page is not None and size is not None:
                sql += " limit {}, {}".format((page-1)*size, size)
            cur.execute(sql)
            res = cur.fetchall()

    except:
        traceback.print_exc()
    return res

def get_training(training_id=None, training_name=None, workspace_id=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = training_sql()
            # sql = """
            #     SELECT t.id, t.name as training_name, t.workspace_id, w.name as workspace_name, w.start_datetime, w.end_datetime, t.gpu_count, t.type, t.description,
            #     i.name as image_name, i.id as image_id, t.access, t.user_id, u.name as user_name,
            #     t.create_datetime, w.id as workspace_id, w.manager_id, (SELECT u.name FROM user u WHERE u.id = w.manager_id) AS manager_name,
            #     bm.name as built_in_model_name, bm.id as built_in_model_id, bm.description as built_in_model_description
            #     from training t
            #     left join workspace w on t.workspace_id = w.id
            #     left join user u on t.user_id = u.id
            #     left join image i on t.docker_image_id = i.id
            #     LEFT JOIN built_in_model bm ON bm.id = t.built_in_model_id
            #     """

            if training_id is not None:
                sql += "where t.id = %s"
                cur.execute(sql, (training_id,))
            elif training_name is not None:
                if workspace_id is not None:
                    sql += "where t.name = {} and t.workspace_id = {} ".format('"'+training_name+'"', workspace_id)
                else :
                    sql += "where t.name = {}".format('"'+training_name+'"')
                cur.execute(sql)
            res = cur.fetchone()
            # res["gpu_model"] = json.loads(res["gpu_model"])
            res = common.resource_str_column_to_dict(res)

    except:
        traceback.print_exc()
    return res


def get_training_owner(training_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT u.name as owner_name, u.id as owner_id
                FROM user u
                RIGHT JOIN training t ON u.id = t.user_id
                WHERE t.id = {}
            """.format(training_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_training_users(training_id, include_owner=True):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = "SELECT DISTINCT u.id, u.name AS user_name "
            sql += "FROM training t "
            sql += "INNER JOIN user_training ut ON ut.training_id = t.id "
            sql += "LEFT JOIN user_workspace uw ON t.workspace_id = uw.workspace_id and t.access= 1 "
            sql += "LEFT JOIN user u ON u.id = uw.user_id OR u.id = ut.user_id "
            sql += "WHERE t.id = {} ".format(training_id)
            if include_owner == False:
                sql += "  AND ((u.id != ut.user_id) OR (ut.user_id != t.user_id))"
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_trainings_users(trainings_id, include_owner=True):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            trainings_id_ = [str(id) for id in trainings_id]
            trainings_id_ = ','.join(trainings_id_)

            sql = """
                SELECT DISTINCT t.id AS training_id, u.id, u.name AS user_name
                FROM training t
                INNER JOIN user_training ut ON ut.training_id = t.id
                LEFT JOIN user_workspace uw ON t.workspace_id = uw.workspace_id and t.access= 1
                LEFT JOIN user u ON u.id = uw.user_id OR u.id = ut.user_id
                WHERE t.id in ({})
            """.format(trainings_id_)
            if include_owner == False:
                sql += "  AND ((u.id != ut.user_id) OR (ut.user_id != t.user_id))"

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

#TODO REMOVE
def get_training_ports(training_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = "SELECT tp.* from training_port tp where tp.training_id = %s"
            cur.execute(sql, (training_id,))
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def get_training_workspace_both_name(training_id):
    # For Pod name
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                SELECT w.name as workspace_name, t.name as training_name, t.type
                from training t
                inner join workspace w on t.workspace_id = w.id where t.id = {}
            """.format(training_id)
            cur.execute(sql)
            res = cur.fetchone()
    except Exception as e:
        traceback.print_exc()
        raise
    return res

def insert_training(training_name, training_type, workspace_id, owner_id, gpu_count, gpu_model, node_mode, node_name, 
                    docker_image_id, access, built_in_model_id, description):
    try:
        gpu_model = common.gpu_model_to_dumps(gpu_model)
        node_name = common.gpu_model_to_dumps(node_name)

        with get_db() as conn:

            cur = conn.cursor()

            sql = "INSERT into training(workspace_id, name, gpu_count, gpu_model, node_mode, node_name, type, docker_image_id, access, user_id, built_in_model_id, description) "
            sql+= "values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"

            cur.execute(sql, (workspace_id, training_name, gpu_count, gpu_model, node_mode, node_name, training_type, docker_image_id, access, owner_id, built_in_model_id, description))

            # cur.executemany(sql, rows)
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_training_run(training_id=None, training_name=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE training set last_run_datetime = %s "
            if training_id is not None:
                sql+= "where id = %s"
            elif training_name is not None:
                sql+= "where name = %s"
            cur.execute(sql, (datetime.today().strftime("%Y-%m-%d %H:%M:%S"), training_id))
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_training(training_id, training_name, user_id, gpu_count, gpu_model, node_mode, node_name, 
                    docker_image_id, access, description):
    from utils.db_training_tool import update_training_tool_sync_with_training
    try:
        gpu_model = common.gpu_model_to_dumps(gpu_model)
        node_name = common.gpu_model_to_dumps(node_name)
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE training 
                set name = %s, user_id = %s, gpu_count = %s, gpu_model = %s, node_mode = %s, node_name = %s, 
                docker_image_id = %s, access = %s, description = %s 
                where id = %s
                """
            cur.execute(sql, (training_name, user_id, gpu_count, gpu_model, node_mode, node_name, docker_image_id, access, description, training_id))

            conn.commit()
        
        # update_training_tool_sync_with_training(training_id=training_id)

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_training_on_user_permission(training_id, gpu_count, docker_image_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE training set gpu_count = %s, docker_image_id = %s where id = %s"

            cur.execute(sql, (gpu_count, docker_image_id, training_id))

            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_training(training_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "DELETE from training where id = %s"
            cur.execute(sql, (training_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        raise
        # return False, e
    return False

def delete_training_with_workspace_id(workspace_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "DELETE from training where workspace_id = %s"
            cur.execute(sql, (workspace_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        raise
        # return False, e
    return False

def get_pod_queue():
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT * FROM pod_queue
            """
            cur.execute(sql)
            res = cur.fetchall()

    except:
        traceback.print_exc()
    return res

def get_pod_queue_with_info():
    # FOR TRAINING DATA
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT w.name as workspace_name, w.id as workspace_id, w.guaranteed_gpu as guaranteed_gpu,
                t.name as training_name, t.id as training_id, 
                t.type as training_type, ut.name as owner_name, ut.users_name as users, i.real_name as image,
                j.name as job_name, j.id as job_id, j.gpu_count as gpu_count, 
                j.group_number as job_group_number, j.job_group_index, j.run_code, j.parameter,
                j.dataset_name, j.dataset_access as dataset_access, j.gpu_model as gpu_model, j.node_name as node_name,
                j.unified_memory, j.gpu_acceleration, j.rdma, j.create_datetime,
                bm.model, bm.path as built_in_path, bm.id as built_in_model_id,
                (SELECT u.name FROM user u WHERE u.id = j.creator_id) AS creator_name, j.creator_id AS creator_id,
                tt.id AS training_tool_id
                from pod_queue q
                JOIN training t on q.training_id = t.id
                JOIN workspace w on t.workspace_id = w.id
                JOIN (
                SELECT training_id, uu.name, group_concat(u.name) as users_name from user_training as ut
                JOIN training t on t.id = ut.training_id
                LEFT JOIN user u on u.id = ut.user_id and t.user_id != ut.user_id
                JOIN user uu on t.user_id = uu.id
                group by training_id
                ) ut on ut.training_id = q.training_id
                LEFT JOIN job j on q.job_id = j.id
                LEFT JOIN image i on i.id = j.docker_image_id
                LEFT JOIN built_in_model bm ON bm.id = t.built_in_model_id
                LEFT JOIN training_tool tt ON tt.training_id = t.id AND tt.tool_type = {TOOL_JOB_ID}
                ORDER BY idx
            """.format(TOOL_JOB_ID=TOOL_JOB_ID)
            cur.execute(sql)
            res = cur.fetchall()
            # for i, d in enumerate(res):
            #     res[i]["gpu_model"] = json.loads(d["gpu_model"])
            res = common.resource_str_column_to_dict(res)
    except:
        traceback.print_exc()
    return res


def insert_pod_queue(training_id, job_id=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "INSERT into pod_queue(training_id, job_id) values (%s,%s)"
            cur.execute(sql, (training_id, job_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return e
    return

def insert_pod_queues(training_and_job_id_list):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for i, id in enumerate(training_and_job_id_list):
                rows.append((id["training_id"], id["job_id"]))

            sql = "INSERT into pod_queue(training_id, job_id) values (%s,%s)"
            cur.executemany(sql, rows)
            conn.commit()


        return True
    except Exception as e:
        traceback.print_exc()
        return e
    return


def delete_pod_queue(training_id, job_id=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "DELETE FROM pod_queue "
            del_id = ""
            if job_id is None:
                del_id = training_id
                sql += "where training_id = %s "
            else :
                del_id = job_id
                sql += "where job_id = %s "

            cur.execute(sql, (del_id,))
            conn.commit()



        return True
    except Exception as e:
        print(e)
        return False

def delete_pod_queues(training_id, job_id_list=[]):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            job_id_list = ','.join(str(e) for e in job_id_list)
            sql = "DELETE FROM pod_queue "
            if len(job_id_list) > 0:
                sql += "where training_id = {} and job_id in ({}) ".format(training_id, job_id_list)
            else :
                sql += "where training_id = {} ".format(training_id)

            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        print(e)
        return False

def get_hyperparamsearch_queue_with_info():
    # FOR TRAINING DATA
    res = []
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT w.name as workspace_name, w.id as workspace_id, w.guaranteed_gpu as guaranteed_gpu,
                t.name as training_name, t.id as training_id, 
                t.type as training_type, ut.name as owner_name, ut.users_name as users, i.real_name as image,
                hps_g.name as hps_name, hps.id as hps_id, 
                hps.gpu_count as gpu_count, hps.gpu_model as gpu_model, hps.node_name as node_name,
                hps_g.id as hps_group_id, hps_g.run_code, hps_g.run_parameter,
                hps.search_parameter, hps.int_parameter, hps.method, hps.search_count, hps.search_interval, hps.init_points,
                hps.hps_group_index as hps_group_index, hps.dataset_name, hps.dataset_access as dataset_access,
                hps.unified_memory, hps.gpu_acceleration, hps.rdma, hps.create_datetime,
                hps.save_file_name, hps.load_file_name, hps.executor_id,
                bm.model, bm.path as built_in_path, bm.id as built_in_model_id,
                (SELECT u.name FROM user u WHERE u.id = hps.executor_id) AS creator_name,
                tt.id as training_tool_id
                from hyperparamsearch_queue hpsq
                LEFT JOIN hyperparamsearch hps ON hpsq.hps_id = hps.id
                JOIN hyperparamsearch_group hps_g ON hps_g.id = hps.hps_group_id
                JOIN training t on hps_g.training_id = t.id
                JOIN workspace w on t.workspace_id = w.id
                JOIN (
                SELECT training_id, uu.name, group_concat(u.name) as users_name from user_training as ut
                JOIN training t on t.id = ut.training_id
                LEFT JOIN user u on u.id = ut.user_id and t.user_id != ut.user_id
                JOIN user uu on t.user_id = uu.id
                group by training_id
                ) ut on ut.training_id = hps_g.training_id
                LEFT JOIN image i on i.id = hps_g.docker_image_id
                LEFT JOIN built_in_model bm ON bm.id = t.built_in_model_id
                LEFT JOIN training_tool tt ON tt.training_id = t.id AND tt.tool_type = {TOOL_HPS_ID}
                ORDER BY idx
            """.format(TOOL_HPS_ID=TOOL_HPS_ID)
            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res)
            # for i, d in enumerate(res):
            #     res[i]["gpu_model"] = json.loads(d["gpu_model"])

    except:
        traceback.print_exc()
    return res

def get_hyperparamsearch_queue():
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT * FROM hyperparamsearch_queue
            """
            cur.execute(sql)
            res = cur.fetchall()

    except:
        traceback.print_exc()
    return res

def insert_hyperparamsearch_queue(training_id, hps_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "INSERT into hyperparamsearch_queue(training_id, hps_id) values (%s,%s)"
            cur.execute(sql, (training_id, hps_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return e
    return

def delete_hyperparamsearch_queues(training_id, hps_id_list=[]):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            hps_id_list = ','.join(str(e) for e in hps_id_list)
            sql = "DELETE FROM hyperparamsearch_queue "
            if len(hps_id_list) > 0:
                sql += "where training_id = {} and hps_id in ({}) ".format(training_id, hps_id_list)
            else :
                sql += "where training_id = {} ".format(training_id)

            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        print(e)
        return False

def delete_hyperparamsearch_queue(training_id, hps_id=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "DELETE FROM hyperparamsearch_queue "
            del_id = ""
            if hps_id is None:
                del_id = training_id
                sql += " where training_id = %s "
            else :
                del_id = hps_id
                sql += " where hps_id = %s "

            cur.execute(sql, (del_id,))
            conn.commit()

        return True
    except Exception as e:
        print(e)
        return False

def get_all_queue_item_with_info():
    """
        Description : Queue에 들어가는 아이템들 JOB, HPS + a 전체를 가져오는 함수

        Return :
            (list(dict))  : 실행에 필요한 정보를 포함한 list
    """

    all_queue_list = []

    all_queue_list += get_pod_queue_with_info()  # JOB
    all_queue_list += get_hyperparamsearch_queue_with_info() # HPS


    return all_queue_list 

def get_dataset(dataset_id=None, dataset_name=None, workspace_id=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT d.*, ws.name as workspace_name
                FROM dataset d
                INNER JOIN workspace ws ON d.workspace_id = ws.id
                """
            if dataset_id is not None:
                sql += "WHERE d.id = {}".format(dataset_id) 
            if dataset_name is not None:
                if workspace_id is not None:
                    sql += 'WHERE d.name = "{}" AND d.workspace_id = {}'.format(dataset_name, workspace_id) 
                else:
                    sql += 'WHERE d.name = "{}"'.format(dataset_name) 
            cur.execute(sql)
            res = cur.fetchone()
    except Exception as e:
        raise e
    return res

def get_dataset_list(workspace_id = None, search_key=None, search_value=None, user_id = None,
                        page = None, size = None, user_type=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "SELECT ds.name as dataset_name, ds.create_datetime, ds.file_count, ds.dir_count, ds.size, ds.update_datetime,ds.modify_datetime, ds.access, ds.id, ds.description, ds.auto_labeling, ds.inode_number, " \
                  "ws.id as workspace_id, ws.name as workspace_name, u.name as owner, u2.name as workspace_manager FROM dataset as ds " \
                  "INNER JOIN workspace ws ON ds.workspace_id = ws.id LEFT JOIN user u ON ds.create_user_id = u.id INNER JOIN user u2 ON u2.id = ws.manager_id"
            #sql = "SELECT * from dataset"

            if search_key is not None and search_value is not None:
                sql += "and " if "where" in sql else " where "
                if search_key == "name":
                    sql += "ds.{} like '%{}%' ".format(search_key, search_value)
                elif search_key == "user_id":
                    sql += "ds.create_user_id = {}".format(search_value)
                else:
                    sql += "ds.{} = {} ".format(search_key, search_value)

            if workspace_id or user_id:
                if workspace_id and user_id:
                    if not "where" in sql:
                        sql += " where "
                    else:
                        sql += " and "
                    sql += " workspace_id = {}".format(workspace_id)
                    #sql += " workspace_id = {} and (create_user_id = {} or access=1)".format(workspace_id, user_id)
                elif workspace_id:
                    if not "where" in sql:
                        sql += " where "
                    else:
                        sql += " and "
                    sql += " workspace_id = {}".format(workspace_id)

                #elif user_type != 0 :
                #    if not "where" in sql:
                #        sql += " where "
                #    else:
                #        sql += " and "
                #    sql += "(create_user_id = {} or access=1)".format(user_id)
            if page is not None and size is not None:
                sql += " limit {}, {}".format((page - 1) * size, size)
            cur.execute(sql)
            res = cur.fetchall()
    except Exception as e:
        traceback.print_exc()
    return res


def get_dataset_workspace_name(dataset_id_list):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "SELECT ds.name as dataset_name, ds.access as access, ws.name as workspace_name, ws.id as workspace_id FROM dataset ds INNER JOIN workspace ws " \
                  "ON ds.workspace_id = ws.id WHERE ds.id in ({})".format(dataset_id_list)
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        print(e)
        raise e
    return res

def get_workspace_dataset_name(dataset_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                SELECT ds.create_user_id, ds.name as dataset_name, ds.description, ds.access as access, 
                ws.name as workspace_name, ws.id as workspace_id, u.name as manager_name
                FROM dataset ds 
                INNER JOIN workspace ws ON ds.workspace_id = ws.id 
                INNER JOIN user u ON u.id = ws.manager_id WHERE ds.id = {} """.format(dataset_id)
            cur.execute(sql)
            res = cur.fetchone()
    except Exception as e:
        raise e
    return res


def insert_dataset(name, workspace_id , create_user_id, access, file_count, dir_count, size, description, inode_number,auto_labeling,create_datetime=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "INSERT into dataset(name, workspace_id, create_user_id, access, file_count, dir_count, size, description, inode_number, auto_labeling,create_datetime) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            cur.execute(sql, (name, workspace_id, create_user_id, access, file_count, dir_count, size, description, inode_number, auto_labeling, create_datetime))

            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        return False



def update_dataset(id, name=None, workspace_id=None, create_user_id=None, access=None, file_count=None, dir_count=None, size=None, description=None, auto_labeling=None, modify_datetime=None):
    try:
        func_arg = locals()

        dataset_id = func_arg.pop('id')
        keys = []
        values = []
        for k, v in func_arg.items():
            if v is not None and v is not '':
                keys.append(k)
                values.append(v)
        keys.append('update_datetime')
        values.append(datetime.today().strftime("%Y-%m-%d %H:%M:%S"))


        with get_db() as conn:
            cur = conn.cursor()


            sql = "UPDATE dataset set " + ", ".join([key + " = %s" for key in keys]) + " where id = %s"
            values.append(dataset_id)

            cur.execute(sql, values)

            cur.fetchone()
            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        return False

def delete_dataset(dataset_id_list):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "DELETE FROM dataset where id in ({})".format(dataset_id_list)
            cur.execute(sql)
            conn.commit()


        return True
    except Exception as e:
        print(e)
        return False

def delete_dataset_with_workspace_id(workspace_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            cur.execute("DELETE FROM dataset where workspace_id = {}".format(workspace_id))
            conn.commit()


        return True
    except Exception as e:
        print(e)
        return False

def get_dataset_dir(dataset_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "SELECT ds.*, ws.name as workspace_name, u.name as owner, u2.name as workspace_manager FROM dataset as ds INNER JOIN workspace as ws on ds.workspace_id = ws.id INNER JOIN user as u on ds.create_user_id = u.id INNER JOIN user as u2 on ws.manager_id = u2.id WHERE ds.id = %s"
            cur.execute(sql, (dataset_id,))
            res = cur.fetchone()
    except Exception as e:
        raise e
    return res

def get_node(node_id=None, node_ip=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            item_key = None
            sql = """
                SELECT n.*, (SELECT GROUP_CONCAT(ni.interface) FROM node_interface ni WHERE ni.node_id = n.id) AS interfaces 
                FROM node n 
            """
            if node_id is not None:
                sql += " WHERE n.id = %s "
                item_key = node_id
            elif node_ip is not None:
                sql += " WHERE n.ip = %s "
                item_key = node_ip

            cur.execute(sql, (item_key,))
            res = cur.fetchone()

    except:
        traceback.print_exc()
    return res

def get_node_using_ip(ip):
    row = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = "SELECT n.*, (SELECT GROUP_CONCAT(ni.interface) FROM node_interface ni WHERE ni.node_id = n.id) AS interfaces FROM node n where n.ip = %s"
            cur.execute(sql, (ip,))
            row = cur.fetchone()
    except:
        traceback.print_exc()
    return row

def get_node_list(page=None, limit=None, search_key="", search_value=""):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                    SELECT n.*, ng.gpu_config 
                    from node n 
                    LEFT JOIN (Select node_id, group_concat(concat(model,"(",memory,")")) as gpu_config from node_gpu group by node_id) as ng on ng.node_id = n.id  
                    """
            sql+= ''

            if search_key != "" and search_value != "":
                sql += "and " if "where" in sql else "where "
                if search_key == "name":
                    sql += "{} like '%{}%' ".format(search_key, search_value)
                else:
                    sql += "{} = {} ".format(search_key, search_value)

            if page is not None and limit is not None:
                sql += "limit {}, {}".format((page - 1) * limit, limit)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_node_cpu_worker_list():
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT LOWER(`name`) AS node_name
                    from node n 
                    WHERE n.is_cpu_server = 1
                    """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_node_gpu_worker_list():
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT LOWER(`name`) AS node_name
                    from node n 
                    WHERE n.is_gpu_server = 1
                    """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_node_no_use_worker_list():
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT LOWER(`name`) AS node_name
                    from node n 
                    WHERE n.no_use_server = 1
                    """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def insert_node_from_device_info(ip, device_info):
    from nodes import get_general_and_mig_gpu_count

    gpu_info = device_info['gpu_info']
    system_info = device_info['system_info']

    os = system_info.get("os")
    cpu = system_info.get("cpu")
    cpu_cores = system_info.get("cpu_cores")
    # TODO 특정 함수로 GB -> Byte or Byte -> GB 할 수 있도록
    ram = system_info.get("ram") if "GB" in str(system_info.get("ram")) else str(round(int(system_info.get("ram")) / (1024 * 1024), 2)) + " GB" 
    ram_limit = int(float(ram.replace("GB", ""))) - 1
    name = system_info.get("node_name")
    driver_version = gpu_info.get("driver_version")

    gpu_list = gpu_info["gpu_list"]
    gpu_count = len(gpu_list)
    general_gpu_count, mig_gpu_count = get_general_and_mig_gpu_count(gpu_list)

    # mig_gpu_count ?

    insert_node(ip=ip, name=name, os=os, cpu=cpu, cpu_cores=cpu_cores, ram=ram, driver_version=driver_version,
                gpu_count=gpu_count, general_gpu_count=general_gpu_count, mig_gpu_count=mig_gpu_count,
                cpu_cores_limit_per_pod=cpu_cores, cpu_cores_limit_per_gpu=cpu_cores, 
                ram_limit_per_pod=ram_limit, ram_limit_per_gpu=ram_limit
                )

def insert_node(ip, name, os, cpu, cpu_cores, ram, driver_version, gpu_count, general_gpu_count, mig_gpu_count, 
                cpu_cores_limit_per_pod=None, cpu_cores_limit_per_gpu=None, ram_limit_per_pod=None, ram_limit_per_gpu=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """insert into node(ip, name, os, cpu, cpu_cores, ram, driver_version, 
                    gpu_count, general_gpu_count, mig_gpu_count,
                    cpu_cores_limit_per_pod, cpu_cores_limit_per_gpu, ram_limit_per_pod, ram_limit_per_gpu) 
                    values (%s,%s,%s,%s,%s,%s,%s,
                    %s,%s,%s,
                    %s,%s,%s,%s)"""
            cur.execute(sql, (ip, name, os, cpu, cpu_cores, ram, driver_version, 
                            gpu_count, general_gpu_count, mig_gpu_count,
                            cpu_cores_limit_per_pod, cpu_cores_limit_per_gpu, ram_limit_per_pod, ram_limit_per_gpu))
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False

def delete_node(ip):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "delete from node where ip = %s"
            cur.execute(sql, (ip,))
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False


def update_node_auto(node_id, name, os, cpu, cpu_cores, ram, driver_version, gpu_count):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "UPDATE node set name = %s, os = %s, cpu = %s, cpu_cores = %s, ram = %s, driver_version = %s, gpu_count = %s where id = %s"
            cur.execute(sql,(name, os, cpu, cpu_cores, ram, driver_version, gpu_count, node_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_node_ip(node_id, node_ip):
    # 노드 추가 시 입력한 node_ip 와 kuber가 가지는 internal ip가 다를 경우 자동 업데이트
    # TODO internal IP col을 따로 추가하는게 나을지 고민 필요
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "UPDATE node set ip = %s where id = %s"
            cur.execute(sql,(node_ip, node_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_node_name(node_id, node_name):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "UPDATE node set name = %s where id = %s"
            cur.execute(sql,(node_name, node_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def update_node_options(node_id, options):
    # node_options = {
    #     "is_cpu_server": is_cpu_server,
    #     "is_gpu_server": is_gpu_server,
    #     "no_use_server": no_use_server,
    #     "cpu_cores_limit_per_pod": cpu_cores_limit_per_pod,
    #     "cpu_cores_lock_per_pod": cpu_cores_lock_per_pod,
    #     "cpu_cores_limit_per_gpu": cpu_cores_limit_per_gpu,
    #     "cpu_cores_lock_per_gpu": cpu_cores_lock_per_gpu,
    #     "ram_limit_per_pod": ram_limit_per_pod,
    #     "ram_lock_per_pod": ram_lock_per_pod,
    #     "ram_limit_per_gpu": ram_limit_per_gpu,
    #     "ram_lock_per_gpu": ram_lock_per_gpu,
    #     "ephemeral_storage_limit": ephemeral_storage_limit
    # }
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql_cmd = ""
            for k, v in options.items():
                if v == None:
                    v = "NULL"
                sql_cmd += "{} = {} ,".format(k, v)

            sql = """
                UPDATE node set 
                @cmd
                where id = {}
            """.format(node_id)
        
            sql = sql.replace("@cmd", sql_cmd[:-1])
            print(sql)
            cur.execute(sql)
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, str(e)


def insert_node_gpu_from_device_info(node_id, device_info):
    insert_node_gpu_from_gpu_list(node_id=node_id, gpu_list=device_info['gpu_info']["gpu_list"])

def insert_node_gpu_from_gpu_list(node_id, gpu_list):
    for gpu in gpu_list:
        if gpu.get("mem_total") == None:
            gpu["mem_total"] = gpu.get("memory")

        num = gpu.get("num")
        model = gpu.get("model")
        architecture = gpu.get("architecture")
        computer_capability = gpu.get("computer_capability")
        cuda_cores = gpu.get("cuda_cores")
        memory = gpu.get("mem_total")
        nvlink =  gpu.get("nvlink")
        mig_mode = gpu.get("mig_mode")
        insert_node_gpu(node_id=node_id, num=num, model=model, memory=memory, cuda_cores=cuda_cores, 
                        computer_capability=computer_capability, architecture=architecture, nvlink=nvlink, mig_mode=mig_mode)

        if len(gpu.get("mig_list")) > 0:
            node_gpu_info = get_node_gpu(node_id=node_id, num=num)
            insert_node_mig_gpu(node_gpu_id=node_gpu_info["id"], instance_list=gpu.get("mig_list"))

def insert_node_gpu(node_id, num, model, memory, cuda_cores, computer_capability, architecture, nvlink, mig_mode):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = "insert into node_gpu(node_id, num, model, memory, cuda_cores, computer_capability, architecture, nvlink, mig_mode) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            cur.execute(sql, (node_id, num, model, memory, cuda_cores, computer_capability, architecture, nvlink, mig_mode))
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False

def delete_node_gpu(node_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "DELETE from node_gpu where node_id = %s"
            cur.execute(sql, (node_id,))
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False

def get_node_gpu(node_id, num):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT * from node_gpu
                where node_id = {} and num = {}
            """.format(node_id, num)

            cur.execute(sql)
            res = cur.fetchone()

    except:
        traceback.print_exc()
    return res

def get_node_gpu_list(node_id=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "SELECT * from node_gpu"
            if node_id is not None:
                sql += " where node_id = {} ".format(node_id)
            cur.execute(sql)
            res = cur.fetchall()

    except:
        traceback.print_exc()
    return res

def get_node_interface(node_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "SELECT interface from node_interface where node_id = %s"
            cur.execute(sql, (node_id,))
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def delete_node_interface(node_id, interfaces):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for interface in interfaces:
                rows.append((node_id, interface))

            sql = "DELETE from node_interface where node_id = %s and interface = %s"
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, str(e)
    return

def insert_node_interface(node_id, interfaces=[]):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for interface in interfaces:
                rows.append((node_id, interface))

            sql = "INSERT into node_interface(node_id, interface) values (%s,%s)"
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, str(e)
    return

def get_node_mig_gpu(node_gpu_id):
    try:
        res = []
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT nmg.*
                FROM node_mig_gpu nmg
                WHERE nmg.node_gpu_id = {}
            """.format(node_gpu_id)
            cur.execute(sql)
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
        return res
    return res

def insert_node_mig_gpu(node_gpu_id, instance_list):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for instance in instance_list:
                rows.append((node_gpu_id, instance))

            sql = "INSERT into node_mig_gpu(node_gpu_id, instance) values (%s,%s)"
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, str(e)
    return


def insert_record_available_gpu(current_count):
    """For following the change of available gpu count."""
    try:
        latest_gpu_count = get_latest_available_gpu_count()

        if latest_gpu_count is None or latest_gpu_count != current_count:
            update_latest_total_gpu_count(current_count)
    except:
        print("INSERT RECORD AVAILABLE GPU COUNT ERROR")
        traceback.print_exc()

def get_latest_available_gpu_count():
        try:
            with get_db() as conn:
                cur = conn.cursor()
                sql = """
                    SELECT 
                        count
                    FROM
                        record_available_gpu
                    ORDER BY 
                        update_datetime desc
                    LIMIT 1"""
                cur.execute(sql)
                res = cur.fetchone()
                return (res and res["count"])
        except:
            print("GET RECORD LATEST AVAILABLE GPU COUNT ERROR")
            traceback.print_exc()
            return None

def update_latest_total_gpu_count(count):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = f"""
                    INSERT INTO 
                        record_available_gpu(count)
                    VALUES 
                        ({count})"""
            cur.execute(sql)
            conn.commit()
    except:
        print("UPDATE LATEST TOTAL GPU COUNT ERROR")
        traceback.print_exc()

def gpu_total_used():
    row = 0
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "SELECT sum(gpu_deployment_total + gpu_training_total) as total FROM workspace "
            cur.execute(sql)
            res = cur.fetchone()
            res = res['total']
    except Exception as e:
        raise e
    return res


def login(name):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "SELECT * from user where name = '{}'".format(name)
            cur.execute(sql)
            res = cur.fetchone()
    except Exception as e:
        print(e)
    return res


def update_favorites(user_id, workspace_id, action):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE user_workspace set favorites = {} where user_id = {} and workspace_id = {}".format(action, user_id, workspace_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        print(e)
        return False


def get_job_group_number(training_id):
    max_group_number = {"max": 0}
    try:
        with get_db() as conn:
        # with get_db() as conn:

            cur = conn.cursor()

            sql = "select MAX(group_number) as max from job where training_id = %s"
            cur.execute(sql, (training_id,))
            max_group_number = cur.fetchone()
            # conn.commit()
        return max_group_number
    except:
        traceback.print_exc()
    return max_group_number


def get_jobs_group_numbers(trainings_id=[]):
    res = None
    if len(trainings_id) == 0:
        return res
    try:
        with get_db() as conn:
        # with get_db() as conn:
            cur = conn.cursor()

            trainings_id_ = [str(id) for id in trainings_id]
            trainings_id_ = ','.join(trainings_id_)
            sql = "SELECT DISTINCT group_number, training_id from job "
            if trainings_id_ != '':
                sql+="where training_id in ({})".format(trainings_id_)

            cur.execute(sql)
            res = cur.fetchall()

            # conn.commit()
        return res
    except:
        traceback.print_exc()
    return res


def get_training_group_number_jobs(training_id, group_number=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "SELECT * FROM job "
            if group_number is None:
                sql +="where training_id = %s"
                rows = cur.execute(sql, (training_id,)).fetchall()
            elif group_number is not None:
                sql +="where training_id = %s and group_number = %s"
                cur.execute(sql, (training_id, group_number,))
                res = cur.fetchall()
        return res
    except Exception as e:
        print(e)
    return res

#TODO 배포 생성 눌렀을 때 - error log 찍히는 부분 있음. (학습은 있으나 job은 없음)
# SELECT j.id, j.name, j.training_id, t.name AS training_name, j.dataset_name, j.docker_image_name as image_name,
# j.parameter, j.create_datetime, j.start_datetime, j.end_datetime, j.job_group_index, j.group_number,
# j.gpu_acceleration, j.unified_memory, j.rdma, j.configurations, j.network_interface, j.gpu_count,
# u.name as runner_name, j.run_code, w.name AS workspace_name
# FROM job j
# LEFT JOIN training t ON t.id = j.training_id
# LEFT JOIN workspace w ON w.id = t.workspace_id
# LEFT JOIN image i ON j.docker_image_id=i.id
# LEFT JOIN user u ON u.id = j.creator_id
# where j.training_id in () ORDER BY id DESC

def get_job_list(search_key=None, size=None, page=None, search_value=None, training_id=None, training_id_list=None, sort=None, order_by="DESC"):
    res = None
    try:
        with get_db() as conn:
        # with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT j.id, j.name, j.training_id, t.name AS training_name, j.dataset_name, j.docker_image_name as image_name, 
                j.parameter, j.create_datetime, j.start_datetime, j.end_datetime, j.job_group_index, j.group_number, 
                j.gpu_acceleration, j.unified_memory, j.rdma, j.configurations, j.network_interface, j.gpu_count, 
                t.built_in_model_id,
                u.name as runner_name, j.run_code, w.name AS workspace_name
                FROM job j
                LEFT JOIN training t ON t.id = j.training_id
                LEFT JOIN workspace w ON w.id = t.workspace_id
                LEFT JOIN image i ON j.docker_image_id=i.id
                LEFT JOIN user u ON u.id = j.creator_id
            """
            # sql = "SELECT j.id, j.name, j.training_id, j.dataset_name, j.docker_image_name as image_name, j.parameter, j.start_datetime, j.end_datetime, "\
            #         "j.job_group_index, j.group_number, u.name as runner_name "\
            #         "FROM job j "\
            #         "LEFT JOIN image i ON j.docker_image_id=i.id "\
            #         "LEFT JOIN user u ON u.id = j.creator_id "

            if search_key is not None and search_value is not None:
                search_value = '"%{}%"'.format(search_value)
                sql += "where {} like {} ".format(search_key, search_value)

            if training_id is not None:
                if "where" not in sql:
                    sql += "where "
                else:
                    sql += "and "
                sql += "training_id = {}".format(training_id)

            if training_id_list is not None:
                training_id_list = [str(id) for id in training_id_list]
                training_id_list = ','.join(training_id_list)
                if "where" not in sql:
                    sql += "where "
                else:
                    sql += "and "
                sql += "j.training_id in ({})".format(training_id_list)

            if sort is not None:
                if sort == "start_datetime":
                    sql += " ORDER BY start_datetime {order_by}, id".format(order_by=order_by)
                elif sort == "end_datetime":
                    sql += " ORDER BY end_datetime {order_by}, id".format(order_by=order_by)
                elif sort == "id":
                    sql += " ORDER BY id {order_by}".format(order_by=order_by)
            else :
                sql += " ORDER BY create_datetime {order_by}, id".format(order_by=order_by)

            if page is not None and size is not None:
                sql += " limit {}, {}".format((page-1)*size, size)
            cur.execute(sql)
            res = cur.fetchall()

    except:
        traceback.print_exc()
    return res

# #TODO get_job_list 와 합치기
# def get_jobs_lists(trainings_id=[], order_by=None):
#     res = None
#     if len(trainings_id) == 0:
#         return res
#     try:
#         with get_db() as conn:
#         # with get_db() as conn:
#             cur = conn.cursor()
#             trainings_id_ = [str(id) for id in trainings_id]
#             trainings_id_ = ','.join(trainings_id_)
#             sql = """
#                 SELECT j.id, j.name, j.training_id, t.name AS training_name, j.dataset_name, j.docker_image_name as image_name,
#                 parameter, j.create_datetime, j.start_datetime, j.end_datetime, j.job_group_index, j.group_number,
#                 j.gpu_acceleration, j.unified_memory, j.rdma, j.configurations, j.network_interface, j.gpu_count,
#                 w.name AS workspace_name
#                 FROM job AS j
#                 LEFT JOIN training t ON t.id = j.training_id
#                 LEFT JOIN workspace w ON w.id = t.workspace_id
#             """
#             if trainings_id_ is not None and trainings_id_ != '':
#                 sql+= " where training_id in ({})".format(trainings_id_)

#             if order_by is not None:
#                 sql += " ORDER by id {} ".format(order_by)

#             cur.execute(sql)
#             res = cur.fetchall()
#     except:
#         traceback.print_exc()
#     return res


def get_job_list_from_job_id_list(job_id_list):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            job_id_list = [str(id) for id in job_id_list]
            job_id_list = ','.join(job_id_list)
            sql = "SELECT id, name, training_id, parameter, start_datetime, end_datetime, job_group_index, group_number FROM job "
            sql += "where id in ({})".format(job_id_list)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_job_list_from_training_id(training_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = "SELECT id, name, training_id, parameter, start_datetime, end_datetime, job_group_index, group_number FROM job "
            sql += "where training_id = {}".format(training_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def get_job_duplicate_name(training_id, job_name):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT COUNT(*) as count
                FROM job j
                WHERE j.training_id = {} AND j.name = "{}"
            """.format(training_id, job_name)
            cur.execute(sql)
            res = cur.fetchone()
    except Exception as e:
        traceback.print_exc()
        return None, str(e)
    return res, ""


def insert_jobs(jobs_info, creator_id, group_number):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for index, job in enumerate(jobs_info):
                job["gpu_model"] = common.gpu_model_to_dumps(job.get("gpu_model"))
                job["node_name"] = common.gpu_model_to_dumps(job.get("node_name"))
                rows.append((job["training_id"], job["job_name"], index, job["docker_image_id"], 
                            job["docker_image_name"], job["dataset_id"], job["dataset_access"], job["dataset_name"],
                            job["run_code"], job["parameter"], job["gpu_acceleration"], job["unified_memory"], 
                            job["rdma"], job["gpu_model"], job["node_name"], group_number, 
                            creator_id, job["gpu_count"]))
            sql = """
                INSERT into job(training_id, name, job_group_index, docker_image_id, 
                                docker_image_name, dataset_id, dataset_access, dataset_name, 
                                run_code, parameter, gpu_acceleration, unified_memory, 
                                rdma, gpu_model, node_name, group_number, 
                                creator_id, gpu_count)
                VALUES (%s,%s,%s,%s,
                        %s,%s,%s,%s,
                        %s,%s,%s,%s,
                        %s,%s,%s,%s,
                        %s,%s)
            """

            cur.executemany(sql, rows)
            conn.commit()

        return True
    except:
        traceback.print_exc()
    return None


def update_job_start_time(job_id, workspace_id=None, training_name=None):
    try:
        with get_db() as conn:
            
            cur = conn.cursor()

            sql = "UPDATE job set start_datetime = %s where id = %s AND end_datetime IS null"
            cur.execute(sql,(datetime.today().strftime("%Y-%m-%d %H:%M:%S"), job_id,))
            conn.commit()

        insert_unified_record(record_type="job", type_id=job_id, workspace_id=workspace_id, training_name=training_name)
        return True
    except Exception as e:
        traceback.print_exc()
        return False


def update_job_end_time(job_id, end_datetime=None, pod_status=None):
    from utils.db_record import update_record_end_time_unified
    try:
        with get_db() as conn:

            cur = conn.cursor()

            end_time = datetime.today().strftime("%Y-%m-%d %H:%M:%S") if end_datetime is None else end_datetime
            sql = "UPDATE job set start_datetime = %s, end_datetime = %s where id = %s AND (start_datetime IS null OR start_datetime > %s)"
            cur.execute(sql,(end_time, end_time, job_id, end_time))
            conn.commit()

            sql = "UPDATE job set end_datetime = %s where id = %s"
            cur.execute(sql,(end_time, job_id,))
            conn.commit()

        update_record_end_time_unified(record_type="job", record_id=job_id, end_datetime=end_time, pod_status=pod_status, unique_and_multiple_pod=True)
        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_job_configurations(job_id, configurations):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE job set configurations = '{}'  where id = {}".format(configurations, job_id)
            cur.execute(sql)
            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_job_network_interface(job_id, network_interface):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE job set network_interface = '{}'  where id = {}".format(network_interface, job_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_hyperparamsearch_configurations(hps_id, configurations):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE hyperparamsearch set configurations = '{}'  where id = {}".format(configurations, hps_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_hyperparamsearch_network_interface(hps_id, network_interface):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE hyperparamsearch set network_interface = '{}'  where id = {}".format(network_interface, hps_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_job_configurations_and_network_interface(job_id, configurations, network_interface):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE job set configurations = '{}', network_interface = '{}'  where id = {}".format(configurations, network_interface, job_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_deployment_configurations(deployment_id, configurations):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE deployment set configurations = '{}' where id = {}".format(configurations, deployment_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_deployment_worker_configurations(deployment_worker_id, configurations):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE deployment_worker set configurations = '{}' where id = {}".format(configurations, deployment_worker_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False


def update_deployment_network_interface(deployment_id, network_interface):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE deployment set network_interface = '{}'  where id = {}".format(network_interface, deployment_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_deployment_configurations_and_network_interface(deployment_id, configurations, network_interface):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE deployment set configurations = '{}', network_interface = '{}'  where id = {}".format(configurations, network_interface, deployment_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False


def delete_jobs(job_id_list = None):
    if job_id_list is None:
        job_id_list = []

    if len(job_id_list) == 0:
        return True
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = "delete from job where id in ({})".format(','.join(str(e) for e in job_id_list))
            cur.execute(sql)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False


def delete_user_training_users(training_id, users_id):
    if len(users_id) == 0:
        return True
    try:
        with get_db() as conn:

            cur = conn.cursor()
            users_id = [str(id) for id in users_id]
            users_id = ','.join(users_id)

            sql = "delete from user_training where training_id={} and user_id in ({})".format(training_id, users_id)
            cur.execute(sql)
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def get_image_workspace_id(workspace_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()

            sql = "SELECT * FROM image i "\
                "left JOIN image_workspace iw ON i.id = iw.image_id "\
                "WHERE i.access = 1 OR iw.workspace_id = {} ".format(workspace_id)

            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
        pass
    return res

def get_workspace_image_id(image_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()

            sql = "SELECT * FROM image_workspace "\
                "WHERE image_id = {} ".format(image_id)

            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
        pass
    return res

def delete_image_with_workspace_id(workspace_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            cur.execute("DELETE FROM image where workspace_id = {}".format(workspace_id))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def get_hyperparamsearch_group_list():
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                SELECT hps_g.*,
                (SELECT COUNT(*) FROM hyperparamsearch hps WHERE hps.hps_group_id = hps_g.id) AS hps_item_count,
                d.id AS dataset_id, d.name AS dataset_name, d.access AS dataset_access,
                i.id AS docker_image_id, i.name AS docker_image_name,
                t.gpu_count, t.name AS training_name, t.built_in_model_id AS built_in_model_id,
                w.id AS workspace_id,
                w.name AS workspace_name
                FROM hyperparamsearch_group hps_g
                LEFT JOIN dataset d ON d.id = hps_g.dataset_id
                LEFT JOIN image i ON i.id = hps_g.docker_image_id
                LEFT JOIN training t ON t.id = hps_g.training_id
                LEFT JOIN workspace w ON w.id = t.workspace_id
            """
            cur.execute(sql)
            res = cur.fetchall()

        return res
    except Exception as e:
        traceback.print_exc()
        return res

def get_hyperparamsearch_group(hps_group_id=None, hps_name=None, training_id=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                SELECT hps_g.*,
                (SELECT COUNT(*) FROM hyperparamsearch hps WHERE hps.hps_group_id = hps_g.id) AS hps_item_count,
                d.id AS dataset_id, d.name AS dataset_name, d.access AS dataset_access,
                i.id AS docker_image_id, i.name AS docker_image_name,
                t.gpu_count, t.name AS training_name, t.built_in_model_id AS built_in_model_id,
                w.id AS workspace_id,
                w.name AS workspace_name
                FROM hyperparamsearch_group hps_g
                LEFT JOIN dataset d ON d.id = hps_g.dataset_id
                LEFT JOIN image i ON i.id = hps_g.docker_image_id
                LEFT JOIN training t ON t.id = hps_g.training_id
                LEFT JOIN workspace w ON w.id = t.workspace_id
            """
            if hps_group_id is not None:
                sql += " WHERE hps_g.id = {}".format(hps_group_id)
            elif hps_name is not None:
                if training_id is None:
                    sql += " WHERE hps_g.name = '{}'".format(hps_name)
                else :
                    sql += " WHERE hps_g.name = '{}' and hps_g.training_id = {}".format(hps_name, training_id)
            cur.execute(sql)
            res = cur.fetchone()

        return res
    except Exception as e:
        traceback.print_exc()
        return res

def get_hyperparamsearch_group_search_last_index(hps_group_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                SELECT MAX(hps.hps_group_index) AS last_index
                FROM hyperparamsearch hps
            """
            if hps_group_id is not None:
                sql += " WHERE hps.hps_group_id = {}".format(hps_group_id)

            cur.execute(sql)
            res = cur.fetchone()

        return res
    except Exception as e:
        traceback.print_exc()
        return res

def get_hyperparamsearch_group_item_count():
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT hps_g.id, hps_g.name, (SELECT COUNT(*) FROM hyperparamsearch hps WHERE hps.hps_group_id = hps_g.id) AS hps_item_count
                FROM hyperparamsearch_group hps_g
            """
            cur.execute(sql)
            res = cur.fetchall()
        
        return res
    except Exception as e:
        traceback.print_exc()
        raise

def insert_hyperparamsearch_group(training_id, hps_name, docker_image_id, dataset_id, run_code, run_parameter, creator_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                INSERT INTO hyperparamsearch_group (training_id, name, docker_image_id, dataset_id, run_code, run_parameter, creator_id)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """
            cur.execute(sql, (training_id, hps_name, docker_image_id, dataset_id, run_code, run_parameter, creator_id,))
            conn.commit()

        return True
    except pymysql.err.IntegrityError as ie:
        raise DuplicateKeyError()
    except Exception as e:
        traceback.print_exc()
        raise

def update_hyperparamsearch_group(hps_group_id, docker_image_id, dataset_id, run_code, run_parameter):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE hyperparamsearch_group set docker_image_id = %s, dataset_id = %s, run_code = %s, run_parameter = %s where id = %s"
            cur.execute(sql,(docker_image_id, dataset_id, run_code, run_parameter, hps_group_id))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def delete_hyperparamsearch_group(hps_group_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = "delete from hyperparamsearch_group where id = {}".format(hps_group_id)
            cur.execute(sql)
            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        raise

def get_hyperparamsearch_group_items(hps_group_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                SELECT hps.*,
                hps_g.training_id
                FROM hyperparamsearch hps
                LEFT JOIN hyperparamsearch_group hps_g ON hps_g.id = hps.hps_group_id
                WHERE hps.hps_group_id = {}
            """.format(hps_group_id)
            
            cur.execute(sql)
            res = cur.fetchall()

        return res
    except Exception as e:
        traceback.print_exc()
        raise

def get_hyperparamsearch_list_from_hps_id_list(hps_id_list):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            hps_id_list = [str(id) for id in hps_id_list]
            hps_id_list = ','.join(hps_id_list)
            sql = """
                SELECT hps.id, hps_g.name, hps_g.training_id, hps.hps_group_index AS hps_group_index, hps_g.id AS group_id
                FROM hyperparamsearch hps 
                LEFT JOIN hyperparamsearch_group hps_g ON hps_g.id = hps.hps_group_id
            """
            sql += "where hps.id in ({})".format(hps_id_list)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_hyperparamsearch_list_from_training_id(training_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT hps.id, hps_g.name, hps_g.training_id, hps.hps_group_index AS hps_group_index, hps_g.id AS group_id
                FROM hyperparamsearch hps 
                LEFT JOIN hyperparamsearch_group hps_g ON hps_g.id = hps.hps_group_id
            """
            sql += " where hps_g.training_id = {}".format(training_id)
            
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def get_hyperparamsearch_queue_item_list(hps_group_id, hps_group_index):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                SELECT hps.*,
                hps_g.training_id
                FROM hyperparamsearch hps
                LEFT JOIN hyperparamsearch_group hps_g ON hps_g.id = hps.hps_group_id
                WHERE hps.hps_group_id = {} and hps.hps_group_index = {}
            """.format(hps_group_id, hps_group_index)
            
            cur.execute(sql)
            res = cur.fetchall()

        return res
    except Exception as e:
        traceback.print_exc()
        return res

def insert_hyperparamsearchs(hps_info):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            rows = []
            for index, hps in enumerate(hps_info):
                hps["gpu_model"] = common.gpu_model_to_dumps(hps["gpu_model"])
                hps["node_name"] = common.gpu_model_to_dumps(hps["node_name"])

                rows.append((hps["hps_group_id"], hps["hps_group_index"], hps["docker_image_name"], hps["dataset_access"], hps["dataset_name"],
                hps["gpu_count"], hps["gpu_model"], hps["node_name"],
                hps["search_parameter"], hps["int_parameter"], hps["method"], hps["init_points"],  hps["search_count"], hps["search_interval"], 
                hps["load_file_name"], hps["save_file_name"],
                hps["gpu_acceleration"], hps["unified_memory"], hps["rdma"], hps["executor_id"]))

            sql = """
                INSERT into hyperparamsearch(hps_group_id, hps_group_index, docker_image_name, dataset_access, dataset_name, 
                gpu_count, gpu_model, node_name,
                search_parameter, int_parameter, method, init_points, search_count, search_interval,
                load_file_name, save_file_name,
                gpu_acceleration, unified_memory, rdma, executor_id)
                values (%s,%s,%s,%s,%s,
                %s,%s,%s,
                %s,%s,%s,%s,%s,%s,
                %s,%s,
                %s,%s,%s,%s)
            """

            cur.executemany(sql, rows)
            conn.commit()

        return True
    except:
        traceback.print_exc()
    return None


def get_hyperparamsearch(hps_id=None):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                SELECT hps.*,
                hps_g.name as hps_group_name, hps_g.run_parameter, hps_g.run_code, 
                d.name as dataset_name, d.access as dataset_access,
                i.real_name as docker_image_name,
                t.gpu_count, t.id as training_id, t.name as training_name,
                w.id as workspace_id, w.name as workspace_name
                FROM hyperparamsearch hps
                LEFT JOIN hyperparamsearch_group hps_g ON hps_g.id = hps.hps_group_id
                LEFT JOIN dataset d ON d.id = hps_g.dataset_id
                LEFT JOIN image i ON i.id = hps_g.docker_image_id
                LEFT JOIN training t ON t.id = hps_g.training_id
                LEFT JOIN workspace w ON w.id = t.workspace_id
            """
            if hps_id is not None:
                sql += " WHERE hps.id = {}".format(hps_id)

            cur.execute(sql)
            res = cur.fetchone()

        return res
    except Exception as e:
        traceback.print_exc()
        return res

def delete_hyperparamsearchs(hps_id_list = []):
    # import sys
    # sys.path.insert(0, os.path.abspath('..'))
    from training_hyperparam import delete_hyperparam_save_load_files

    if len(hps_id_list) == 0:
        return True
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = "delete from hyperparamsearch where id in ({})".format(','.join(str(e) for e in hps_id_list))
            print(sql)
            cur.execute(sql)
            conn.commit()

        for group_info in get_hyperparamsearch_group_list():
            if group_info["hps_item_count"] == 0:
                delete_hyperparam_save_load_files(workspace_name=group_info["workspace_name"], training_name=group_info["training_name"], hps_name=group_info["name"])
                delete_hyperparamsearch_group(hps_group_id=group_info["id"])
        return True
    except:
        traceback.print_exc()
        return False

def get_hyperparamsearch_list(training_id=None, training_id_list=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT hps.*,
                hps_g.*,
                t.built_in_model_id, t.name AS training_name,
                u.name as creator,
                w.name AS workspace_name
                FROM hyperparamsearch hps
                LEFT JOIN hyperparamsearch_group hps_g ON hps.hps_group_id = hps_g.id
                LEFT JOIN training t ON t.id = hps_g.training_id
                LEFT JOIN user u ON u.id = hps_g.creator_id 
                LEFT JOIN workspace w ON w.id = t.workspace_id
            """
            if training_id is not None:
                sql += " WHERE hps_g.training_id = {} ".format(training_id)
            elif training_id_list is not None:
                training_id_list = [str(id) for id in training_id_list]
                training_id_list = ','.join(training_id_list)
                sql+= " WHERE hps_g.training_id in ({})".format(training_id_list)


            sql += " ORDER BY hps.hps_group_id DESC, hps.id DESC"
            cur.execute(sql)
            res = cur.fetchall()

        return res
    except Exception as e:
        traceback.print_exc()
        return res

def get_hyperparamsearch_lists(training_id_list=[]):
     res = None
     try:
         with get_db() as conn:
             cur = conn.cursor()

             sql = """
                 SELECT hps.*, hps.docker_image_name as image_name,
                 hps_g.*,
                 t.built_in_model_id, t.name AS training_name,
                 u.name as creator,
                 w.name AS workspace_name
                 FROM hyperparamsearch hps
                 LEFT JOIN hyperparamsearch_group hps_g ON hps.hps_group_id = hps_g.id
                 LEFT JOIN training t ON t.id = hps_g.training_id
                 LEFT JOIN user u ON u.id = hps_g.creator_id 
                 LEFT JOIN workspace w ON w.id = t.workspace_id
             """
             training_id_list = [str(id) for id in training_id_list]
             training_id_list = ','.join(training_id_list)
             if training_id_list is not None and training_id_list != '':
                 sql+= " where training_id in ({})".format(training_id_list)
             sql += " ORDER BY hps.hps_group_id DESC, hps.id DESC"
             cur.execute(sql)
             res = cur.fetchall()

         return res
     except Exception as e:
         traceback.print_exc()
         return res

def update_hyperparamsearch_start_time(hps_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE hyperparamsearch set start_datetime = %s, end_datetime = %s where id = %s AND end_datetime IS null"
            cur.execute(sql,(datetime.today().strftime("%Y-%m-%d %H:%M:%S"), None, hps_id,))
            conn.commit()

        insert_unified_record(record_type="hyperparamsearch", type_id=hps_id)

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_hyperparamsearch_end_time(hps_id, pod_status=None):
    from utils.db_record import update_record_end_time_unified
    try:
        with get_db() as conn:

            cur = conn.cursor()
            end_datetime = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
            sql = "UPDATE hyperparamsearch set end_datetime = %s, start_datetime = %s where id = %s AND start_datetime IS null"
            cur.execute(sql,(end_datetime, end_datetime, hps_id,))
            conn.commit()

            sql = "UPDATE hyperparamsearch set end_datetime = %s where id = %s"
            cur.execute(sql,(datetime.today().strftime("%Y-%m-%d %H:%M:%S"), hps_id,))
            conn.commit()
        
        update_record_end_time_unified(record_type="hyperparamsearch", record_id=hps_id, end_datetime=end_datetime, pod_status=pod_status, unique_and_multiple_pod=True)

        return True
    except Exception as e:
        traceback.print_exc()
        return False


def reduce_joined_result(rows, reduce_by, reduce_to, reduce_column):
    res = []
    reduced_list = []
    last = None
    for row in rows:
        if row[reduce_by]!=last:
            last = row[reduce_by]
            try:
                res[-1][reduce_to] = reduced_list
            except IndexError:
                pass

            d={}
            for col in row.keys():
                if col not in reduce_column:
                    d[col] = row[col]
            res.append(d)
            reduced_list=[]

        all_null=True
        d={}
        for col in reduce_column:
            d[col] = row[col]
            if d[col] != None:
                all_null=False
        if not all_null:
            reduced_list.append(d)
    try:
        res[-1][reduce_to] = reduced_list
    except IndexError:
        traceback.print_exc()
        return False
    return res


def get_service(deployment_id):
    try:
        res = None
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT d.id, d.name, d.built_in_creator, u.name AS creator, d.description, d.create_datetime, d.type, d.start_datetime,
                d.input_type, bm.name as built_in_model_name,
                w.name AS workspace_name
                FROM deployment d
                LEFT JOIN user u ON u.id = d.user_id
                LEFT JOIN workspace w ON w.id = d.workspace_id
                LEFT JOIN built_in_model bm ON bm.id = d.built_in_model_id
                WHERE d.id = {}
            """.format(deployment_id)

            cur.execute(sql)
            res = cur.fetchone()

    except Exception as e:
        traceback.print_exc()
        pass
    return res

# 템플릿 적용
def get_service_list(workspace_id=None, training_id=None):
    try:
        res = None
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT d.id, d.name, d.built_in_creator, u.name AS creator, d.description, d.create_datetime, 
                json_value(dt.template,'$.kind.deployment_type') as type, d.start_datetime,
                d.input_type, bm.name as built_in_model_name, w.id as workspace_id,
                w.start_datetime AS workspace_start_datetime, w.end_datetime AS workspace_end_datetime
                FROM deployment d
                LEFT JOIN user u ON u.id = d.user_id
                LEFT JOIN workspace w ON d.workspace_id = w.id
                LEFT JOIN deployment_template dt ON dt.id = d.template_id
                LEFT JOIN built_in_model bm ON bm.id = json_value(dt.template,'$.built_in_model_id')
            """
            if workspace_id is not None:
                sql += """ where d.workspace_id = {} """.format(workspace_id)
            
                if training_id is not None:
                    sql += """ AND JSON_VALUE(dt.template, '$.training_id') = {} """.format(training_id)


            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
        pass
    return res


def get_training_exist(training_id):
    try:
        res = None
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT *
                FROM training
                WHERE id = {}
                """.format(training_id)
            cur.execute(sql)
            res = cur.fetchone()

    except Exception as e:
        traceback.print_exc()
        pass
    return res

def get_job_exist(job_id):
    try:
        if job_id is None:
            return None
        res = None
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT *
                FROM job
                WHERE id = {}
                """.format(job_id)
            cur.execute(sql)
            res = cur.fetchone()

    except Exception as e:
        traceback.print_exc()
        pass
    return res



def get_training_exist(training_id):
    try:
        if training_id is None:
            return None
        res = None
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT *
                FROM training
                WHERE id = {}
                """.format(training_id)
            cur.execute(sql)
            res = cur.fetchone()

    except Exception as e:
        traceback.print_exc()
        pass
    return res

# 템플릿 적용
# TODO 템플릿 분기처리 수정 예정 => Lyla 22/12/29
def get_deployment(deployment_id=None, deployment_name=None):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT d.*, 
                w.name as workspace_name,
                (SELECT u.name FROM user u WHERE u.id = w.manager_id) AS manager_name,
                bm.name as built_in_model_name,
                bm.id as built_in_model_id, bm.description as built_in_model_description,
                u.name as owner_name,
                dt.template as deployment_template_info,
                dt.item_deleted
                FROM deployment d
                LEFT JOIN user u ON u.id = d.user_id
                LEFT JOIN workspace w ON w.id = d.workspace_id
                LEFT JOIN deployment_template dt ON dt.id=d.template_id
                LEFT JOIN built_in_model bm ON bm.id = json_value(dt.template,'$.built_in_model_id')
            """
            if deployment_id is not None:
                sql += " WHERE d.id = {}".format(deployment_id)
            elif deployment_name is not None:
                sql += " WHERE d.name = '{}'".format(deployment_name)
            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res, key_list=["gpu_model", "libs_digest", "deployment_template_info", "node_name", "item_deleted"])
    except Exception as e:
        traceback.print_exc()
        pass
    return res

# 템플릿 적용
def get_deployment_list(workspace_id=None, training_id=None, sort=None):
    try:
        res = None
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT d.*, u.name AS creator, 
                i.name AS docker_image_name,
                u.name AS user_name,
                w.name AS workspace_name, 
                w.start_datetime AS workspace_start_datetime, w.end_datetime AS workspace_end_datetime,
                dt.template as deployment_template_info, 
                dt.name as deployment_template_name, 
                dt.description as deployment_template_description,
                dt.item_deleted,
                dtg.name as deployment_template_group_name, 
                dtg.description as deployment_template_group_description 
                FROM deployment d
                LEFT JOIN user u ON u.id = d.user_id
                LEFT JOIN workspace w ON d.workspace_id = w.id
                LEFT JOIN image i on d.docker_image_id = i.id
                LEFT JOIN deployment_template dt ON d.template_id = dt.id
                LEFT JOIN deployment_template_group dtg ON dt.template_group_id = dtg.id
            """
            if workspace_id is not None:
                sql += """ where d.workspace_id = {} """.format(workspace_id)
                if training_id is not None:
                    sql += """ AND JSON_VALUE(dt.template, '$.training_id') = {} """.format(training_id)
            if sort is not None:
                if sort == "created_datetime":
                    sql += " ORDER BY d.create_datetime desc"
                if sort == "last_run_datetime":
                    sql += " ORDER BY d.start_datetime desc "


            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res, key_list=["deployment_template_info", "gpu_model", "item_deleted"])
    except Exception as e:
        traceback.print_exc()
        pass
    return res

def get_deployments_from_deployment_id_list(deployment_id_list):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()

            deployment_id = [str(id) for id in deployment_id_list]
            deployment_id = ','.join(deployment_id)
            sql = "SELECT * FROM deployment "
            sql += "where id in ({})".format(deployment_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

# TODO 삭제
def get_deployment_with_info(deployment_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if get_deployment(deployment_id=deployment_id).get("type") =="custom":
                sql = """
                SELECT d.name as deployment_name, d.id as deployment_id,
                    d.gpu_count, d.gpu_model, d.run_code, d.checkpoint, d.checkpoint_id, d.operating_type,
                    w.name as workspace_name, w.id as workspace_id, t.name as training_name,
                    u.name as owner_name, i.real_name as image,
                    c.checkpoint_dir_path, cw.name as checkpoint_workspace_name
                    from deployment d
                    LEFT JOIN training t on d.training_id = t.id
                    JOIN workspace w on d.workspace_id = w.id
                    JOIN user u ON d.user_id = u.id
                    LEFT JOIN image i on i.id = d.docker_image_id
                    LEFT JOIN checkpoint c ON c.id = d.checkpoint_id
                    LEFT JOIN workspace cw ON cw.id = c.workspace_id
                    WHERE d.id = {}
                """.format(deployment_id)
            else:
                sql = """
                    SELECT d.name as deployment_name, d.id as deployment_id,
                    d.built_in_model_id,
                    d.gpu_count, d.gpu_model, d.checkpoint, d.checkpoint_id, d.operating_type,
                    w.name as workspace_name, w.id as workspace_id, t.name as training_name,
                    u.name as owner_name, i.real_name as image,
                    bm.path as built_in_model_path, bm.deployment_py_command, bm.checkpoint_load_dir_path_parser, bm.checkpoint_load_file_path_parser,
                    bm.deployment_num_of_gpu_parser,
                    c.checkpoint_dir_path, cw.name as checkpoint_workspace_name
                    from deployment d
                    LEFT JOIN training t on d.training_id = t.id
                    JOIN workspace w on d.workspace_id = w.id
                    JOIN user u ON d.user_id = u.id
                    LEFT JOIN image i on i.id = d.docker_image_id
                    LEFT JOIN built_in_model bm ON bm.id = d.built_in_model_id
                    LEFT JOIN checkpoint c ON c.id = d.checkpoint_id
                    LEFT JOIN workspace cw ON cw.id = c.workspace_id
                    WHERE d.id = {}
                """.format(deployment_id)
            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
    except:
        traceback.print_exc()
    return res

def get_deployment_data_form(deployment_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT *
                FROM deployment_data_form
                WHERE deployment_id = {}
            """.format(deployment_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

# 템플릿 적용
def insert_deployment(workspace_id, deployment_name, description, operating_type,
                    gpu_count, gpu_model, node_name, node_mode,
                    input_type, access, owner_id, docker_image_id, deployment_template_id, api_path=None):
    try:
        gpu_model = common.gpu_model_to_dumps(gpu_model)
        node_name = common.gpu_model_to_dumps(node_name)
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                INSERT INTO deployment
                (workspace_id, name, description, operating_type, 
                gpu_count, gpu_model, node_name, node_mode,
                input_type, access, user_id, docker_image_id, template_id, api_path)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """
            cur.execute(sql,(workspace_id, deployment_name, description, operating_type, 
                        gpu_count, gpu_model, node_name, node_mode,
                        input_type, access, owner_id, docker_image_id, deployment_template_id, api_path))
            lastrowid = cur.lastrowid
            conn.commit()

        # return True, ""
        return {
            'result':True,
            'message':'',
            'id': lastrowid
        }
    except Exception as e:
        traceback.print_exc()
        # return False, e
        return {
            'result':False,
            'message':e
        }



def update_deployment_start_time_init(deployment_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE deployment SET start_datetime = null, end_datetime = null, executor_id = null, configurations = null
                WHERE id = %s
            """
            cur.execute(sql,(deployment_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_deployment_start_time(deployment_id, executor_id=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE deployment set start_datetime = %s, end_datetime = %s, executor_id = %s where id = %s AND end_datetime IS null "
            cur.execute(sql,(datetime.today().strftime("%Y-%m-%d %H:%M:%S"), None, executor_id, deployment_id,))
            conn.commit()


        return True
    except Exception as e:
        traceback.print_exc()
        return False


def update_deployment_end_time(deployment_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()
            end_datetime = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
            sql = "UPDATE deployment set end_datetime = %s, start_datetime = %s where id = %s AND start_datetime IS null"
            cur.execute(sql,(end_datetime, end_datetime, deployment_id,))
            conn.commit()

            sql = "UPDATE deployment set end_datetime = %s where id = %s"
            cur.execute(sql,(datetime.today().strftime("%Y-%m-%d %H:%M:%S"), deployment_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

# 템플릿 적용
def update_deployment(deployment_id, description, operating_type, 
                    gpu_count, gpu_model, node_mode, node_name,
                    input_type, access, owner_id, docker_image_id, deployment_template_id):
    try:
        gpu_model = common.gpu_model_to_dumps(gpu_model)
        node_name = common.gpu_model_to_dumps(node_name)
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                UPDATE deployment
                set description = %s,
                operating_type = %s, 
                gpu_count = %s, gpu_model = %s, node_mode = %s, node_name = %s,
                input_type = %s, access = %s, user_id = %s, docker_image_id = %s, template_id = %s
                where id = %s
            """
            cur.execute(sql, (description,
                            operating_type, 
                            gpu_count, gpu_model, node_mode, node_name,
                            input_type, access, owner_id, docker_image_id, deployment_template_id, deployment_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_deployment_input_type(deployment_id, input_type):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                UPDATE deployment
                set input_type = %s
                where id = %s
            """
            cur.execute(sql, (input_type, deployment_id,))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def delete_deployments(deployment_ids = []):
    if len(deployment_ids) == 0:
        return True
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = "delete from deployment where id in ({})".format(','.join(str(e) for e in deployment_ids))
            cur.execute(sql)
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False

def delete_deployment_data_form(deployment_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                delete
                from deployment_data_form
                where deployment_id = {}
            """.format(deployment_id)
            cur.execute(sql)
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e



def insert_user_deployment_s(deployments_id, users_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()
            rows = []
            for i in range(len(deployments_id)):
                    rows.append((deployments_id[i],users_id[i]))
            sql = "INSERT IGNORE into user_deployment(deployment_id, user_id) values (%s,%s)"
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def insert_deployment_data_form(deployment_id, location, method, api_key, value_type, category, category_description):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                INSERT into deployment_data_form (deployment_id, location, method, api_key, value_type, category, category_description)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """
            cur.execute(sql, (deployment_id, location, method, api_key, value_type, category, category_description,))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_user_deployment_s(deployments_id, users_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            rows = []
            for i in range(len(deployments_id)):
                rows.append((deployments_id[i],users_id[i]))
            sql = "DELETE from user_deployment where deployment_id = %s and user_id = %s"
            cur.executemany(sql, rows)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def get_deployment_users(deployment_id=None, include_owner=True):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT DISTINCT u.id, u.name AS user_name, d.id as deployment_id
                FROM deployment d
                INNER JOIN user_deployment ud ON ud.deployment_id = d.id
                LEFT JOIN user_workspace uw ON d.workspace_id = uw.workspace_id and d.access= 1
                left JOIN user u ON u.id = uw.user_id OR u.id = ud.user_id 
            """

            if deployment_id is not None:
                sql += " WHERE d.id = {} ".format(deployment_id)
                if include_owner == False:
                    sql += "  AND ((u.id != ud.user_id) OR (ut.user_id != d.user_id))"

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_image(image_id):
    try:
        res = None
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
                SELECT *
                FROM image
                WHERE id = {}
            """.format(image_id)

            cur.execute(sql)
            res = cur.fetchone()

    except Exception as e:
        traceback.print_exc()
        pass
    return res

def get_built_in_model_list(model_ids=None, model_name=None, created_by=None):
    """get built in model list from id list string

    Args:
        model_ids (str, optional): model id string joined by ",". ex) 2013, 2094. Defaults to None.
        model_name (str, optional): built in model name. Defaults to None.
        created_by (str, optional): created by. Defaults to None.

    Returns:
        list: built in model info dic list.
    """    
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT bm.*, image.id as docker_image_id
                    FROM built_in_model bm
                    LEFT JOIN image ON image.name = bm.run_docker_name
                """

            if model_ids is not None:
                # sql+= " WHERE bm.id = {}".format(model_id)
                # sql+= ' WHERE bm.id in ({})'.format(','.join(str(e) for e in model_ids))
                sql+= ' WHERE bm.id in ({})'.format(model_ids)
            elif model_name is not None:
                sql+= " WHERE bm.name = '{}'".format(model_name)

            if created_by is not None:
                sql+= " AND bm.created_by = '{}' ".format(created_by) if "WHERE" in sql else " WHERE bm.created_by = '{}' ".format(created_by)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

#TODO 단일, list 조회 분할 필요
def get_built_in_model(model_id=None, model_name=None, created_by=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT bm.*, image.id as docker_image_id
                    FROM built_in_model bm
                    LEFT JOIN image ON image.name = bm.run_docker_name
                """

            if model_id is not None:
                sql+= " WHERE bm.id = {}".format(model_id)
            elif model_name is not None:
                sql+= " WHERE bm.name = '{}'".format(model_name)
            else:
                return res

            if created_by is not None:
                sql+= " AND bm.created_by = '{}' ".format(created_by) if "WHERE" in sql else " WHERE bm.created_by = '{}' ".format(created_by)

            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_built_in_model_data_training_form(model_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT *
                    FROM built_in_model_data_training_form bmtf
                """

            if model_id is not None:
                sql+= " WHERE bmtf.built_in_model_id = {}".format(model_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_built_in_model_data_deployment_form(model_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT *
                    FROM built_in_model_data_deployment_form bmdf
                """

            if model_id is not None:
                sql+= " WHERE bmdf.built_in_model_id = {}".format(model_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_built_in_model_kind_and_created_by():
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT DISTINCT bm.kind, bm.created_by
                    FROM built_in_model bm
                """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_built_in_model_kind():
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT DISTINCT kind
                    FROM built_in_model
                """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_built_in_model_parameter(model_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT DISTINCT bmp.parameter, bmp.parameter_description, bmp.default_value
                    FROM built_in_model_parameter bmp
                    WHERE bmp.built_in_model_id = {}
                """.format(model_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

## CREATE and UPDATE (EDIT) LIST
def get_workspace_name_and_id_list():
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT w.id, w.name
                FROM workspace w
            """

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_workspace_name_and_id_list_activate_first(datetime=datetime.today().strftime("%Y-%m-%d %H:%M")):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT w.id, w.name,
                    CASE 
                        WHEN w.end_datetime>='{}' 
                            THEN 1
                        ELSE 0
                    END AS activate
                FROM workspace w
                ORDER BY activate DESC, id
            """.format(datetime)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def get_workspace_name_and_id_list_record_count():
    """
        Description : get a list of workspace name and id ordered by record count

        Returns :
            list: 
    """    
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT w.id, w.name
                FROM workspace w
                LEFT JOIN 
                    (
                        SELECT workspace_id AS id, COUNT(workspace_id) AS record_count 
                        FROM record_unified 
                        GROUP BY workspace_id
                    ) AS ru
                ON ru.id=w.id
                ORDER BY record_count DESC
            """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_workspace_name_and_id_list_latest_log():
    """
        Description : get a list of workspace name and id ordered by latest log_create_datetime

        Returns :
            list: 
    """    
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT w.id, w.name
                FROM workspace w
                LEFT JOIN 
                    (
                        SELECT workspace_id AS id, MAX(log_create_datetime) AS latest 
                        FROM record_unified 
                        GROUP BY workspace_id
                    ) AS ru
                ON ru.id=w.id
                ORDER BY latest DESC
            """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_training_name_and_id_list(workspace_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT rjb.training_id as id, rjb.training_name as name FROM record_job as rjb
                WHERE workspace_id={0} AND rjb.training_id_if_exists is not NULL
                UNION
                SELECT rjp.training_id as id, rjp.training_name as name FROM record_training_tool as rjp
                WHERE workspace_id={0} AND rjp.training_id_if_exists is not NULL
                UNION
                SELECT rdp.training_id as id, rdp.training_name as name FROM record_deployment as rdp
                WHERE workspace_id={0} AND rdp.training_id_if_exists is not NULL
            """.format(workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

#TODO record 용이라는거 구분 필요
def get_training_name_and_id_list_new(workspace_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT UNIQUE json_value(rjb.type_detail,'$.training_id')as id, json_value(rjb.type_detail,'$.training_name') as name FROM record_unified as rjb
                WHERE workspace_id={0} AND json_value(rjb.subtype_detail,'$.training_id_if_exists') != "null" AND (rjb.subtype = "job" OR rjb.subtype="tool" OR rjb.subtype="deployment")
            """.format(workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_workspace_user_name_and_id_list(workspace_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT u.id, u.name
                from user_workspace uw
                inner join user u on uw.user_id = u.id
                where workspace_id = {}
            """.format(workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

# 배포 생성 화면에서 사용
def get_workspace_training_name_and_id_list(workspace_id, user_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT DISTINCT t.id, t.name, t.type, t.docker_image_id,
                bm.name as built_in_model_name,
                bm.enable_to_deploy_with_gpu, bm.enable_to_deploy_with_cpu, bm.deployment_multi_gpu_mode, bm.deployment_status
                FROM training t
                RIGHT JOIN user_workspace uw ON uw.workspace_id = t.workspace_id
                RIGHT JOIN user_training ut ON ut.training_id = t.id
                LEFT JOIN built_in_model bm ON bm.id = t.built_in_model_id
            """
            if user_id == 1:
                # root
                sql += """
                WHERE t.workspace_id = {}
                """.format(workspace_id)
            else:
                sql += """
                WHERE ((uw.user_id = {0} AND (t.access = 1 OR (t.access=0 AND ut.user_id = {0})))) AND t.workspace_id = {1}
                """.format(user_id, workspace_id)
            sql += " ORDER BY id DESC"
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

# 배포 생성 화면에서 사용
def get_workspace_built_in_training_list(workspace_id, user_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT DISTINCT t.id, t.name, t.type, t.docker_image_id, t.description, t.user_id, t.built_in_model_id,
                bm.name as built_in_model_name, bm.path, bm.kind as built_in_model_kind, 
                bm.enable_to_deploy_with_gpu, bm.enable_to_deploy_with_cpu, bm.deployment_multi_gpu_mode, bm.deployment_status, 
                bm.thumbnail_path, IF(tb.user_id IS NOT NULL, 1, 0) AS bookmark,
                u.name as user_name,
                j.header_user_start_datetime
                FROM training t
                RIGHT JOIN user_workspace uw ON uw.workspace_id = t.workspace_id
                RIGHT JOIN user_training ut ON ut.training_id = t.id
                LEFT JOIN user u ON u.id = t.user_id
                LEFT JOIN built_in_model bm ON bm.id = t.built_in_model_id
                LEFT JOIN (
                    SELECT MAX(start_datetime) AS header_user_start_datetime, training_id
                    FROM job
                    WHERE creator_id = {0}
                    GROUP BY training_id
                ) AS j ON j.training_id=t.id
                LEFT JOIN training_bookmark tb ON tb.training_id=t.id AND tb.user_id = {0}
            """.format(user_id)
            if user_id!=1:
                sql+= """
                    WHERE ((uw.user_id = {0} AND (t.access = 1 OR (t.access=0 AND ut.user_id = {0})))) 
                    AND t.workspace_id = {1} AND t.type IN ('built-in', 'built-in-ji')
                    ORDER BY id DESC
                """.format(user_id, workspace_id)
            else:
                sql+="""
                    WHERE t.workspace_id = {} AND t.type IN ('built-in', 'built-in-ji')
                    ORDER BY id DESC
                """.format(workspace_id)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

# 배포 생성 화면에서 사용
def get_workspace_custom_training_list(workspace_id, user_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql="""
                SELECT DISTINCT t.id, t.name, t.description, t.type, t.user_id, tt.header_user_start_datetime,
                IF(tb.user_id IS NOT NULL, 1, 0) as bookmark, u.name as user_name
                FROM training t
                RIGHT JOIN user_workspace uw ON uw.workspace_id = t.workspace_id
                RIGHT JOIN user_training ut ON ut.training_id = t.id
                LEFT JOIN (
                    SELECT MAX(start_datetime) AS header_user_start_datetime, training_id
                    FROM training_tool tt
                    WHERE executor_id={0}
                    GROUP BY training_id
                ) AS tt ON tt.training_id=t.id
                LEFT JOIN training_bookmark tb ON tb.training_id=t.id AND tb.user_id = {0}
                LEFT JOIN user u on u.id = t.user_id
            """.format(user_id, workspace_id)
            if user_id!=1:
                sql+="""
                    WHERE ((uw.user_id = {0} AND (t.access = 1 OR (t.access=0 AND ut.user_id = {0})))) 
                    AND t.workspace_id = {1} AND t.type != 'built-in'
                    ORDER BY id DESC 
                """.format(user_id, workspace_id)
            else:
                sql+="""
                    WHERE t.workspace_id = {} AND t.type != 'built-in'
                    ORDER BY id DESC 
                """.format(workspace_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res
def get_built_in_model_name_and_id_list(created_by=None):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            #TODO model => name으로 바꿔야함
            sql = """
                SELECT bm.id, bm.name as model, bm.run_docker_name
                FROM built_in_model bm
            """
            if created_by is not None:
                sql += " WHERE bm.created_by = '{}'".format(created_by)

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

# def insert_built_in_model():
#     with get_db() as conn:
#         init_built_in_model(conn)
    
def delete_built_in_model(built_in_model_ids):
    """built_in_model 삭제 함수

    Args:
        built_in_model_ids (str): built in model id list str. ex) "2021, 2015"

    Returns:
        status (bool): success-True / fail-False
    """    
    # if len(built_in_model_ids) == 0:
    #     return True
    try:
        with get_db() as conn:
            cur = conn.cursor()

            # sql = "delete from built_in_model where id in ({})".format(','.join(str(e) for e in built_in_model_ids))
            sql = "delete from built_in_model where id in ({})".format(built_in_model_ids)
            cur.execute(sql)
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False

def update_built_in_model_status(built_in_model_id, status_type, status, update_datetime):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                UPDATE built_in_model
                SET {status_type}_status = {status}, update_datetime = "{update_datetime}"
                WHERE id = {built_in_model_id}
            """.format(status_type=status_type, status=status, update_datetime=update_datetime, built_in_model_id=built_in_model_id)
            cur.execute(sql)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False

def update_built_in_model_update_time(built_in_model_id, update_datetime):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE built_in_model 
                SET update_datetime = "{update_datetime}" 
                WHERE id = {built_in_model_id}
            """.format(built_in_model_id=built_in_model_id, update_datetime=update_datetime)
            cur.execute(sql)
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False

def update_built_in_model_create_time(built_in_model_id, create_datetime):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE built_in_model 
                SET create_datetime = "{create_datetime}" 
                WHERE id = {built_in_model_id}
            """.format(built_in_model_id=built_in_model_id, create_datetime=create_datetime)
            cur.execute(sql)
            conn.commit()

        return True
    except:
        traceback.print_exc()
        return False

def update_built_in_model_docker_image_id(built_in_model_id, docker_image_id):
    """
        Description : Built in model의 Docker image 변경 시 관련 아이템들의 도커 이미지도 같이 교체

        Args : 
            built_in_model_id (int) : 변경 된 built_in_model_id
            docker_image_id (int) : 변경 후 docker image id

        Returns :
            (bool) : True | False (성공 | 실패)
            (str) : 실패 시 에러 메세지. 성공 시 ('')
    """
    try:
        with get_db() as conn:
            cur = conn.cursor()

            # Training Item Update
            sql = """
                UPDATE training t
                SET t.docker_image_id = {}
                WHERE t.built_in_model_id = {}
            """.format(docker_image_id, built_in_model_id)
            cur.execute(sql)

            # Training Tool Item Update
            sql = """
                UPDATE training_tool tt
                LEFT JOIN training t ON tt.training_id = t.id
                SET tt.docker_image_id = {}
                WHERE t.built_in_model_id = {}
            """.format(docker_image_id, built_in_model_id)
            cur.execute(sql)

            # Deployment Item Update
            sql = """
                UPDATE deployment d
                SET d.docker_image_id = {}
                WHERE d.built_in_model_id = {}
            """.format(docker_image_id, built_in_model_id)
        
            #TODO Queue Item Update

            cur.execute(sql)
            conn.commit()

    except Exception as e:
        traceback.print_exc()
        return False, e
    return True, ""

def get_docker_image(docker_image_id=None, docker_image_name=None):
    try:
        res=None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT *
                FROM image i
            """
            if docker_image_id is not None:
                sql+=" WHERE i.id = {}".format(docker_image_id)
            elif docker_image_name is not None:
                sql+=" WHERE i.name = '{}'".format(docker_image_name)
            cur.execute(sql)
            res = cur.fetchone()

    except Exception as e:
        traceback.print_exc()
    return res


def get_docker_image_name_and_id_list(workspace_id=None):
    try:
        res = None
        if workspace_id==None:
            with get_db() as conn:

                cur = conn.cursor()
                sql = """
                    SELECT i.id, i.name FROM image i
                """
                cur.execute(sql)
                res = cur.fetchall()

        else:
            with get_db() as conn:

                cur = conn.cursor()

                # sql = 'SELECT * FROM image WHERE workspace_id={}'.format(workspace_id)
                sql = """
                    SELECT i.id, i.name FROM image i
                    LEFT JOIN image_workspace iw ON i.id = iw.image_id
                    WHERE i.access = 1 OR iw.workspace_id = {} AND i.status = 2
                """.format(workspace_id)

                cur.execute(sql)
                res = cur.fetchall()

    except Exception as e:
        pass
    return res

# User session

def get_login_session(token=None, user_id=None, session_id=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if token is not None:
                sql = """
                    SELECT *
                    FROM login_session ls
                    WHERE ls.token = '{}'
                """.format(token)
            elif user_id is not None:
                sql = """
                    SELECT *
                    FROM login_session ls
                    WHERE ls.user_id = '{}'
                """.format(user_id)
            elif session_id is not None:
                sql = """
                    SELECT *
                    FROM login_session ls
                    WHERE ls.id = '{}'
                """.format(session_id)

            cur.execute(sql)
            res = cur.fetchone()
            return res, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def insert_login_session(user_id, token):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                INSERT INTO login_session (user_id, token) values (%s,%s)
            """
            cur.execute(sql,(user_id, token))
            conn.commit()
            return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_login_session_last_call_datetime(token, datetime=datetime.today().strftime("%Y-%m-%d %H:%M:%S")):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                UPDATE login_session
                SET last_call_datetime = "{}"
                WHERE token = "{}"
            """.format(datetime, token)
            cur.execute(sql)
            conn.commit()
            return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_login_session_user_id_last_call_datetime(user_id, datetime=datetime.today().strftime("%Y-%m-%d %H:%M:%S")):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                UPDATE login_session
                SET last_call_datetime = "{}"
                WHERE user_id = {}
            """.format(datetime, user_id)
            cur.execute(sql)
            conn.commit()
            return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def update_login_session_token(old_token, new_token):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                UPDATE login_session
                SET token = "{}", last_call_datetime = "{}"
                WHERE token = "{}"
            """.format(new_token, datetime.today().strftime("%Y-%m-%d %H:%M:%S"), old_token)
            num_of_item = cur.execute(sql)
            if num_of_item == 0:
                print("Already Updated")
                return False, "Already Updated"
            conn.commit()
            return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_login_session(token=None, user_id=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if token is not None and user_id is not None:
                sql = """
                    DELETE
                    FROM login_session
                    WHERE token = "{}" and user_id = "{}"
                """.format(token, user_id)
            elif token is not None:
                sql = """
                    DELETE
                    FROM login_session
                    WHERE token = "{}"
                """.format(token)
            elif user_id is not None:
                sql = """
                    DELETE
                    FROM login_session
                    WHERE user_id = "{}"
                """.format(user_id)
            cur.execute(sql)
            conn.commit()
            return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_expired_login_sessions(session_interval = settings.TOKEN_EXPIRED_TIME):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = '''
            DELETE FROM login_session
            WHERE login_session.last_call_datetime < DATE_SUB(NOW(), INTERVAL ''' + str(session_interval)  + " SECOND);"
            cur.execute(sql)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False


# LAST_BACKUP_TIME = time.time()
def backup_db():
    # global LAST_BACKUP_TIME
    # if t - LAST_BACKUP_TIME > 60 * 60 * 24:
    #     LAST_BACKUP_TIME = t
    BACKUPPATH = '/backup'
    DATETIME = time.strftime('%Y%m%d-%H%M%S')
    cmd = "mysqldump -u{DB_USER} -p{DB_USER_PASSWORD} {DB_NAME} > {BACKUPPATH}/{DB_NAME}_{DATETIME}.sql".format(
        DB_USER=settings.JF_DB_USER, DB_USER_PASSWORD=settings.JF_DB_PW, DB_NAME=settings.JF_DB_NAME, BACKUPPATH=BACKUPPATH, DATETIME=DATETIME
        )
    dumpcmd = 'docker exec -i {DOCKER_NAME} /bin/sh -c "{CMD}"'.format(DOCKER_NAME=settings.JF_DB_DOCKER, CMD=cmd)
    result = common.launch_on_host(dumpcmd, ignore_stderr=True)
    print("BACKUP DB", result)

def get_records_for_dashboard(workspace_id=None):
    """
    기록 페이지의 워크스페이스 테이블과 유사한 검색 필터 기능이 요구되면 이 함수 삭제하고 get_records_workspaces_info 로
    """
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    h.datetime as time_stamp,
                    h.task,
                    h.action,
                    h.task_name,
                    h.update_details,
                    h.user,
                    w.name as workspace
                FROM
                    history h
                INNER JOIN
                    workspace w ON w.id = h.workspace_id
            """
            if not workspace_id is None:
                sql += "WHERE h.workspace_id = {} ".format(workspace_id)
            sql += "ORDER BY datetime DESC LIMIT 10"
            cur.execute(sql)
            res = cur.fetchall()
    except Exception as e:
        traceback.print_exc()
    return res

def insert_record_workspace(record=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            placeholders = ', '.join(['%s'] * len(record))
            columns = ', '.join(record.keys())
            sql = "INSERT INTO record_workspace ( %s ) VALUES ( %s )" % (columns, placeholders)
            cur.execute(sql, list(record.values()))
            conn.commit()
        return True, ""
    except Exception as e:
        print(e)
        traceback.print_exc()
        return False, e


# TODO 삭제 예정 db_checkpoint로 옮김 (2022-10-26 Yeobie)
# def get_checkpoint(checkpoint_id):
#     try:
#         res = None
#         with get_db() as conn:

#             cur = conn.cursor()
#             sql = """
#                     SELECT * FROM checkpoint WHERE id = {}
#             """.format(checkpoint_id)
#             cur.execute(sql)
#             res = cur.fetchone()
#     except Exception as e:
#         traceback.print_exc()
#         pass
#     return res

def get_trainings():
    res = ""
    with get_db() as conn:
        cur = conn.cursor()
        sql = '''
            SELECT training.name as training_name, user.id, user.name, training.gpu_count as gpu, training.gpu_model, node_mode, node_name, type,  training.create_datetime,training.last_run_datetime
            FROM training
            LEFT JOIN training_tool
            ON training.id=training_tool.training_id
            LEFT JOIN user
            ON training.user_id=user.id
            GROUP BY training.id;
            '''
        cur.execute(sql)
        res = cur.fetchall()
    return res

def get_deployments():
    res = ""
    with get_db() as conn:
        cur = conn.cursor()
        sql = '''
            SELECT deployment.name as deployment_name, user.id, user.name, deployment.checkpoint as ckpt, deployment.gpu_count as gpu,  deployment.configurations, deployment.start_datetime, deployment.end_datetime
            FROM deployment
            LEFT JOIN user
            ON deployment.user_id=user.id
            LEFT JOIN deployment_data_form
            ON deployment.id=deployment_data_form.deployment_id
            GROUP BY deployment.id;
            '''
        cur.execute(sql)
        res = cur.fetchall()
    return res

def set_mariadb_setting():
    # 기본 b-tree로 되어 있는 index에 hash를 추가함
    res = ""
    with get_db() as conn:
        cur = conn.cursor()
        sql = '''set global innodb_adaptive_hash_index = 1;
        '''
        cur.execute(sql)
        res = cur.fetchall()
    return res
'''
def create_settings_table():
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """CREATE TABLE IF NOT EXISTS settings
                (
                    opt_name varchar(255) NOT NULL UNIQUE,
                    opt_value varchar(255)
                );
                """

            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res
'''

def get_dataset_access_by_dataset_name(workspace_id, dataset_name):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT access 
                FROM dataset 
                WHERE name="{}" AND workspace_id={}
            """.format(dataset_name, workspace_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res


def create_trigger_for_dataset_create_user_id():
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
    CREATE TRIGGER IF NOT EXISTS dataset_owner_trg
    AFTER DELETE ON user
    FOR EACH ROW
    BEGIN
    UPDATE dataset as d SET create_user_id=(SELECT manager_id FROM workspace as w WHERE w.id=d.workspace_id)
    WHERE create_user_id=OLD.id;
    END;
                """
            cur.execute(sql)
            res = cur.fetchall()
            print(res)
    except Exception as e:
        traceback.print_exc()
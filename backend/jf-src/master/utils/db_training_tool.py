from utils.db_base import *
import utils.common  as common
from datetime import date, datetime, timedelta
import json

def get_training_tool_list(training_id=None, tool_type=None, training_id_list=None):
    """
    Description : 
        Training Tool 조회용

    Args :
        training_id (int) : 특정 training id 1개에 대한 조회
        tool_type (int) :  TOOL_EDITOR_ID TOOL_JUPYTER_ID TOOL_JOB_ID TOOL_HPS_ID TOOL_SSH_ID 중 조회

        training_id_list (list) : 여러개의 training id list를 받아서 해당 training id를 포함하는 아이템 조회

    Returns :
        (list) : 성공 시 [{....}]
        None : 실패 시 
    """
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    SELECT tt.*, i.name AS image_name
                    FROM training_tool tt
                    LEFT JOIN image i ON i.id = tt.docker_image_id
                """
            search_option = []
            if training_id:
                search_option.append(
                    "training_id = {}".format(training_id)
                )
            if tool_type:
                search_option.append(
                    "tool_type = {}".format(tool_type)
                )
            if training_id_list:
                training_id_list = [str(training_id) for training_id in training_id_list]
                training_id_list = ','.join(training_id_list)
                search_option.append(
                    "training_id in ({})".format(training_id_list)
                )
                
            if len(search_option) > 0:
                sql += " WHERE {}".format(" and ".join(search_option))

            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res)
    except Exception as e:
        traceback.print_exc()
        return None
    return res

def get_training_tool_only(training_tool_id=None, training_id=None, tool_type=None, tool_replica_number=0):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            if training_tool_id is not None:
                sql = """
                    SELECT *
                    FROM training_tool
                    WHERE id = {}
                """.format(training_tool_id)
            elif training_id is not None and tool_type is not None:
                sql = """
                    SELECT *
                    FROM training_tool
                    WHERE training_id = {} and tool_type = {} and tool_replica_number = {}
                """.format(training_id, tool_type, tool_replica_number)


            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
    except Exception as e:
        traceback.print_exc()
        return None
    return res

def get_training_tool(training_tool_id=None, training_id=None, tool_type=None, tool_replica_number=0):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            if training_tool_id is not None:
                sql = """
                    SELECT tt.*, 
                        i.id AS docker_image_id, i.name AS docker_image_name
                    FROM training_tool tt
                    LEFT JOIN image i ON i.id = tt.docker_image_id
                    WHERE tt.id = {}
                """.format(training_tool_id)
            elif training_id is not None and tool_type is not None:
                sql = """
                    SELECT tt.*, 
                        i.id AS docker_image_id, i.name AS docker_image_name
                    FROM training_tool tt
                    LEFT JOIN image i ON i.id = tt.docker_image_id
                    WHERE training_id = {} and tool_type = {} and tool_replica_number = {}
                """.format(training_id, tool_type, tool_replica_number)


            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
    except Exception as e:
        traceback.print_exc()
        return None
    return res

def insert_training_tool(training_id, tool_type, gpu_count, tool_replica_number=0, gpu_model=None, node_name=None, docker_image_id=None, init_mode=False):
    """
        Args :
            init_mode (bool) : True - Tool 별 일부 정보를 제외한 나머지는 Training Table 정보를 Tool 로 복사 입력 (최초 생성 시). False - 지정한 값을 Tool에 입력
    """
    def get_insert_form(value):
        if value is None:
            value = "Null"
        else:
            value = "'" + str(value) + "'"

        return value
    try:
        with get_db() as conn:
            cur = conn.cursor()
            gpu_model = common.gpu_model_to_dumps(gpu_model)
            node_name = common.gpu_model_to_dumps(node_name)

            if tool_type == TOOL_EDITOR_ID:
                print("TOOL EDITOR CREATE")
                sql = """
                    INSERT INTO training_tool (training_id, tool_type, tool_replica_number, gpu_count, docker_image_id)
                    VALUES ({},{},{}, 0, IfNULL((SELECT i.id FROM image i WHERE i.name = '{}'), '{}'))
                """.format(training_id, tool_type, tool_replica_number, JF_CPU_DEFAULT_IMAGE_NAME, JF_DEFAULT_IMAGE_NAME)

            elif tool_type in [TOOL_JUPYTER_ID,TOOL_JOB_ID,TOOL_HPS_ID,TOOL_SSH_ID]:
                print("TOOL JUPYTER, JOB, HPS, SSH CREATE")
                if init_mode == True:
                    sql = """
                        INSERT INTO training_tool (training_id, tool_type, tool_replica_number, gpu_count, gpu_model, node_name, node_mode, docker_image_id)
                            SELECT {training_id}, {tool_type}, {tool_replica_number}, {gpu_count}, gpu_model, node_name, node_mode, IfNULL((SELECT i.id FROM image i WHERE i.id = docker_image_id), 1)
                            FROM training
                            WHERE id = {training_id}
                    """.format(training_id=training_id, tool_type=tool_type, tool_replica_number=tool_replica_number, gpu_count=gpu_count)
                else:
                    gpu_model = get_insert_form(gpu_model)
                    node_name = get_insert_form(node_name)
                    docker_image_id = get_insert_form(docker_image_id)

                    sql = """
                        INSERT INTO training_tool (training_id, tool_type, tool_replica_number, gpu_count, gpu_model, node_name, node_mode, docker_image_id)
                            SELECT {training_id}, {tool_type}, {tool_replica_number}, {gpu_count}, {gpu_model}, {node_name}, node_mode, {docker_image_id}
                            FROM training
                            WHERE id = {training_id}
                    """.format(training_id=training_id, tool_type=tool_type, tool_replica_number=tool_replica_number, gpu_count=gpu_count, gpu_model=gpu_model, node_name=node_name,
                                docker_image_id=docker_image_id)
            else:
                print("TOOL OTHERS CREATE")
                if init_mode == True:
                    sql = """
                        INSERT INTO training_tool (training_id, tool_type, tool_replica_number, gpu_count, gpu_model, node_name, node_mode, docker_image_id)
                            SELECT {training_id}, {tool_type}, {tool_replica_number}, {gpu_count}, gpu_model, node_name, node_mode, IfNULL((SELECT i.id FROM image i WHERE i.id = docker_image_id), 1)
                            FROM training
                            WHERE id = {training_id}
                    """.format(training_id=training_id, tool_type=tool_type, tool_replica_number=tool_replica_number, gpu_count=gpu_count)
                else:
                    gpu_model = get_insert_form(gpu_model)
                    node_name = get_insert_form(node_name)
                    docker_image_id = get_insert_form(docker_image_id)
                    sql = """
                        INSERT INTO training_tool (training_id, tool_type, tool_replica_number, gpu_count, gpu_model, node_name, node_mode, docker_image_id)
                            SELECT {training_id}, {tool_type}, {tool_replica_number}, {gpu_count}, {gpu_model}, {node_name}, node_mode, {docker_image_id}
                            FROM training
                            WHERE id = {training_id}
                    """.format(training_id=training_id, tool_type=tool_type, tool_replica_number=tool_replica_number, gpu_count=gpu_count, gpu_model=gpu_model, node_name=node_name,
                                docker_image_id=docker_image_id)
            # print(sql)
            cur.execute(sql)
            conn.commit()

        return True, ""
    except pymysql.err.IntegrityError:
        pass
    except Exception as e:
        print(sql)
        traceback.print_exc()
        return False, e

def update_training_tool(training_tool_id, gpu_count, docker_image_id, gpu_model, node_mode, node_name):
    try:
        with get_db() as conn:
            gpu_model = common.gpu_model_to_dumps(gpu_model)
            node_name = common.gpu_model_to_dumps(node_name)

            cur = conn.cursor()

            sql = """
                UPDATE training_tool 
                set gpu_count = %s, docker_image_id = %s, gpu_model = %s, node_mode = %s, node_name = %s
                where id = %s
            """
            cur.execute(sql, (
                    gpu_count, docker_image_id, gpu_model, node_mode, node_name,
                    training_tool_id
            ))
            conn.commit()


        return True
    except Exception as e:
        traceback.print_exc()
        return False
    
def update_training_tool_name(training_tool_id, training_tool_name):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                UPDATE training_tool 
                set name = %s
                where id = %s
            """
            cur.execute(sql, (training_tool_name, training_tool_id))
            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        raise e


# def update_training_tool(training_tool_id, **update_key):
#     try:
#         with get_db() as conn:

#             SET = ""
#             row = []
#             for k,v in update_key.items():
#                 SET += "{} = %s,".format(k)
#                 rows.append(v)
#             SET = SET[:-1]
#             rows.append(training_tool_id)
#             row = tuple(row)
#             sql = """
#                 UPDATE training_tool
#                 SET @SET
#                 WHERE id = %s
#             """.replace("@SET", SET)

#             print(sql)
#             cur.execute(sql, row)
#             conn.commit()

#         return True
#     except Exception as e:
#         traceback.print_exc()
#         return False

def get_training_tool_setting_info(training_tool_id):
    res = None
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
            SELECT tt.*, t.name AS training_name, w.name AS workspace_name, w.id AS workspace_id,
            u.name AS owner_name, t.type, t.access, t.gpu_count AS training_gpu_count,
            (SELECT u.name FROM user u WHERE u.id = w.manager_id) AS manager_name,
            i.name AS image_name, i.real_name AS image
            FROM training_tool tt
            LEFT JOIN training t ON tt.training_id = t.id
            LEFT JOIN workspace w ON t.workspace_id = w.id
            LEFT JOIN user u ON t.user_id = u.id
            LEFT JOIN image i ON tt.docker_image_id = i.id
            WHERE tt.id = {}
            """.format(training_tool_id)
            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)

    except:
        traceback.print_exc()
    return res

def update_training_tool_configurations(training_tool_id, configurations):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE training_tool set configurations = '{}' where id = {}".format(configurations, training_tool_id)
            cur.execute(sql)
            conn.commit()


        return True
    except Exception as e:
        traceback.print_exc()
        return False


def delete_training_tool(training_tool_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                DELETE FROM training_tool WHERE id = "{}"
                """.format(training_tool_id)
            cur.execute(sql)
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, str(e)
    return False

def update_training_tool_sync_with_training(training_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE training_tool tt
                INNER JOIN training t ON t.id = tt.training_id
                SET tt.gpu_model = t.gpu_model, 
                tt.node_name = t.node_name
                WHERE t.id = %s and tt.tool_type = 1
            """
            cur.execute(sql,(training_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False


def update_training_tool_start_time_init(training_tool_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE training_tool SET start_datetime = null, end_datetime = null, executor_id = null, configurations = null
                WHERE id = %s
            """
            cur.execute(sql,(training_tool_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_training_tool_start_time(training_tool_id, executor_id=None, workspace_id=None, training_name=None, training_type=None):
    from utils.db_record import insert_unified_record
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE training_tool SET start_datetime = %s, end_datetime = %s, executor_id = %s
                WHERE id = %s AND end_datetime IS null
            """
            cur.execute(sql,(datetime.today().strftime("%Y-%m-%d %H:%M:%S"), None, int(executor_id), training_tool_id))
            conn.commit()
        insert_unified_record(record_type="tool", type_id=training_tool_id, workspace_id=workspace_id, training_name=training_name, training_type=training_type, executor_id=executor_id)

        return True
    except Exception as e:
        traceback.print_exc()
        return False


def update_training_tool_end_time(training_tool_id=None, pod_status=None):
    from utils.db_record import update_record_end_time_unified
    try:
        with get_db() as conn:

            cur = conn.cursor()
            end_time = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
            sql = """
                UPDATE training_tool SET end_datetime = %s, start_datetime = %s
                WHERE id = %s  AND start_datetime IS null
            """
            cur.execute(sql,(end_time, end_time, training_tool_id))
            conn.commit()

            sql = """
                UPDATE training_tool SET end_datetime = %s
                WHERE id = %s
            """
            cur.execute(sql,(end_time, training_tool_id))
            conn.commit()

        update_record_end_time_unified(record_type="tool", record_id=training_tool_id, end_datetime=end_time, pod_status=pod_status)
        return True
    except Exception as e:
        traceback.print_exc()
        return False

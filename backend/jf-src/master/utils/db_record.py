import pymysql
from utils.db_base import *
import utils.db
import traceback
import utils.common as common
from datetime import datetime

RECORD_SUBTYPE_DETAIL_POD_STATUS_KEY = "pod_status"

def get_records_workspace_summary_usage():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT 
                ws.id, ws.name, 
                ws.create_datetime, ws.start_datetime, ws.end_datetime, 
                ws.gpu_training_total, ws.gpu_deployment_total, ws.guaranteed_gpu
            FROM 
                workspace ws
            """
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_summary_usage_activation_time():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT log_id, id, name, start_datetime, end_datetime, log_create_datetime
            FROM record_workspace
            GROUP BY id, start_datetime, end_datetime
            ORDER BY log_create_datetime asc
            """
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_summary_usage_uptime_of_job_unified():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT rj.id, rj.workspace_id, rj.gpu_count, rj.start_datetime, rj.end_datetime, rj.log_create_datetime, 'job' as usage_type
                FROM record_unified rj
                WHERE rj.start_datetime is not NULL AND rj.subtype="job"
                ORDER BY rj.log_create_datetime asc
            """
            cur.execute(sql)
            res = cur.fetchall()
    except Exception as e:
        traceback.print_exc()
    return res

def get_records_summary_usage_uptime_of_jupyter_unified():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT rj.id, rj.workspace_id, Case WHEN json_value(rj.type_detail,'$.tool_type') = 0 then 'True' WHEN json_value(rj.type_detail,'$.tool_type') = 1 THEN 'False' END as editor, rj.start_datetime, rj.end_datetime, rj.log_create_datetime, 'jupyter' as usage_type
                FROM record_unified rj
                WHERE rj.start_datetime is not NULL AND rj.subtype="tool"
                ORDER BY rj.log_create_datetime asc
            """
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_summary_usage_uptime_of_deployment_unified():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    rd.id, rd.workspace_id, rd.type, rd.gpu_count, rd.start_datetime, rd.end_datetime, rd.log_create_datetime, 'deployment' as usage_type
                FROM
                    record_unified rd
                WHERE
                    rd.start_datetime is not NULL AND rd.subtype="deployment"
                ORDER BY
                    rd.log_create_datetime asc
            """
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_summary_usage_uptime_of_hyperparamsearch_unified():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT rh.id, rh.workspace_id, rh.gpu_count, rh.start_datetime, rh.end_datetime, rh.log_create_datetime, rh.subtype as usage_type
                FROM record_unified rh
                WHERE rh.start_datetime is not NULL AND rh.subtype="hyperparamsearch"
                ORDER BY rh.log_create_datetime asc
            """
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_workspaces_info(workspace_ids, task, action, search_key, search_value, sort_key, sort_value):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    h.datetime,
                    h.task,
                    h.action,
                    h.task_name,
                    h.update_details,
                    h.user,
                    w.name as workspace_name
                FROM
                    history h
                INNER JOIN
                    workspace w ON w.id = h.workspace_id
            """
            wheres = []
            if not workspace_ids is None:
                wheres.append("workspace_id IN ({})".format(workspace_ids))
            if not task is None:
                wheres.append("task = '{}'".format(task))
            if not action is None:
                wheres.append("action = '{}'".format(action))
            if not search_key is None and not search_value is None:
                if search_key == "workspace":
                    wheres.append("w.name like '%{}%' ".format(search_value))
                elif search_key == "task_name":
                    wheres.append("h.task_name like '%{}%' ".format(search_value))
                elif search_key == "user":
                    wheres.append("h.user like '%{}%' ".format(search_value))
            if not len(wheres) == 0:
                sql += """WHERE {} """.format(" AND ".join(wheres))
            if sort_key == 'time_stamp':
                sql += "ORDER BY h.datetime {}".format(sort_value)
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_of_available_gpu_count():
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    count,
                    update_datetime
                FROM
                    record_available_gpu
                ORDER BY 
                    update_datetime asc
            """
            cur.execute(sql)
            res = cur.fetchall()
            return res
    except:
        print("GET RECORDS AVAILABLE GPU COUNT ERROR")
        traceback.print_exc()
        return None

def get_records_of_gpu_usage(workspace='ALL'):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT DISTINCT
                    max(used) used,
                    total,
                    DATE(record_datetime)
                FROM 
                    record_gpu USE INDEX (gpu_ws)
                WHERE
                	workspace_id = %s
                GROUP BY
                	DATE(record_datetime)
                ORDER BY 
                    record_datetime desc
                LIMIT 365;
                """
            cur.execute(sql,(workspace))
            res = cur.fetchall()
            return res
    except:
        print("GET RECORDS GPU USAGE ERROR")
        traceback.print_exc()
        return None

def get_records_of_detailed_gpu_usage(workspace='ALL', offset=6):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT 
                    used,
                    total,
                    CAST(((used/total)*100) AS INT) AS 'usage',
                    record_datetime
                FROM 
                    record_gpu USE INDEX (gpu_ws)
                WHERE
                	workspace_id = %s
                ORDER BY 
                    record_datetime desc
                LIMIT %s;
            """
            cur.execute(sql,(workspace,offset))
            res = cur.fetchall()
            return res
    except:
        print("GET RECORDS DETAILED GPU USAGE ERROR")
        traceback.print_exc()
        return None

def set_index_for_records_of_available_gpu_count():
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                CREATE INDEX update_datetime_asc
                ON record_available_gpu (update_datetime)
            """
            cur.execute(sql)
    except:
        traceback.print_exc()

def get_records_instance_activation_time(workspace_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = f"""
                SELECT 
                    log_id, id, name, 
                    gpu_training_total, gpu_deployment_total, guaranteed_gpu,
                    start_datetime, end_datetime, log_create_datetime
                FROM 
                    record_workspace
                WHERE 
                    id = {workspace_id}
                GROUP BY 
                    id, start_datetime, end_datetime, gpu_deployment_total, gpu_training_total
                ORDER BY 
                    log_create_datetime asc
            """

            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_user_list_by_group_id(group_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = f"""
                SELECT 
                    user_id
                FROM 
                    user_usergroup
                WHERE 
                    usergroup_id = {group_id}
                """
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_records_storage_info():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT
            FROM
            LEFT JOIN
            """.format()
            cur.execute(sql)
            res = cur.fetchone()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_storage_timeline():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT
            FROM
            LEFT JOIN
            """.format()
            cur.execute(sql)
            res = cur.fetchone()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_instance_uptime_of_job(workspace_id=None, search_key=None, search_value=None, user_list=None):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    rj.id, rj.name, rj.workspace_id, w.name as workspace_name, rj.training_id, rj.job_group_index,
                    rj.training_name, rj.gpu_count, rj.start_datetime, rj.end_datetime, rj.configurations, rj.training_id_if_exists,
                    'job' as usage_type
                FROM
                    record_job rj
                INNER JOIN
                    workspace w ON w.id = rj.workspace_id
            """
            wheres = []
            if workspace_id is not None:
                wheres.append("rj.workspace_id={}".format(workspace_id))
            if user_list is not None:
                wheres.append("rj.creator_id in ({})".format(", ".join(user_list)))
            wheres.append("rj.start_datetime is not NULL")
            if not search_key is None and not search_value is None:
                if search_key == "workspace":
                    wheres.append("w.name like '%{}%' ".format(search_value))
                elif search_key == "training":
                    wheres.append("rj.training_name like '%{}%' ".format(search_value))
                elif search_key == "job_deployment":
                    wheres.append("rj.name like '%{}%' ".format(search_value))
            if not len(wheres) == 0:
                sql += """WHERE {} """.format(" AND ".join(wheres))
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res


def get_records_instance_uptime_of_job_unified(workspace_id=None, search_key=None, search_value=None, user_list=None):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    rj.id, rj.name, rj.workspace_id, w.name as workspace_name, json_value(rj.type_detail,'$.training_id') as training_id, json_value(rj.subtype_detail,'$.job_group_index') as job_group_index,
                    json_value(rj.type_detail,'$.training_name') as training_name, rj.gpu_count, rj.start_datetime, rj.end_datetime, rj.configurations, json_value(rj.subtype_detail,'$.training_id_if_exists') as training_id_if_exists,
                    'job' as usage_type
                FROM
                    record_unified rj
                INNER JOIN
                    workspace w ON w.id = rj.workspace_id
            """
            wheres = []
            wheres.append("rj.subtype='job'")
            if workspace_id is not None:
                wheres.append("rj.workspace_id={}".format(workspace_id))
            if user_list is not None:
                wheres.append("rj.executor_id in ({})".format(", ".join(user_list)))
            wheres.append("rj.start_datetime is not NULL")
            if not search_key is None and not search_value is None:
                if search_key == "workspace":
                    wheres.append("w.name like '%{}%' ".format(search_value))
                elif search_key == "training":
                    wheres.append("json_value(rj.type_detail,'$.training_name') like '%{}%' ".format(search_value))
                elif search_key == "job_deployment":
                    wheres.append("rj.name like '%{}%' ".format(search_value))
            if not len(wheres) == 0:
                sql += """WHERE {} """.format(" AND ".join(wheres))
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

# jupyter에서 editor 라는 key가 사라지고 training_tool table에 type 0, 1 로 구분
# training_tool.type = 0 == jupyter.editor = True , training_tool.type = 1 == jupyter.editor = False
def get_records_instance_uptime_of_jupyter_unified(workspace_id=None, usage_type=None, search_key=None, search_value=None, user_list=None):
    print(usage_type)
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    rj.id, rj.workspace_id, w.name as workspace_name, json_value(rj.type_detail,'$.training_id') as training_id, json_value(rj.type_detail,'$.training_name') as training_name,
                    Case WHEN json_value(rj.type_detail,'$.tool_type') = 0 then 'True' WHEN json_value(rj.type_detail,'$.tool_type')=1 THEN 'False' END as editor, rj.start_datetime, rj.end_datetime, rj.log_create_datetime, rj.configurations, json_value(rj.subtype_detail,'$.training_id_if_exists') as training_id_if_exists,
                    'jupyter' as usage_type
                FROM
                    record_unified rj
                INNER JOIN
                    workspace w ON w.id = rj.workspace_id
                """
            wheres = []
            wheres.append("rj.subtype='tool'")
            if workspace_id is not None:
                wheres.append("rj.workspace_id={}".format(workspace_id))
            if user_list is not None:
                wheres.append("rj.executor_id in ({})".format(", ".join(user_list)))
            wheres.append("rj.start_datetime is not NULL")
            if not usage_type is None:
                if usage_type == "editor":
                    # wheres.append("rj.tool_type={}".format(0))
                    wheres.append("json_value(rj.type_detail,'$.tool_type') = {}".format(0))
                elif usage_type == "training":
                    # wheres.append("rj.tool_type={}".format(1))
                    wheres.append("json_value(rj.type_detail,'$.tool_type') = {}".format(1))
            if not search_key is None and not search_value is None:
                if search_key == "workspace":
                    wheres.append("w.name like '%{}%' ".format(search_value))
                elif search_key == "training":
                    wheres.append("json_value(rj.type_detail,'$.training_name') like '%{}%' ".format(search_value))
                elif search_key == "job_deployment":
                    return []
            if not len(wheres) == 0:
                sql += """WHERE {} """.format(" AND ".join(wheres))
            sql += """
                ORDER BY rj.log_create_datetime asc
                """
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_instance_uptime_of_deployment_unified(workspace_id=None, search_key=None, search_value=None, user_list=None):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    rd.id, rd.name, rd.workspace_id, json_value(rd.type_detail,'$.training_id') as training_id, json_value(rd.type_detail,'$.training_name') as training_name, json_value(rd.subtype_detail,'$.type') as type, rd.gpu_count,
                    rd.start_datetime, rd.end_datetime, rd.log_create_datetime, rd.configurations, json_value(rd.subtype_detail,'$.training_id_if_exists') as training_id_if_exists,
                    w.name as workspace_name,
                    'deployment' as usage_type
                FROM
                    record_unified rd
                INNER JOIN
                    workspace w ON w.id = rd.workspace_id
                """
            wheres = []
            wheres.append("rd.subtype='deployment'")
            if workspace_id is not None:
                wheres.append("rd.workspace_id={}".format(workspace_id))
            if user_list is not None:
                wheres.append("rd.executor_id in ({})".format(", ".join(user_list)))
            wheres.append("rd.start_datetime is not NULL")
            if not search_key is None and not search_value is None:
                if search_key == "workspace":
                    wheres.append("w.name like '%{}%' ".format(search_value))
                elif search_key == "training":
                    wheres.append("json_value(rd.type_detail,'$.training_name') like '%{}%' ".format(search_value))
                elif search_key == "job_deployment":
                    wheres.append("rd.name like '%{}%' ".format(search_value))
            if not len(wheres) == 0:
                sql += """WHERE {} """.format(" AND ".join(wheres))
            sql += """
                ORDER BY rd.log_create_datetime asc
                """
            cur.execute(sql)
            res = cur.fetchall()
    except Exception as e:
        traceback.print_exc()
    return res

def get_records_instance_uptime_of_hyperparamsearch_unified(workspace_id=None, search_key=None, search_value=None, user_list=None):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT
                    rh.id, json_value(rh.subtype_detail,'$.hps_group_name')  as name, rh.workspace_id, w.name as workspace_name, json_value(rh.type_detail,'$.training_id') as training_id, json_value(rh.subtype_detail,'$.hps_group_index') as hps_group_index,
                    json_value(rh.type_detail,'$.training_name') as training_name, rh.gpu_count, rh.start_datetime, rh.end_datetime, rh.configurations, json_value(rh.subtype_detail,'$.training_id_if_exists') as training_id_if_exists,
                    'hyperparamsearch' as usage_type
                FROM
                    record_unified rh
                INNER JOIN
                    workspace w ON w.id = rh.workspace_id
            """
            wheres = []
            wheres.append("rh.subtype='hyperparamsearch'")
            if workspace_id is not None:
                wheres.append("rh.workspace_id={}".format(workspace_id))
            if user_list is not None:
                wheres.append("rh.executor_id in ({})".format(", ".join(user_list)))
            wheres.append("rh.start_datetime is not NULL")
            if not search_key is None and not search_value is None:
                if search_key == "workspace":
                    wheres.append("w.name like '%{}%' ".format(search_value))
                elif search_key == "training":
                    wheres.append("json_value(rh.type_detail,'$.training_name') like '%{}%' ".format(search_value))
                elif search_key == "job_deployment":
                    wheres.append("json_value(rh.subtype_detail,'$.hps_group_name') like '%{}%' ".format(search_value))
            if not len(wheres) == 0:
                sql += """WHERE {} """.format(" AND ".join(wheres))
            cur.execute(sql)
            res = cur.fetchall()

    except Exception as e:
        traceback.print_exc()
    return res

def get_records_storage_history():
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT
            FROM
            LEFT JOIN
            """.format()
            cur.execute(sql)
            res = cur.fetchone()
    except Exception as e:
        traceback.print_exc()
    return res

def get_daily_training_list_per_user_unified(user_id:str="",user_name:str=""):
    """get trainings per user(24hrs interval)

    :param user_id: user_id
    :param user_name: username
    """

    res = ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if user_id != "":
                sql = '''
                SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, "" as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, "" as subtype  FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                (
                result.end_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                OR
                result.start_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                )
                AND
                result.user_id =''' + user_id + '''
                AND
                (subtype="" OR "hyperparamsearch")
                ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            elif user_name != "":
                sql = '''
                SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, "" as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, "" as subtype  FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                (
                result.end_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                OR
                result.start_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                )
                AND
                result.user_name =''' + user_name + '''
                AND
                (subtype="" OR "hyperparamsearch")
                ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            else:
                sql = '''
                SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, "" as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, "" as subtype  FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                (
                result.end_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                OR
                result.start_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                )
                AND
                (subtype="" OR "hyperparamsearch")
                ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_daily_deployment_list_per_user(user_id:str="",user_name:str=""):
    res = ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if user_id != "":
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description 
                FROM deployment
                LEFT JOIN user
                ON deployment.user_id=user.id
                LEFT JOIN deployment_data_form
                ON deployment.id=deployment_data_form.deployment_id
                WHERE
                end_datetime IS NULL
                OR
                end_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                AND
                user.id ="''' + user_id + '''"
                GROUP BY deployment.id;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            elif user_name != "":
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description 
                FROM deployment
                LEFT JOIN user
                ON deployment.user_id=user.id
                LEFT JOIN deployment_data_form
                ON deployment.id=deployment_data_form.deployment_id
                WHERE
                end_datetime IS NULL
                OR
                end_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                AND
                user.name ="''' + user_name + '''"
                GROUP BY deployment.id;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            else:
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description 
                FROM deployment
                LEFT JOIN user
                ON deployment.user_id=user.id
                LEFT JOIN deployment_data_form
                ON deployment.id=deployment_data_form.deployment_id
                WHERE
                end_datetime IS NULL
                OR
                end_datetime >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                GROUP BY deployment.id;
                '''
                cur.execute(sql)
                res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_training_list_for_records_unified(user_id:str="",user_name:str="", starting_point= str(datetime.now()), end_point = ""):
    """get trainings

    :param user_id: user_id
    :param user_name: username
    """
    res = ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if user_id != "":
                sql = '''
                 SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, NULL as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, NULL as subtype FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                result.user_id ="''' + user_id + '''"
                AND
                result.end_datetime BETWEEN "''' + end_point + '" AND "' + starting_point +'''" 
                AND
                (result.subtype IS NULL or result.subtype="hyperparamsearch")
                ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            elif user_name != "":
                sql = '''
                 SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, NULL as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, NULL as subtype FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                result.user_name ="''' + user_name + '''"
                AND
                result.end_datetime BETWEEN "''' + end_point + '" AND "' + starting_point +'''" 
                AND
                (result.subtype IS NULL or result.subtype="hyperparamsearch")
                ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            else:
                sql = '''
                 SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, NULL as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, NULL as subtype FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                result.end_datetime BETWEEN "''' + end_point + '" AND "' + starting_point +'''" 
                AND
                (result.subtype IS NULL or result.subtype="hyperparamsearch")
                ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_deployment_list_for_records(user_id:str="",user_name:str="", starting_point= str(datetime.now()), end_point= ""):
    res = ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if user_id != "":
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description 
                FROM deployment
                LEFT JOIN user
                ON deployment.user_id=user.id
                LEFT JOIN deployment_data_form
                ON deployment.id=deployment_data_form.deployment_id
                WHERE
                user.id ="''' + user_id + '''"
                AND
                (
                end_datetime BETWEEN "''' + end_point + '" AND "' + starting_point +'''" 
                OR
                deployment.end_datetime = NULL
                )
                GROUP BY deployment.id
                ORDER BY create_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            elif user_name != "":
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description 
                FROM deployment
                LEFT JOIN user
                ON deployment.user_id=user.id
                LEFT JOIN deployment_data_form
                ON deployment.id=deployment_data_form.deployment_id
                WHERE
                user.name ="''' + user_name + '''"
                AND
                (
                end_datetime BETWEEN "''' + end_point + '" AND "' + starting_point +'''" 
                OR
                deployment.end_datetime = NULL
                )
                GROUP BY deployment.id
                ORDER BY create_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            else:
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description
                FROM deployment
                LEFT JOIN user
                ON deployment.user_id=user.id
                LEFT JOIN deployment_data_form
                ON deployment.id=deployment_data_form.deployment_id
                WHERE
                (
                end_datetime BETWEEN "''' + end_point + '" AND "' + starting_point +'''" 
                OR
                deployment.end_datetime = NULL
                )
                GROUP BY deployment.id
                ORDER BY create_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_active_training_job_list_for_records_unified(user_id:str="",user_name:str=""):
    """get trainings

    :param user_id: user_id
    :param user_name: username
    """
    res = ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if user_id != "":
                sql = '''
                 SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, NULL as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, NULL as subtype FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                result.start_datetime IS NOT NULL
                AND 
                result.end_datetime IS NULL
                AND
                (result.subtype IS NULL or result.subtype="hyperparamsearch")
                AND
                   result.user_id = ''' + user_id + '''
                   ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            elif user_name != "":
                sql = '''
                 SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, NULL as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, NULL as subtype FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                result.start_datetime IS NOT NULL
                AND 
                result.end_datetime IS NULL
                AND
                (result.subtype IS NULL or result.subtype="hyperparamsearch")
                AND
                   result.user_name ="''' + user_name + '''"
                   ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            else:
                sql = '''
                SELECT * 
                FROM ( SELECT training.name as training_name, user.id as user_id, user.name as user_name, training_tool.gpu_count, training_tool.configurations, NULL as dataset_name, training_tool.start_datetime as start_datetime, training_tool.end_datetime as end_datetime, False as is_hps, True as is_jupyter, NULL as subtype FROM training_tool
                LEFT JOIN training
                ON training.id = training_tool.training_id
                LEFT JOIN user
                ON user.id = training.user_id
                WHERE tool_type = 0
                UNION
                SELECT training.name as training_name, user.id as user_id, user.name as user_name, job.gpu_count, job.configurations, job.dataset_name, job.start_datetime as start_datetime, job.end_datetime as end_datetime, False as is_hps, False as is_jupyter, NULL as subtype FROM job
                LEFT JOIN user
                ON user.id = job.creator_id
                LEFT JOIN training
                ON training.id = job.training_id            
                UNION
                SELECT json_value(record_unified.type_detail,'$.training_name') as training_name, user.id as user_id, user.name as user_name, record_unified.gpu_count, configurations, json_value(record_unified.subtype_detail,'$.dataset_name') as dataset_name, start_datetime as start_datetime, end_datetime as end_datetime, True as is_hps, False as is_jupyter, subtype FROM record_unified
                LEFT JOIN training
                ON training.id = json_value(record_unified.type_detail,'$.training_id')
                LEFT JOIN user
                ON user.id = training.user_id) as result
                WHERE
                result.start_datetime IS NOT NULL
                AND 
                result.end_datetime IS NULL
                AND
                (result.subtype IS NULL or result.subtype="hyperparamsearch")
                ORDER BY result.start_datetime DESC;
                '''
                cur.execute(sql)
                res = cur.fetchall()
    except:
        traceback.print_exc()
    return res


def get_active_deployment_list_for_records(user_id:str="",user_name:str=""):
    res = ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if user_id != "":
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description
                FROM (SELECT * FROM deployment WHERE (end_datetime IS NULL AND deployment.start_datetime IS NOT NULL)) as deployment, user, deployment_data_form
                WHERE (deployment.user_id = user.id AND deployment.id=deployment_data_form.deployment_id) AND user.id ="''' + user_id + '''"
                GROUP BY deployment.id
                ORDER BY deployment.create_datetime;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            elif user_name != "":
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description
                FROM (SELECT * FROM deployment WHERE (end_datetime IS NULL AND deployment.start_datetime IS NOT NULL)) as deployment, user, deployment_data_form
                WHERE (deployment.user_id = user.id AND deployment.id=deployment_data_form.deployment_id) AND user.name ="''' + user_name + '''"
                GROUP BY deployment.id
                ORDER BY deployment.create_datetime;
                '''
                cur.execute(sql)
                res = cur.fetchall()
            else:
                sql = '''
                SELECT deployment.id, deployment.name as deployment_name, user.id as user_id, user.name as user_name, deployment.description, deployment.workspace_id, deployment.type, deployment.training_id, deployment.training_name, deployment.built_in_model_id, deployment.job_id, deployment.run_code, deployment.checkpoint as ckpt, deployment.checkpoint_id as ckpt_id, deployment.operating_type, deployment.gpu_count, deployment.input_type, deployment.configurations, deployment.create_datetime, deployment.start_datetime, deployment.end_datetime, deployment.built_in_creator, deployment_data_form.location as form_location ,deployment_data_form.method as form_method, deployment_data_form.api_key as form_api_key,  deployment_data_form.value_type as form_value_type,deployment_data_form.category as form_category, deployment_data_form.category_description as form_category_description
                FROM (SELECT * FROM deployment WHERE (end_datetime IS NULL AND deployment.start_datetime IS NOT NULL)) as deployment, user, deployment_data_form
                WHERE (deployment.user_id = user.id AND deployment.id=deployment_data_form.deployment_id)
                GROUP BY deployment.id
                ORDER BY deployment.create_datetime;
                '''
                cur.execute(sql)
                res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_token_for_record(user_id:str="",user_name:str=""):
    res = ""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            if user_id != "":
                sql = '''
                SELECT token, last_call_datetime, user_id, user.name as user_name
                FROM login_session
                LEFT JOIN user
                ON
                login_session.user_id = user.id
                WHERE
                user.id =''' + user_id + ';'
                cur.execute(sql)
                res = cur.fetchall()
            elif user_name != "":
                sql = '''
                SELECT token, last_call_datetime, user_id, user.name as user_name
                FROM login_session
                LEFT JOIN user
                ON
                login_session.user_id = user.id
                WHERE
                user.name ="''' + user_name + '''"
                '''
                cur.execute(sql)
                res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_every_username():
    res = ""
    with get_db() as conn:
        cur = conn.cursor()
        sql = "SELECT user.name FROM user;"
        cur.execute(sql)
        res = cur.fetchall()
    return res

def get_all_workspace_id_and_name():
    res = ""
    with get_db() as conn:
        cur = conn.cursor()
        sql = "SELECT id, name FROM workspace;"
        cur.execute(sql)
        res = cur.fetchall()
    return res

"""Insert an entry to record_gpu 

:param used: # of used gpus  
:type used: int
:param total: # of total gpus  
:type total: int
:param ws: workspace id
:type ws: str
"""
def record_gpu_record(used, total, ws='ALL'):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                    INSERT INTO 
                        record_gpu(used, total, record_datetime, workspace_id)
                    VALUES 
                        (%s, %s, %s, %s)"""
            cur.execute(sql,(used,total,datetime.now().strftime("%Y-%m-%d %H:%M:%S"),ws))
            conn.commit()
    except:
        print("RECORD LATEST GPU RECORD ERROR")
        traceback.print_exc()

"""Updates records_gpu(multiple entries)

:param to_update: dictionary of 
:type to_update: dict
"""
def update_gpu_records(to_update):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            for key, value in to_update.items():
                sql = """
                    UPDATE record_gpu
                    SET used = """ + str(value) + """
                	WHERE id =
                	(
                	    SELECT id
                	    FROM record_gpu
                		WHERE workspace_id = '""" + str(key) + """'
                		ORDER BY record_datetime DESC
                		LIMIT 1 
                	)
                    AND used < """ + str(value)
                cur.execute(sql)
            conn.commit()
    except:
        print("UPDATE LATEST GPU RECORD ERROR")
        traceback.print_exc()

"""Delete records older than x days

:param days: x
:type days: int
"""
def delete_gpu_records(days=14):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            DELETE
                FROM record_gpu
                WHERE record_datetime < (curdate() - INTERVAL %s DAY);
            """
            cur.execute(sql, (days))
            conn.commit()
    except:
        print("DELETE OLD GPU RECORD ERROR")
        traceback.print_exc()


def get_specific_item_record_list(record_type=None, record_id=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = f"""
                SELECT *
                FROM record_unified
                WHERE extracted_subtype_id = {record_id} 
                AND record_unified.subtype = '{record_type}'
            """
            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res, key_list=["subtype_detail", "type_detail"])
            return res
    except Exception as e:
        traceback.print_exc()
        return False

def insert_unified_record(record_type, type_id, workspace_id=None, training_name=None, training_type=None, executor_id=None):
    """Inserts a record into the database.

    :param record_type: type of data being recorded
    :type record_type: str
    :param type_id: id of data being recorded
    :type type_id: int
    :param workspace_id: id of a workspace it belongs to
    :type workspace_id: int
    :param training_name: name of a training being recorded 
    :type training_name: str
    :param training_type: type of a training being recorded
    :type training_type: str
    :param executor_id: user id of executor
    :type executor_id: int
    """
    try:
        with get_db() as conn:
            cur = conn.cursor()
            current_record = dict()
            if record_type == "job":
                sql = "SELECT * FROM job where id = " + str(type_id)
                cur.execute(sql)
                current_record = cur.fetchone()
                if workspace_id is None or training_name is None:
                    job_info = utils.db.get_job(type_id)
                    current_record["workspace_id"] = job_info["workspace_id"]
                    current_record["training_name"] = job_info["training_name"]
                    current_record["creator_id"] = job_info["creator_id"]
                else:
                    current_record["workspace_id"] = workspace_id
                    current_record["training_name"] = training_name
                current_record["tool_type"] = None
                current_record['type'] = "training"
                current_record["executor_id"] = current_record["creator_id"]
                if current_record['configurations'] == None or "":
                    return 0
            elif record_type == "tool":
                sql = "SELECT * FROM training_tool where id =" + str(type_id)
                cur.execute(sql)
                current_record = cur.fetchone()
                sql = "SELECT * FROM training where id =" + str(current_record['training_id'])
                cur.execute(sql)
                training_record = cur.fetchone()
                print(training_record)
                if training_name is None:
                    current_record["training_name"] = training_record["name"]
                else:
                    current_record['training_name'] = training_name
                current_record["workspace_id"] = training_record["workspace_id"]
                current_record['name'] = None
                current_record['create_datetime'] = current_record['start_datetime']
                current_record['training_type'] = training_type
                current_record['type'] = "training"
            elif record_type == "deployment":
                sql = "SELECT dw.*, dp.name, dp.workspace_id, dp.training_id, dp.training_name, dp.type, dp.built_in_model_id FROM deployment_worker as dw LEFT JOIN deployment as dp ON dp.id = dw.deployment_id where dw.id =" + str(
                    type_id)
                cur.execute(sql)
                current_record = cur.fetchone()
                current_record["training_id_if_exists"] = current_record["training_id"]
                current_record["tool_type"] = ""
                current_record['type'] = "deployment"
            elif record_type == "hyperparamsearch":
                sql = "SELECT * FROM hyperparamsearch where id=" + str(type_id)
                cur.execute(sql)
                current_record = cur.fetchone()
                hps_info = utils.db.get_hyperparamsearch(hps_id=type_id)
                current_record["workspace_id"] = hps_info['workspace_id']
                current_record['training_id'] = hps_info['training_id']
                current_record['training_name'] = hps_info['training_name']
                current_record["hps_group_name"] = hps_info["hps_group_name"]
                current_record["run_code"] = hps_info["run_code"]
                current_record["run_parameter"] = hps_info["run_parameter"]
                current_record['tool_type'] = None
                current_record['name'] = None
                current_record['type'] = "training"
                if current_record['configurations'] == None or "":
                    return 0
            new_row = dict()
            if executor_id is not None:
                current_record["executor_id"] = executor_id

            type_detail = {
                "training_id": current_record.pop('training_id'),
                "training_name": current_record.pop('training_name'),
                "training_tool_id": current_record.pop('id'),
                "tool_type": current_record.pop("tool_type")
            }
            new_row['name'] = current_record['name']
            new_row['type'] = current_record.pop('type')
            new_row['type_detail'] = json.dumps(type_detail)
            del (type_detail)

            new_row['executor_id'] = str(current_record.pop('executor_id'))
            new_row['workspace_id'] = str(current_record["workspace_id"])
            new_row['create_datetime'] = current_record['create_datetime']
            new_row['start_datetime'] = current_record['start_datetime']
            new_row['end_datetime'] = current_record['end_datetime']
            new_row['log_create_datetime'] = str(datetime.now())
            new_row['gpu_count'] = str(current_record.pop('gpu_count'))
            new_row['configurations'] = current_record.pop('configurations')
            new_row['subtype'] = record_type
            current_record['subtype_id'] = type_id
            current_record['record_type_ver'] = 1
            new_row['subtype_detail'] = json.dumps(current_record)

            del (current_record)

            sql = """
            					INSERT INTO 
            						record_unified(name, type, type_detail, executor_id, workspace_id, create_datetime, start_datetime, end_datetime, log_create_datetime, gpu_count, configurations, subtype, subtype_detail)
            					VALUES 
            						(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            				"""
            cur.execute(sql, (
                new_row['name'], new_row['type'], new_row['type_detail'], new_row['executor_id'],
                new_row['workspace_id'],
                new_row['create_datetime'], new_row['start_datetime'], new_row['end_datetime'],
                new_row['log_create_datetime'], new_row['gpu_count'], new_row['configurations'], new_row['subtype'],
                new_row['subtype_detail']))
            sql = """
            					UPDATE
                					record_unified RU,
                					workspace WS
            					SET
                					RU.workspace_name = WS.name
            					WHERE
                					RU.workspace_id = WS.id;
            			"""
            cur.execute(sql)
            conn.commit()

    except Exception as e:
        print(traceback.format_exc())


def update_record_end_time_unified(record_type=None, record_id=None, end_datetime=None, pod_status=None, unique_and_multiple_pod=False):
    """Update record end time.

    :ptype record_type: string
    :param record_type: job/jupyter/deployment/hps
    :ptype record_id: int
    :param record_id: id from original db table(job/jupyter/deployment/hps)
    :ptype end_datetime: string
    :param end_datetime: time when job/jupyter/deployment/hps finished

    unique_and_multiple_pod (bool) : job, hps id는 오직 한번만 실행되며 멀티 노드에 의해 여러 Pod이 생성되면서 pod status를 append할 수 있음

    Note:
        Users can restart/terminate jupyter, so record_id for jupyter may not be a unique value.
    """
    def get_pod_status_appended_subtype_detail(record_type, record_id, pod_status):
        subtype_detail = get_specific_item_record_list(record_type=record_type, record_id=record_id)[-1]["subtype_detail"]
        # Multi node GPU의 경우 POD이 노드 개수 만큼 생성되기 때문에 status가 여러개 존재할 수 있음
        if subtype_detail is None:
            subtype_detail = {
                RECORD_SUBTYPE_DETAIL_POD_STATUS_KEY: [pod_status]
            }
        else :
            if subtype_detail.get(RECORD_SUBTYPE_DETAIL_POD_STATUS_KEY) is None:
                subtype_detail[RECORD_SUBTYPE_DETAIL_POD_STATUS_KEY] = [pod_status]
            else:
                subtype_detail[RECORD_SUBTYPE_DETAIL_POD_STATUS_KEY].append(pod_status)
        subtype_detail = common.gpu_model_to_dumps(subtype_detail)
        return subtype_detail
    
    try:
        subtype_detail = get_pod_status_appended_subtype_detail(record_type=record_type, record_id=record_id, pod_status=pod_status)
        with get_db() as conn:
            cur = conn.cursor()
            if unique_and_multiple_pod == False:
                sql = """UPDATE record_unified 
                        SET end_datetime = %s, subtype_detail = %s
                        WHERE extracted_subtype_id = %s
                        AND end_datetime IS null
                        AND record_unified.subtype = %s
                        """
            else:
                sql = """UPDATE record_unified 
                        SET end_datetime = %s, subtype_detail = %s
                        WHERE extracted_subtype_id = %s
                        AND record_unified.subtype = %s
                        """
            cur.execute(sql, (end_datetime, subtype_detail, record_id, record_type))
            print("????", subtype_detail)
            conn.commit()
        return True

    except Exception as e:
        traceback.print_exc()
        return False
"""
    record_unified workspace_exists_check 트리거 생성
"""
def create_trigger_for_record_unified():
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
    CREATE TRIGGER IF NOT EXISTS workspace_exists_check
    AFTER DELETE ON workspace
    FOR EACH ROW
    BEGIN
    UPDATE record_unified SET workspace_exists=0
    WHERE record_unified.workspace_id = OLD.id;
    END;
                """
            cur.execute(sql)
            res = cur.fetchall()
            print(res)
    except Exception as e:
        traceback.print_exc()

# record_unified에 extracted_subtype_id라는 virtual column을 추가하고 index를 추가함
def alter_record_unified_if_not_exists():
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            	SELECT * FROM record_unified LIMIT 1;
            	"""
            cur.execute(sql)
            res = cur.fetchall()
            print("RES", res)
            if len(res) == 0:
                return 
                
            if (not 'extracted_subtype_id' in res[0]):
                sql = """
            		ALTER TABLE record_unified add extracted_subtype_id int as (json_value(subtype_detail,'$.subtype_id'));
            		"""
                cur.execute(sql)
                print(sql)
                sql = """
            		CREATE INDEX ru_subtype_id ON record_unified (extracted_subtype_id);
            		"""
                cur.execute(sql)
                print(sql)
                conn.commit()
    except Exception as e:
        traceback.print_exc()

def get_record_unified_end_datetime():
    """record_unified 에서 end_datetime이 Null인 행을 찾음"""
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT subtype, json_value(subtype_detail,'$.subtype_id') as subtype_id
            FROM record_unified
            WHERE end_datetime IS NULL;
            """
            cur.execute(sql)
            res = cur.fetchall()
            return res
    except Exception as e:
        traceback.print_exc()

def update_record_unified_end_datetime(subtype_id):
    """
    end_datetime records.update_record_unified_end_datetime_is_null 함수에 따라 Null을 현재시간으로 변경
    input : [subtype_id1, subtype_id2, subtype_id3, ...]
    """
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            UPDATE record_unified SET
            end_datetime=CURRENT_TIMESTAMP()
            WHERE """
            
            for i in subtype_id:
                sql += \
                """
                extracted_subtype_id={} OR""".format(i)
            sql = sql[:-3] + ';'
            
            cur.execute(sql)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False
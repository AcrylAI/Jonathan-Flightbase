import pymysql
from utils.db_base import *
from utils.db_record import insert_unified_record, update_record_end_time_unified
import utils.common  as common
import traceback
from datetime import datetime



def get_deployment_only(deployment_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT d.*
                FROM deployment d
                WHERE d.id = {}
            """.format(deployment_id)

            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
    except Exception as e:
        traceback.print_exc()
        pass
    return res

# 템플릿 적용
# TODO 템플릿 분기처리 수정 예정 => Lyla 23/02/01
def get_deployment_worker(deployment_worker_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT d.id as deployment_id, d.name as deployment_name, d.type, d.access, d.operating_type, d.input_type,
                dw.gpu_count, dw.gpu_model, dw.node_mode, dw.node_name, dw.template_id,
                dw.description, d.workspace_id, w.name as workspace_name,
                dw.training_id, dw.training_name, dw.job_id, dw.run_code, dw.checkpoint, dw.checkpoint_id, dw.docker_image_id, dw.create_datetime, dw.end_datetime,
                dw.configurations, dw.token, dw.user_id, (SELECT u.name FROM user u WHERE u.id = w.manager_id) AS manager_name,
                bm.name as built_in_model_name, bm.id as built_in_model_id, bm.description as built_in_model_description,
                u.name as owner_name,
                jt.name as job_name, jt.job_group_index
                
                FROM deployment_worker dw
                LEFT join deployment d ON d.id = dw.deployment_id
                LEFT JOIN user u ON u.id = dw.user_id
                LEFT JOIN workspace w ON w.id = d.workspace_id
                LEFT JOIN job j ON j.id = dw.job_id
                LEFT JOIN deployment_template dt ON dt.id=d.template_id
                LEFT JOIN built_in_model bm ON bm.id = json_value(dt.template,'$.built_in_model_id')
                LEFT JOIN job jt ON jt.id = json_value(dt.template,'$.job_id')
                WHERE dw.id = {}
            """.format(deployment_worker_id)

            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
    except Exception as e:
        traceback.print_exc()
        pass
    return res


def get_deployment_worker_list(deployment_id=None):
    try:
        res = []
        with get_db() as conn:
            cur = conn.cursor()
            if deployment_id is not None:
                sql = """
                    SELECT dw.*,
                    i.name AS image_name
                    FROM deployment_worker dw
                    LEFT JOIN image i on i.id = dw.docker_image_id
                    WHERE deployment_id = {}
                    ORDER BY id DESC
                """.format(deployment_id)
            else:
                sql = """
                    SELECT dw.*,
                    i.name AS image_name
                    FROM deployment_worker dw
                    LEFT JOIN image i on i.id = dw.docker_image_id
                    ORDER BY id DESC
                """

            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res)
    except Exception as e:
        traceback.print_exc()
        pass
    return res

def get_deployment_template(deployment_template_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT dt.*, dtg.name as deployment_template_group_name
            FROM deployment_template dt
            LEFT JOIN deployment_template_group dtg on dtg.id = dt.template_group_id
            WHERE dt.id = {}
            """.format(deployment_template_id)
            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res, key_list=["template"])
    except:
        traceback.print_exc()
    return res

# 템플릿 전체 리스트
def get_deployment_template_list(workspace_id, deployment_template_group_id=None, is_ungrouped_template=0):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT dt.*, dtg.name as deployment_template_group_name, dtg.id as deployment_template_group_id,
            dtg.user_id as deployment_template_group_owner_id, w.name as workspace_name,
            u.name as user_name, bm.name as built_in_model_name, 
            hg.name as hps_name, h.hps_group_index,
            j.name as job_name, j.job_group_index
            FROM deployment_template dt
            LEFT JOIN deployment_template_group dtg on dtg.id = dt.template_group_id
            LEFT JOIN workspace w on w.id = dt.workspace_id
            LEFT JOIN user u on u.id = dt.user_id
            LEFT JOIN built_in_model bm on bm.id = json_value(dt.template,'$.built_in_model_id')
            LEFT JOIN job j on j.id = json_value(dt.template,'$.job_id')
            LEFT JOIN hyperparamsearch h on h.id = json_value(dt.template,'$.hps_id')
            LEFT JOIN hyperparamsearch_group hg on hg.id = h.hps_group_id
            WHERE dt.workspace_id = {} AND dt.is_deleted = 0
            """.format(workspace_id)
            if deployment_template_group_id != None:
                sql += " AND dtg.id={}".format(deployment_template_group_id)
            elif is_ungrouped_template==1:
                sql += " AND dtg.name is NULL"
            sql += " ORDER BY dt.create_datetime DESC"
            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res, key_list=["template", "item_deleted"])
    except:
        traceback.print_exc()
    return res

def get_deployment_template_list_n(workspace_id, deployment_template_group_id=None, is_ungrouped_template=0):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT dt.*, dtg.name as deployment_template_group_name, dtg.id as deployment_template_group_id,
            dtg.user_id as deployment_template_group_owner_id, w.name as workspace_name,
            u.name as user_name, bm.name as built_in_model_name_real
            FROM deployment_template dt
            LEFT JOIN deployment_template_group dtg on dtg.id = dt.template_group_id
            LEFT JOIN workspace w on w.id = dt.workspace_id
            LEFT JOIN user u on u.id = dt.user_id
            LEFT JOIN built_in_model bm on bm.id = json_value(dt.template,'$.built_in_model_id')
            WHERE dt.workspace_id = {} AND dt.is_deleted = 0
            """.format(workspace_id)
            if deployment_template_group_id != None:
                sql += " AND dtg.id={}".format(deployment_template_group_id)
            elif is_ungrouped_template==1:
                sql += " AND dtg.name is NULL"
            sql += " ORDER BY dt.create_datetime DESC"
            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res, key_list=["template", "item_deleted"])
    except:
        traceback.print_exc()
    return res


def get_deployment_templates(deployment_template_ids):
    res = None
    try:
        deployment_template_ids=','.join(deployment_template_ids)
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT * FROM deployment_template 
            WHERE id in ({})
            """.format(deployment_template_ids)
            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res, key_list=["template"])
    except:
        traceback.print_exc()
    return res

def get_deployment_template_group_list(workspace_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT dtg.id, dtg.name as deployment_template_group_name, dtg.description as deployment_template_group_description,
            dtg.user_id, u.name as user_name, dtg.create_datetime 
            FROM deployment_template_group dtg
            LEFT JOIN user u ON u.id=dtg.user_id 
            WHERE workspace_id = {}
            ORDER BY dtg.create_datetime DESC
            """.format(workspace_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

# 템플릿 전체 리스트
def get_deployment_template_list_back(workspace_id, deployment_template_group_id=None, is_ungrouped_template=0):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT dt.id, dt.name AS deployment_template_name, dt.description AS deployment_template_description, 
            dtg.name AS deployment_template_group_name, dtg.description AS deployment_template_group_description,
            dt.template AS deployment_template, dt.user_id, u.name as user_name, dt.create_datetime
            FROM deployment_template dt
            LEFT JOIN deployment_template_group dtg ON dtg.id=dt.template_group_id
            LEFT JOIN user u ON u.id=dt.user_id 
            WHERE dt.workspace_id = {} AND dt.is_deleted = 0
            """.format(workspace_id)
            if deployment_template_group_id != None:
                sql += " AND dtg.id={}".format(deployment_template_group_id)
            elif is_ungrouped_template==1:
                sql += " AND dtg.name is NULL"
            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res, key_list=["deployment_template"])
    except:
        traceback.print_exc()
    return res

def get_deployment_template_by_name(deployment_template_name, workspace_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT * FROM deployment_template 
            WHERE name LIKE "{}%" AND workspace_id = {} AND is_deleted=0
            """.format(deployment_template_name, workspace_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_deployment_template_group_by_name(deployment_template_group_name, workspace_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT * FROM deployment_template_group 
            WHERE name LIKE "{}%" AND workspace_id = {}
            """.format(deployment_template_group_name, workspace_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_deployment_template_by_unique_key(deployment_template_name, deployment_template_group_id, workspace_id,
                                        deployment_template_id=None):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT * FROM deployment_template 
            WHERE name = '{}' AND workspace_id = {} AND is_deleted = 0
            """.format(deployment_template_name, workspace_id)
            
            if deployment_template_group_id==None:
                sql+=" AND template_group_id IS NULL"
            else:
                sql+=" AND template_group_id = {}".format(deployment_template_group_id)

            if deployment_template_id != None:
                sql+=" AND id != {}".format(deployment_template_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_deployment_template_id(deployment_template_name):
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
                SELECT id as template_id FROM deployment_template
                WHERE name = "{}"
            """.format(deployment_template_name)
            cur.execute(sql)
            res = cur.fetchone()
        return res
    except:
        traceback.print_exc()
    return res
        
def update_deployment_template_delete(deployment_template_ids):
    try:
        deployment_template_ids=','.join(deployment_template_ids)
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            UPDATE deployment_template
            SET is_deleted = 1
            WHERE id in ({})
            """.format(deployment_template_ids)
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_deployment_template(deployment_template_id, deployment_template_name, deployment_template_description,
                                deployment_template_group_id):
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            UPDATE deployment_template
            SET name=%s, description = %s, template_group_id = %s
            WHERE id = %s
            """
            cur.execute(sql, (deployment_template_name, deployment_template_description, 
                            deployment_template_group_id, deployment_template_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_deployment_template_back(deployment_template_id, deployment_template):
    try:
        deployment_template = common.gpu_model_to_dumps(deployment_template)
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            UPDATE deployment_template 
            SET template = '{}'
            WHERE id = {}
            """.format(deployment_template, deployment_template_id)
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def get_deployment_template_delete_list():
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
                SELECT id, name, workspace_id FROM deployment_template
                WHERE (id NOT IN (
                SELECT template_id
                FROM deployment
                WHERE template_id IS NOT NULL
                UNION ALL
                SELECT template_id
                FROM deployment_worker
                WHERE template_id IS NOT NULL
                )) AND (is_deleted=1)
            """
            cur.execute(sql)
            res = cur.fetchall()
        return res
    except:
        traceback.print_exc()
    return res


def delete_deployment_templates(deployment_template_id_list):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                DELETE FROM deployment_template WHERE id in ({})
                """.format(','.join(deployment_template_id_list))
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_deployment_template_groups(deployment_template_group_ids):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                DELETE FROM deployment_template_group WHERE id in ({})
                """.format(','.join(deployment_template_group_ids))
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def insert_deployment_template(workspace_id, deployment_template_name, deployment_template_group_id, 
                            deployment_template_description, deployment_template, user_id, is_deleted):
    try:
        deployment_template = common.gpu_model_to_dumps(deployment_template)
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                INSERT INTO deployment_template
                (workspace_id, name, template_group_id, description, template, user_id, is_deleted)
                VALUES(%s,%s,%s,%s,%s,%s,%s)
            """
            cur.execute(sql,(workspace_id, deployment_template_name, deployment_template_group_id, 
                        deployment_template_description, deployment_template, user_id, is_deleted))
            lastrowid = cur.lastrowid
            conn.commit()
        return {
            'result':True,
            'message':'',
            'id': lastrowid
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'result':False,
            'message':e
        }

def insert_deployment_template_group(workspace_id, deployment_template_group_name, 
                                    deployment_template_group_description, user_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                INSERT INTO deployment_template_group
                (name, description, workspace_id, user_id)
                VALUES(%s,%s,%s,%s)
            """
            cur.execute(sql,(deployment_template_group_name, deployment_template_group_description, workspace_id, user_id))
            lastrowid = cur.lastrowid
            conn.commit()
        return {
            'result':True,
            'message':'',
            'id': lastrowid
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'result':False,
            'message':e
        }

def update_deployment_template_group(deployment_template_group_id, deployment_template_group_name,
                                    deployment_template_group_description):
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
            UPDATE deployment_template_group
            SET name=%s, description = %s
            WHERE id = %s
            """
            cur.execute(sql, (deployment_template_group_name, deployment_template_group_description, 
                                deployment_template_group_id))
            conn.commit()

        return {
            'result':True,
            'message':''
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'result':False,
            'message':e
        }

def get_deployment_template_group(deployment_template_group_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT * FROM deployment_template_group 
            WHERE id = {}
            """.format(deployment_template_group_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_deployment_template_group_by_unique_key(deployment_template_group_name, workspace_id, deployment_template_group_id=None):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql = """
            SELECT * FROM deployment_template_group 
            WHERE name = '{}' AND workspace_id = {}
            """.format(deployment_template_group_name, workspace_id)
            if deployment_template_group_id!=None:
                sql += """
                AND id != {}
                """.format(deployment_template_group_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def update_deployment_template_delete_by_template_group_ids(deployment_template_group_ids):
    deployment_template_group_ids = ",".join(deployment_template_group_ids)
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = """
            UPDATE deployment_template
            SET is_deleted = 1
            WHERE template_group_id IN ({})
            """.format(deployment_template_group_ids)
            cur.execute(sql)
            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        return False

def get_deployment_template_exist(deployment_template, workspace_id, is_deleted):
    res = None
    try:
        deployment_template = common.gpu_model_to_dumps(deployment_template)
        if "'" in deployment_template:
            deployment_template = deployment_template.replace("'",'"')
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT * FROM deployment_template WHERE template = '{}' AND is_deleted = {} AND workspace_id = {}
            """.format(deployment_template, is_deleted, workspace_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

# template 삭제
def get_deployment_type_info(deployment_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT type, training_id, built_in_model_id, checkpoint, checkpoint_id 
            FROM deployment WHERE id={}
            """.format(deployment_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

# template 삭제
def get_deployment_worker_type_info(deployment_worker_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            SELECT d.type, dw.training_id, dw.built_in_model_id, dw.checkpoint, dw.checkpoint_id
            FROM deployment_worker dw
            LEFT JOIN deployment d ON d.id=dw.deployment_id
            WHERE dw.id={}
            """.format(deployment_worker_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_deployment_run_minimum_info(deployment_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT d.name as deployment_name, d.id as deployment_id, d.type as deployment_type, d.api_path,
                d.gpu_count, d.gpu_model, d.training_name, d.run_code, d.user_id,
                w.name as workspace_name, w.id as workspace_id,
                u.name as owner_name, i.name as image
                FROM deployment d
                JOIN workspace w on d.workspace_id = w.id
                JOIN user u ON d.user_id = u.id
                LEFT JOIN image i on i.id = d.docker_image_id
                WHERE d.id = {}
            """.format(deployment_id)
            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
    except:
        traceback.print_exc()
    return res


def get_deployment_worker_run_minimum_info(deployment_worker_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT d.name as deployment_name, d.type as deployment_type, d.api_path,
                dw.id as deployment_worker_id, dw.deployment_id, dw.gpu_count, dw.gpu_model, dw.node_name,
                dw.training_name, dw.run_code, dw.user_id,
                w.name as workspace_name, w.id as workspace_id,
                u.name as owner_name, i.name as image, i.real_name as image_real_name
                FROM deployment_worker dw
                LEFT JOIN deployment d on d.id = dw.deployment_id
                LEFT JOIN workspace w on w.id = d.workspace_id
                LEFT JOIN user u ON dw.user_id = u.id
                LEFT JOIN image i on i.id = dw.docker_image_id
                WHERE dw.id = {}
            """.format(deployment_worker_id)
            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
    except:
        traceback.print_exc()
    return res

# TODO 삭제
def get_deployment_checkpoint_run_info(deployment_id):
    res = None
    try:
        with get_db() as conn:
            
            cur=conn.cursor()
            sql="""
                SELECT d.checkpoint, d.checkpoint_id, d.built_in_model_id,
                c.checkpoint_dir_path, cw.name as checkpoint_workspace_name,
                bm.path as built_in_model_path, bm.name as built_in_model_name,
                bm.deployment_py_command, bm.checkpoint_load_dir_path_parser, 
                bm.checkpoint_load_file_path_parser, bm.deployment_num_of_gpu_parser
                FROM deployment d
                LEFT JOIN built_in_model bm ON bm.id = d.built_in_model_id
                LEFT JOIN checkpoint c ON c.id = d.checkpoint_id
                LEFT JOIN workspace cw ON cw.id = c.workspace_id
                WHERE d.id = {}
            """.format(deployment_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_deployment_worker_checkpoint_run_info(deployment_worker_id):
    res = None
    try:
        with get_db() as conn:
            
            cur=conn.cursor()
            sql="""
                SELECT dw.checkpoint, dw.checkpoint_id, dw.built_in_model_id,
                c.checkpoint_dir_path, cw.name as checkpoint_workspace_name,
                bm.path as built_in_model_path, bm.name as built_in_model_name, 
                bm.deployment_py_command, bm.checkpoint_load_dir_path_parser, 
                bm.checkpoint_load_file_path_parser, bm.deployment_num_of_gpu_parser
                FROM deployment_worker dw
                LEFT JOIN built_in_model bm ON bm.id = dw.built_in_model_id
                LEFT JOIN checkpoint c ON c.id = dw.checkpoint_id
                LEFT JOIN workspace cw ON cw.id = c.workspace_id
                WHERE dw.id = {}
            """.format(deployment_worker_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

# TODO 삭제
def get_deployment_built_in_run_info(deployment_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
                SELECT d.checkpoint, d.built_in_model_id,
                bm.path as built_in_model_path, bm.name as built_in_model_name, 
                bm.deployment_py_command, bm.checkpoint_load_dir_path_parser,
                bm.checkpoint_load_file_path_parser, bm.deployment_num_of_gpu_parser
                FROM deployment d
                LEFT JOIN built_in_model bm ON bm.id = d.built_in_model_id
                WHERE d.id = {}
            """.format(deployment_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_deployment_worker_built_in_run_info(deployment_worker_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
                SELECT dw.checkpoint, dw.built_in_model_id,
                bm.path as built_in_model_path, bm.name as built_in_model_name, 
                bm.deployment_py_command, bm.checkpoint_load_dir_path_parser,
                bm.checkpoint_load_file_path_parser, bm.deployment_num_of_gpu_parser
                FROM deployment_worker dw
                LEFT JOIN built_in_model bm ON bm.id = dw.built_in_model_id
                WHERE dw.id = {}
            """.format(deployment_worker_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

# 템플릿 적용
def get_deployment_pod_run_info(deployment_id):
    res=None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT d.name as deployment_name, d.api_path,
            d.id as deployment_id, dt.template as deployment_template_info,
            d.gpu_count, d.gpu_model, d.workspace_id,
            w.name as workspace_name,
            u.name as owner_name, i.name as docker_image, i.real_name as image_real_name
            FROM deployment d
            JOIN workspace w on w.id = d.workspace_id
            LEFT JOIN user u on u.id = d.user_id
            LEFT JOIN image i on i.id = d.docker_image_id
            LEFT JOIN deployment_template dt on dt.id = d.template_id 
            WHERE d.id={}
            """.format(deployment_id)
            cur.execute(sql)
            res=cur.fetchone()
            res = common.resource_str_column_to_dict(res, key_list=["gpu_model", "deployment_template_info"])
    except:
        traceback.print_exc()
    return res

# 템플릿 적용
def get_deployment_worker_pod_run_info(deployment_worker_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT d.name as deployment_name, d.api_path,
            dw.id as deployment_worker_id, dw.deployment_id, 
            dt.template as deployment_template_info,
            dw.gpu_count, dw.gpu_model, dw.node_name,
            w.name as workspace_name, w.id as workspace_id,
            u.name as owner_name, i.name as docker_image, i.real_name as image_real_name
            FROM deployment_worker dw
            JOIN deployment d on d.id = dw.deployment_id
            JOIN workspace w on w.id = d.workspace_id
            LEFT JOIN user u on dw.user_id = u.id
            LEFT JOIN image i on i.id = dw.docker_image_id
            LEFT JOIN deployment_template dt on dt.id = dw.template_id
            WHERE dw.id = {}
            """.format(deployment_worker_id)
            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res, key_list=["gpu_model", "deployment_template_info", "node_name"])
    except:
        traceback.print_exc()
    return res

def get_deployment_worker_built_in_pod_run_info(built_in_model_id):
    res = None
    try:
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
                SELECT bm.deployment_py_command, bm.path as built_in_model_path, 
                bm.checkpoint_load_dir_path_parser, bm.name as built_in_model_name,
                bm.checkpoint_load_file_path_parser, bm.deployment_num_of_gpu_parser
                FROM built_in_model bm
                WHERE bm.id = {}
            """.format(built_in_model_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_deployment_name_info(deployment_id):
    res=None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT d.name as deployment_name, w.name as workspace_name
                FROM deployment d
                JOIN workspace w on w.id = d.workspace_id
                WHERE d.id = {}
            """.format(deployment_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

def get_deployment_worker_name_info(deployment_worker_id):
    res=None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT d.name as deployment_name, w.name as workspace_name
                FROM deployment_worker dw
                JOIN deployment d on d.id = dw.deployment_id
                JOIN workspace w on w.id = d.workspace_id
                WHERE dw.id = {}
            """.format(deployment_worker_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res

# TODO 삭제 예정
def get_deployment_worker_with_info(deployment_worker_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            # print("INFO TYPE", get_deployment_worker(deployment_worker_id=deployment_worker_id).get("type"))
            if get_deployment_worker(deployment_worker_id=deployment_worker_id).get("type") =="custom":
                
                sql = """
                    SELECT d.name as deployment_name, d.id as deployment_id, d.type as deployment_type,
                    dw.gpu_count, dw.gpu_model, dw.run_code, dw.checkpoint, dw.checkpoint_id, d.operating_type,
                    w.name as workspace_name, w.id as workspace_id, t.name as training_name,
                    u.name as owner_name, i.real_name as image,
                    c.checkpoint_dir_path, cw.name as checkpoint_workspace_name
                    FROM deployment_worker dw
                    LEFT JOIN deployment d on d.id = dw.deployment_id
                    LEFT JOIN training t on d.training_id = t.id
                    JOIN workspace w on d.workspace_id = w.id
                    JOIN user u ON dw.user_id = u.id
                    LEFT JOIN image i on i.id = dw.docker_image_id
                    LEFT JOIN checkpoint c ON c.id = dw.checkpoint_id
                    LEFT JOIN workspace cw ON cw.id = c.workspace_id
                    WHERE dw.id = {}
                """.format(deployment_worker_id)
            else:
                sql = """
                    SELECT d.name as deployment_name, d.id as deployment_id, d.type as deployment_type,
                    dw.built_in_model_id,
                    dw.gpu_count, dw.gpu_model, dw.checkpoint, dw.checkpoint_id, d.operating_type,
                    w.name as workspace_name, w.id as workspace_id, t.name as training_name,
                    u.name as owner_name, i.real_name as image,
                    bm.path as built_in_model_path, bm.deployment_py_command, bm.checkpoint_load_dir_path_parser, bm.checkpoint_load_file_path_parser,
                    bm.deployment_num_of_gpu_parser,
                    c.checkpoint_dir_path, cw.name as checkpoint_workspace_name
                    FROM deployment_worker dw
                    LEFT JOIN deployment d on d.id = dw.deployment_id
                    LEFT JOIN training t on dw.training_id = t.id
                    JOIN workspace w on d.workspace_id = w.id
                    JOIN user u ON dw.user_id = u.id
                    LEFT JOIN image i on i.id = dw.docker_image_id
                    LEFT JOIN built_in_model bm ON bm.id = dw.built_in_model_id
                    LEFT JOIN checkpoint c ON c.id = dw.checkpoint_id
                    LEFT JOIN workspace cw ON cw.id = c.workspace_id
                    WHERE dw.id = {}
                """.format(deployment_worker_id)
            cur.execute(sql)
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
    except:
        traceback.print_exc()
    return res

# template 삭제
def insert_deployment_worker_o(deployment_id, description, training_id, training_name, built_in_model_id, job_id,
                run_code, checkpoint, checkpoint_id, gpu_count, gpu_model, node_mode, node_name,
                docker_image_id, token, user_id, executor_id, configurations=""):
    try:
        gpu_model = common.gpu_model_to_dumps(gpu_model)
        node_name = common.gpu_model_to_dumps(node_name)
        with get_db() as conn:
            cur = conn.cursor()

            # sql = """
            #     INSERT INTO deployment_worker 
            #     (deployment_id, description, training_id, training_name, built_in_model_id, job_id,
            #      run_code, checkpoint, checkpoint_id, gpu_count, gpu_model, node_mode, node_name,
            #      docker_image_id, token, user_id, executor_id)       
            #     VALUES 
            #     (%s,%s,%s,%s,%s,%s,
            #     %s,%s,%s,%s,%s,%s,%s,
            #     ,%s,%s,%s,%s)
            # """
            sql = """
                INSERT INTO deployment_worker 
                (deployment_id, description, training_id, training_name, built_in_model_id, job_id,
                run_code, checkpoint, checkpoint_id, gpu_count, gpu_model, node_mode, node_name,
                docker_image_id, token, user_id, executor_id, configurations)       
                VALUES 
                (%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s)
            """

            cur.execute(sql, (deployment_id, description, training_id, training_name, built_in_model_id, job_id,
                            run_code, checkpoint, checkpoint_id, gpu_count, gpu_model, node_mode, node_name,
                            docker_image_id, token, user_id, executor_id, configurations))

            # print((deployment_id, description, training_id, training_name, built_in_model_id, job_id,
            # run_code, checkpoint, checkpoint_id, gpu_count, gpu_model, node_mode, node_name,
            # docker_image_id, token, user_id, executor_id))
            
            # cur.execute(sql, (deployment_id, description, training_id, training_name, built_in_model_id, job_id,
            # run_code, checkpoint, checkpoint_id, gpu_count, gpu_model, node_mode, node_name,
            # docker_image_id, token, user_id, executor_id))
            conn.commit()
        return cur.lastrowid, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

# 템플릿 적용
def insert_deployment_worker(deployment_id, description, template_id, 
                            gpu_count, gpu_model, node_mode, node_name,
                            docker_image_id, token, user_id, executor_id):
    try:
        gpu_model = common.gpu_model_to_dumps(gpu_model)
        node_name = common.gpu_model_to_dumps(node_name)
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                INSERT INTO deployment_worker 
                (deployment_id, description, template_id, gpu_count, gpu_model, node_mode, node_name,
                docker_image_id, token, user_id, executor_id)       
                VALUES 
                (%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,%s)
            """

            cur.execute(sql, (deployment_id, description, template_id, gpu_count, gpu_model, node_mode, node_name,
                            docker_image_id, token, user_id, executor_id))

            conn.commit()
        return cur.lastrowid, ""
    except Exception as e:
        traceback.print_exc()
        return False, e
  

def delete_deployment_worker(deployment_worker_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                DELETE FROM deployment_worker WHERE id = {}
                """.format(deployment_worker_id)
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        # traceback.print_exc()
        return False, e
    return False

def delete_deployment_workers(deployment_worker_id_list):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                DELETE FROM deployment_worker WHERE id in ({})
                """.format(','.join(deployment_worker_id_list))
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        # traceback.print_exc()
        return False, e
    return False

def update_deployment_worker_start_time(deployment_worker_id, executor_id=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = "UPDATE deployment_worker set start_datetime = %s, end_datetime = %s, executor_id = %s where id = %s AND end_datetime IS null "
            cur.execute(sql,(datetime.today().strftime("%Y-%m-%d %H:%M:%S"), None, executor_id, deployment_worker_id,))
            conn.commit()

        insert_unified_record(record_type="deployment",type_id=deployment_worker_id,executor_id=executor_id)

        return True
    except Exception as e:
        traceback.print_exc()
        return False


def update_deployment_worker_end_time(deployment_worker_id, pod_status=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()
            end_datetime = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
            sql = "UPDATE deployment_worker set end_datetime = %s, start_datetime = %s where id = %s AND start_datetime IS null"
            cur.execute(sql,(end_datetime, end_datetime, deployment_worker_id,))
            conn.commit()

            sql = "UPDATE deployment_worker set end_datetime = %s where id = %s"
            cur.execute(sql,(datetime.today().strftime("%Y-%m-%d %H:%M:%S"), deployment_worker_id,))
            conn.commit()

        update_record_end_time_unified(record_type="deployment", record_id=deployment_worker_id, end_datetime=end_datetime, pod_status=pod_status)
        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_deployment_worker_description(deployment_worker_id, description):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = "UPDATE deployment_worker set description = %s where id = %s"
            cur.execute(sql,(description, deployment_worker_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def get_user_deployment_bookmark_list(user_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT *
                FROM deployment_bookmark
                WHERE user_id = {}
            """.format(user_id)

            cur.execute(sql)
            res = cur.fetchall()
    except Exception as e:
        traceback.print_exc()
        return []
    return res

def insert_deployment_bookmark(deployment_id, user_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                INSERT INTO deployment_bookmark (deployment_id, user_id)
                VALUES (%s,%s)
            """
            cur.execute(sql, (deployment_id, user_id))
            conn.commit()
        return True, ""
    except pymysql.err.IntegrityError as ie:
        raise DuplicateKeyError("Already bookmarked")
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_deployment_bookmark(deployment_id, user_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                DELETE FROM deployment_bookmark WHERE deployment_id = %s AND user_id = %s
                """
            cur.execute(sql, (deployment_id, user_id))
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e



def update_deployment_api_path(deployment_id, api_path):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT COUNT(id) as count
                FROM deployment
                WHERE api_path = %s and id != %s
            """
            cur.execute(sql, (api_path, deployment_id))
            res = cur.fetchone()
            if res["count"] > 0:
                raise DuplicateKeyError("Duplicated api_path")

            sql = """
                UPDATE deployment
                SET api_path = %s
                WHERE id = %s
            """

            cur.execute(sql, (api_path, deployment_id))
            conn.commit()

        return True, ""
    except pymysql.err.IntegrityError as ie:
        raise
    except Exception as e:
        traceback.print_exc()
        return False, e


def get_deployment_id_from_worker_id(deployment_worker_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT dw.deployment_id
                FROM deployment_worker dw
                WHERE dw.id = {}
            """.format(deployment_worker_id)
            cur.execute(sql)
            res = cur.fetchone()
    except:
        traceback.print_exc()
    return res


def update_deployment_template_id(deployment_id, deployment_template_id):
    try:
        res = None
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            UPDATE deployment
            SET template_id = {}
            WHERE id = {}
            """.format(deployment_template_id, deployment_id)
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def update_deployment_worker_template_id(deployment_worker_id, deployment_template_id):
    try:
        res = None
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            UPDATE deployment_worker
            SET template_id = {}
            WHERE id = {}
            """.format(deployment_template_id, deployment_worker_id)
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e


def update_not_used_template_is_deleted(workspace_id):
    try:
        res = None
        with get_db() as conn:
            cur=conn.cursor()
            sql="""
            UPDATE deployment_template SET is_deleted=1
            WHERE id NOT IN (
            SELECT template_id FROM deployment
            WHERE template_id IS NOT NULL
            UNION ALL
            SELECT template_id FROM deployment_worker
            WHERE template_id IS NOT NULL
            )
            """.format(workspace_id)
            cur.execute(sql)
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def get_deployment_by_template(deployment_template_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT d.id, d.name, d.description,
            d.gpu_count, d.gpu_model,
            d.docker_image_id, d.access, d.api_path, d.user_id
            FROM deployment_template dt
            JOIN deployment d ON dt.id=d.template_id
            WHERE dt.id={}
            """.format(deployment_template_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def get_deployment_worker_by_template(deployment_template_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT dw.id, d.name as deployment_name, 
            dw.gpu_count, dw.gpu_model,
            dw.docker_image_id, d.access, d.api_path, d.user_id, dw.executor_id
            FROM deployment_template dt
            JOIN deployment_worker dw ON dt.id=dw.template_id
            JOIN deployment d ON dw.deployment_id=d.id
            WHERE dt.id={}
            """.format(deployment_template_id)
            cur.execute(sql)
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res
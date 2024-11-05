from utils.db_base import *
from datetime import date, datetime, timedelta
import utils.common  as common

def get_training_only(training_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT t.*
                FROM training t
                WHERE t.id = {}
            """.format(training_id)

            cur.execute(sql)
            res = cur.fetchone()
    except Exception as e:
        traceback.print_exc()
        return None
    return res

def get_user_training_bookmark_list(user_id):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT *
                FROM training_bookmark
                WHERE user_id = {}
            """.format(user_id)

            cur.execute(sql)
            res = cur.fetchall()
    except Exception as e:
        traceback.print_exc()
        return []
    return res

def insert_training_bookmark(training_id, user_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                INSERT INTO training_bookmark (training_id, user_id)
                VALUES (%s,%s)
            """
            cur.execute(sql, (training_id, user_id))
            conn.commit()
        return True, ""
    except pymysql.err.IntegrityError as ie:
        raise DuplicateKeyError("Already bookmarked")
    except Exception as e:
        traceback.print_exc()
        return False, e

def delete_training_bookmark(training_id, user_id):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                DELETE FROM training_bookmark WHERE training_id = %s AND user_id = %s
                """
            cur.execute(sql, (training_id, user_id))
            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def update_training_set_default(training_id, gpu_count, gpu_model, node_mode, node_name, docker_image_id):
    try:
        with get_db() as conn:
            gpu_model = common.gpu_model_to_dumps(gpu_model)
            node_name = common.gpu_model_to_dumps(node_name)
            cur = conn.cursor()

            sql = """
                UPDATE training 
                set gpu_count = %s, gpu_model = %s, node_mode = %s, node_name = %s, docker_image_id = %s
                where id = %s
                """
            cur.execute(sql, (gpu_count, gpu_model, node_mode, node_name, docker_image_id, training_id))

            conn.commit()

        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def get_job_list_by_group_number(training_id, group_number):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT j.id, j.name, j.job_group_index, t.name as training_name,
                w.name as workspace_name
                FROM job j
                LEFT JOIN training t on t.id=j.training_id
                LEFT JOIN workspace w  on t.workspace_id=w.id
                WHERE j.training_id={} AND j.group_number={}
                ORDER BY j.job_group_index
            """.format(training_id, group_number)

            cur.execute(sql)
            res = cur.fetchall()
    except Exception as e:
        traceback.print_exc()
        return None
    return res


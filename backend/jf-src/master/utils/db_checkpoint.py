from utils.db_base import *
from datetime import date, datetime, timedelta

def get_checkpoint(checkpoint_id):
    res = None
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT c.*
                FROM checkpoint c
                WHERE c.id = {}
            """.format(checkpoint_id)

            cur.execute(sql)
            res = cur.fetchone()
    except Exception as e:
        traceback.print_exc()
        return None
    return res

def get_checkpoint_list():
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT c.*
                FROM checkpoint c
            """

            cur.execute(sql)
            res = cur.fetchall()
    except Exception as e:
        traceback.print_exc()
        return res
    return res

def insert_checkpoint(description, built_in_model_id, checkpoint_file_path, checkpoint_dir_path, checkpoint_dir_size, 
                    user_id, access, workspace_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                INSERT INTO checkpoint (description, built_in_model_id, checkpoint_file_path, checkpoint_dir_path, checkpoint_dir_size, 
                user_id, access, workspace_id)
                VALUES (%s,%s,%s,%s,%s,
                %s,%s,%s)
            """
            cur.execute(sql, (description, built_in_model_id, checkpoint_file_path, checkpoint_dir_path, checkpoint_dir_size,
            user_id, access, workspace_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e
    return True, ""

def update_checkpoint_size(checkpoint_id, checkpoint_dir_size):
    try:
        with get_db() as conn:
            cur = conn.cursor()

           
            sql = "UPDATE checkpoint set checkpoint_dir_size = %s where id = %s"
            cur.execute(sql, (checkpoint_dir_size, checkpoint_id))
            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e
    return True, ""
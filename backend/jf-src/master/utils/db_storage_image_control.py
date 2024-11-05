from utils.db_base import *
from datetime import date, datetime, timedelta


def insert_storage_image_control(workspace_id, size=None, storage_id=None, status=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = "INSERT into storage_image_control (workspace_id, size, storage_id, status) values (%s,%s,%s,%s)"
            cur.execute(sql, (workspace_id, size, storage_id, status))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return None
    return res

def get_storage_allocation_size(storage_id ):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT storage_id,
                cast(sum(size) as int) As allocate_size
                FROM storage_image_control
            """

            if storage_id is not None:
                storage_id =str(storage_id)
                sql += " where storage_id in ({}) ".format(storage_id)
            

            cur.execute(sql)
            res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
        return []
    return res


def get_storage_image_control(workspace_id = None):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT *
                FROM storage_image_control
            """

            if workspace_id is not None:
                workspace_id =str(workspace_id)
                sql += " where workspace_id in ({}) ".format(workspace_id)
            

            cur.execute(sql)
            res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
        return []
    return res

def get_storage_image_control_list(storage_id = None):
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT *
                FROM storage_image_control
            """
            if storage_id is not None:
                storage_id =str(storage_id)
                sql += " where storage_id in ({}) ".format(storage_id)

            cur.execute(sql)
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
        return []
    return res


def update_storage_image_control(workspace_id, storage_id, size=None,  status=None):
    try:
        func_arg = locals()

        workspace_id = func_arg.pop('workspace_id')
        keys = []
        values = []
        for k, v in func_arg.items():
            if v is not None and v is not '':
                keys.append(k)
                values.append(v)

        with get_db() as conn:
            cur = conn.cursor()

            sql = "UPDATE storage_image_control set " + ", ".join([key + " = %s" for key in keys]) + " where workspace_id = %s"
            values.append(workspace_id)

            cur.execute(sql, values)

            cur.fetchone()
            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        return False, e
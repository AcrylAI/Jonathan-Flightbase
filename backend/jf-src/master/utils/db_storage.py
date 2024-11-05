from utils.db_base import *
from datetime import date, datetime, timedelta


def insert_storage(physical_name, logical_name, size, fstype, description = None, active=0, create_lock=1, share=0,id=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """INSERT into storage (physical_name, logical_name, size, fstype, description, active, create_lock, share, id) values (%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            cur.execute(sql, (physical_name, logical_name, size, fstype, description, active, create_lock, share, id))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return None
    return res

# TODO storage 수정 - storage 단일 조회와 목록 조회 구분 필요 (2022-10-28 Yeobie)
def get_storage(id=None, physical_name=None, logical_name=None):
    #res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT *
                FROM storage
            """
            
            if id is not None:
                sql += "and " if "where" in sql else " where "
                sql += " id in ({}) ".format(str(id))

            if physical_name is not None:
                sql += "and " if "where" in sql else " where "
                sql += " physical_name in ('{}') ".format(physical_name)

            if logical_name is not None:
                sql += "and " if "where" in sql else " where "
                sql += " logical_name in ('{}') ".format(logical_name)

            
            
            
            cur.execute(sql)
            res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
        return None
    return res


def get_storage_list():
    res = []
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT *
                FROM storage
            """
            
            cur.execute(sql)
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
        return None
    return res


def update_storage(id, logical_name=None, description=None, active=None, create_lock=None, share=None):
    try:
        func_arg = locals()

        id = func_arg.pop('id')
        keys = []
        values = []
        for k, v in func_arg.items():
            if v is not None and v is not '':
                keys.append(k)
                values.append(v)

        with get_db() as conn:
            cur = conn.cursor()

            sql = "UPDATE storage set " + ", ".join([key + " = %s" for key in keys]) + " where id = %s"
            values.append(id)
            cur.execute(sql, values)

            cur.fetchone()
            conn.commit()
        return True
    except Exception as e:
        traceback.print_exc()
        return False, e
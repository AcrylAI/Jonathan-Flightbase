from utils.db_base import *
import utils.common  as common
from datetime import date, datetime, timedelta
import json



def get_training_tool_port_list(training_tool_id):
    res = []
    try:
        with get_db() as conn:

            cur = conn.cursor()
            sql = "SELECT tp.* from training_port tp where tp.training_tool_id = %s"
            cur.execute(sql, (training_tool_id,))
            res = cur.fetchall()
    except:
        traceback.print_exc()
    return res

def insert_training_tool_port(training_tool_id, name, target_port, node_port, protocol, description, system_definition, service_type, status, training_port_id=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()
            if service_type is None:
                service_type = KUBE_SERVICE_TYPE[0]
            if system_definition is None:
                system_definition = 0
            if status is None:
                status = 1
            # sql = """
            #     INSERT ignore INTO training_port 
            #     (training_id, training_tool_id, name, target_port, protocol, description, system_definition, service_type, status)
            #     VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
            # """
            # cur.execute(sql, (training_id, training_tool_id, name, target_port, protocol, description, system_definition, service_type, status))
            if training_port_id is None:
                sql = """
                    INSERT ignore INTO training_port 
                    (training_id, training_tool_id, name, target_port, node_port, protocol, description, system_definition, service_type, status)
                    VALUES ((SELECT training_id FROM training_tool WHERE id = %s),%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """
                print(sql, (training_tool_id, training_tool_id, name, target_port, protocol, description, system_definition, service_type, status))
                cur.execute(sql, (training_tool_id, training_tool_id, name, target_port, node_port, protocol, description, system_definition, service_type, status))
            else:
                sql = """
                    INSERT ignore INTO training_port 
                    (id, training_id, training_tool_id, name, target_port, node_port, protocol, description, system_definition, service_type, status)
                    VALUES (%s, (SELECT training_id FROM training_tool WHERE id = %s),%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """
                print(sql, (training_port_id, training_tool_id, training_tool_id, name, target_port, protocol, description, system_definition, service_type, status))
                cur.execute(sql, (training_port_id, training_tool_id, training_tool_id, name, target_port, node_port, protocol, description, system_definition, service_type, status))

            conn.commit()
        return True, ""
    except Exception as e:
        traceback.print_exc()
        return False, e

def insert_training_tool_port_list(port_list):
    # [
    #     (training_id, training_tool_id, name, target_port, node_port, protocol, description, system_definition, service_type, status),
    #     (training_id, training_tool_id, name, target_port, node_port, protocol, description, system_definition, service_type, status)
    # ]
    with get_db() as conn:
        try:
            cur = conn.cursor()

            rows = port_list
            sql = """
                INSERT ignore INTO training_port 
                (training_id, training_tool_id, name, target_port, node_port, protocol, description, system_definition, service_type, status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """
            cur.executemany(sql, rows)
            conn.commit()

        except pymysql.err.IntegrityError:
            pass
        except :
            traceback.print_exc()

def delete_training_tool_port(training_port_id=None, training_tool_id=None):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            if training_port_id is not None:
                sql = """
                    DELETE FROM training_port WHERE id = {}
                    """.format(training_port_id)
            elif training_tool_id is not None:
                sql = """
                    DELETE FROM training_port WHERE training_tool_id = {}
                    """.format(training_tool_id)
            print(sql)
            cur.execute(sql)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False
    return False

def update_training_tool_port(training_port_id, name,
                            target_port, node_port, protocol, description, system_definition, service_type, status):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE training_port tp
                SET tp.name = %s, tp.target_port = %s, tp.node_port = %s, tp.protocol = %s, tp.description = %s, status = %s
                WHERE id = %s
            """
            print(sql,(name, target_port, node_port, protocol, description, status,
                            training_port_id))
            cur.execute(sql,(name, target_port, node_port, protocol, description, status,
                            training_port_id))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False

def update_training_tool_port_empty_node_port(training_tool_id, name, node_port):
    try:
        with get_db() as conn:

            cur = conn.cursor()

            sql = """
                UPDATE training_port tp
                SET tp.node_port = %s
                WHERE tp.training_tool_id = %s AND tp.name = %s
            """
            cur.execute(sql,(node_port, training_tool_id, name))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        return False
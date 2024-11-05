from utils.db_base import *
import utils.common as common
import traceback
import os.path
import sys
sys.path.insert(0, os.path.abspath('..'))
from TYPE import *
from utils.exceptions import *

def get_network_group_list():
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ng.*
                FROM network_group ng
            """
            cur.execute(sql)
            res = cur.fetchall()

        return res
    except Exception as e:
        raise e

def get_network_group(network_group_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ng.*
                FROM network_group ng
                WHERE ng.id = %s
            """
            cur.execute(sql, (network_group_id, ))
            res = cur.fetchone()

        return res
    except Exception as e:
        raise e

def get_network_group_node_interface_list(network_group_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ngni.*, n.ip AS node_ip, n.name AS node_name
                FROM network_group_node_interface ngni
                LEFT JOIN node n ON n.id = ngni.node_id
                WHERE ngni.network_group_id = {}
            """.format(network_group_id)
            cur.execute(sql)
            res = cur.fetchall()
        return res
    except Exception as e:
        raise e

def get_network_group_and_interface_list_by_node_id(node_id):
    # TODO pod_interface 부분 변경 필요 - 작업 완료 테스트 중
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ng.*, ngci.interface as container_interface, ngni.interface as node_interface
                FROM network_group AS ng
                LEFT JOIN network_group_node_interface AS ngni ON ngni.network_group_id = ng.id
                LEFT JOIN node AS n ON n.id = ngni.node_id 
                LEFT JOIN network_group_container_interface AS ngci ON ngci.network_group_id = ng.id AND ngni.port_index = ngci.port_index
                WHERE n.id = {}
            """.format(node_id)
            cur.execute(sql)
            res = cur.fetchall()
        return res        
    except Exception as e:
        raise e

def insert_network_group(name, description, speed, category):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                INSERT INTO network_group (name, description, speed, category)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(sql, (name, description, speed, category))
            conn.commit()
        return True
    except pymysql.err.IntegrityError as ie:
        raise DuplicateKeyError()
    except Exception as e:
        traceback.print_exc()
        raise e

def get_network_group_node_interface(network_group_id, node_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ngni.*
                FROM network_group_node_interface ngni
                WHERE network_group_id = %s and node_id = %s
            """
            cur.execute(sql, (network_group_id, node_id))
            res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
        raise e


def insert_network_group_node_interface(network_group_id, node_id, interface):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                INSERT INTO network_group_node_interface (network_group_id, node_id, interface, port_index)
                VALUES (%s, %s, %s, IFNULL((
                    SELECT COUNT(*)
                    FROM network_group_node_interface ngni
                    WHERE network_group_id = %s and node_id = %s) + 1, 1)
                )
            """
            cur.execute(sql, (network_group_id, node_id, interface, network_group_id, node_id))
            conn.commit()
        return True
    except pymysql.err.IntegrityError as ie:
        raise DuplicateKeyError()
    except Exception as e:
        traceback.print_exc()
        raise e

def update_network_group_node_interface(interface, network_group_node_interface_id=None, network_group_id=None, node_id=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            
            sql = """
                UPDATE network_group_node_interface
                SET interface = %s
            """
            if network_group_node_interface_id is not None:
                sql += " WHERE id = %s "
                cur.execute(sql, (interface, network_group_node_interface_id))
            else:
                sql += " WHERE network_group_id = %s and node_id = %s "
                cur.execute(sql, (interface, network_group_id, node_id))
            conn.commit()
        return True
    except Exception as e:
        raise e

def update_network_group_node_interface_port_index(port_index, network_group_node_interface_id=None, network_group_id=None, node_id=None, interface=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            
            sql = """
                UPDATE network_group_node_interface
                SET port_index = %s
            """
            if network_group_node_interface_id is not None:
                sql += " WHERE id = %s "
                cur.execute(sql, (port_index, network_group_node_interface_id))
            else:
                sql += " WHERE network_group_id = %s and node_id = %s "
                cur.execute(sql, (port_index, network_group_id, node_id, interface))
            conn.commit()
        return True
    except Exception as e:
        raise e

def delete_network_group_node_interface(network_group_node_interface_id=None, network_group_id=None, node_id=None, interface=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            
            sql = """
                DELETE 
                FROM network_group_node_interface
            """
            if network_group_node_interface_id is not None:
                sql += " WHERE id = %s "
                cur.execute(sql, (network_group_node_interface_id, ))
            elif network_group_id is not None and node_id is not None and interface is None:
                # TODO Node Interface Key와 연동용으로 존재. Node에서 Key 삭제 시 제거할 수 있음 (2023-01-04 Yeobie)
                sql += " WHERE network_group_id = %s and node_id = %s"
                cur.execute(sql, (network_group_id, node_id, ))
            else:
                sql += " WHERE network_group_id = %s and node_id = %s and  interface = %s"
                cur.execute(sql, (network_group_id, node_id, interface))

            conn.commit()

        return True
    except Exception as e:
        raise e


def get_network_group_cni_list_for_nad():
    # TODO pod_interface 부분 변경 필요 - 작업 완료 테스트 중
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ngcni.network_group_id, ngcni.cni_config, ngci.interface as container_interface, ngci.id as container_interface_id,
                    ng.name AS network_group_name, ng.category AS network_group_category, 
                    n.ip AS node_ip, n.name AS node_name, n.id AS node_id,
                    ngni.interface as node_interface
                FROM network_group_cni ngcni
                LEFT JOIN network_group ng ON ng.id = ngcni.network_group_id
                INNER JOIN network_group_node_interface ngni ON ngni.network_group_id = ngcni.network_group_id
                LEFT JOIN node n ON n.id = ngni.node_id
                LEFT JOIN network_group_container_interface ngci ON ngci.network_group_id = ng.id AND ngci.port_index = ngni.port_index
            """
            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res)
        return res
    except Exception as e:
        raise e

def insert_network_group_cni(network_group_id, cni_config):
    try:
        cni_config = common.gpu_model_to_dumps(cni_config)
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                INSERT INTO network_group_cni (network_group_id, cni_config)
                VALUES (%s, %s)
            """
            cur.execute(sql, (network_group_id, cni_config))
            conn.commit()
        return True
    except Exception as e:
        raise e

def update_network_group_cni(network_group_id, cni_config):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            cni_config = json.dumps(cni_config)
            sql = """
                UPDATE network_group_cni
                SET cni_config = %s
                WHERE network_group_id = %s
            """
            cur.execute(sql, (cni_config, network_group_id))
            conn.commit()
        return True
    except Exception as e:
        raise e

def get_network_group_container_interface_list(network_group_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT *
                FROM network_group_container_interface AS ngci
                WHERE ngci.network_group_id = %s
            """
            cur.execute(sql, (network_group_id,))
            res = cur.fetchall()
            return res
    except Exception as e:
        raise e
# TODO
# duplicate error 추가
def insert_network_group_container_interface(network_group_id, port_index, interface):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                INSERT INTO network_group_container_interface (network_group_id, port_index, interface)
                VALUES (%s, %s, %s)
            """
            cur.execute(sql, (network_group_id, port_index, interface))
            conn.commit()

        return True
    except pymysql.err.IntegrityError as ie:
        traceback.print_exc()
        raise ie
    except Exception as e:
        traceback.print_exc()
        raise e

###################################################################################

def get_network_group_container_interface_port_for_check(network_group_id, port_index):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT *
                FROM network_group_container_interface
                WHERE network_group_id = %s and port_index = %s
            """
            cur.execute(sql, (network_group_id, port_index))
            res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
        raise e

def get_network_group_by_name(name : str):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT *
                FROM network_group
                WHERE name = %s
            """
            cur.execute(sql, (name,))
            res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
        raise e

def get_network_group_cni_by_network_group_id(network_group_id : int):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ngcni.* 
                FROM network_group_cni ngcni
                WHERE network_group_id = %s
            """
            cur.execute(sql, (network_group_id,))
            res = cur.fetchone()
            res = common.resource_str_column_to_dict(res)
        return res
    except Exception as e:
        raise e

def get_network_group_container_duplicate_check(interface : str, network_group_id : int):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT *
                FROM network_group_container_interface
                WHERE interface = %s and network_group_id != %s
            """
            cur.execute(sql, (interface, network_group_id))
            res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
        raise e

def update_network_group(network_group_id : int, name : str, description : str, speed : float):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            
            sql = """
                UPDATE network_group
                SET name = %s, description = %s, speed = %s
                WHERE id = %s
            """
            cur.execute(sql, (name, description, speed, network_group_id))
            conn.commit()
        return True
    except Exception as e:
        raise e

def delete_network_group_by_group_id(network_group_id : int = None, network_group_id_list : list = [], many : bool = False):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            
            sql = """
                DELETE 
                FROM network_group
                WHERE id = %s
            """
            if many:
                cur.executemany(sql, network_group_id_list)
            else:
                cur.execute(sql, (network_group_id,))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        raise e


def get_network_group_node_interface_list_for_dual_port(network_group_id, node_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ngni.*
                FROM network_group_node_interface ngni
                WHERE network_group_id = %s and node_id = %s
            """
            cur.execute(sql, (network_group_id, node_id))
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
        raise e

def delete_network_group_container_interface(network_group_container_interface_id : int, container_interface_id_list : list = [], many : bool = False):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            
            sql = """
                DELETE 
                FROM network_group_container_interface
                WHERE id = %s
            """
            if many:
                cur.executemany(sql, container_interface_id_list)
            else:
                cur.execute(sql, (network_group_container_interface_id, ))
            conn.commit()

        return True
    except Exception as e:
        traceback.print_exc()
        raise e

def update_network_group_container_interface(network_group_container_interface_id : int, interface : str, port_index : int = None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            list_ = []
            sql = """
                UPDATE network_group_container_interface
                SET interface = %s
            """
            list_ += [interface]
            if port_index:
                sql +="""
                , port_index = %s
                """
                list_ += [port_index]
            sql += """
            WHERE id = %s
            """
            list_ += [network_group_container_interface_id]
            cur.execute(sql, list_)
            conn.commit()
        return True
    except pymysql.err.IntegrityError as ie:
        traceback.print_exc()
        raise NetworkGroupContainerInterfaceDuplicateError
    except Exception as e:
        traceback.print_exc()
        raise e

def get_network_group_cni_list():
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT *
                FROM network_group_cni
            """
            cur.execute(sql)
            res = cur.fetchall()
            res = common.resource_str_column_to_dict(res)
        return res
    except Exception as e:
        traceback.print_exc()
        raise e


def get_network_group_list_group_by_node_id(node_id):
    try:
        with get_db() as conn:
            cur = conn.cursor()

            sql = """
                SELECT ng.*
                FROM network_group AS ng
                LEFT JOIN network_group_node_interface AS ngni ON ngni.network_group_id = ng.id
                LEFT JOIN node AS n ON n.id = ngni.node_id
                WHERE n.id = {}
                GROUP BY ng.id
            """.format(node_id)
            cur.execute(sql)
            res = cur.fetchall()
        return res        
    except Exception as e:
        raise e
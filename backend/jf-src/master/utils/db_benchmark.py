from datetime import datetime

from utils.db_base import *
from utils.exceptions import *

# network
def get_cell_network_group_record_list(client_node_id : int, server_node_id : int, interface : bool = True):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT DISTINCT 
            network_group_id as id, 
            network_group_name as name
            """
            if interface:
                sql += """
                ,client_node_interface,
                server_node_interface
                """
            sql += """
            FROM benchmark_node_network_speed
            WHERE client_node_id = %s AND server_node_id = %s
            """
            cur.execute(sql,(client_node_id, server_node_id))
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
    return res

def get_network_group_list_by_node_id(node_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT ng.id, ng.name, ngni.interface
            FROM network_group ng
            LEFT JOIN network_group_node_interface ngni
            ON ng.id=ngni.network_group_id
            WHERE ngni.node_id = %s
            ORDER BY ng.id
            """
            cur.execute(sql,(node_id))
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
    return res

# def get_network_group_node_interface_by_node_id(node_id):
#     try:
#         res = None
#         with get_db() as conn:
#             cur = conn.cursor()
#             sql = """
#             SELECT * FROM network_group_node_interface WHERE node_id = %s
#             """
#             cur.execute(sql,(node_id))
#             res = cur.fetchall()
#         return res
#     except Exception as e:
#         traceback.print_exc()
#     return res

# def get_network_group_list():
#     try:
#         res = None
#         with get_db() as conn:
#             cur = conn.cursor()
#             sql = """
#             SELECT * FROM network_group
#             """
#             cur.execute(sql)
#             res = cur.fetchall()
#         return res
#     except Exception as e:
#         traceback.print_exc()
#     return res

def get_network_group_node_interface_intersection_list(client_node_id : int, server_node_id : int):
    """
    두 노드가 모두 속해있는 network group interface 추출
    """
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            SELECT 
            c.network_group_id ,
            (SELECT name FROM network_group WHERE id = c.network_group_id) as network_group_name,
            (SELECT category FROM network_group WHERE id = c.network_group_id) as network_group_category,
            c.node_id as client_node_id,
            c.interface as client_interface_name,
            s.node_id as server_node_id,
            s.interface as server_interface_name
            FROM network_group_node_interface c INNER JOIN network_group_node_interface s
            ON c.network_group_id = s.network_group_id 
            WHERE c.node_id = %s and s.node_id = %s 
            """
            cur.execute(sql, (client_node_id, server_node_id))
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
    return res

#TODO
# category 추가해야하는지 고민
def insert_benchmark_node_network(client_node_id, server_node_id, network_group_id, network_group_name, client_interface_name, 
                                            server_interface_name, start_datetime, error_message=None, ethernet_json_data=None, infiniband_data=None, network_group_category=None):
    try:
        with get_db() as conn:
            end_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            list_ = [client_node_id, server_node_id, network_group_id, network_group_name, client_interface_name, server_interface_name, start_datetime, end_datetime]
            sql = """INSERT INTO benchmark_node_network_speed(
                client_node_id,
                server_node_id,
                network_group_id,
                network_group_name,
                client_node_interface,
                server_node_interface,
                start_datetime,
                end_datetime,
                """
            if ethernet_json_data:
                client_node_ip = ethernet_json_data["start"]["connected"][0]["local_host"]
                server_node_ip = ethernet_json_data["start"]["connected"][0]["remote_host"]
                sender_bandwidth = ethernet_json_data["end"]["sum_sent"]["bits_per_second"]
                receiver_bandwidth = ethernet_json_data["end"]["sum_received"]["bits_per_second"]
                list_ += [client_node_ip, server_node_ip, sender_bandwidth, receiver_bandwidth]
                sql +="""
                client_node_ip,
                server_node_ip,
                sender_bandwidth,
                receiver_bandwidth
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """
            if infiniband_data:
                client_node_ip = infiniband_data["client_node_ip"]
                server_node_ip = infiniband_data["server_node_ip"]
                sender_bandwidth = infiniband_data["bandwidth"]
                receiver_bandwidth = infiniband_data["bandwidth"]
                list_ += [client_node_ip, server_node_ip, sender_bandwidth, receiver_bandwidth]
                sql +="""
                client_node_ip,
                server_node_ip,
                sender_bandwidth,
                receiver_bandwidth
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """
                pass
            if error_message:
                list_ += [error_message]
                sql +="""
                error_message
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                """
            cur = conn.cursor()
            cur.execute(sql, list_)
            conn.commit()
        return True, ""
    except Exception as e:
        print(e)
        traceback.print_exc()
        return False, e

def get_benchmark_network_latest_start_time(client_node_id, server_node_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = "SELECT MAX(start_datetime) as start_datetime FROM benchmark_node_network_speed WHERE client_node_id = %s AND server_node_id = %s"
            cur.execute(sql, (client_node_id, server_node_id))
            res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
    return res

def get_benchmark_network_csv_list_by_client_id_and_server_id(client_node_id, server_node_id, start_datetime=None, reversed=False, order_by_reversed=False):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            list_ = []
            sql = """
                SELECT 
                    start_datetime,
                    network_group_name,
                """
            if reversed:
                sql +="""
                (SELECT name FROM node WHERE id=server_node_id) as client_node_name,
                (SELECT name FROM node WHERE id=client_node_id) as server_node_name,
                sender_bandwidth as bandwidth,
                server_node_interface as client_node_interface,
                client_node_interface as server_node_interface,
                """
            else:
                sql +="""
                (SELECT name FROM node WHERE id=client_node_id) as client_node_name,
                (SELECT name FROM node WHERE id=server_node_id) as server_node_name,
                receiver_bandwidth as bandwidth,
                client_node_interface,
                server_node_interface,
                """
            sql += """
            error_message
            FROM benchmark_node_network_speed
            WHERE client_node_id = %s AND server_node_id = %s
            """
            list_ += [client_node_id, server_node_id]
            if start_datetime:
                sql +="""
                AND start_datetime = %s
                """
                list_ += [start_datetime]
            if order_by_reversed:
                sql +="""
                ORDER BY start_datetime DESC 
                """

            cur.execute(sql, list_)
            res = cur.fetchall()
        return res
    except Exception as e:
        traceback.print_exc()
    return res

def get_benchmark_network_by_list_client_id_and_server_id(client_node_id, server_node_id, network_group_id=None, \
    reversed=False, client_node_interface=None, server_node_interface=None, start_datetime=None, order_by_reversed=False, all=True):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            list_ = []
            sql = """
                SELECT 
                    client_node_id,
                    server_node_id,
                    network_group_id,
                    network_group_name,
                    client_node_ip,
                    server_node_ip,
                    receiver_bandwidth,
                    sender_bandwidth,
                    error_message,
                    start_datetime,
                """
            if reversed:
                sql +="""
                client_node_interface as server_node_interface,
                server_node_interface as client_node_interface
                """
            else:
                sql +="""
                client_node_interface,
                server_node_interface
                """
            sql += """
            FROM benchmark_node_network_speed
            WHERE client_node_id = %s AND server_node_id = %s
            """
            list_ += [client_node_id, server_node_id]
            if network_group_id:
                sql += """ 
                AND network_group_id = %s
                """
                list_ += [network_group_id]
            
            if client_node_interface :
                sql +="""
                AND client_node_interface = %s
                """
                list_ +=[client_node_interface]

            if server_node_interface:
                sql +="""
                AND server_node_interface = %s
                """
                list_ +=[server_node_interface]

            if start_datetime:
                sql +="""
                AND start_datetime = %s
                """
                list_ += [start_datetime]
            if order_by_reversed:
                sql +="""
                ORDER BY start_datetime DESC, network_group_id
                """
            cur.execute(sql, list_)
            if all:
                res = cur.fetchall()
            else:
                res = cur.fetchone()
        return res
    except Exception as e:
        traceback.print_exc()
    return res

# storage
def get_benchmark_storage_fio_latest(node_id, storage_id):
    """
    선택한 셀의 가장 최신 데이터
    ---
    # return
        [{'id': 12,
        'node_id': 1,
        'storage_id': 1,
        'read_withbuffer_speed': 19.95,
        'read_withbuffer_iops': 5107.49,
        'read_withoutbuffer_speed': 139.19,
        'read_withoutbuffer_iops': 35631.9,
        'write_withbuffer_speed': 19.99,
        'write_withbuffer_iops': 5117.49,
        'write_withoutbuffer_speed': 127.06,
        'write_withoutbuffer_iops': 32528.1,
        'error_message': ,
        'test_datetime': '2022-11-22 07:27:42'}]
    """
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = \
            """SELECT read_withbuffer_iops, read_withbuffer_speed, read_withoutbuffer_iops, read_withoutbuffer_speed,
            write_withbuffer_iops, write_withbuffer_speed, write_withoutbuffer_iops, write_withoutbuffer_speed, error_message
            FROM benchmark_node_storage_io_speed
            WHERE node_id = {node_id} AND storage_id = {storage_id}
            AND test_datetime = (
                SELECT MAX(test_datetime)
                FROM benchmark_node_storage_io_speed
                WHERE node_id = {node_id} AND storage_id = {storage_id}
            )""".format(node_id=node_id, storage_id=storage_id)

            cur.execute(sql)
            data = cur.fetchall()
            if not data:
                return False
            res = data[0]
        return res
    except Exception as e:
        traceback.print_exc()
        return False

def get_benchmark_storage_fio_cell_history(node_id, storage_id):
    """
    선택한 셀의 history
    ---
    # return
        [{'test_datetime': '2022-12-01 01:52:49',
        'read_withbuffer_iops': 1727.73,
        'read_withbuffer_speed': 6910.0,
        'read_withoutbuffer_iops': 19409.4,
        'read_withoutbuffer_speed': 77637.0,
        'write_withbuffer_iops': 1728.93,
        'write_withbuffer_speed': 6915.0,
        'write_withoutbuffer_iops': 26449.8,
        'write_withoutbuffer_speed': 105799.0
        'error_message': ,},
        {...}, {...}, {...}]
    """
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = \
            """SELECT test_datetime, read_withbuffer_iops, read_withbuffer_speed, read_withoutbuffer_iops, read_withoutbuffer_speed,
            write_withbuffer_iops, write_withbuffer_speed, write_withoutbuffer_iops, write_withoutbuffer_speed, error_message
            FROM benchmark_node_storage_io_speed
            WHERE node_id = {node_id} AND storage_id = {storage_id}""".format(node_id=node_id, storage_id=storage_id)
            cur.execute(sql)
            res = cur.fetchall()
            if not res:
                return False
        return res
    except Exception as e:
        traceback.print_exc()
        return False
    
def insert_benchmark_storage_fio(node_id, storage_id, data=None):
    """node storage_benchmark 데이터 삽입
    # Input
    ---------
    node_id, storage_id, data
    data = {
        'Read-WithBuffer-Rand': {'speed': '26.09', 'iops': '6679.63', 'runtime': '10.00'}, 
        'Write-WithBuffer-Rand': {'speed': '145.17', 'iops': '37162.46', 'runtime': '7.05'},
        'Read-WithoutBuffer-Rand': {'speed': '20.70', 'iops': '5298.67', 'runtime': '10.00'},
        'Write-WithoutBuffer-Rand': {'speed': '139.19', 'iops': '35631.92', 'runtime': '7.36'}
    }

    """
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            INSERT INTO benchmark_node_storage_io_speed (node_id, storage_id,
            read_withbuffer_speed, read_withbuffer_iops,
            read_withoutbuffer_speed, read_withoutbuffer_iops,
            write_withbuffer_speed, write_withbuffer_iops,
            write_withoutbuffer_speed, write_withoutbuffer_iops, test_datetime)
            VALUES"""
            
            sql += \
            """
            ({}, {}, {}, {}, {}, {}, {}, {}, {}, {}, CURRENT_TIMESTAMP()),""".format(
                node_id, storage_id,
                data["Read-WithBuffer-Rand"]["speed"],
                data["Read-WithBuffer-Rand"]["iops"],
                data["Write-WithBuffer-Rand"]["speed"],
                data["Write-WithBuffer-Rand"]["iops"],
                data["Read-WithoutBuffer-Rand"]["speed"],
                data["Read-WithoutBuffer-Rand"]["iops"],
                data["Write-WithoutBuffer-Rand"]["speed"],
                data["Write-WithoutBuffer-Rand"]["iops"]
            )
            sql = sql[:-1] + ";"
            cur.execute(sql)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False

def insert_benchmark_storage_fio_err(node_id, storage_id, err=None):
    try:
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
            INSERT INTO benchmark_node_storage_io_speed (node_id, storage_id, error_message)
            VALUES ({}, {}, "{}")""".format(node_id, storage_id, err)
            cur.execute(sql)
            conn.commit()
        return True
    except:
        traceback.print_exc()
        return False
import subprocess
import traceback
import os
import sys

# from utils.test import elapsed

sys.path.insert(0, os.path.abspath('..'))
from TYPE import *

## 
PROTOCOL_IPV4 = "ipv4"
PROTOCOL_IPV6 = "ipv6"
# NETWORK_GROUP_CATEGORY_INFINIBAND = "Infiniband"
# NETWORK_GROUP_CATEGORY_ETHERNET = "Ethernet"


class NetworkInterfaceNotInfinibandError(Exception):
    pass

class NetworkInterfaceManager:
    """
    Description: Network interface를 사용해 network 정보를 얻는 class
    """

    def __init__(self, interface : str):
        self.interface : str = interface
        self._ip : str = None
        self._category : str = None
        self._pci : str = None
        self._is_virtual_en : bool = None
        self._is_virtual_ib : bool = None
        self._mlx_core_name : str = None
        self._ib_vf_count : int = None


    def get_ip(self, protocol : str = PROTOCOL_IPV4) -> str:
        """
        Description: network interface에 해당하는 ip 검색

        Args:
            protocol (str, optional): protocol. Defaults to PROTOCOL_IPV4.

        Returns:
            str: ip 
        """
        try:
            if self._ip != None:
                return self._ip
            if protocol == PROTOCOL_IPV4:
                cmd = f"ifconfig {self.interface} | grep -w inet | awk -F ' ' '{{print $2}}'"
            elif protocol == PROTOCOL_IPV6:
                cmd = f"ifconfig {self.interface} | grep -w inet6 | awk -F ' ' '{{print $2}}'"
            ip = subprocess.check_output(cmd, shell=True).strip().decode('utf-8')
            self._ip = ip
            return ip
        except subprocess.CalledProcessError as e:
            return ""
        except Exception as e:
            traceback.print_exc()
            raise e
            
    def interface_bandwidth_check(self) -> str:
        """
        Description: interface bandwidth 검사 (현재는 Ethernet인지 Infiniband인지 정도만 검사 가능)

        Returns:
            str: NETWORK_GROUP_CATEGORY_ETHERNET or NETWORK_GROUP_CATEGORY_ETHERNET
        """
        try:
            if self._category:
                return self._category
            self.get_ib_mlx_core_name()
            self._category = NETWORK_GROUP_CATEGORY_INFINIBAND
            return NETWORK_GROUP_CATEGORY_INFINIBAND
        except NetworkInterfaceNotInfinibandError as e:
            self._category = NETWORK_GROUP_CATEGORY_ETHERNET
            return NETWORK_GROUP_CATEGORY_ETHERNET
        except Exception as e:
            pass

    def is_virtual_en(self) -> bool:
        """
        Description: Ethernet interface가 가상인지 확인 

        Returns:
            bool: True -> 가상 interface
        """
        try:
            if self._is_virtual_en != None:
                return self._is_virtual_en
            cmd = "ls -l /sys/class/net | grep -w {} | grep -w virtual".format(self.interface)
            subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT).strip().decode('utf-8')
            self._is_virtual_en = True
            return True
        except subprocess.CalledProcessError as e:
            self._is_virtual_en = False
            return False
        except Exception as e:
            traceback.print_exc()
            raise e

    def get_network_pci(self) -> str:
        """
        Description: network interface의 pci 확인

        Returns:
            str: network pci ex) "17:00.3"
        """
        try:
            if self._pci != None:
                return self._pci
            if self.is_virtual_en():
                return ""
            cmd = f"ls -l /sys/class/net | grep -w {self.interface} | awk -F '/' '{{print $6}}'"
            result = subprocess.check_output(cmd, shell=True).strip().decode('utf-8')
            #PCI가 0000:17:00.0 나오기 떄문에  17:00.0 만 추출
            result_list = result.split(":")
            result_list.pop(0)
            interface_device_id = (":").join(result_list)
            self._pci = interface_device_id
            return interface_device_id
        except subprocess.CalledProcessError as e:
            return ""
        except Exception as e:
            traceback.print_exc()
            raise e

    def get_ib_mlx_core_name(self) -> str:
        """
        Description: Infiniband의 mlx core name 확인

        Raises:
            NetworkInterfaceNotInfiniband: Infiniband interface가 아닌 경우 rase

        Returns:
            str: mlx core name ex)  "mlx5_0"
        """
        try:
            if self._mlx_core_name:
                return self._mlx_core_name
            pci = self.get_network_pci()
            if pci == "":
                raise NetworkInterfaceNotInfinibandError
            cmd = f"ls -l /sys/class/infiniband/ | grep -w {pci} | awk -F '/' '{{print $8}}'"
            mlx_name = subprocess.check_output(cmd, shell=True).strip().decode('utf-8')
            if mlx_name == "":
                raise NetworkInterfaceNotInfinibandError
            self._mlx_core_name = mlx_name
            return mlx_name
        except Exception as e:
            traceback.print_exc()
            raise e

    def is_virtual_ib(self) -> bool:
        """
        Description: Infiniband interface가 가상 interface인지 확인

        Returns:
            bool: True -> 가상 Infiniband
        """
        try:
            if self._is_virtual_ib != None:
                return self._is_virtual_ib
            mlx_core_name = self.get_ib_mlx_core_name()
            path = "/sys/class/infiniband/{}/device/sriov/".format(mlx_core_name)
            if os.path.exists(path):
                self._is_virtual_ib = False
                return False
            self._is_virtual_ib = True
            return True
        except Exception as e:
            traceback.print_exc()
            raise e 

    def get_ib_vf_count(self) -> int:
        """
        Description: 가상 infiniband interface가 몇개인지 확인

        Returns:
            int: 개수 
                 VF일 경우 -1
        """
        try:
            if self._ib_vf_count != None:
                return self._ib_vf_count
            if self.is_virtual_ib() == False:
                mlx_core_name = self.get_ib_mlx_core_name()
                path = "/sys/class/infiniband/{}/device/sriov/".format(mlx_core_name)
                self._ib_vf_count = len(os.listdir(path))
                return self._ib_vf_count
            self._ib_vf_count = -1
            return self._ib_vf_count
        except Exception as e:
            traceback.print_exc()
            raise e
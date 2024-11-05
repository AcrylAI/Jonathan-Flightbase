"""
[Description]
    사용자가 가상 환겨엥서 등록한 Network Interface를 사용하는데 이 때 가상환경 안에서 interface가 가지게 될 네트워크 IP 범위를 정의해줘야 한다.
    (func) get_address_range : interface가 가지게 될 IP 범위를 알려주는 함수
    (func) is_valid_address : 입력한 IP 범위가 총 IP 범위 내에 속하는지 여부를 파악하는 함수
[Created At] 22.12.07
[Modified At] 22.12.09
[Author] Walter
[References]
    https://gist.github.com/vndmtrx/dc412e4d8481053ddef85c678f3323a6
"""
import sys


def get_address_range(ip_address):
    """
        [Description] IP 주소와 prefix (서브넷 마스크의 bit 수)를 받아 가능한 Host IP 범위를 리턴

        [Args]
            ip address (str):  (ex. "192.168.1.1/16)
        [Returns]
            range of Host IP (tuple):  (ex. ('192.168.0.1', '192.168.255.254'))
        [Examples]
            get_address_range(ip_address="192.168.1.1/16")  # ('192.168.0.1', '192.168.255.254')
    """
    ip_address, prefix = ip_address.split('/')
    ip_address = [int(i) for i in ip_address.split('.')]
    prefix = int(prefix)

    # check address format (255 이하)
    for i in ip_address:
        if i > 255:
            print("정확한 ip 주소를 입력해주세요")

    # check prefix
    if not (1 <= prefix <= 32):
        print("정확한 prefix 값을 입력해주세요")

    # get subnet mask, network, broadcast
    mask = [(((1 << 32) - 1) << (32 - prefix) >> i) & 255 for i in reversed(range(0, 32, 8))]  # 16 -> [255, 255, 0, 0]
    network = [ip_address[i] & mask[i] for i in range(4)]  # AND 한 것 [192, 168, 0, 0]
    broadcast = [(ip_address[i] & mask[i]) | (255 ^ mask[i]) for i in range(4)]  # [192, 168, 255, 255]

    # get host address
    start_address, end_address = network, broadcast
    start_address[-1] += 1
    end_address[-1] -= 1

    return '.'.join(map(str, start_address)), '.'.join(map(str, end_address))


def is_valid_address(ip_address, start_address, end_address):
    """
        [Description] ip_address를 받아 최대 range를 구하고, 범위 range를 받아 최대 range 내에 속하는지 판단하는 함수

        [Args]
            ip address (str):  (ex. "192.168.1.1/16")
            start address (str):  (ex. "192.168.0.1")
            end address (str):  (ex. "192.168.255.254")
        [Returns]
            boolean (bool):  (ex. True | False)
        [Examples]
            is_valid_address(ip_address="192.168.1.1/16",
                            start_address="192.168.0.1",
                            end_address="192.168.255.254")  # True
    """
    # IP 주소의 전체 range 반환
    range_start_address, range_end_address = get_address_range(ip_address)

    # 자료형 변환 (str -> int)
    range_start_address = [int(i) for i in range_start_address.split('.')]
    range_end_address = [int(i) for i in range_end_address.split('.')]
    start_address = [int(i) for i in start_address.split('.')]
    end_address = [int(i) for i in end_address.split('.')]

    # start_address 가 end_address 보다 작은가 (ex. 192.168.10.200 - 192.168.20.100)
    for idx in range(4):
        if start_address[idx] < end_address[idx]:
            break
        if start_address[idx] > end_address[idx]:
            return False

    # start, end가 전체 range 안에 있는 값인가
    for idx in range(4):
        if not (range_start_address[idx] <= start_address[idx] and end_address[idx] <= range_end_address[idx]):
            return False

    return True

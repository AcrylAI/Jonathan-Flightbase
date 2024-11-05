import os
import json
import requests
from datetime import datetime
from dateutil import tz
import pathlib
import email.utils

import utils.lic as lic
import settings
from utils import db

#SERVER_LIST = ['https://google.com', 'https://naver.com', 'https://daum.net'] # 
SERVER_LIST = []
LAST_DATETIME_FILE = settings.JF_BIN_DIR + '/data/last'

class InvalidLicenseError(RuntimeError):
    pass

def _load_last_datetime():
    with open(LAST_DATETIME_FILE, 'r') as f:
        data = f.read()
    last_datetime = acryl_dec(data)
    last_datetime = datetime.strptime(last_datetime, '%Y-%m-%d %H:%M:%S')
    return last_datetime

def _save_last_datetime(last_datetime):
    last_datetime = last_datetime.strftime('%Y-%m-%d %H:%M:%S')
    data = acryl_enc(last_datetime)
    with open(LAST_DATETIME_FILE, 'w') as f:
        f.write(data)

def get_current_date():
    local_datetime = datetime.utcnow()
    server_datetime = None
    for server in SERVER_LIST:
        try:
            server_response = requests.get(server)
            server_date_str = server_response.headers['Date']
            server_datetime = datetime(*email.utils.parsedate(server_date_str)[:6])
            break
        except:
            pass


    # TODO load last_datetime from file (decode)
    last_datetime = None

    if server_datetime != None:
        current_datetime = server_datetime

        # TODO update last_datetime to current_datetime in file. (encode)
        if last_datetime!=None and last_datetime>=current_datetime:
            current_datetime = last_datetime # Override last_datetime
    else:
        current_datetime = local_datetime

        if last_datetime == None:
            pass #return False
        elif last_datetime < current_datetime:
            pass # update??
        else:
            current_datetime = last_datetime # Override last_datetime

    from_zone = tz.tzutc()
    to_zone = tz.tzlocal()

    current_datetime = current_datetime.replace(tzinfo=from_zone)
    current_local_datetime = current_datetime.astimezone(to_zone)
    current_local_datestr = current_local_datetime.strftime('%Y%m%d')
    return current_local_datestr


def check_lic_key(lic_key):
    if not lic.is_valid_lic(lic_key):
        raise InvalidLicenseError('Unlicensed GPU has detected.')

    try:
        license = json.loads(lic.decode_lic(lic_key))
        start_date = int(license["start_date"])
        end_date = int(license["end_date"])
    except:
        raise InvalidLicenseError('Broken license. Please contact us.')

    now = int(get_current_date())
    if now < start_date:
        # not yet started
        raise InvalidLicenseError('Invalid license. Start date of the license is future.')
    elif now <= end_date:
        # OK
        return True
    else:
        # expired
        raise InvalidLicenseError('License has expired.')

def load_lic_key(ip):
    lic_key = None
    sql = 'SELECT id, license FROM node WHERE ip=%s'
    rows = db.execute_and_fetch(sql, (ip,))
    if rows!=None and len(rows)>0:
        lic_key = rows[0]['license']
    else:
        print('node of ip {} not exist in database.'.format(ip))
    return lic_key

def save_lic_key(lic_key, ip):
    sql = 'SELECT id, license FROM node WHERE ip=%s'
    rows = db.execute_and_fetch(sql, (ip,))
    if rows!=None and len(rows)>0:
        me = rows[0]['id']
        sql = 'UPDATE node SET license=%s WHERE id=%s'
        db.execute_and_fetch(sql, (lic_key, me))
        sql = 'SELECT id, ip, name, license FROM node WHERE id=%s'
        rows = db.execute_and_fetch(sql, (me,))
        print ('result:', rows[0])
    else:
        print ('node of ip {} not exist.'.format(ip))

def gen_lic_key(token, end_date='20201231'):
    import requests
    fp = lic.export_fp()
    data = {'token': token,
            'fp': fp,
            'desc': 'dev',
            'type': 'demo',
            'start_date': '20200428',
            'end_date': end_date}
    response = requests.post('http://192.168.0.109:10003/gen_lic', data=data)
    print (response.text)
    return response.json()['lic_key']


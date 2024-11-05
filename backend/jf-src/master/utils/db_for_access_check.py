from utils.db_base import *
from utils.exceptions import *
from datetime import date, datetime, timedelta

# 특정 ID로 ID 가져오는 함수로만 구성
# EX) Training_id -> workspace_id
# raise도 여기서 바로?
# Input ID가 DB에 존재하지 않는 경우  -> cur.fetchone() == None | cur.fetchall() == ()
# Input ID가 DB에 존재하면 (Join을 쓰는 경우가 아니라면) Output용 ID는 반드시 존재함

def get_workspace_id_from_deployment_id(deployment_id):
    try:
        res = None
        with get_db() as conn:
            cur = conn.cursor()
            sql = """
                SELECT d.workspace_id
                FROM deployment d
                WHERE d.id = {}
            """.format(deployment_id)

            cur.execute(sql)
            res = cur.fetchone()
            if res is None:
                raise ItemNotExistError("This Deployment ID Not Exist.")
            return res["workspace_id"]
    except Exception as e:
        traceback.print_exc()
        raise e
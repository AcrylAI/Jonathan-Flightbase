import json
from inspect import getmembers, isclass
import sys


class CustomSuccess():
    """For CustomSuccess"""
    code=0
    location=""
    def __str__(self):
        # try:
        #     ...
        # except Exception as e:
        #     print(e)
        # 위 상황에 메세지 남기기 위해서
        return "CustomSuccessCase"

    def response(self, redirect=False):
        return {'location' : self.location, 'message' : self.message, 'code' : self.code }
    
    pass


# example
# from utils.dataset_exceptions import *
# from utils.exceptions_image import *

CustomSuccessList = ()
ImportSuccessList = []

SuccessList = getmembers(sys.modules['utils.success'], isclass)

for key,value in SuccessList:
    if key == 'CustomSuccess' : # or key == 'RemoteError':
        continue
    ImportSuccessList.append(value)

CustomSuccessList = CustomSuccessList + tuple(ImportSuccessList)
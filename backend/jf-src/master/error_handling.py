import json
#from utils.resource import response
import pymysql

from inspect import getmembers, isclass
import sys


class CustomError(Exception):
    code=0
    location=""

    def response(self, redirect=False):
        return {'location' : self.location, 'message' : self.message, 'code' : self.code }


from utils.exceptions import *

ExceptList = getmembers(sys.modules['__main__'], isclass)
print(len(ExceptList))
CustomExceptList=[]
for key,value in ExceptList:
    if key == 'CustomError':
        continue
    CustomExceptList.append(key)
    print("key : {}, value : {}".format(key,value))

print(CustomExceptList)
#print(getmembers(sys.builtin_module_names, isclass))
# print(CustomErrorList)
# print(type(CustomErrorList))
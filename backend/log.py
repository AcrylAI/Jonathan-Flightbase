import sys;
import time;
import json;
import requests;
import traceback;

ip = sys.argv[1];
port = int(sys.argv[2]);
user = sys.argv[3];
project_name = sys.argv[4];

after = -1;
while True:
	do_sleep = True;
	try:
		if after >= 0:
			data = { "after": str(after) };
		else:
			data = None;
		res = requests.get('http://{}:{}/log_get?user={}&project_name={}&after={}'.format(ip, port, user, project_name, after));
		obj = json.loads(res.text);
		if obj["r"] == 0:
			arr = obj["arr"];
			for e in arr:
				try:
					sys.stdout.write(e["text"]);
					sys.stdout.flush();
				except:
					pass;
			if len(arr) > 0:
				try:
					after = arr[len(arr)-1]["sid"];
					do_sleep = False;
				except:
					pass;
		elif obj["r"] > 0:
			break;
	except:
		traceback.print_exc();
		after = -1;
	if do_sleep:
		time.sleep(1);
quit();


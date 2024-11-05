import os
import argparse
import random
parser = argparse.ArgumentParser(description='TEST')
parser.add_argument('--x', type=float)
parser.add_argument('--time', type=int, default=5)
parser.add_argument('--param_count', type=int, default=4)
args, unknown = parser.parse_known_args()

def black_box_function(x):
    return  x * (x - 10) * (x-15) * (x-5) * (x-20)
# MAX 1.17778 (-1.8 < x < 21.8)

history = {
    "x": {"label":"temp", "value":[]}
}

for i in range(args.param_count):
    k = "param_{}".format(i)
    history[k] = []



import time
import random
for i in range(args.time):
    time.sleep(1)
    print("RUNNING", i)
    for k,v in history.items():
        if "param_" in k:
            v.append(random.uniform(1,10))
    history["x"]["value"].append(i)
    # print("JF Training Metrics: {}".format(history))
    os.system('echo "{}" > {}'.format(history, os.environ.get("JF_GRAPH_LOG_FILE_PATH")))

print("[JF]Score={}".format(black_box_function(args.x)))
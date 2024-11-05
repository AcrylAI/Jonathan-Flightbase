import argparse
import random
parser = argparse.ArgumentParser(description='TEST')
parser.add_argument('--x', type=float)
args = parser.parse_args()

def black_box_function(x):
    return  x * (x - 10) * (x-15) * (x-5) * (x-20)

# MAX 1.17778 (-1.8 < x < 21.8)


print("[JF]Score={}".format(black_box_function(args.x)))
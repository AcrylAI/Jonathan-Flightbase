from __future__ import print_function

import argparse
import torch.backends.cudnn as cudnn
import torch.nn.functional as F
import torch.optim as optim
import torch.utils.data.distributed
from torchvision import models
import horovod.torch as hvd
import timeit
import numpy as np
import os
from torch.nn.parallel import DistributedDataParallel as DDP
import torch.distributed as dist


print("JF - CPU CORES : ", os.environ.get("JF_CPU"))
print("JF - RAM : ", os.environ.get("JF_MEMORY"))
# Benchmark settings
parser = argparse.ArgumentParser(description='PyTorch Synthetic Benchmark',
                                 formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument('--fp16-allreduce', action='store_true', default=False,
                    help='use fp16 compression during allreduce')

parser.add_argument('--model', type=str, default='resnet50',
                    help='model to benchmark')
parser.add_argument('--batch-size', type=int, default=32,
                    help='input batch size')

parser.add_argument('--num-warmup-batches', type=int, default=10,
                    help='number of warm-up batches that don\'t count towards benchmark')
parser.add_argument('--num-batches-per-iter', type=int, default=10,
                    help='number of batches per benchmark iteration')
parser.add_argument('--num-iters', type=int, default=10,
                    help='number of benchmark iterations')

parser.add_argument('--no-cuda', action='store_true', default=False,
                    help='disables CUDA training')
parser.add_argument('--dummy', default=1)
##############################################################################################
parser.add_argument('--local_rank', type=int, default=0, help='DDP parameter, do not modify')
##############################################################################################
args = parser.parse_args()
args.cuda = not args.no_cuda and torch.cuda.is_available()

LOCAL_RANK = int(os.getenv('LOCAL_RANK', -1))
WORLD_SIZE = int(os.getenv('WORLD_SIZE', 1))
RANK = int(os.getenv('RANK', 0))
# print("ARGS", args.local_rank)
# print("ENV LOCAL_RANK", LOCAL_RANK)
# print("ENV WORLD_SIZE", WORLD_SIZE)
if args.cuda:
    torch.cuda.set_device(args.local_rank)

cudnn.benchmark = True
device = torch.device('cuda', args.local_rank)
# if dist.is_nccl_available() else "gloo"
dist.init_process_group(backend="nccl")


# Set up standard model.
model = getattr(models, args.model)()

if args.cuda:
    # Move model to GPU.
    model.cuda()

model = DDP(model, device_ids=[args.local_rank], output_device=args.local_rank)


optimizer = optim.SGD(model.parameters(), lr=0.01)

# Set up fixed fake data
data = torch.randn(args.batch_size, 3, 224, 224)
target = torch.LongTensor(args.batch_size).random_() % 1000
if args.cuda:
    data, target = data.cuda(), target.cuda()


def benchmark_step():
    optimizer.zero_grad()
    output = model(data)
    loss = F.cross_entropy(output, target)
    loss.backward()
    optimizer.step()


def log(s, nl=True):
    if RANK != 0:
        return
    print(s, end='\n' if nl else '')


log('Model: %s' % args.model)
log('Batch size: %d' % args.batch_size)
device = 'GPU' if args.cuda else 'CPU'
log('Number of %ss: %d' % (device, WORLD_SIZE))

# Warm-up
log('Running warmup...')
timeit.timeit(benchmark_step, number=args.num_warmup_batches)

# Benchmark
log('Running benchmark...')
img_secs = []
for x in range(args.num_iters):
    time = timeit.timeit(benchmark_step, number=args.num_batches_per_iter)
    img_sec = args.batch_size * args.num_batches_per_iter / time
    log('Iter #%d: %.1f img/sec per %s' % (x, img_sec, device))
    img_secs.append(img_sec)

# Results
img_sec_mean = np.mean(img_secs)
img_sec_conf = 1.96 * np.std(img_secs)
log('Img/sec per %s: %.1f +-%.1f' % (device, img_sec_mean, img_sec_conf))
log('Total img/sec on %d %s(s): %.1f +-%.1f' %
    (WORLD_SIZE, device, WORLD_SIZE * img_sec_mean, WORLD_SIZE * img_sec_conf))
print("[JF]Score=1")
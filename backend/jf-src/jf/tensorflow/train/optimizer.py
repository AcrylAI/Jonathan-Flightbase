import tensorflow as tf
import os

if 'OMPI_COMM_WORLD_RANK' in os.environ:
    import horovod.tensorflow as hvd
    def jfopt(opt):
        return hvd.DistributedOptimizer(opt)
else:
    def jfopt(opt):
        return opt

def RMSPropOptimizer(*args, **kwargs):
    opt = tf.train.RMSPropOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def SyncReplicasOptimizer(*args, **kwargs):
    opt = tf.train.SyncReplicasOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def FtrlOptimizer(*args, **kwargs):
    opt = tf.train.FtrlOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def AdadeltaOptimizer(*args, **kwargs):
    opt = tf.train.AdadeltaOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def AdamOptimizer(*args, **kwargs):
    opt = tf.train.AdamOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def AdagradOptimizer(*args, **kwargs):
    opt = tf.train.AdagradOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def MomentumOptimizer(*args, **kwargs):
    opt = tf.train.MomentumOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def AdagradDAOptimizer(*args, **kwargs):
    opt = tf.train.AdagradDAOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def GradientDescentOptimizer(*args, **kwargs):
    opt = tf.train.GradientDescentOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def ProximalAdagradOptimizer(*args, **kwargs):
    opt = tf.train.ProximalAdagradOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

def ProximalGradientDescentOptimizer(*args, **kwargs):
    opt = tf.train.ProximalGradientDescentOptimizer(*args, **kwargs)
    opt = jfopt(opt)
    return opt

__all__ = [name for name in dir() if name.count('Optimizer')]


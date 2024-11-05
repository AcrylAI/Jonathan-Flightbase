import tensorflow as tf
import numpy as np
import os

if 'OMPI_COMM_WORLD_RANK' in os.environ:

    import horovod.tensorflow as hvd
    hvd.init()
    gpu_rank = hvd.rank()
    gpu_size = hvd.size()

    def is_master():
        return (gpu_rank == 0)

    class Session(tf.Session):
        def __init__(self, target='', graph=None, config=None):
            if config == None:
                config = tf.ConfigProto()
            config.gpu_options.visible_device_list = str(hvd.local_rank())
            config.gpu_options.allow_growth = True
            #if True:#os.environ['JF_UNIFIDE_MEMORY'] == '1':
            #    config.gpu_options.per_process_gpu_memory_fraction = 1.1
            self.jf_broadcast_switch = 0
            self.jf_broadcast_graph = graph if graph != None else tf.get_default_graph()

            super().__init__(target=target, graph=graph, config=config)

        def multi_run(self, fetches, feed_dict=None, options=None, run_metadata=None):
            if self.jf_broadcast_switch == 0:
                with self.jf_broadcast_graph.as_default():
                    bcast = hvd.broadcast_global_variables(0)
                super().run(fetches=bcast, feed_dict=None, options=None, run_metadata=None)
                self.jf_broadcast_switch = 1

            batch_data_length = None
            for i in feed_dict:
                if type(feed_dict[i]) == np.ndarray and len(feed_dict[i]) > 1:
                    if batch_data_length == None or batch_data_length < len(feed_dict[i]):
                        batch_data_length = len(feed_dict[i])

            if batch_data_length < gpu_size:
                raise Exception('To use multi_run method, Batch size must be larger than the number of gpu')

            for i in feed_dict:
                if type(feed_dict[i]) == np.ndarray and len(feed_dict[i]) == batch_data_length:
                    feed_dict[i] = feed_dict[i][gpu_rank*(len(feed_dict[i])//gpu_size):(gpu_rank+1)*(len(feed_dict[i])//gpu_size)]

            return super().run(fetches=fetches, feed_dict=feed_dict, options=options, run_metadata=run_metadata)

    def gradients(*args, **kwargs):
        if 'optimizer' not in kwargs.keys():
            raise ValueError("IF you want to use jfmg, you must give 'optimizer' argument.")
        opt = hvd.DistributedOptimizer(kwargs.pop('optimizer'))
        grads_and_vars = opt.compute_gradients(*args,**kwargs)
        grads = [grad for grad,var in grads_and_vars]
        return grads        

    def MonitoredTrainingSession(checkpoint_dir, hooks = None, config = None):
        hooks = [
            # Horovod: BroadcastGlobalVariablesHook broadcasts initial variable states
            # from rank 0 to all other processes. This is necessary to ensure consistent
            # initialization of all workers when training is started with random weights
            # or restored from a checkpoint.
            hvd.BroadcastGlobalVariablesHook(0),

            # Horovod: adjust number of steps based on number of GPUs.
            tf.train.StopAtStepHook(last_step=20000 // hvd.size()),

            #tf.train.LoggingTensorHook(tensors={'step': global_step, 'loss': loss, 'accuracy': accuracy}, every_n_iter=10),
        ];
        # Horovod: pin GPU to be used to process local rank (one GPU per process)
        config = tf.ConfigProto();
        config.gpu_options.allow_growth = True;
        config.gpu_options.visible_device_list = str(hvd.local_rank());

        return tf.train.MonitoredTrainingSession(checkpoint_dir=checkpoint_dir, hooks=hooks, config=config);

else:
    is_master = True

    class Session(tf.Session):
        def __init__(self, target='', graph=None, config=None):                
            super().__init__(target=target, graph=graph, config=config)
            
        def multi_run(self, fetches, feed_dict=None, options=None, run_metadata=None):              
            return super().run(fetches=fetches, feed_dict=feed_dict, options=options, run_metadata=run_metadata)

    def gradients(*args, **kwargs):
        if 'optimizer' in kwargs.keys():
            del kwargs['optimizer']
        return tf.gradients(*args, **kwargs)

    def MonitoredTrainingSession(checkpoint_dir, hooks = None, config = None):
        return tf.train.MonitoredTrainingSession(checkpoint_dir=checkpoint_dir, hooks=hooks, config=config);


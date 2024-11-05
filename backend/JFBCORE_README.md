# Jonathan Flight Base Core

A solution to make your AI

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

GPU Driver, Docker Install : http://git.acriil.com/jonathanflightbase/jfbcore/wikis/GPU-DRIVER,-Docker-Installation

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

#### Run master
On master server
```
nvidia-docker run --rm --privileged \
 -v /PATH_TO_JF-BIN/jf-bin:/jf-bin:ro \
 -v /PATH_TO_JF-DATA/jf-data:/jf-data:rw \
 -it --network=host DOCKER_IMAGE_NAME \
 /jf-bin/start-master --pub-ip MASTER_IP_ADDRESS --mpi-port 3001
```
##### Example
```
nvidia-docker run --rm --privileged \
 -v /root/xxx/jf-bin:/jf-bin:ro \
 -v /root/xxx/jf-data:/jf-data:rw \
 -it --network=host c341166c8575 \
 /jf-bin/start-master --pub-ip 192.168.1.11 --mpi-port 3001
 ```

#### Run worker
On worker server
```
nvidia-docker run --rm --privileged \
 -v /PATH_TO_JF-BIN/jf-bin:/jf-bin:ro \
 -v /PATH_TO_JF-DATA/jf-data:/jf-data:rw \
 -it --network=host DOCKER_IMAGE_NAME \
 /jf-bin/start-worker --pub-ip WORKER_IP_ADDRESS --mpi-port 3001 --jf-ip WORKER_IP_ADDRESS_FOR_JF_COMM --jf-nif WORKER_NETWORK_INTERFACE_NAME --jf-gpu NUM_OF_GPU
```
##### Example
```
nvidia-docker run --rm --privileged \
 -v /root/xxx/jf-bin:/jf-bin:ro \
 -v /root/xxx/jf-data:/jf-data:rw \
 -it --network=host c341166c8575 \
 /jf-bin/start-worker --pub-ip 192.168.1.15 --mpi-port 3001 --jf-ip 192.168.20.15 --jf-nif enp4s0f0 --jf-gpu 2
```


## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Versioning

For the versions available, see the [tags on this repository](http://git.acriil.com/jonathanflightbase/jfbcore/tags).

## License


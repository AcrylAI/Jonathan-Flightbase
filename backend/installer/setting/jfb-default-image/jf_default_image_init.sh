#! /bin/bash
# JF_DEFAULT_TAR=jf_default # jf_default-
# JF_API_TAR=jf_api # jf_api_cpu_image-, jf_api_gpu_image-
# JF_TF2_TAR=jf_ml_gpu_tf2_image # jf_ml_gpu_tf2_image-
# JF_TORCH_TAR=jf_ml_gpu_torch_image # jf_ml_gpu_torch_image-
# JF_CPU_TAR=jf_ml_cpu_image # jf_ml_cpu_image-

# JF_DEFAULT_IMAGE=jf_default:latest
# JF_API_IMAGE=jf_api_image:latest
# JF_TF2_IMAGE=jf_ml_gpu_tf2_image:latest
# JF_TORCH_IMAGE=jf_ml_gpu_torch_image:latest
# JF_CPU_IMAGE=jf_ml_cpu_image:latest

. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

# DEFAULT IMAGE FOR OLD VERSION 
./jf_default_image_load.sh --jfb_images_path=$JFB_IMAGES_PATH --jfb_image_tar=$JF_DEFAULT_TAR --jfb_image_tag=$JF_DEFAULT_IMAGE

# API IMAGE
./jf_default_image_load.sh --jfb_images_path=$JFB_IMAGES_PATH --jfb_image_tar=$JF_API_TAR --jfb_image_tag=$JF_API_IMAGE

# GPU TF2 IMAGE
./jf_default_image_load.sh --jfb_images_path=$JFB_IMAGES_PATH --jfb_image_tar=$JF_TF2_TAR --jfb_image_tag=$JF_TF2_IMAGE

# GPU TORCH IMAGE
./jf_default_image_load.sh --jfb_images_path=$JFB_IMAGES_PATH --jfb_image_tar=$JF_TORCH_TAR --jfb_image_tag=$JF_TORCH_IMAGE

# cPU TORCH IMAGE
./jf_default_image_load.sh --jfb_images_path=$JFB_IMAGES_PATH --jfb_image_tar=$JF_CPU_TAR --jfb_image_tag=$JF_CPU_IMAGE



# # jf_default:

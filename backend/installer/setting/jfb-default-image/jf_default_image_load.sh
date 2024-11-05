#!/bin/bash
#--jfb_images_path= --jfb_image_tar= --jfb_image_tag=
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

if [ "$JFB_IMAGES_PATH" == "" ] || [ "$JFB_IMAGE_TAR" == "" ] || [ "$JFB_IMAGE_TAG" == "" ]
then
    echo "The following parameters cannot be used as empty values."
    echo "--jfb_images_path" [$JFB_IMAGES_PATH]
    echo "--jfb_image_tar" [$JFB_IMAGE_TAR]
    echo "--jfb_image_tag" [$JFB_IMAGE_TAG]
    exit 1
fi

cd $JFB_IMAGES_PATH
if [ $? -gt 0 ]
then
    echo "JFB IMAGE PATH NOT exist"
    exit 2
fi

echo "--jfb_images_path" [$JFB_IMAGES_PATH]
echo "--jfb_image_tar" [$JFB_IMAGE_TAR]
echo "--jfb_image_tag" [$JFB_IMAGE_TAG]

IMAGE_TAR=$(ls | grep $JFB_IMAGE_TAR | grep -m 1 .tar$)
echo $IMAGE_TAR
LOADED_IMAGE_NAME_TAG=$(docker load -i $IMAGE_TAR | awk '{print $3}')
docker tag $LOADED_IMAGE_NAME_TAG $JFB_IMAGE_TAG

exit $?

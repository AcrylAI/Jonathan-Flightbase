#!/bin/bash
# 2021-10-12 11:24

. /etc/jfb/setting.conf
. /etc/jfb/global_param.conf

/etc/jfb/checker.sh

if [ $? -gt 0 ]
then
    echo "Check /etc/jfb/setting.conf"
    exit 1
fi

for i in "$@"; do
  case $i in
    --master_ip=*)
      MASTER_IP="${i#*=}"
      shift # past argument=value
      ;;
    -i=*|--ofed_install=*)
      OFED_INSTALL="${i#*=}"
      shift # past argument=value
      ;;
    --docker_data_root=*)
      DOCKER_DATA_ROOT="${i#*=}"
      shift # past argument=value
      ;;
    --docker_repository_ip=*)
      DOCKER_REPOSITORY_IP="${i#*=}"
      shift # past argument=value
      ;;  
    --docker_repository_port=*)
      DOCKER_REPOSITORY_PORT="${i#*=}"
      shift # past argument=value
      ;;
    --docker_repository_dir=*)
      DOCKER_REPOSITORY_DIR="${i#*=}"
      shift # past argument=value
      ;;
    --kuber_master_lb_ip=*)
      KUBER_MASTER_LB_IP="${i#*=}"
      shift # past argument=value
      ;;
    --kuber_master_lb_port=*)
      KUBER_MASTER_LB_PORT="${i#*=}"
      shift # past argument=value
      ;;
    --kuber_master_ips=*)
      KUBER_MASTER_IPS="${i#*=}"
      shift # past argument=value
      ;;
    --kuber_master_join_command=*)
      KUBER_MASTER_JOIN_COMMAND="${i#*=}"
      shift # past argument=value
      ;;
    --new_ha_master_ip=*)
      NEW_HA_MASTER_IP="${i#*=}"
      shift
      ;;
    --target_ha_master_name=*)
      TARGET_HA_MASTER_NAME="${i#*=}"
      shift
      ;;
    --jfb_db_backup_file=*)
      JFB_DB_BACKUP_FILE="${i#*=}"
      shift
      ;;
    --jfb_images_path=*)
      JFB_IMAGES_PATH="${i#*=}"
      shift
      ;;
    --jfb_image_tar=*)
      JFB_IMAGE_TAR="${i#*=}"
      shift
      ;;
    --jfb_image_tag=*)
      JFB_IMAGE_TAG="${i#*=}"
      shift
      ;;
    --ib_ip=*)
      IB_IP="${i#*=}"
      shift
      ;;
    # -l=*|--lib=*)
    # LIBPATH="${i#*=}"
    # shift # past argument=value
    # ;;
    # -l=*|--lib=*)
    #   LIBPATH="${i#*=}"
    #   shift # past argument=value
    #   ;;
    # --default)
    #   DEFAULT=YES
    #   shift # past argument with no value
    #   ;;
    *)
      # unknown option
      ;;
  esac
done

echo OFED_INSTALL $OFED_INSTALL
echo DOCKER_DATA_ROOT $DOCKER_DATA_ROOT
echo DOCKER_REPOSITORY_IP $DOCKER_REPOSITORY_IP
echo DOCKER_REPOSITORY_PORT $DOCKER_REPOSITORY_PORT
echo DOCKER_REPOSITORY_DIR $DOCKER_REPOSITORY_DIR

#! /bin/bash
. /etc/jfb/parser.sh
if [ $? -gt 0 ]
then
    echo "Please Check /etc/jfb/parser.sh"
    exit 1
fi

echo $JFB_DB_DOCKER_NAME
MYSQL_ROOT_PASSWORD=$(docker exec JF-mariadb env | grep PASSWORD | sed -r 's/MYSQL_ROOT_PASSWORD=//')


echo 'SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0; DROP TABLE jfb.built_in_model, jfb.built_in_model_data_deployment_form, jfb.built_in_model_data_training_form, jfb.built_in_model_parameter' | docker exec -i $JFB_DB_DOCKER_NAME /usr/bin/mysql -p$MYSQL_ROOT_PASSWORD -uroot
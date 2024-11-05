CREATE TABLE IF NOT EXISTS `user` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(32) UNIQUE,
    `uid`                   INT(11),
    `user_type`             INT(11) NOT NULL,
    `login_counting`        INT(5) DEFAULT 0,
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `update_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `usergroup` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(50) UNIQUE,
    `description`           VARCHAR(1000),
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `update_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `user_usergroup` (
    `usergroup_id`          INT(11) NOT NULL,
    `user_id`               INT(11) NOT NULL,
    PRIMARY KEY(`usergroup_id`,`user_id`),
    CONSTRAINT FOREIGN KEY (`usergroup_id`) REFERENCES `jfb`.`usergroup` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `built_in_model` (
    `id`                                            INT(11) NOT NULL AUTO_INCREMENT,
    `name`                                          VARCHAR(100) NOT NULL UNIQUE,
    `model`                                         VARCHAR(100),
    `kind`                                          VARCHAR(100) DEFAULT NULL,
    `description`                                   VARCHAR(1000),
    `train_data`                                    VARCHAR(100),
    `evaluation_index`                              VARCHAR(100),
    `path`                                          VARCHAR(100),
    `run_docker_name`                               VARCHAR(1000) DEFAULT "jf-default",
    `training_py_command`                           VARCHAR(1000),
    `deployment_py_command`                         VARCHAR(1000),
    `exist_default_checkpoint`                      TINYINT(1) DEFAULT 0,
    `deployment_output_types`                       VARCHAR(1000),
    `training_data_dir_path_parser`                 VARCHAR(1000),
    `checkpoint_save_path_parser`                   VARCHAR(1000),
    `checkpoint_load_dir_path_parser_retraining`    VARCHAR(1000),
    `checkpoint_load_file_path_parser_retraining`   VARCHAR(1000),
    `checkpoint_load_dir_path_parser`               VARCHAR(1000),
    `checkpoint_load_file_path_parser`              VARCHAR(1000),  
    `created_by`                                    VARCHAR(100),
    `training_num_of_gpu_parser`                    VARCHAR(100),
    `horovod_training_multi_gpu_mode`               TINYINT(1) DEFAULT 1,
    `nonhorovod_training_multi_gpu_mode`            TINYINT(1) DEFAULT 0,
    `enable_to_train_with_gpu`                      TINYINT(1) DEFAULT 1,
    `enable_to_train_with_cpu`                      TINYINT(1) DEFAULT 0,
    `deployment_num_of_gpu_parser`                  VARCHAR(100),    
    `deployment_multi_gpu_mode`                     TINYINT(1) DEFAULT 0,
    `enable_to_deploy_with_gpu`                     TINYINT(1) DEFAULT 1,
    `enable_to_deploy_with_cpu`                     TINYINT(1) DEFAULT 1,
    `auto_labeling`                                 TINYINT(1) DEFAULT 0,
    `marker_labeling`                               TINYINT(1) DEFAULT 0,
    `training_status`                               TINYINT(1) DEFAULT 0,
    `deployment_status`                             TINYINT(1) DEFAULT 0,
    `enable_retraining`                             TINYINT(1) DEFAULT 0,
    `thumbnail_path`                                VARCHAR(100),
    `create_datetime`                               VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `update_datetime`                               VARCHAR(20),
    `infojson_path`                                 VARCHAR(100) DEFAULT 'info.json',
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `built_in_model_parameter` (
    `built_in_model_id`	            INT(11),
    `parameter`                     VARCHAR(100),
    `parameter_description`         VARCHAR(1000),
    `default_value`                 VARCHAR(100),
    UNIQUE KEY unique_key (`built_in_model_id`, `parameter`),
    CONSTRAINT FOREIGN KEY (`built_in_model_id`) REFERENCES `jfb`.`built_in_model` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `built_in_model_data_training_form` (
    `built_in_model_id`	            INT(11),
    `type`                          VARCHAR(11) NOT NULL,
    `name`                          VARCHAR(1000) NOT NULL,
    `category`                      VARCHAR(100) NOT NULL,
    `category_description`          VARCHAR(1000),
    `argparse`                      VARCHAR(20) DEFAULT NULL,
    UNIQUE KEY unique_key (`built_in_model_id`, `type`, `name`),
    CONSTRAINT FOREIGN KEY (`built_in_model_id`) REFERENCES `jfb`.`built_in_model` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `built_in_model_data_deployment_form` (
    `built_in_model_id`	            INT(11),
    `location`                      VARCHAR(20) NOT NULL,
    `method`                        VARCHAR(20) NOT NULL,
    `api_key`                       VARCHAR(100) NOT NULL,
    `value_type`                    VARCHAR(100),
    `category`                      VARCHAR(100) NOT NULL,
    `category_description`          VARCHAR(1000),
    UNIQUE KEY unique_key (`built_in_model_id`, `api_key`),      
    CONSTRAINT FOREIGN KEY (`built_in_model_id`) REFERENCES `jfb`.`built_in_model` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `dataset` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(50) NOT NULL,
    `workspace_id`          INT(11),
    `create_user_id`        INT(11),
    `access`                VARCHAR(200),
    `file_count`            INT(11) DEFAULT 0,
    `dir_count`             INT(11) DEFAULT 0,
    `size`                  BIGINT(100) DEFAULT 0,
    `description`           VARCHAR(1000),
    `inode_number`          VARCHAR(200),
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `update_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `modify_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `auto_labeling`         INT(5) DEFAULT 0,
    PRIMARY KEY(`id`),
    UNIQUE KEY unique_key (`inode_number`),
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `history` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `datetime`              VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `task`                  VARCHAR(50),
    `action`                VARCHAR(50),
    `workspace_id`          INT(11),
    `task_name`             VARCHAR(50),
    `update_details`        VARCHAR(500),
    `user`                  VARCHAR(20),
    PRIMARY KEY(`id`),
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `workspace` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(50) NOT NULL UNIQUE,
    `manager_id`            INT(11) NOT NULL,
    `gpu_deployment_total`  INT(11) DEFAULT 0,
    `gpu_training_total`    INT(11) DEFAULT 0,
    `guaranteed_gpu`        TINYINT(1) DEFAULT 1,
    `description`           VARCHAR(1000),
    `start_datetime`        VARCHAR(20),
    `end_datetime`          VARCHAR(20),
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`),
    CONSTRAINT FOREIGN KEY (`manager_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_workspace` (
    `workspace_id`          INT(11) NOT NULL,
    `user_id`               INT(11) NOT NULL,
    `favorites`             INT(11) DEFAULT 0,
    PRIMARY KEY(`workspace_id`,`user_id`),
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `node` (
    `id`                                INT(11) NOT NULL AUTO_INCREMENT,
    `ip`                                VARCHAR(50) NOT NULL UNIQUE,
    `name`                              VARCHAR(50) DEFAULT NULL,
    `os`                                VARCHAR(50) DEFAULT NULL,
    `cpu`                               VARCHAR(50) DEFAULT NULL,
    `cpu_cores`                         VARCHAR(50) DEFAULT NULL,
    `ram`                               VARCHAR(50) DEFAULT NULL,
    `driver_version`                    VARCHAR(50) DEFAULT NULL,
    `status`                            VARCHAR(50),
    `interface_1g`                      VARCHAR(50) DEFAULT NULL,
    `interface_10g`                     VARCHAR(50) DEFAULT NULL,
    `interface_ib`                      VARCHAR(50) DEFAULT NULL,
    `gpu_count`                         INT(11),
    `general_gpu_count`                 INT(11),
    `mig_gpu_count`                     INT(11),
    `cpu_cores_limit_per_pod`           FLOAT(12) DEFAULT NULL,
    `cpu_cores_lock_per_pod`            TINYINT(1) DEFAULT 0 COMMENT 'Lock - 0 : Disable, 1 : Enable',
    `cpu_cores_lock_percent_per_pod`    FLOAT(12) DEFAULT 100 COMMENT 'Lock allow range 0 ~ N %',
    `cpu_cores_limit_per_gpu`           FLOAT(12) DEFAULT NULL, 
    `cpu_cores_lock_per_gpu`            TINYINT(1) DEFAULT 0 COMMENT 'Lock - 0 : Disable, 1 : Enable',
    `cpu_cores_lock_percent_per_gpu`    FLOAT(12) DEFAULT 100 COMMENT 'Lock allow range 0 ~ N %',
    `ram_limit_per_pod`                 FLOAT(12) DEFAULT NULL, 
    `ram_lock_per_pod`                  TINYINT(1) DEFAULT 0 COMMENT 'Lock - 0 : Disable, 1 : Enable',
    `ram_lock_percent_per_pod`          FLOAT(12) DEFAULT 100 COMMENT 'Lock allow range 0 ~ N %',
    `ram_limit_per_gpu`                 FLOAT(12) DEFAULT NULL,
    `ram_lock_per_gpu`                  TINYINT(1) DEFAULT 0 COMMENT 'Lock - 0 : Disable, 1 : Enable',
    `ram_lock_percent_per_gpu`          FLOAT(12) DEFAULT 100 COMMENT 'Lock allow range 0 ~ N %',
    `ephemeral_storage_limit`           FLOAT(12) DEFAULT NULL,
    `is_gpu_server`                     TINYINT(1) DEFAULT 1,
    `is_cpu_server`                     TINYINT(1) DEFAULT 1,
    `no_use_server`                     TINYINT(1) DEFAULT 0,
    `license`                           VARCHAR(1000) DEFAULT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `node_gpu` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `node_id`	            INT(11),
    `num`                   INT(11),
    `model`	                VARCHAR(50),
    `memory`	            VARCHAR(50),
    `cuda_cores`	        INT(11),
    `computer_capability`   FLOAT(11),
    `architecture`	        VARCHAR(50),
    `nvlink`	            VARCHAR(50),
    `mig_mode`              VARCHAR(10) NOT NULL DEFAULT 'None' COMMENT 'None, N/A, Disabled, Enabled',
    PRIMARY KEY (`id`),
    CONSTRAINT FOREIGN KEY (`node_id`) REFERENCES `jfb`.`node` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `node_mig_gpu` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `node_gpu_id`	        INT(11),
    `instance`	            VARCHAR(500),
    PRIMARY KEY (`id`),
    CONSTRAINT FOREIGN KEY (`node_gpu_id`) REFERENCES `jfb`.`node_gpu` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `node_interface` (
    `node_id`	            INT(11),
    `interface`	            VARCHAR(50),
    CONSTRAINT FOREIGN KEY (`node_id`) REFERENCES `jfb`.`node` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `network_group` (
    `id`                          INT(11) NOT NULL AUTO_INCREMENT,
    `name`                        VARCHAR(50) NOT NULL,
    `description`                 VARCHAR(1000),
    `speed`                       FLOAT(11) COMMENT 'XX Gbps',
    `category`                    VARCHAR(20) COMMENT '1G, 10G, Infiniband ...', 
    PRIMARY KEY(`id`),
    UNIQUE KEY unique_key (`name`)
);

CREATE TABLE IF NOT EXISTS `network_group_cni` (
    `id`                           INT(11) NOT NULL AUTO_INCREMENT,
    `network_group_id`             INT(11) NOT NULL,
    `cni_config`                   JSON DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY unique_key (`network_group_id`),
    CONSTRAINT FOREIGN KEY (`network_group_id`) REFERENCES `jfb`.`network_group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `network_group_node_interface` (
    `id`                      INT(11) NOT NULL AUTO_INCREMENT,
    `network_group_id`        INT(11) NOT NULL,
    `node_id`                 INT(11) NOT NULL,
    `port_index`              INT(11) NOT NULL COMMENT 'Multiple Port Case',
    `interface`               VARCHAR(50) COMMENT 'NODE Interface',
    PRIMARY KEY (`id`),
    UNIQUE KEY unique_key_1 (`node_id`, `network_group_id`,`interface`),
    UNIQUE KEY unique_key_2 (`node_id`, `network_group_id`,`port_index`),
    CONSTRAINT FOREIGN KEY (`network_group_id`) REFERENCES `jfb`.`network_group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`node_id`) REFERENCES `jfb`.`node` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `network_group_container_interface` (
    `id`                            INT(11) NOT NULL AUTO_INCREMENT,
    `network_group_id`              INT(11) NOT NULL,
    `port_index`                    INT(11) NOT NULL COMMENT 'Multiple Port Case',
    `interface`                     VARCHAR(50) COMMENT 'Container Interface',
    PRIMARY KEY (`id`),
    UNIQUE KEY unique_key_1 (`interface`),
    UNIQUE KEY unique_key_2 (`network_group_id`, `port_index`),
    CONSTRAINT FOREIGN KEY (`network_group_id`) REFERENCES `jfb`.`network_group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `training` (
    `id`                INT(11) NOT NULL AUTO_INCREMENT,
    `workspace_id`      INT(11) NOT NULL,
    `name`              VARCHAR(50) NOT NULL,
    `gpu_count`         INT(11) NOT NULL,
    `gpu_model`         JSON DEFAULT NULL,
    `node_mode`         TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '0 = single, 1 multiple',
    `node_name`         JSON DEFAULT NULL,
    `type`              VARCHAR(50) NOT NULL,
    `docker_image_id`   INT(11),
    `access`            INT(11),
    `user_id`           INT(11),
    `description`       VARCHAR(1000),
    `built_in_model_id` INT(11),
    `create_datetime`   VARCHAR(20) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `last_run_datetime` VARCHAR(20),
    PRIMARY KEY (`id`),
    UNIQUE KEY unique_key (`workspace_id`, `name`),
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `training_port` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `training_id`           INT(11) NOT NULL,
    `training_tool_id`      INT(11) NOT NULL,
    `name`                  VARCHAR(50) NOT NULL,
    `target_port`           INT(11),
    `protocol`              VARCHAR(50) DEFAULT 'TCP',
    `node_port`             INT(11) DEFAULT NULL,
    `description`           VARCHAR(1000),
    `system_definition`     TINYINT(1) DEFAULT 0,
    `service_type`          VARCHAR(50) DEFAULT 'NodePort',
    `status`                TINYINT(1) DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY unique_key_1 (`training_tool_id`, `node_port`),
    UNIQUE KEY unique_key_3 (`training_tool_id`, `name`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`training_tool_id`) REFERENCES `jfb`.`training_tool` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `training_bookmark` (
    `training_id`           INT(11) NOT NULL,
    `user_id`               INT(11) NOT NULL,
    PRIMARY KEY(`training_id`,`user_id`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_training` (
    `training_id`           INT(11) NOT NULL,
    `user_id`               INT(11) NOT NULL,
    PRIMARY KEY(`user_id`,`training_id`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `image` (
    `id`                    INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id`               INT(11) NOT NULL,
    `name`                  VARCHAR(50) NOT NULL,
    `real_name`             VARCHAR(200),
    `file_path`             VARCHAR(200),
    `status`                INT(11) DEFAULT 0,
    `fail_reason`           VARCHAR(300),
    `type`                  INT(11) DEFAULT 0,
    `access`                INT(11) DEFAULT 0,
    `size`                  FLOAT(11) DEFAULT NULL,
    `iid`                   VARCHAR(50) DEFAULT NULL,
    `docker_digest`         VARCHAR(200) DEFAULT NULL,
    `libs_digest`           VARCHAR(300) DEFAULT NULL,
    `description`           VARCHAR(1000) DEFAULT NULL,
    `upload_filename`       VARCHAR(300) DEFAULT NULL,
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `update_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    UNIQUE KEY unique_key (`name`),
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `image_workspace` (
    `image_id`              INT(11) NOT NULL,
    `workspace_id`          INT(11) NOT NULL,
    PRIMARY KEY(`image_id`,`workspace_id`),
    CONSTRAINT FOREIGN KEY (`image_id`)     REFERENCES `jfb`.`image`     (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `training_tool`(
    `id`                 INT(11) NOT NULL AUTO_INCREMENT,
    `training_id`        INT(11),
    `name`               VARCHAR(100) DEFAULT NULL,
    `tool_type`          TINYINT(1) COMMENT '0 = editor, 1 = jupyter(gpu)', 
    `tool_replica_number`   INT(11) DEFAULT 0,
    `docker_image_id`    INT(11) DEFAULT 1,
    `gpu_count`          INT(11),
    `gpu_model`          JSON DEFAULT NULL,
    `node_name`          JSON DEFAULT NULL,
    `node_mode`          TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '0 = single, 1 multiple',
    `configurations`     VARCHAR(1000) DEFAULT NULL,
    `start_datetime`     VARCHAR(20),
    `end_datetime`       VARCHAR(20),
    `executor_id`        INT(11),
    PRIMARY KEY(`id`),
    UNIQUE KEY unique_key (`training_id`, `tool_type`, `tool_replica_number`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`executor_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`docker_image_id`) REFERENCES `jfb`.`image` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `jupyter` (
    `id`                 INT(11) NOT NULL AUTO_INCREMENT,
    `training_id`        INT(11),
    `editor`             VARCHAR(50) NOT NULL,
    `configurations`     VARCHAR(1000) DEFAULT NULL,
    `start_datetime`     VARCHAR(20),
    `end_datetime`       VARCHAR(20),
    `executor_id`        INT(11),
    PRIMARY KEY(`id`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`executor_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `job` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `training_id`           INT(11),
    `name`                  VARCHAR(50),
    `job_group_index`       INT(11),
    `docker_image_id`       INT(11),
    `docker_image_name`     VARCHAR(1000),
    `dataset_id`            INT(11),
    `dataset_access`        VARCHAR(50),
    `dataset_name`          VARCHAR(50),
    `gpu_count`             INT(11) NOT NULL,
    `gpu_model`             JSON DEFAULT NULL,
    `node_mode`             TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '0 = single, 1 multiple',
    `node_name`             JSON DEFAULT NULL,
    `run_code`              VARCHAR(1000),
    `parameter`             VARCHAR(1000),
    `gpu_acceleration`      INT(11) DEFAULT 0,
    `unified_memory`        INT(11) DEFAULT 0,
    `rdma`                  INT(11) DEFAULT 0,
    `group_number`          INT(11),
    `configurations`        VARCHAR(1000) DEFAULT NULL,
    `network_interface`     VARCHAR(20) DEFAULT NULL,
    `creator_id`            INT(11),
    `loss`                  VARCHAR(50),
    `accuracy`              VARCHAR(50),
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `start_datetime`        VARCHAR(20),
    `end_datetime`          VARCHAR(20),
    PRIMARY KEY(`id`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`docker_image_id`) REFERENCES `jfb`.`image` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`creator_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`dataset_id`) REFERENCES `jfb`.`dataset` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `pod_queue` (
    `idx`               INT(11) NOT NULL AUTO_INCREMENT,
    `training_id`       INT(11) NOT NULL,
    `job_id`            INT(11),
    PRIMARY KEY (`idx`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`job_id`) REFERENCES `jfb`.`job` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `hyperparamsearch_group` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `training_id`           INT(11),
    `name`                  VARCHAR(50),
    `docker_image_id`       INT(11),
    `dataset_id`            INT(11),
    `run_code`              VARCHAR(1000),
    `run_parameter`         VARCHAR(1000),
    `creator_id`            INT(11),
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`),
    UNIQUE KEY unique_key (`training_id`, `name`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`docker_image_id`) REFERENCES `jfb`.`image` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`creator_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`dataset_id`) REFERENCES `jfb`.`dataset` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `hyperparamsearch` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `hps_group_id`          INT(11),
    `hps_group_index`          INT(11),
    `docker_image_name`     VARCHAR(1000),
    `dataset_access`        VARCHAR(50),
    `dataset_name`          VARCHAR(50),
    `gpu_count`             INT(11) NOT NULL,
    `gpu_model`             JSON DEFAULT NULL,
    `node_mode`             TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '0 = single, 1 multiple',
    `node_name`             JSON DEFAULT NULL,
    `search_parameter`      VARCHAR(1000),
    `int_parameter`         VARCHAR(1000),
    `method`                VARCHAR(10),
    `init_points`           int(11),
    `search_count`          int(11),
    `search_interval`       FLOAT(11),
    `load_file_name`        VARCHAR(100),
    `save_file_name`        VARCHAR(100),
    `save_file_reset`       TINYINT(1) DEFAULT 0,
    `gpu_acceleration`      TINYINT(1) DEFAULT 0,
    `unified_memory`        TINYINT(1) DEFAULT 0,
    `rdma`                  TINYINT(1) DEFAULT 0,
    `configurations`        VARCHAR(1000) DEFAULT NULL,
    `network_interface`     VARCHAR(20) DEFAULT NULL,
    `executor_id`           INT(11),
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `start_datetime`        VARCHAR(20),
    `end_datetime`          VARCHAR(20),
    PRIMARY KEY(`id`),
    CONSTRAINT FOREIGN KEY (`executor_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`hps_group_id`) REFERENCES `jfb`.`hyperparamsearch_group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `hyperparamsearch_queue` (
    `idx`                   INT(11) NOT NULL AUTO_INCREMENT,
    `training_id`           INT(11),
    `hps_id`                INT(11),
    PRIMARY KEY (`idx`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`hps_id`) REFERENCES `jfb`.`hyperparamsearch` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `api_log` (
    `id`                INT(11) NOT NULL AUTO_INCREMENT,
    `user`              VARCHAR(50),
    `request`           VARCHAR(50),
    `method`            VARCHAR(50),
    `body`              VARCHAR(10000),
    `success_check`     CHAR(1),
    `datetime`          VARCHAR(20) DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `deployment` (
    `id`                INT(11) NOT NULL AUTO_INCREMENT,
    `name`              VARCHAR(100),
    `description`       VARCHAR(1000),
    `workspace_id`      INT(11),
    `type`              VARCHAR(200),
    `training_id`       INT(11),
    `training_name`     VARCHAR(100),
    `built_in_model_id` INT(11),
    `job_id`            INT(11),
    `run_code`          VARCHAR(1000),
    `checkpoint`        LONGTEXT DEFAULT NULL,
    `checkpoint_id`     INT(11),
    `operating_type`    VARCHAR(10),
    `gpu_count`         INT(11),
    `gpu_model`         JSON DEFAULT NULL,
    `node_mode`         TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '0 = single, 1 multiple',
    `node_name`         JSON DEFAULT NULL,
    `network_interface` VARCHAR(20) DEFAULT NULL,
    `input_type`        VARCHAR(200),
    `docker_image_id`   INT(11),
    `access`            INT(11),
    `configurations`    VARCHAR(100) DEFAULT "",
    `token`             VARCHAR(40) DEFAULT "",
    `api_path`          VARCHAR(100) DEFAULT NULL,
    `user_id`           INT(11),
    `create_datetime`   VARCHAR(20) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `start_datetime`    VARCHAR(20),
    `end_datetime`      VARCHAR(20),
    `built_in_creator`  VARCHAR(100) DEFAULT NULL,
    `executor_id`       INT(11),
    `template_id`       INT(11),
    PRIMARY KEY (`id`),
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`job_id`) REFERENCES `jfb`.`job` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`docker_image_id`) REFERENCES `jfb`.`image` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`executor_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`template_id`) REFERENCES `jfb`.`deployment_template` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `deployment_data_form` (
    `deployment_id`             INT(11) NOT NULL,
    `location`                  VARCHAR(11) NOT NULL COMMENT 'data location in API (body, args, file ...)',
    `method`                    VARCHAR(11) NOT NULL COMMENT 'api call method',
    `api_key`                   VARCHAR(11) NOT NULL COMMENT 'api key',
    `value_type`                VARCHAR(11) NOT NULL COMMENT 'api_key value',
    `category`                  VARCHAR(100) COMMENT 'input form category. ex) Image, Video, Audio .. ',
    `category_description`      VARCHAR(1000) COMMENT 'category description. File format ( png, jpg ...) , size ...',
    UNIQUE KEY unique_key (`deployment_id`, `api_key`),
    CONSTRAINT FOREIGN KEY (`deployment_id`) REFERENCES `jfb`.`deployment` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `user_deployment` (
    `deployment_id` INT(11) NOT NULL,
    `user_id`    INT(11) NOT NULL,
    PRIMARY KEY(`user_id`,`deployment_id`),
    CONSTRAINT FOREIGN KEY (`deployment_id`) REFERENCES `jfb`.`deployment` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `deployment_worker` (
    `id`                INT(11) NOT NULL AUTO_INCREMENT,
    `deployment_id`     INT(11),
    `description`       VARCHAR(1000),
    `training_id`       INT(11),
    `training_name`     VARCHAR(100),
    `built_in_model_id` INT(11),
    `job_id`            INT(11),
    `run_code`          VARCHAR(1000),
    `checkpoint`        LONGTEXT DEFAULT NULL,
    `checkpoint_id`     INT(11),
    `gpu_count`         INT(11),
    `gpu_model`         JSON DEFAULT NULL,
    `node_mode`         TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '0 = single, 1 multiple',
    `node_name`         JSON DEFAULT NULL,
    `network_interface` VARCHAR(20) DEFAULT NULL,
    `docker_image_id`   INT(11),
    `configurations`    VARCHAR(100) DEFAULT "",
    `token`             VARCHAR(40) DEFAULT "",
    `user_id`           INT(11),
    `create_datetime`   VARCHAR(20) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `start_datetime`    VARCHAR(20),
    `end_datetime`      VARCHAR(20),
    `executor_id`       INT(11),
    `template_id`       INT(11),
    PRIMARY KEY (`id`),
    CONSTRAINT FOREIGN KEY (`training_id`) REFERENCES `jfb`.`training` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`job_id`) REFERENCES `jfb`.`job` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`docker_image_id`) REFERENCES `jfb`.`image` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`executor_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`deployment_id`) REFERENCES `jfb`.`deployment` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`template_id`) REFERENCES `jfb`.`deployment_template` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `deployment_bookmark` (
    `deployment_id`         INT(11) NOT NULL,
    `user_id`               INT(11) NOT NULL,
    PRIMARY KEY(`deployment_id`,`user_id`),
    CONSTRAINT FOREIGN KEY (`deployment_id`) REFERENCES `jfb`.`deployment` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `deployment_template` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `workspace_id`          INT(11) NOT NULL,
    `name`                  VARCHAR(100),
    `template_group_id`     INT(11),
    `description`           VARCHAR(1000),
    `template`              JSON NOT NULL,
    `user_id`               INT(11),
    `create_datetime`       VARCHAR(20) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    `is_deleted`            TINYINT(1) NOT NULL DEFAULT 0,
    `item_deleted`          JSON NOT NULL DEFAULT '{}',
    PRIMARY KEY (`id`),
    CONSTRAINT FOREIGN KEY (`template_group_id`) REFERENCES `jfb`.`deployment_template_group` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `deployment_template_group` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `name`                  VARCHAR(100) NOT NULL,
    `description`           VARCHAR(1000),
    `workspace_id`          INT(11) NOT NULL,
    `user_id`               INT(11),
    `create_datetime`       VARCHAR(20) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY (`id`),
    UNIQUE KEY unique_key (`workspace_id`, `name`),
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `login_session` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `user_id`               INT(11) NOT NULL,
    `token`                 VARCHAR(100) NOT NULL,
    `last_call_datetime`    VARCHAR(20) NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`,`user_id`,`token`),
    CONSTRAINT FOREIGN KEY (`user_id`) REFERENCES `jfb`.`user` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `checkpoint` (
    `id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `description`           VARCHAR(1000),
    `built_in_model_id`     INT(11),
    `checkpoint_file_path`  VARCHAR(1000) NOT NULL,
    `checkpoint_dir_path`   VARCHAR(1000) DEFAULT NULL,
    `checkpoint_dir_size`   FLOAT(11),
    `user_id`               INT(11) NOT NULL,
    `workspace_id`          INT(11) ,
    `access`                TINYINT(1) DEFAULT 1,
    PRIMARY KEY(`id`),
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `record_workspace` (
    `log_id`                INT(11) NOT NULL AUTO_INCREMENT,
    `id`                    INT(11) NOT NULL,
    `name`                  VARCHAR(50) NOT NULL,
    `manager_id`            INT(11) NOT NULL,
    `gpu_deployment_total`  INT(11),
    `gpu_training_total`    INT(11),
    `guaranteed_gpu`        TINYINT(1) DEFAULT 1,
    `description`           VARCHAR(1000),
    `start_datetime`        VARCHAR(20),
    `end_datetime`          VARCHAR(20),
    `log_create_datetime`   VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`log_id`)
);

CREATE TABLE IF NOT EXISTS `record_workspace_variation` (
    `log_id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `workspace_id`              INT(11) NOT NULL,
    `training_count`            INT(11) NOT NULL,
    `dataset_count`             INT(11) NOT NULL,
    `image_count`               INT(11) NOT NULL,
    `deployment_count`          INT(11) NOT NULL,
    `log_create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`log_id`)
);

CREATE TABLE IF NOT EXISTS `record_all_workspaces_variation` (
    `log_id`                    INT(11) NOT NULL AUTO_INCREMENT,
    `workspace_count`           INT(11) NOT NULL,
    `training_count`            INT(11) NOT NULL,
    `deployment_count`          INT(11) NOT NULL,
    `dataset_count`             INT(11) NOT NULL,
    `image_count`               INT(11) NOT NULL,
    `node_count`                INT(11) NOT NULL,
    `log_create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`log_id`)
);

CREATE TABLE IF NOT EXISTS `record_unified` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT '',
  `type_detail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`type_detail`)),
  `executor_id` int(11) DEFAULT NULL,
  `workspace_id` int(11) DEFAULT NULL,
  `workspace_name` varchar(255) DEFAULT '',
  `workspace_exists` tinyint(1) DEFAULT 1,
  `create_datetime` datetime NOT NULL,
  `start_datetime` datetime DEFAULT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `log_create_datetime` datetime DEFAULT NULL,
  `gpu_count` int(11) DEFAULT NULL,
  `configurations` varchar(255) DEFAULT NULL,
  `subtype` varchar(255) DEFAULT NULL,
  `subtype_detail` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`subtype_detail`)),
  `diff_datetime` int(255) DEFAULT timestampdiff(SECOND,`start_datetime`,`end_datetime`),
  PRIMARY KEY (`id`),
  KEY `workspace_name` (`workspace_name`)
) ENGINE=InnoDB AUTO_INCREMENT=1730 DEFAULT CHARSET=utf8mb3;

CREATE TABLE IF NOT EXISTS `record_gpu` (
	`id` int AUTO_INCREMENT,
	`used` int NOT NULL,
	`total` int NOT NULL,
	`workspace_id` VARCHAR(50) DEFAULT 'ALL',
	`record_datetime` datetime NOT NULL,
	PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS gpu_ws ON record_gpu(workspace_id);

CREATE TABLE IF NOT EXISTS `record_available_gpu` (
    `id`                INT(11) NOT NULL AUTO_INCREMENT,
    `count`             INT(11) NOT NULL,
    `update_datetime`   VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `dna_challenge` (
    `id`                            INT(11) NOT NULL AUTO_INCREMENT,
    `training_id`                   INT(11),
    `user_id`                       INT(11),
    `training_file_path`            LONGTEXT NOT NULL,
    `training_file_command`         LONGTEXT DEFAULT NULL,
    `answer_sheet_file_path`        LONGTEXT NOT NULL,
    `score`                         FLOAT(11) NOT NULL,
    `inference_time`                FLOAT(11) NOT NULL,
    `answer_sheet_create_file_path` LONGTEXT NOT NULL,
    `answer_sheet_create_command`   LONGTEXT NOT NULL,
    `package_installer_path`        LONGTEXT DEFAULT NULL,
    `register`                      TINYINT(1) DEFAULT 0,
    `create_datetime`               VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `storage` (
    `id`            INT(11) NOT NULL AUTO_INCREMENT,
    `physical_name`         VARCHAR(20) NOT NULL,
    `logical_name`          VARCHAR(20) NOT NULL,
    `size`                  BIGINT(100),
    `fstype`                VARCHAR(20),
    `description`           LONGTEXT,
    `active`                TINYINT(1) DEFAULT 0,
    `create_lock`           TINYINT(1) DEFAULT 0,
    `share`                 TINYINT(1) DEFAULT 0,
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `storage_image_control` (
    `workspace_id`          INT(11) NOT NULL,
    `size`                  BIGINT(100),
    `storage_id`            INT(11) NOT NULL,
    `status`                TINYINT(1) DEFAULT 1,
    `create_datetime`       VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`workspace_id`),
    CONSTRAINT FOREIGN KEY (`workspace_id`) REFERENCES `jfb`.`workspace` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`storage_id`) REFERENCES `jfb`.`storage` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `benchmark_node_network_speed` (
    `id`                            INT(11) NOT NULL AUTO_INCREMENT,     
    `client_node_id`                INT(11) NOT NULL,
    `server_node_id`                INT(11) NOT NULL,
    `network_group_id`              INT(11) NOT NULL,
    `network_group_name`            VARCHAR(50) NOT NULL,
    `client_node_interface`         VARCHAR(50),
    `server_node_interface`         VARCHAR(50),
    `client_node_ip`                VARCHAR(20),
    `server_node_ip`                VARCHAR(20), 
    `sender_bandwidth`              FLOAT,
    `receiver_bandwidth`            FLOAT,
    `error_message`                 LONGTEXT,
    `start_datetime`                VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    `end_datetime`                  VARCHAR(20),   
    PRIMARY KEY(`id`),
    CONSTRAINT FOREIGN KEY (`network_group_id`) REFERENCES `jfb`.`network_group` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`network_group_name`) REFERENCES `jfb`.`network_group` (`name`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`client_node_id`) REFERENCES `jfb`.`node` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (`server_node_id`) REFERENCES `jfb`.`node` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `benchmark_node_storage_io_speed` (
    `id`                          INT(11) NOT NULL AUTO_INCREMENT,
    `node_id`                     INT(11) NOT NULL,
    `storage_id`                  INT(11) NOT NULL,
    `read_withbuffer_speed`       FLOAT(11),
    `read_withbuffer_iops`        FLOAT(11),
    `read_withoutbuffer_speed`    FLOAT(11),
    `read_withoutbuffer_iops`     FLOAT(11),
    `write_withbuffer_speed`      FLOAT(11),
    `write_withbuffer_iops`       FLOAT(11),
    `write_withoutbuffer_speed`   FLOAT(11),
    `write_withoutbuffer_iops`    FLOAT(11),
    `error_message`               LONGTEXT,
    `test_datetime`               VARCHAR(20) DEFAULT CURRENT_TIMESTAMP(),
    PRIMARY KEY(`id`),
    CONSTRAINT FOREIGN KEY (`node_id`) REFERENCES `jfb`.`node` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
);



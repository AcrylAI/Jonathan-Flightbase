trigger = """
CREATE TRIGGER IF NOT EXISTS `after_delete_training`
AFTER DELETE ON training
FOR EACH ROW
BEGIN
    UPDATE deployment_template AS dt
    SET dt.item_deleted = JSON_SET(dt.item_deleted, '$.training', 1)
    WHERE 
    IF((JSON_VALUE(dt.template, '$.training_id') IS NULL 
        OR JSON_VALUE(dt.template, '$.training_id') = "null"), 
        0, JSON_VALUE(dt.template, '$.training_id')) = OLD.id
    OR
    (JSON_VALUE(dt.template, '$.mount.training[0].name') = OLD.name
    AND dt.workspace_id = OLD.workspace_id);
END//

CREATE TRIGGER IF NOT EXISTS `after_delete_job`
AFTER DELETE ON job
FOR EACH ROW
UPDATE deployment_template AS dt
SET dt.item_deleted = JSON_SET(dt.item_deleted, '$.training', 2)
WHERE 
IF((JSON_VALUE(dt.template, '$.job_id') IS NULL 
    OR JSON_VALUE(dt.template, '$.job_id') = "null"), 
    0, JSON_VALUE(dt.template, '$.job_id')) = OLD.id//

CREATE TRIGGER IF NOT EXISTS `after_delete_hps`
AFTER DELETE ON hyperparamsearch
FOR EACH ROW
UPDATE deployment_template AS dt
SET dt.item_deleted = JSON_SET(dt.item_deleted, '$.training', 3)
WHERE 
IF((JSON_VALUE(dt.template, '$.hps_id') IS NULL 
    OR JSON_VALUE(dt.template, '$.hps_id') = "null"), 
    0, JSON_VALUE(dt.template, '$.hps_id')) = OLD.id//

CREATE TRIGGER IF NOT EXISTS `after_delete_dataset`
AFTER DELETE ON dataset
FOR EACH ROW
UPDATE deployment_template AS dt
SET dt.item_deleted = JSON_SET(dt.item_deleted, '$.dataset',1)
WHERE JSON_VALUE(dt.template, '$.mount.dataset[0].name') = OLD.name
AND dt.workspace_id = OLD.workspace_id//
    
CREATE TRIGGER IF NOT EXISTS `workspace_exists_check`
AFTER DELETE ON workspace
FOR EACH ROW
UPDATE record_unified SET workspace_exists=0
WHERE record_unified.workspace_id = OLD.id//
"""
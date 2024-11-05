from settings import *

KUBE_ENV_JF_HOME_KEY="JF_HOME" # JF HOME DIR PATH KEY
KUBE_ENV_JF_HOME_KEY_ENV="$JF_HOME"
KUBE_ENV_JF_HOME_DEFAULT_VALUE=JF_TRAINING_POD_PATH

KUBE_ENV_JF_ITEM_OWNER_KEY="JF_HOST" # JF OWNER NAME KEY
KUBE_ENV_JF_ITEM_OWNER_KEY_ENV="$JF_HOST"

KUBE_ENV_JF_ITEM_ID_KEY="JF_ITEM_ID" # JF ITEM ID KEY (ex training_tool_id)
KUBE_ENV_JF_ITEM_ID_KEY_ENV="$JF_ITEM_ID"

KUBE_ENV_JF_ETC_DIR_KEY="JF_ETC"
KUBE_ENV_JF_ETC_DIR_KEY_ENV="$JF_ETC"
KUBE_ENV_JF_ETC_DIR_DEFAULT_VALUE=JF_ETC_DIR_POD_PATH

KUBE_ENV_JF_DEPLOYMENT_PWD_KEY="JF_DEPLOYMENT_PWD"
KUBE_ENV_JF_DEPLOYMENT_PWD_KEY_ENV="$JF_DEPLOYMENT_PWD"
# kube_setting_cmd에 있는 스크립트를 파일로 실행할 때 사용
def create_etc_sync_configmap():
    from utils.kube import coreV1Api
    from utils.kube_setting_cmd import ssh_linux_user_sync_cmd
    try:
        body = {
            "apiVersion": "v1",
            "kind": "ConfigMap",
            "metadata": {
                "name": "etc-sync"
            },
            "data": {
                "etc_sync.sh": ssh_linux_user_sync_cmd()
            }
        }
        try:
            coreV1Api.create_namespaced_config_map(namespace='default', body=body)
        except:
            coreV1Api.delete_namespaced_config_map(namespace='default', name='etc-sync')
            coreV1Api.create_namespaced_config_map(namespace='default', body=body)
    except:
        traceback.print_exc()

def create_configmap_all():
    # 한번 생성 된 파일인 삭제 후 다시 해야 변경 사항이 적용 가능함
    create_etc_sync_configmap()
    
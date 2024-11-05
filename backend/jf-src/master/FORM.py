from TYPE import *
import utils.common as common

def docker_image_info_form(docker_image_name: str, docker_image_id: int):
    # DOCKER_IMAGE_INFO_KEY
    return {
        "name": docker_image_name,
        "id": docker_image_id
    }       

def port_info_form(port_list):
    # PORT_INFO_KEY
    return {
        "port_forwarding_info": port_list
    }

def resource_info_form(gpu_count, gpu_model):
    # RESOURCE_INFO_KEY
    return {
        "gpu_count": gpu_count,
        "gpu_model": gpu_model
    }

def gpu_model_ui_form(gpu_model):
    # get_training()["gpu_model"]
    return common.convert_gpu_model(gpu_model)

def training_tool_edit_ui_form(training_tool_id, docker_image_name, docker_image_id, gpu_count, gpu_model, port_list):
    return {
        PORT_INFO_KEY: port_info_form(port_list=port_list),
        DOCKER_IMAGE_INFO_KEY: docker_image_info_form(docker_image_name=docker_image_name, docker_image_id=docker_image_id),
        RESOURCE_INFO_KEY: resource_info_form(gpu_count=gpu_count, gpu_model=gpu_model)
    }   

def training_tool_edit_ui_visible_form(ui_key_list, ui_form):
    for ui_key in ui_key_list:
        ui_form[ui_key]["visible"] = 1
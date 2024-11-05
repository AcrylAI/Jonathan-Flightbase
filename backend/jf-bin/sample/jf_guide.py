# 파라미터 - 작업 생성 시 파라미터를 입력받기 위해서 아래의 스크립트를 통해 원하는 파라미터를 추가해주세요(ex: epoch, batch_size, learning_rate, dropout_rate, layer_units)
import argparse
import os
parser = argparse.ArgumentParser()
parser.add_argument('--epoch', type=int, default=10) 
parser.add_argument('--batch_size', type=int, default=32)
parser.add_argument('--learning_rate', type=float, default=0.001)
# parser.add_argument('--parameter', type=parameter_type, default=parameter_default_value)
params, _ = parser.parse_known_args()
params = vars(params)

epoch = params['epoch']
batch_size = params['batch_size']
learning_rate = params['learning_rate']

# 데이터셋 경로 - job 생성시 선택한 데이터셋이 '/user_dataset' 하위에 위치해 있습니다
data_path = '/user_dataset'

# 체크포인트 경로 - 학습시 저장되는 체크포인트를 관리, 배포 및 서비스하기 위해서 '/checkpoints'에 저장하세요.
# Tensorboard도 해당 경로 아래 저장하면 확인 할 수 있습니다. * 완벽히 지원하고 있진 않음 개발 중 
checkpoint_path = '/checkpoints'

# 그래프 출력 - 학습시 아래의 스크립트를 통해 결과값(ex: accuracy, loss)들을 그래프로 볼 수 있습니다.
history = {
    "accuracy": [],
    "loss": [],
    "x" : { "label" : "epochs" , "value" : [] }
}
import random
for ep in range(epoch):
    accuracy = random.random() * 100 # 학습 accuracy
    loss = random.random() # 학습 loss
    history["accuracy"].append(accuracy)
    history["loss"].append(loss)
    history["x"]["value"].append(ep)
    
    # JOB GRAPH용 로그 이전 버전(권장하지 않음), 아직 지원하고 있으나 추후 삭제 될 수 있음
    print("\n=================\n","JF Training Metrics: {}".format(history),"\n=================\n")

    # JOB GRAPH용 로그 새버전
    os.system('echo "{}" > {}'.format(history, os.environ.get("JF_GRAPH_LOG_FILE_PATH")))

    # HPS 정보용 Job에서는 필요 없음
    print("[JF]Score={}".format(accuracy)
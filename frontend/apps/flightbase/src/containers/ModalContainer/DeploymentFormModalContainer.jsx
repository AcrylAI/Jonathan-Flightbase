import { createRef, PureComponent } from 'react';
import { cloneDeep } from 'lodash';

// i18n
import { withTranslation } from 'react-i18next';

// Components
import DeploymentFormModal from '@src/components/Modal/DeploymentFormModal';
import { toast } from '@src/components/Toast';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';
import Hangul from '@src/koreaUtils';

class DeploymentFormModalContainer extends PureComponent {
  _MODE = import.meta.env.VITE_REACT_APP_MODE;
  _isMount = false;

  state = {
    validate: false, // 모달의 submit 버튼 활성/비활성 여부 상태 값
    deploymentId: '', // Deployment id 값
    deploymentOptions: [
      { label: 'CPU', value: 'cpu' },
      { label: 'GPU', value: 'gpu' },
    ], // Deployment Type 선택 옵션
    deploymentName: '', // Deployment Name 값
    deploymentNameError: null, // Deployment Name 인풋 에러 텍스트
    deploymentDesc: '', // Deployment Description 값
    deploymentDescError: null, // Deployment Description 인풋 에러 텍스트
    workspace: null, // workspace 값
    workspaceError: null, // workspace 인풋 에러 텍스트
    workspaceOptions: [], // workspace 옵션

    deploymentType: 'built-in', // 배포 유형 값
    deploymentTypeOptions: [
      {
        label: 'Built-in',
        value: 'built-in',
        icon: '/images/icon/00-ic-data-built-in-yellow.svg',
      },
      {
        label: 'Custom',
        value: 'custom',
        icon: '/images/icon/00-ic-data-custom-yellow.svg',
      },
    ], // 배포 유형 옵션

    builtInType: null,
    builtInTypeOptions: [
      { label: 'user-trained', value: 'custom' },
      { label: 'pre-trained', value: 'default' },
    ],
    selectedBuiltInTypeIdx: undefined,
    dockerImageSelectedItemIdx: null,
    // Built-in 모델 옵션
    builtInUserTrainedModelOptions: [], // user-trained (Custom)
    builtInPreTrainedModelOptions: [], // pre-trained (Default)

    // Custom 모델 옵션
    customModelOptions: [],

    builtInFilter: null,
    builtInFilterOptions: [],
    modelOptions: [],

    // 커스텀 배포 - 실행코드
    instanceType: 'gpu',
    instanceTypeOptions: [
      { label: 'CPU', value: 'cpu' },
      { label: 'GPU', value: 'gpu' },
    ],
    gpuModelTypeOptions: [
      { label: 'random.label', value: 0 },
      { label: 'specificModel.label', value: 1 },
    ],
    gpuModelType: 0, // 무작위 선택이 디폴트 (변경 불가)
    gpuModelListOptions: [], // GPU 모델 선택 옵션
    gpuModelList: null, // 선택한 GPU 모델 리스트
    cpuModelList: [], // 선택한 CPU 모델 리스트 (노드)
    isMigModel: false, // 선택한 gpu model 리스트에 MIG 모델 포함 여부
    dockerImageOptions: [],
    dockerImage: null,
    dockerImageError: null,
    gpuCount: 0,
    gpuUsage: '', // 사용할 GPU(GPU usage) 수 값
    gpuUsageError: '', // 사용할 GPU 인풋 에러 텍스트
    gpuTotal: 0, // 사용가능한 gpu 수 값
    gpuFree: 0,
    maxGpuUsageCount: { gpuDeploymentTotal: 0, gpuServiceTotal: 0 }, // 사용 가능한 GPU 수
    accessTypeOptions: [
      // Access Type 선택 옵션
      { label: 'Public', value: 1 },
      { label: 'Private', value: 0 },
    ],
    deploymentStatus: '',
    accessType: 1, // 선택한 Access Type 값
    ownerOptions: [], // Owner 선택 옵션
    owner: null, // 선택한 Owner 값
    userList: [], // 유저 멀티 선택 옵션
    selectedList: [], // 선택된 유저 값
    tmpSelectedList: [],
    permissionLevel: -1,
    isTrainingModelDeleted: false,
    // * slider gpu
    sliderIsValidate: true,
    gpuModels: [],
    modelType: 0,
    gpuUsageStatus: '',
    gpuSelectedOptions: [],
    gpuDetailSelectedOptions: [],
    gpuTotalValue: 1,
    gpuRamTotalValue: 1,
    gpuDetailValue: 1,
    gpuRamDetailValue: 1,
    gpuTotalSliderMove: false,
    gpuSliderMove: false,
    gpuAndRamSliderValue: {
      cpu: 1,
      ram: 1,
    },
    // * slider cpu
    cpuModelStatus: [],
    cpuModelType: 0, // 무작위 선택이 디폴트 (변경 불가)
    cpuSwitchStatus: false,
    cpuSliderMove: false,
    cpuSelectedOptions: [],
    detailSelectedOptions: [],
    cpuTotalValue: 1,
    ramTotalValue: 1,
    cpuDetailValue: 1,
    ramDetailValue: 1,
    cpuAndRamSliderValue: { cpu: 1, ram: 1 },
    selectedDeploymentType: null,
    trainingList: [],
    originTrainingList: [],
    trainingSelectedType: { label: 'Custom', value: 'custom' },
    trainingSelectedOwner: {
      label: 'all.label',
      value: 'allOwner',
    },
    toolSelectedOwner: {
      label: 'all.label',
      value: 'toolAll',
    },

    trainingInputValue: '',
    trainingSelectTab: 0,
    trainingType: '',
    selectedTraining: null,
    selectedTrainingData: null,
    jobList: null,
    jobId: '',
    jobDetailList: null,
    jobDetailOpenList: [],
    hpsList: null,
    hpsDetailList: null,
    hpsDetailOpenList: [],
    hpsLogTable: [],
    selectedHpsId: '',
    selectedHpsScore: '',
    selectedHps: null,
    trainingToolTab: 0,
    selectedTool: null,
    selectedToolType: null,
    customLan: 'python',
    customFile: '',
    customParam: '',
    customList: [],
    originCustomList: [],
    customSearchValue: '',
    hpsLogList: [],
    hpsModelList: [],
    originHpsModelList: [],
    originJobModelList: [],
    jobModelList: [],
    selectedLogId: '',
    customRuncode: '',
    variablesValues: [{ key: '', value: '' }],
    selectedType: null,
    toolSearchValue: '',
    toolModelSearchValue: '',
    hpsModelSelectValue: '',
    jobModelSelectValue: '',
    trainingTypeArrow: {
      train: false,
      tool: false,
      model: false,
      variable: false,
      hps: false,
      hpsModel: false,
      jobModel: false,
    },
    templateData: [],
    makeNewGroup: false,
    clickedDataList: null,
    clickedTemplateLists: null,
    groupSelect: false,
    newGroupName: '',
    newGroupDescription: '',
    groupNameError: false,
    templateId: null,
    templateNewName: '',
    templateNewDescription: '',
    templateNameError: false,
    templateOpenStatus: false,
    customListStatus: null,
    modelList: [],
    originModelList: [],
    modelSearchValue: '',
    modelCategorySelect: { value: 'all' },
    modelSelectStatus: true,
    selectedModel: null, // 배포 유형 - built-in 모델 선택된 값
    jsonData: {}, // 배포유형 - 설정값입력
    jsonDataError: false,
    showSelectAgain: false,
    editModalTemplateId: null,
    editOriginSelectedModel: null,
    defaultGroupName: null,
    defaultTemplateName: null,
    groupData: null,
    deploymentTemplateType: null,
    jsonRef: createRef(),
    deploymentNoGroupSelected: false,
  };

  async componentDidMount() {
    const {
      type,
      data: { deploymentId, workspaceName },
    } = this.props;

    let sliderState = {
      cpuModelStatus: [],
      prevSliderData: {},
      gpuModelListOptions: [],
      gpuModels: {},
      modelType: this.state.modelType,
      type,
    };
    let newState = {};

    if (type === 'EDIT_DEPLOYMENT') {
      this._isMount = false;
      const response = await callApi({
        url: `deployments/${deploymentId}`,
        method: 'get',
      });

      const { result, status, message, error } = response;

      let type = result.deployment_template_type;

      this.setState({ showSelectAgain: true, modelSelectStatus: false });
      let { workspaceId } = this.props.data;
      // 배포 모달 옵션 정보 조회
      if (!workspaceId && result.workspace_id) {
        workspaceId = result.workspace_id;
      }
      const optionRes = await this.getOptions(workspaceId);
      const { trained_built_in_model_list: trainedBuiltInList } = optionRes;
      const { built_in_model_list: builtInModelList } = optionRes;

      const { cpuModelStatus } = this.parseOption(optionRes);
      newState.cpuModelStatus = cpuModelStatus;
      sliderState.cpuModelStatus = JSON.parse(JSON.stringify(cpuModelStatus));
      if (status === STATUS_SUCCESS) {
        // deployment data
        const {
          deployment_name: deploymentName,
          description: deploymentDesc,
          deployment_type: deploymentType,
          workspace_id: workspaceId,
          training_id: trainingModelId,
          built_in_model_id: builtInModelId,
          checkpoint,
          gpu_model: gpuModel,
          gpu_count: gpuUsage,
          user_id: ownerId,
          users: selectedUsers,
          docker_image_id: dockerImageId,
          access: accessType,
          node_name_detail: prevSliderData,
          gpu_model: gpuModels,
          deployment_template_type: deploymentTemplateType,
          deployment_template_id: editModalTemplateId,
          deployment_template: editOriginSelectedModel,
          permission_level: permissionLevel,
        } = result;
        this.setState({
          workspace: { label: result.workspace_id, value: result.workspace_id },
        });
        sliderState.prevSliderData = JSON.parse(JSON.stringify(prevSliderData));
        sliderState.gpuModels = JSON.parse(JSON.stringify(gpuModels));

        if (trainedBuiltInList && trainedBuiltInList.length > 0) {
          trainedBuiltInList.forEach((v) => {
            if (v.id === result.training_id) {
              newState.selectedModel = v;
            }
          });
        }

        // 배포 모달의 옵션 정보 조회
        const optionRes = await this.getOptions(workspaceId);
        const {
          builtInUserTrainedModelOptions,
          builtInPreTrainedModelOptions,
          customModelOptions,
          ownerOptions,
          gpuTotal,
          gpuFree,
          dockerImageOptions,
          builtInFilterOptions,
          gpuModelListOptions,
        } = this.parseOption(optionRes);

        sliderState.gpuModelListOptions = JSON.parse(
          JSON.stringify(gpuModelListOptions),
        );
        newState.deploymentTemplateType = deploymentTemplateType;
        newState.prevSliderData = prevSliderData;
        newState.gpuModels = gpuModels;
        newState.deploymentType = deploymentType;
        newState.deploymentId = deploymentId;
        newState.deploymentName = deploymentName;
        newState.deploymentNameError = '';
        newState.deploymentDesc = deploymentDesc;
        newState.deploymentDescError = '';
        newState.workspace = { label: workspaceId, value: workspaceId };
        newState.workspaceError = '';
        newState.workspaceOptions = [{ label: workspaceName, value: 0 }];
        newState.workspace = { label: workspaceName, value: 0 };
        newState.gpuCount = gpuUsage;
        newState.editModalTemplateId = editModalTemplateId;
        newState.editOriginSelectedModel = editOriginSelectedModel;
        newState.permissionLevel = permissionLevel;

        // 학습 모델 옵션 설정
        // 빌트인 모델 옵션
        if (deploymentTemplateType === 'pretrained') {
          newState.selectedModel = editOriginSelectedModel;
          if (builtInModelList && builtInModelList.length > 0) {
            builtInModelList.forEach((v) => {
              if (v.id === result.built_in_model_id) {
                newState.selectedModel = {
                  built_in_model_id: v.id,
                  built_in_model_name: v.name,
                  deployment_type: 'built-in',
                  ...v,
                };
              }
            });
          }
        }
        if (deploymentTemplateType === 'sandbox') {
          newState.jsonData = editOriginSelectedModel;
        }
        newState.builtInUserTrainedModelOptions =
          builtInUserTrainedModelOptions;
        newState.builtInPreTrainedModelOptions = builtInPreTrainedModelOptions;
        // 커스텀 모델 옵션 (배포 타입이 Custom)
        newState.customModelOptions = customModelOptions;
        const { model } = this.findModelAndBuiltInType(
          newState,
          deploymentType,
          trainingModelId || builtInModelId,
        );

        newState.model = model;

        newState.builtInFilterOptions = builtInFilterOptions;

        const checkpointArr = checkpoint ? checkpoint.split('/') : [];
        const targetCheckpoint = checkpointArr
          .slice(2, checkpointArr.length)
          .join('/');

        if (model) {
          if (
            editOriginSelectedModel.job_name ||
            editOriginSelectedModel.hps_name
          ) {
            this.getTrainingTypeData('usertrained', workspaceId);
          }
          if (
            deploymentType === 'built-in' &&
            deploymentTemplateType === 'usertrained'
          ) {
            newState.trainingType = 'built-in';
            newState.selectedDeploymentType = 'usertrained';
            newState.selectedTraining = editOriginSelectedModel.training_name;
            newState.trainingTypeArrow = {
              train: false,
              tool: false,
              model: false,
              hps: false,
              hpsModel: false,
              jobModel: false,
            };
            if (model.kind) {
              newState.builtInFilter = { label: model.kind, value: model.kind };
            }
            let jobList = '';
            let hpsList = '';

            if (
              editOriginSelectedModel.job_name ||
              editOriginSelectedModel.hps_name
            ) {
              const { jobListItem, hpsListItem } = await this.getJobList(
                editOriginSelectedModel,
                editOriginSelectedModel.training_name,
                true,
              );
              jobList = jobListItem;
              hpsList = hpsListItem;
            }

            const splitedChekcpoint =
              editOriginSelectedModel.checkpoint?.split('/');
            newState.checkpoint = splitedChekcpoint?.at(-1);

            if (editOriginSelectedModel.training_type === 'hps') {
              const hpsName = editOriginSelectedModel.hps_name;
              const hpsId = editOriginSelectedModel.hps_id;
              const hpsIdx = editOriginSelectedModel.hps_group_index;
              newState.trainingToolTab = 1;
              newState.trainingType = 'built-in';

              let hpsLogTable = [];
              hpsList.forEach((v, i) => {
                if (v.hps_name === hpsName) {
                  v.hps_group_list.forEach((model) => {
                    if (model.hps_id === hpsId) {
                      hpsLogTable = model.hps_number_info;
                    }
                  });
                }
              });

              this.toolSelectHandler({
                type: 'HPS',
                name: hpsName,
                jobId: hpsId,
                detailNumber: hpsIdx + 1,
                hpsLogTable: hpsLogTable,
                hpsCheckpoint: hpsLogTable.max_item.checkpoint_list,
              });

              newState.hpsModelSelectValue = splitedChekcpoint.at(-1);
            } else if (editOriginSelectedModel.training_type === 'job') {
              newState.jobModelSelectValue = splitedChekcpoint.at(-1);
              const jobName = editOriginSelectedModel.job_name;
              const jobId = editOriginSelectedModel.job_id;
              const jobIdx = editOriginSelectedModel.job_group_index;
              let checkpoint = [];
              jobList.forEach((v, i) => {
                if (v.job_name === jobName) {
                  v.job_group_list.forEach((model) => {
                    if (model.job_id === jobId) {
                      checkpoint = model.checkpoint_list;
                    }
                  });
                }
              });
              this.toolSelectHandler({
                type: 'JOB',
                name: jobName,
                jobId: jobId,
                detailNumber: jobIdx + 1,
                jobCheckpoint: checkpoint,
              });
              newState.trainingToolTab = 0;
              newState.trainingType = 'built-in';
            }
          } else if (deploymentType === 'custom') {
            await this.getJobList(
              editOriginSelectedModel,
              editOriginSelectedModel.training_name,
            );
            await this.getCustomList(editOriginSelectedModel);
            if (
              editOriginSelectedModel?.environments &&
              editOriginSelectedModel?.environments.length > 0
            ) {
              newState.variablesValues = editOriginSelectedModel.environments;
            }

            newState.trainingTypeArrow = {
              train: false,
              tool: false,
              model: false,
              variable: false,
              hps: false,
              hpsModel: false,
              jobModel: false,
            };
            newState.selectedTraining = editOriginSelectedModel.training_name;
            newState.selectedDeploymentType = 'usertrained';
            newState.trainingType = 'advanced';
            if (editOriginSelectedModel.command) {
              if (editOriginSelectedModel.command.arguments) {
                newState.customParam =
                  editOriginSelectedModel.command.arguments;
              }
              if (editOriginSelectedModel.command.binary) {
                newState.customLan = editOriginSelectedModel.command.binary;
              }
              if (editOriginSelectedModel.command.script) {
                newState.customFile = editOriginSelectedModel.command.script;
              }
            }
          }

          const { enableCpu, enableGpu } = model;
          // Job group setting

          // Group number setting
          if (newState.jobGroup) {
            // Checkpoint setting
            if (newState.groupNumber) {
              const { checkpointList = [] } = newState.groupNumber;
              newState.checkpointOptions = checkpointList.map(
                ({ name: checkpointTarget }) => {
                  if (checkpointTarget === targetCheckpoint) {
                    newState.checkpoint = {
                      label: checkpointTarget,
                      value: checkpointTarget,
                    };
                  }
                  return {
                    label: checkpointTarget,
                    value: checkpointTarget,
                  };
                },
              );
            }
          }

          // instance option setting
          newState.instanceTypeOptions = [
            { label: 'CPU', value: 'cpu', disabled: enableCpu === 0 },
            { label: 'GPU', value: 'gpu', disabled: enableGpu === 0 },
          ];
        }

        // 학습 모델이 삭제됐으면 아이콘을 보여줍니다.
        if (!newState.checkpoint) {
          newState.isTrainingModelDeleted = true;
        }

        // Instance Type setting
        newState.instanceType = 'gpu';

        // GPU usage setting
        newState.gpuUsage = gpuUsage;

        // DockerImage setting
        newState.dockerImage = dockerImageId;
        const dockerImage = dockerImageOptions.filter(
          ({ value }) => dockerImageId === value,
        )[0];
        newState.dockerImageOptions = dockerImageOptions;
        newState.dockerImage = dockerImage;
        // newState.dockerImageError = deploymentType === 'built-in' ? '' : null;

        // AccessType setting
        newState.accessType = accessType;

        // owner setting
        const targetOwnerOptions = [...ownerOptions];
        const ownerTmp = targetOwnerOptions.filter(
          ({ value }) => value === ownerId,
        )[0];
        const owner = !ownerTmp ? null : ownerTmp;
        newState.owner = owner;
        newState.ownerOptions = ownerOptions;

        // users setting
        const users = [...ownerOptions];
        const userList = [];
        const selectedList = [];
        for (let i = 0; i < users.length; i += 1) {
          const userItem = users[i];
          const { value: userId } = userItem;
          let flag = false;
          for (let j = 0; j < selectedUsers.length; j += 1) {
            const { id: selectedUserId } = selectedUsers[j];
            if (userId === selectedUserId) {
              flag = true;
              break;
            }
          }
          if (flag) {
            selectedList.push(userItem);
          } else {
            userList.push(userItem);
          }
        }
        newState.userList = userList;
        newState.selectedList = selectedList;
        newState.gpuTotal = gpuTotal;
        newState.gpuFree = gpuFree;

        // gpu model 선택 넣기
        let newGpuModelListOptions = [];

        let gpuModelObj = gpuModel !== null ? gpuModel : {};

        // 초기화
        const prevData = Object.keys(prevSliderData?.node_name_gpu);
        if (prevData.length === 0) {
          gpuModelObj = {};
        }
        newGpuModelListOptions = gpuModelListOptions.map((v) => {
          return {
            ...v,
            selected: Object.keys(gpuModelObj).indexOf(v.model) !== -1,
            node_list: v.node_list.map((n) => ({
              ...n,
              selected: gpuModelObj[n.model]
                ? gpuModelObj[n.model].indexOf(n.name) !== -1
                : false,
            })),
          };
        });

        const cpuModelList = [];
        newGpuModelListOptions.map(({ node_list: nodeList }, idx) => {
          cpuModelList[idx] = nodeList.filter(({ selected }) => selected);
          return cpuModelList;
        });

        const gpuModelList = newGpuModelListOptions.filter(
          ({ selected }) => selected,
        );

        const gpuState = this.gpuModelState(
          newGpuModelListOptions,
          gpuModelList,
          gpuUsage,
        );
        newState.selectedBuiltInTypeIdx = 0;
        newState = {
          ...newState,
          ...gpuState,
          cpuModelList,
          gpuModelType: gpuModel ? 1 : 0,
        };

        this.setState(newState, () => {
          this.sliderMountHandler(sliderState);
        });
        this.deploymentTypeHandler(type === 'custom' ? 'usertrained' : type);
      } else {
        errorToastMessage(error, message);
      }
    } else if (type === 'CREATE_DEPLOYMENT') {
      const {
        workspaceId,
        fromTraining,
        jobIdx,
        jobName,
        modelName,
        dockerImageName,
      } = this.props.data;

      newState.trainingTypeArrow = {
        train: true,
        tool: true,
        model: true,
        variable: true,
        hps: false,
        hpsModel: true,
        jobModel: true,
      };
      // 배포 모달 옵션 정보 조회
      const optionRes = await this.getOptions(workspaceId);
      const {
        builtInUserTrainedModelOptions,
        builtInPreTrainedModelOptions,
        customModelOptions,
        ownerOptions,
        workspaceOptions,
        gpuTotal,
        gpuFree,
        dockerImageOptions,
        builtInFilterOptions,
        gpuModelListOptions,
        cpuModelStatus,
      } = this.parseOption(optionRes);

      if (fromTraining) {
        this.setState({ selectedDeploymentType: 'usertrained' });
        const getTrainingList = await this.getTrainingTypeData('usertrained');
        let prevSelectedModel = [];
        getTrainingList?.usertrained_training_list.forEach((v) => {
          if (v.training_name === modelName) {
            prevSelectedModel = v;
          }
        });
        if (prevSelectedModel?.deployment_type === 'built-in') {
          const { jobListItem } = await this.getJobList(
            prevSelectedModel,
            modelName,
          );
          newState.trainingTypeArrow = {
            train: false,
            tool: false,
            model: true,
            variable: true,
            hps: false,
            hpsModel: true,
            jobModel: true,
          };
          let getJobItem = [];
          jobListItem.forEach((v) => {
            if (v?.job_name === jobName) {
              getJobItem = v;
            }
          });
          this.toolSelectHandler({
            type: 'JOB',
            name: getJobItem.job_name,
            jobId: getJobItem.job_group_list[jobIdx]?.job_id,
            detailNumber: getJobItem.job_group_list.length - jobIdx,
            jobCheckpoint: getJobItem.job_group_list[jobIdx]?.checkpoint_list,
          });
        }
      }

      sliderState.gpuModelListOptions = JSON.parse(
        JSON.stringify(gpuModelListOptions),
      );
      sliderState.cpuModelStatus = JSON.parse(JSON.stringify(cpuModelStatus));
      newState.cpuModelStatus = cpuModelStatus;

      if (workspaceId) {
        // isUserModal 변수에 값이 있을 경우 유저 화면에서 배포 생성
        const { deploymentType } = this.state; // 현재 선택된 배포 타입
        const loginUserName = sessionStorage.getItem('user_name'); // 로그인한 유저의 이름

        // 학습 모델 옵션 설정
        newState.builtInUserTrainedModelOptions =
          builtInUserTrainedModelOptions;
        newState.builtInPreTrainedModelOptions = builtInPreTrainedModelOptions;
        newState.customModelOptions = customModelOptions; // 커스텀 모델 옵션 (배포 타입이 Custom)
        newState.builtInFilterOptions = builtInFilterOptions;

        // 도커이미지(docker image) 초기 설정 - 초기 도커 이미지를 jf-default로 설정
        let dockerImage = dockerImageOptions.filter(
          ({ label }) => label === 'jf-default',
        )[0];

        // 빠른 배포 생성 시 도커이미지 받아온걸로 설정
        if (fromTraining) {
          dockerImage = dockerImageOptions.filter(
            ({ label }) => label === dockerImageName,
          )[0];
        }
        newState.dockerImageOptions = dockerImageOptions;
        newState.dockerImage =
          deploymentType === 'built-in' ? dockerImage : null;

        let selectedIdx = 0;
        dockerImageOptions.forEach((v, i) => {
          if (dockerImage.value === v.value) {
            selectedIdx = i;
          }
        });

        newState.dockerImageSelectedItemIdx = selectedIdx;
        // newState.dockerImageError = deploymentType === 'built-in' ? '' : null;

        // 소유자(owner) 설정 - 초가 owner를 로그인한 유저로 설정(변경 가능)
        const owner = ownerOptions.filter(
          ({ label }) => loginUserName === label,
        )[0];
        newState.owner = owner;
        newState.ownerOptions = ownerOptions;

        // 사용자(User) 초기 설정
        newState.userList = ownerOptions;

        // 워크스페이스 초기 설정 - 유저 화면에서는 workspace 인풋 제공하지 않음
        newState.workspace = { label: '', value: parseInt(workspaceId, 10) };
        newState.workspaceError = '';

        // 사용가능한 GPU 수 설정
        newState.gpuTotal = gpuTotal;
        newState.gpuFree = gpuFree;

        // GPU model setting
        newState.gpuModelListOptions = gpuModelListOptions;
        if (this.props.data.checkpoint) {
          const selectedModel = [];
          builtInUserTrainedModelOptions?.forEach((v) => {
            if (v.title === this.props.data.modelName) {
              selectedModel.push(v);
              newState.model = v;
            }
          });
        }
      } else {
        // 어드민 페이지에서 트레이닝 생성
        newState.workspaceOptions = workspaceOptions;
      }

      this.setState(newState, () => {
        if (this.props.data.checkpoint) {
          const userType = { label: 'user-trained', value: 'custom' };
          this.selectInputHandler('builtInType', userType);
          if (
            this.props.data.checkpoint &&
            newState.model?.jobList?.length > 0
          ) {
            this.state.model.jobList.forEach((v, i) => {
              if (this.props.data.jobName === v.name) {
                const newJobGroup = {
                  groupList: v.group_list,
                  value: v.id,
                  label: v.name,
                };
                this.selectInputHandler('jobGroup', newJobGroup);
                v.group_list.forEach((value) => {
                  if (this.props.data.jobIdx === value.name) {
                    const newGroupNumber = {
                      checkpointList: value.checkpoint_list,
                      label: value.name,
                      value: value.id,
                    };
                    this.selectInputHandler('groupNumber', newGroupNumber);
                  }
                });
              }
            });
          }
        }
        this.sliderMountHandler(sliderState);
      });
    }
  }

  sliderMountHandler = ({
    cpuModelStatus,
    prevSliderData,
    gpuModelListOptions,
    gpuModels,
    modelType,
    type,
  }) => {
    const newState = {};
    if (cpuModelStatus?.length > 0) {
      const selectedOptions = [];
      const detailSelectedOption = [];
      let selectedItemBucket = [];
      let nodeCpuObj = {};
      let nodeRamObj = {};
      const cpuObj = {};
      const ramObj = {};
      let cpuPerPod = 1;
      let ramPerPod = 1;
      cpuModelStatus.forEach(({ node_list: nodeList }, idx) => {
        nodeCpuObj = {};
        nodeRamObj = {};
        selectedItemBucket = [];
        selectedOptions.push({ [idx]: false });
        if (nodeList?.length > 0) {
          nodeList.forEach(({ resource_info }) => {
            const {
              cpu_cores_limit_per_pod: cpuPod,
              ram_limit_per_pod: ramPod,
            } = resource_info;

            if (cpuPerPod < cpuPod) {
              cpuPerPod = cpuPod;
            }

            if (ramPerPod < ramPod) {
              ramPerPod = ramPod;
            }
          });

          newState.cpuAndRamSliderValue = { cpu: cpuPerPod, ram: ramPerPod };

          let isActive = false;
          nodeList.forEach((v, i) => {
            let selectedItemValue = false;
            let prevCpuValue = 1;
            let prevRamValue = 1;
            if (prevSliderData && type === 'EDIT_DEPLOYMENT') {
              //* EDIT이면

              const prevCpu = Object.keys(prevSliderData.node_name_cpu);
              if (this.state.gpuCount === 0) {
                newState.modelType = 1;
                newState.instanceType = 'cpu';
                if (prevCpu.length < 1) {
                  newState.cpuModelType = 0;
                }
              }
              if (prevCpu.length > 0) {
                newState.modelType = 1;
                newState.cpuModelType = 1;
                newState.instanceType = 'cpu';
                if (prevSliderData.node_name_cpu_all.is_active) {
                  prevCpuValue =
                    prevSliderData.node_name_cpu_all.cpu_cores_limit_per_pod;
                  prevRamValue =
                    prevSliderData.node_name_cpu_all.ram_limit_per_pod;
                  isActive = true;
                  newState.cpuSwitchStatus = false;
                  newState.cpuSliderMove = true;
                } else if (
                  prevSliderData.node_name_cpu_all.is_active === false
                ) {
                  newState.cpuSwitchStatus = true;
                }

                prevCpu.forEach((nodeName) => {
                  if (nodeName === v.node_name) {
                    selectedOptions[idx][idx] = true;
                    const { cpu_cores_limit_per_pod, ram_limit_per_pod } =
                      prevSliderData.node_name_cpu[nodeName];

                    const prevMaxGpuValue =
                      prevCpuValue > cpu_cores_limit_per_pod
                        ? cpu_cores_limit_per_pod
                        : prevCpuValue;
                    const prevMaxRamValue =
                      prevRamValue > ram_limit_per_pod
                        ? ram_limit_per_pod
                        : prevRamValue;

                    nodeCpuObj[i] = isActive
                      ? prevMaxGpuValue
                      : cpu_cores_limit_per_pod; // 일단 20인데 그 안에 prevValue를 넣어야함
                    nodeRamObj[i] = isActive
                      ? prevMaxRamValue
                      : ram_limit_per_pod;
                    newState.sliderIsValidate = true;
                    selectedItemValue = true;
                  } else {
                    if (!nodeCpuObj[i] && !nodeRamObj[i]) {
                      nodeCpuObj[i] = 1;
                      nodeRamObj[i] = 1;
                    }
                  }
                });
              } else {
                nodeCpuObj[i] = 1;
                nodeRamObj[i] = 1;
                selectedItemValue = false;
                newState.sliderIsValidate = true;
              }
            } else {
              nodeCpuObj[i] = 1;
              nodeRamObj[i] = 1;
              selectedItemValue = false;
            }
            selectedItemBucket.push(selectedItemValue);
          });
          detailSelectedOption.push({ [idx]: selectedItemBucket });
          cpuObj[idx] = nodeCpuObj;
          ramObj[idx] = nodeRamObj;
        }
      });
      newState.cpuDetailValue = cpuObj;
      newState.ramDetailValue = ramObj;
      newState.cpuSelectedOptions = selectedOptions;
      newState.detailSelectedOptions = detailSelectedOption;
    }

    // gpu 기본 state 깔기
    if (gpuModelListOptions?.length > 0) {
      const selectedOptions = [];
      const detailSelectedOption = [];
      let selectedItemBucket = [];
      let nodeGpuObj = {};
      let nodeRamObj = {};
      const gpuObj = {};
      const ramObj = {};
      let gpuPerPod = 1;
      let ramPerPod = 1;
      gpuModelListOptions.forEach(({ node_list: nodeList, model }, idx) => {
        nodeGpuObj = {};
        nodeRamObj = {};
        selectedItemBucket = [];
        selectedOptions.push({ [idx]: false });
        if (nodeList?.length > 0) {
          nodeList.forEach(({ resource_info }) => {
            const {
              cpu_cores_limit_per_gpu: gpuPod,
              ram_limit_per_gpu: ramPod,
            } = resource_info;
            if (gpuPerPod < gpuPod) {
              gpuPerPod = gpuPod;
            }
            if (ramPerPod < ramPod) {
              ramPerPod = ramPod;
            }
          });
          newState.gpuAndRamSliderValue = { cpu: gpuPerPod, ram: ramPerPod };
          let isActive = false;

          nodeList.forEach((v, i) => {
            let selectedItemValue = false;
            let prevGpuValue = 1;
            let prevRamValue = 1;
            if (prevSliderData && type === 'EDIT_DEPLOYMENT') {
              // * EDIT이면
              let prevSelectedGpuModels = [];
              if (gpuModels) {
                prevSelectedGpuModels = Object.keys(gpuModels);
              }
              const prevSelectedGpuModelCheck =
                prevSelectedGpuModels.indexOf(model);
              const prevGpu = Object.keys(prevSliderData.node_name_gpu);
              if (prevGpu.length > 0 && prevSliderData.node_name_gpu_all) {
                newState.modelType = 0;
                newState.instanceType = 'gpu';
                if (prevSelectedGpuModels.length > 0) {
                  newState.gpuModelType = 1;
                } else {
                  newState.sliderIsValidate = true;
                  newState.gpuSwitchStatus = false;
                }
                if (prevSliderData.node_name_gpu_all.is_active) {
                  prevGpuValue =
                    prevSliderData.node_name_gpu_all.cpu_cores_limit_per_gpu;
                  prevRamValue =
                    prevSliderData.node_name_gpu_all.ram_limit_per_gpu;
                  isActive = true;
                  newState.gpuTotalSliderMove = true;
                  newState.gpuSwitchStatus = false;
                } else if (
                  prevSliderData.node_name_gpu_all.is_active === false
                ) {
                  newState.gpuSwitchStatus = true;
                }
                prevGpu.forEach((nodeName) => {
                  if (nodeName === v.name && prevSelectedGpuModelCheck !== -1) {
                    selectedOptions[idx][idx] = true;

                    // 숫자있느곳에 이제 해당하는 곳에 값을 넣는다.
                    const { cpu_cores_limit_per_gpu, ram_limit_per_gpu } =
                      prevSliderData.node_name_gpu[nodeName];

                    const prevMaxGpuValue =
                      prevGpuValue > cpu_cores_limit_per_gpu
                        ? cpu_cores_limit_per_gpu
                        : prevGpuValue;
                    const prevMaxRamValue =
                      prevRamValue > ram_limit_per_gpu
                        ? ram_limit_per_gpu
                        : prevRamValue;

                    nodeGpuObj[i] = isActive
                      ? prevMaxGpuValue
                      : cpu_cores_limit_per_gpu;
                    nodeRamObj[i] = isActive
                      ? prevMaxRamValue
                      : ram_limit_per_gpu;
                    if (modelType === 0) {
                      newState.sliderIsValidate = true;
                    }
                    selectedItemValue = true;
                  } else {
                    if (!nodeGpuObj[i] && !nodeRamObj[i]) {
                      nodeGpuObj[i] = 1;
                      nodeRamObj[i] = 1;
                    }
                  }
                });
              } else {
                nodeGpuObj[i] = 1;
                nodeRamObj[i] = 1;
                selectedItemValue = false;
                newState.sliderIsValidate = true;
              }
            } else {
              nodeGpuObj[i] = 1;
              nodeRamObj[i] = 1;
              selectedItemValue = false;
            }
            selectedItemBucket.push(selectedItemValue);
          });
          detailSelectedOption.push({ [idx]: selectedItemBucket });
          gpuObj[idx] = nodeGpuObj;
          ramObj[idx] = nodeRamObj;
        }
      });

      newState.gpuDetailValue = gpuObj;
      newState.gpuRamDetailValue = ramObj;
      newState.gpuSelectedOptions = selectedOptions;
      newState.gpuDetailSelectedOptions = detailSelectedOption;
    }
    if (prevSliderData) {
      const prevGpuTotalValue =
        prevSliderData?.node_name_gpu_all?.cpu_cores_limit_per_gpu;
      const prevCpuTotalValue =
        prevSliderData?.node_name_cpu_all?.cpu_cores_limit_per_pod;

      const prevRamTotalValue =
        prevSliderData?.node_name_cpu_all?.ram_limit_per_pod;

      const prevGpuRamTotalValue =
        prevSliderData?.node_name_gpu_all?.ram_limit_per_gpu;

      newState.gpuTotalValue =
        typeof prevGpuTotalValue === 'number' ? prevGpuTotalValue : 1;

      newState.cpuTotalValue =
        typeof prevCpuTotalValue === 'number' ? prevCpuTotalValue : 1;

      newState.ramTotalValue =
        typeof prevRamTotalValue === 'number' ? prevRamTotalValue : 1;

      newState.gpuRamTotalValue =
        typeof prevGpuRamTotalValue === 'number' ? prevGpuRamTotalValue : 1;
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  trainingSelectHandler = (name) => {
    const newState = {};
    newState.selectedTraining = name;
    this.setState(newState);
  };

  toolSelectHandler = ({
    type,
    name,
    jobId,
    detailNumber,
    hpsLogTable,
    jobCheckpoint,
    hpsCheckpoint,
  }) => {
    const newState = {};
    if (type === 'JOB') {
      newState.selectedToolType = 'job';
      newState.jobModelList = jobCheckpoint;
      newState.originJobModelList = jobCheckpoint;
      newState.jobModelSelectValue = '';
      newState.jobId = jobId;
    } else {
      newState.selectedHpsId = hpsLogTable?.max_item?.hps_id;
      newState.selectedHpsScore = hpsLogTable?.max_item?.target;
      newState.selectedLogId = hpsLogTable?.max_item?.id;
      newState.hpsLogTable = hpsLogTable;
      newState.selectedToolType = 'hps';
      newState.hpsModelSelectValue = '';
      newState.hpsModelList = hpsCheckpoint;
      newState.originHpsModelList = hpsCheckpoint;
    }
    newState.selectedTool = `${type} / ${name} / ${type}${detailNumber}`;

    this.templateIdReset();
    this.trainingTypeArrowCustomHandler('tool', false);
    this.setState(newState, () => this.submitBtnCheck());
  };

  toolDetailOpenHandler = (idx, type) => {
    const newState = {};

    const { jobDetailOpenList, hpsDetailOpenList } = this.state;

    const newDetailOpenList = [];
    if (type === 'job') {
      jobDetailOpenList.forEach((v, i) => {
        if (i === idx) {
          newDetailOpenList.push({ arrow: !v.arrow });
        } else {
          newDetailOpenList.push(v);
        }
      });
      newState.jobDetailOpenList = newDetailOpenList;
    } else if (type === 'hps') {
      hpsDetailOpenList.forEach((v, i) => {
        if (i === idx) {
          newDetailOpenList.push({ arrow: !v.arrow });
        } else {
          newDetailOpenList.push(v);
        }
      });
      newState.hpsDetailOpenList = newDetailOpenList;
    }

    this.setState(newState);
  };

  getTrainingTypeData = async (type, wid) => {
    let workspaceId = this.props.data.workspaceId;
    if (this.state.workspace) {
      workspaceId = this.state.workspace.value;
    }
    if (!this.state.workspace && !workspaceId && wid) {
      workspaceId = wid;
    }
    const newState = {};

    const response = await callApi({
      url: `options/deployments/templates?workspace_id=${workspaceId}&deployment_template_type=${type}`,
      method: 'get',
    });

    const { result, status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      newState.trainingList = result;
      newState.originTrainingList = result;
    } else {
      errorToastMessage(error, message);
    }
    this.setState(newState);
    return result;
  };

  /** ================================================================================
   * API START
   ================================================================================ */

  // workspace 목록 조회
  getWorkspacesData = async () => {
    const response = await callApi({
      url: 'workspaces',
      method: 'get',
    });

    const { result, status } = response;
    if (status === STATUS_SUCCESS) {
      return result.list;
    }
    return [];
  };

  // Deployment 생성을 위한 옵션 정보 조회
  getOptions = async (workspaceId) => {
    const response = await callApi({
      url: `options/deployments${
        workspaceId ? `?workspace_id=${workspaceId}` : ''
      }`,
      method: 'get',
    });
    const { result, status, message } = response;
    if (status === STATUS_SUCCESS) {
      return result;
    }
    toast.error(message);
    return {};
  };

  // 배포 생성/수정
  onSubmit = async (callback) => {
    const { type } = this.props;
    const url = 'deployments';
    let method = 'POST';
    const {
      deploymentName,
      gpuUsage,
      instanceType,
      accessType,
      owner,
      tmpSelectedList: selectedList,
      deploymentId,
      deploymentDesc: description,
      workspace,
      dockerImage,
      gpuModelType,
      cpuModelList,
      selectedDeploymentType, // 4가지중 어떤거 선택했느지
      trainingToolTab, // Job 0 인지 Hps 1 인지
      jobId,
      jobModelSelectValue, // job - 체크포인트
      hpsModelSelectValue, // hps - 체크포인트
      selectedTrainingData,
      selectedHpsId,
      selectedLogId,
      selectedModel,
      jsonData,
      templateOpenStatus,
      templateNewName,
      makeNewGroup,
      templateNewDescription,
      newGroupDescription,
      editModalTemplateId,
      editOriginSelectedModel,
      clickedDataList,
      defaultGroupName,
      defaultTemplateName,
      trainingType,
      customLan,
      customFile,
      customParam,
      variablesValues,
      templateId,
    } = this.state;

    const gpuModelNodeListJson = {};
    if (gpuModelType === 1) {
      cpuModelList.map((v) => {
        if (v.length > 0) {
          v.map(({ name, model: m }, idx) => {
            if (idx === 0) {
              gpuModelNodeListJson[m] = [name];
            } else {
              gpuModelNodeListJson[m].push(name);
            }
            return gpuModelNodeListJson[m];
          });
        }
        return gpuModelNodeListJson;
      });
    }
    const { node_name_gpu, node_name_cpu } = this.getSliderData();

    const body = {
      workspace_id: workspace.value,
      deployment_name: deploymentName,
      // deployment_type: deploymentType,
      owner_id: owner.value,
      instance_type: instanceType,
      access: accessType,
      description,
      docker_image_id: dockerImage.value,
      gpu_model: gpuModelType === 1 ? gpuModelNodeListJson : null,
      node_name_gpu,
      node_name_cpu,
    };
    if (selectedDeploymentType === 'usertrained') {
      if (trainingType === 'built-in') {
        body.deployment_type = 'built-in';
        if (trainingToolTab === 0) {
          // Job
          body.training_type = 'job';
          body.training_id = selectedTrainingData.training_id;
          body.job_id = jobId;
          body.checkpoint = jobModelSelectValue;
          body.built_in_model_id = selectedTrainingData.built_in_model_id;
        } else {
          // Hps
          body.training_type = 'hps';
          body.checkpoint = hpsModelSelectValue;
          body.training_id = selectedTrainingData.training_id;
          body.hps_id = selectedHpsId;
          body.hps_number = selectedLogId;
          body.built_in_model_id = selectedTrainingData.built_in_model_id;
        }
      } else if (trainingType === 'advanced') {
        const command = {
          binary: customLan,
          script: customFile,
          arguments: customParam,
        };

        body.deployment_type = 'custom';
        body.training_id = selectedTrainingData.training_id;
        body.command = command;
        if (variablesValues.length > 0) {
          const newVariablesValues = [];

          variablesValues.forEach((v) => {
            if (v.name !== '' && v.value !== '') {
              newVariablesValues.push(v);
            }
          });

          if (newVariablesValues.length > 0) {
            body.environments = newVariablesValues;
          }
        }
      }
    } else if (selectedDeploymentType === 'pretrained') {
      body.built_in_model_id = selectedModel.built_in_model_id;
      body.deployment_type = 'built-in';
    } else if (selectedDeploymentType === 'sandbox') {
      body.deployment_template = jsonData;
      body.deployment_type = 'custom';
    }

    if (templateOpenStatus) {
      body.deployment_template_name = templateNewName || defaultTemplateName;
      if (templateNewDescription)
        body.deployment_template_description = templateNewDescription;
      body.deployment_template_name = templateNewName || defaultTemplateName;
      if (makeNewGroup) {
        body.deployment_template_group_name =
          templateNewName || defaultGroupName;
        if (newGroupDescription) {
          body.deployment_template_group_description = newGroupDescription;
        }
      } else if (clickedDataList) {
        body.deployment_template_group_id = clickedDataList.id;
      }
    }

    if (type === 'EDIT_DEPLOYMENT') {
      method = 'PUT';
      body.deployment_id = deploymentId;
      // 수정 -> 템플릿 추가
      if (
        selectedDeploymentType === 'pretrained' &&
        editOriginSelectedModel.built_in_model_id ===
          selectedModel.built_in_model_id &&
        !templateOpenStatus
      ) {
        body.deployment_template_id = editModalTemplateId;
      }
    } else {
      if (templateId !== null) {
        body.deployment_template_id = templateId;
      }
    }
    // instanceType이 gpu 일 때 gpu_count 추가
    if (instanceType === 'gpu') {
      body.gpu_count = parseInt(gpuUsage, 10);
    }
    // accessType이 private 일 때 users_id 추가
    if (accessType === 0) {
      body.users_id = selectedList.map(({ value }) => value);
    }
    const response = await callApi({ url, method, body });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      if (type === 'CREATE_DEPLOYMENT') {
        this.getTemplateListHandler();
        this.getGroupData();
        defaultSuccessToastMessage('create');
      } else {
        defaultSuccessToastMessage('update');
      }
      if (callback) callback();
      return true;
    }
    errorToastMessage(error, message);
    return false;
  };
  /** ================================================================================
   * API END
   ================================================================================ */

  /** ================================================================================
   * Event Handler START
   ================================================================================ */

  getSliderData = () => {
    const {
      cpuModelStatus,
      cpuDetailValue,
      ramDetailValue,
      detailSelectedOptions,
      gpuModelListOptions,
      cpuSliderMove,
      cpuTotalValue,
      ramTotalValue,
      gpuDetailSelectedOptions,
      gpuDetailValue,
      gpuRamDetailValue,
      gpuTotalSliderMove,
      gpuTotalValue,
      gpuRamTotalValue,
      cpuModelType,
      modelType,
    } = this.state;
    const node_name_cpu = {};
    const node_name_gpu = {};
    if (modelType === 1) {
      if (cpuModelType === 1) {
        cpuModelStatus.forEach((v, i) => {
          v.node_list?.forEach((node, idx) => {
            if (detailSelectedOptions[i][i][idx]) {
              //*  Check 여부 판단
              const sliderCpuValue = Object.values(cpuDetailValue[i]);
              const sliderRamValue = Object.values(ramDetailValue[i]);
              Object.assign(node_name_cpu, {
                [node?.node_name]: {
                  cpu_cores_limit_per_pod: sliderCpuValue[idx],
                  ram_limit_per_pod: sliderRamValue[idx],
                },
              });
            }
          });
        });
        Object.assign(node_name_cpu, {
          '@all': {
            is_active: cpuSliderMove,
            // detail과 같은 key로 total값 넣는다.
            cpu_cores_limit_per_pod: cpuTotalValue,
            ram_limit_per_pod: ramTotalValue,
          },
        });
      }
    } else {
      gpuModelListOptions.forEach((v, i) => {
        v.node_list?.forEach((node, idx) => {
          if (gpuDetailSelectedOptions[i][i][idx]) {
            //*  Check 여부 판단
            const sliderGpuValue = Object.values(gpuDetailValue[i]);
            const sliderRamValue = Object.values(gpuRamDetailValue[i]);

            Object.assign(node_name_gpu, {
              [node?.name]: {
                cpu_cores_limit_per_gpu: sliderGpuValue[idx],
                ram_limit_per_gpu: sliderRamValue[idx],
              },
            });
          }
        });
      });
      const gpuAllData = {
        '@all': {
          is_active: gpuTotalSliderMove,
          cpu_cores_limit_per_gpu: gpuTotalValue,
          ram_limit_per_gpu: gpuRamTotalValue,
        },
      };
      Object.assign(node_name_gpu, gpuAllData);
    }
    return { node_name_gpu, node_name_cpu };
  };

  // 라디오 버튼 이벤트 핸들러 (Deployment Type)
  radioBtnHandler = (e) => {
    const { name, value } = e.target;

    const newState = {
      [name]:
        name === 'accessType' || name === 'gpuModelType'
          ? parseInt(value, 10)
          : value,
    };
    if (name === 'deploymentType') {
      const { dockerImageOptions } = this.state;

      // 도커이미지 설정
      const dockerImage = dockerImageOptions.filter(
        ({ label }) => label === 'jf-default',
      )[0];

      // newState.trainingModel = null;
      newState.checkpoint = null;
      newState.checkpointOptions = [];

      if (value === 'built-in') {
        newState.dockerImage = dockerImage;
        // newState.dockerImageError = '';
      } else {
        newState.dockerImageSelectedItemIdx = null;
        newState.dockerImage = null;
        //  newState.dockerImageError = null;
      }
    }
    if (name === 'gpuModelType' && value === 0) {
      newState.gpuUsageError = '';
    }
    if (name === 'instanceType') {
      newState.gpuUsage = value === 'cpu' ? 0 : 1;
      newState.gpuUsageError = '';
      if (value !== 'cpu') {
        newState.gpuUsage = '';
        newState.gpuUsageError = null;
        newState.gpuModelType = 1;
      } else {
        newState.gpuModelType = 0;
      }
    }

    if (name === 'gpuModelType') {
      if (parseInt(value, 10) === 0) {
        newState.gpuUsage = 1;
        newState.gpuUsageError = '';
      } else {
        const { gpuModelList, isMigModel } = this.state;

        if (!gpuModelList || gpuModelList.length === 0) {
          newState.gpuUsageError = null;
        } else if (isMigModel) {
          newState.gpuUsage = 1;
          newState.gpuUsageError = '';
        }
      }
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  variableInputHandler = ({ e = { target: { value: '' } }, idx, key }) => {
    this.templateIdReset();
    const { variablesValues } = this.state;

    let { value } = e.target;

    const newVariables = [];

    if (key === 'key') {
      variablesValues.forEach((v, i) => {
        if (idx === i) {
          const val = v.value;
          newVariables.push({ name: value, value: val });
        } else {
          newVariables.push(v);
        }
      });
    } else if (key === 'value') {
      variablesValues.forEach((v, i) => {
        if (idx === i) {
          const key = v.name;
          newVariables.push({ name: key, value });
        } else {
          newVariables.push(v);
        }
      });
    }

    this.setState({ variablesValues: newVariables });
  };

  // 텍스트 인풋 이벤트 핸들러 (Deployment Name)
  textInputHandler = (e) => {
    const { name, value } = e.target;
    const newState = {
      [name]:
        name === 'gpuUsage' && typeof value === 'number'
          ? parseInt(value, 10)
          : value,
      [`${name}Error`]: null,
    };

    const validate = this.validate(name, value);
    if (validate) {
      newState[`${name}Error`] = validate;
    } else if (name === 'deploymentDesc' && value.trim() === '') {
      newState[`${name}Error`] = null;
    } else {
      newState[`${name}Error`] = '';
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 넘버 인풋 이벤트 핸들러
  numberInputHandler = (e) => {
    const { name, value } = e;
    const newState = {
      [name]: value,
      [`${name}Error`]: null,
    };

    const validate = this.validate(name, value);

    if (validate) {
      newState[`${name}Error`] = validate;
    } else {
      newState[`${name}Error`] = '';
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  trainingToolTabHandler = (tab) => {
    const { trainingToolTab } = this.state;
    const newState = {};
    if (tab === 0) {
      newState.selectedHpsScore = '';
      newState.hpsLogTable = [];
      if (trainingToolTab === 1) {
        this.toolSortHandler({
          type: 'job',
          selectedItem: { label: 'all.label', value: 'allOwner' },
        });

        newState.toolSearchValue = '';
        newState.selectedToolType = null;
        newState.selectedTool = null;
      }
    }
    if (trainingToolTab === 0 && tab === 1) {
      this.toolSortHandler({
        type: 'hps',
        selectedItem: { label: 'all.label', value: 'allOwner' },
      });
      newState.toolSearchValue = '';
      newState.selectedToolType = null;
      newState.selectedTool = null;
    }
    newState.trainingToolTab = tab;
    this.setState(newState);
  };

  runcodeClickHandler = ({ name }) => {
    const newState = {};
    newState.customRuncode = name;
    newState.customFile = name;
    this.setState(newState);
  };

  getCustomList = async (training) => {
    this.setState({ customListStatus: true, customList: [] });
    const newState = {};
    setTimeout(() => {
      this.setState({ customListStatus: false });
    }, 2000);
    const response = await callApi({
      url: `options/deployments/templates/custom?training_id=${training?.training_id}`,
      method: 'get',
    });

    const { result, status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      newState.customList = result.run_code_list;
      newState.originCustomList = result.run_code_list;
    } else {
      errorToastMessage(error, message);
    }
    this.setState(newState);
  };

  getJobList = async (train, name, token) => {
    const newState = {};
    const jobDetailLength = [];
    const hpsDetailLength = [];
    newState.toolSearchValue = '';

    newState.deploymentType = train.deployment_type;

    if (train.deployment_type === 'built-in') {
      newState.dockerImage = this.state.dockerImageOptions.filter(
        (data) => data.value === train.docker_image_id,
      )[0];
    }

    newState.selectedTool = null;
    newState.selectedToolType = null;
    newState.toolModelSearchValue = '';
    newState.hpsModelSelectValue = '';
    newState.jobModelSelectValue = '';
    newState.selectedModel = train;
    newState.selectedHpsScore = '';
    newState.jobModelSelectValue = '';
    newState.hpsModelSelectValue = '';

    newState.jobModelList = [];
    newState.hpsLogList = [];
    newState.hpsModelList = [];
    newState.jobList = null;
    newState.jobDetailList = null;
    newState.jobDetailOpenList = [];
    newState.hpsList = null;
    newState.hpsDetailList = null;
    newState.hpsDetailOpenList = [];
    newState.trainingToolTab = 0;
    newState.selectedTool = null;

    newState.customLan = 'python';
    newState.customFile = '';
    newState.customParam = '';

    newState.customSearchValue = '';

    newState.customRuncode = '';
    newState.variablesValues = [{ name: '', value: '' }];

    this.trainingSelectHandler(name);

    newState.selectedTrainingData = train;

    this.setState({ trainingType: train.training_type });

    if (train.enable_to_deploy_with_gpu && !train.deployment_multi_gpu_mode) {
      newState.gpuUsage = 1;
    }

    if (train.training_type && !token) {
      this.templateIdReset();
    }

    const response = await callApi({
      url: `options/deployments/templates/usertrained?training_id=${train?.training_id}`,
      method: 'get',
    });

    const { result, status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      const { job_list, hps_list } = result;

      job_list.forEach((v) => {
        jobDetailLength.push({ arrow: false });
      });
      hps_list.forEach((v) => {
        hpsDetailLength.push({ arrow: false });
      });
      newState.jobList = job_list;
      newState.hpsList = hps_list;
      newState.originJobList = job_list;
      newState.originHpsList = hps_list;
      newState.jobDetailOpenList = jobDetailLength;
      newState.hpsDetailOpenList = hpsDetailLength;
      this.setState(newState, () => {
        this.submitBtnCheck();
      });
      return {
        jobListItem: job_list,
        hpsListItem: hps_list,
        jobDetailOpenListItem: jobDetailLength,
        hpsDetailOpenListItem: hpsDetailLength,
      };
    } else {
      newState.jobList = [];
      newState.hpsList = [];
      errorToastMessage(error, message);
      this.setState(newState, () => {
        this.submitBtnCheck();
      });
    }
  };

  variablesAdd = () => {
    const { variablesValues } = this.state;

    let newVariables = [];

    if (variablesValues.length >= 1) {
      variablesValues.forEach((v, i) => {
        newVariables.push(v);
        if (i + 1 === variablesValues.length) {
          newVariables.push({ name: '', value: '' });
        }
      });
    }
    if (newVariables.length === 0) {
      newVariables.push({ name: '', value: '' });
    }

    this.setState({ variablesValues: newVariables });
  };

  variablesDelete = (idx) => {
    const { variablesValues } = this.state;
    const newVariables = [];
    variablesValues.forEach((v, i) => {
      if (i !== idx) {
        newVariables.push(v);
      }
    });

    this.setState({ variablesValues: newVariables });
  };

  // 셀렉트 박스 이벤트 핸들러 (Workspace, Training Model)
  selectInputHandler = async (name, value) => {
    const { type } = this.props;
    const { dockerImageOptions } = this.state;
    const newState = {
      [name]: value,
      [`${name}Error`]: value ? '' : null,
    };
    if (name === 'dockerImage') {
      let selectedIdx = 0;
      dockerImageOptions.forEach((v, i) => {
        if (value.value === v.value) {
          selectedIdx = i;
        }
      });
      newState.dockerImageSelectedItemIdx = selectedIdx;
    }
    if (name === 'workspace') {
      this.backBtnHandler();

      // 배포 모달 옵션 정보 조회
      const optionRes = await this.getOptions(value.value);
      const {
        // built-in 모델 옵션
        builtInUserTrainedModelOptions,
        builtInPreTrainedModelOptions,
        // 커스텀 모델 옵션
        customModelOptions,
        ownerOptions,
        gpuTotal,
        gpuFree,
        dockerImageOptions,
        builtInFilterOptions,
        cpuModelStatus,
        gpuModelListOptions,
      } = this.parseOption(optionRes);
      const sliderState = {
        cpuModelStatus: cpuModelStatus,
        prevSliderData: {},
        gpuModelListOptions: gpuModelListOptions,
        gpuModels: {},
        modelType: this.state.modelType,
        type,
      };

      this.sliderMountHandler(sliderState);
      // 학습 모델 옵션 설정
      newState.cpuModelStatus = cpuModelStatus;
      newState.gpuModelListOptions = gpuModelListOptions;
      newState.builtInUserTrainedModelOptions = builtInUserTrainedModelOptions;
      newState.builtInPreTrainedModelOptions = builtInPreTrainedModelOptions;
      newState.customModelOptions = customModelOptions; // 커스텀 모델 옵션 (배포 타입이 Custom)
      newState.builtInFilterOptions = builtInFilterOptions;

      // 도커이미지(docker image) 초기 설정 - 초기 도커 이미지를 jf-default로 설정
      const dockerImage = dockerImageOptions.filter(
        ({ label }) => label === 'jf-default',
      )[0];
      newState.dockerImageOptions = dockerImageOptions;
      newState.dockerImage = dockerImage;
      // newState.dockerImageError = deploymentType === 'built-in' ? '' : null;
      // 소유자(owner) 설정
      newState.owner = null;
      newState.ownerOptions = ownerOptions;

      // 사용자(User) 초기 설정
      newState.userList = ownerOptions;

      // 사용가능한 GPU 수 설정
      newState.gpuTotal = gpuTotal;
      newState.gpuFree = gpuFree;

      // 모델 관련 정보 초기화
      newState.groupNumber = null;
      newState.checkpoint = null;
    } else if (name === 'trainingModel') {
      newState.groupNumber = null;
      newState.checkpoint = null;
      newState.isTrainingModelDeleted = false;
    }
    if (this.props.data.checkpoint) {
      const selectedModel = [];
      this.state.builtInUserTrainedModelOptions?.forEach((v) => {
        if (v.title === this.props.data.modelName) {
          selectedModel.push(v);
          newState.model = v;
        }
      });
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 유저 멀티 셀렉트 이벤트 핸들러
  multiSelectHandler = ({ selectedList }) => {
    this.setState({ tmpSelectedList: selectedList }, () => {
      this.submitBtnCheck();
    });
  };

  // 배포유형 training - custom - 실행 명령어 핸들러
  paramsInputHandler = ({ e = { target: { value: '' } }, type }) => {
    let { value } = e.target;
    const newState = {};

    if (type === 'file') {
      newState.customFile = value;
    } else if (type === 'param') {
      newState.customParam = value;
    } else if (type === 'lan') {
      newState.customLan = value;
    }

    this.templateIdReset();
    this.setState(newState);
  };
  // GPU 모델 선택 이벤트 핸들러
  selectGpuModelHandler = (type, idx, nodeIdx) => {
    const { gpuModelListOptions, gpuUsage, gpuUsageError, cpuModelList } =
      this.state;
    let { gpuModelList } = this.state;
    let cpuModelListOptions = gpuModelListOptions[idx].node_list;
    let newState = {};
    if (type === 'gpu') {
      gpuModelListOptions[idx].selected = !gpuModelListOptions[idx].selected;
      // GPU 모델 선택/선택해제시 CPU 모델 전체 선택/선택해제
      cpuModelListOptions = cpuModelListOptions.map((v) => {
        return {
          ...v,
          selected: gpuModelListOptions[idx].selected,
        };
      });
      gpuModelListOptions[idx].node_list = cpuModelListOptions;
    } else {
      // type === 'cpu'
      cpuModelListOptions[nodeIdx].selected =
        !cpuModelListOptions[nodeIdx].selected;
      gpuModelListOptions[idx].node_list = cpuModelListOptions;
      if (!gpuModelListOptions[idx].selected) {
        // GPU 선택 안되어 있을 경우 선택
        gpuModelListOptions[idx].selected = true;
      }
      if (!cpuModelListOptions[nodeIdx].selected) {
        // CPU 선택 해제하는 경우 CPU 선택 개수 0이면 GPU 선택도 해제
        if (
          cpuModelListOptions.filter(({ selected }) => selected).length === 0
        ) {
          gpuModelListOptions[idx].selected = false;
        }
      }
    }
    cpuModelList[idx] = cpuModelListOptions.filter(({ selected }) => selected);
    gpuModelList = gpuModelListOptions.filter(({ selected }) => selected);
    newState = {
      cpuModelList,
      ...this.gpuModelState(
        gpuModelListOptions,
        gpuModelList,
        gpuUsage,
        gpuUsageError,
      ),
    };
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  /**
   * 선택 탭
   * @param {number} idx
   */
  tabClickHandler = (idx) => {
    const newState = {};

    newState.trainingSelectTab = idx;

    this.setState(newState);
  };

  trainingSearch = (e) => {
    let { value } = e?.target;
    const { originTrainingList } = this.state;

    const newState = {};

    if (value === '') {
    } else {
      //원래없었어요
      const newListData = [];

      const trainingSearchData = JSON.parse(
        JSON.stringify(originTrainingList?.usertrained_training_list),
      );

      trainingSearchData.forEach((v) => {
        if (
          v.training_name.indexOf(value) !== -1 ||
          v.training_description.indexOf(value) !== -1
        ) {
          newListData.push(v);
        }
      });

      newState.trainingList = {
        built_in_model_kind_list: originTrainingList.built_in_model_kind_list,
        built_in_model_thumbnail_image_info:
          originTrainingList.built_in_model_thumbnail_image_info,
        usertrained_training_list: newListData,
      };
    }
    this.setState(newState);

    // 이름, 설명, 카테고리
  };

  toolSortHandler = ({ e = { target: { value: '' } }, type, selectedItem }) => {
    const {
      originJobList = [],
      originHpsList = [],
      owner,
      toolSelectedOwner,
      trainingToolTab,
    } = this.state;
    let { value } = e.target;
    let toolType = '';

    if (!type) {
      if (trainingToolTab === 0) {
        toolType = 'job';
      } else {
        toolType = 'hps';
      }
    } else {
      toolType = type;
    }

    const newState = {};
    newState.toolSearchValue = value;

    const filteredData = [];

    let selectedOwner = '';

    if (!selectedItem) {
      selectedOwner = toolSelectedOwner;
    } else {
      if (
        selectedItem.value === 'toolOwner' ||
        selectedItem.value === 'toolAll'
      ) {
        selectedOwner = selectedItem;
      }
    }

    if (toolType === 'job') {
      // joblist
      if (value !== '' && value) {
        originJobList.forEach((v) => {
          if (v.job_name.includes(value)) {
            filteredData.push(v);
          }
        });
      } else {
        originJobList.forEach((v) => {
          filteredData.push(v);
        });
      }
      newState.jobList = filteredData;
    } else if (toolType === 'hps') {
      // hpslist
      if (value !== '' && value) {
        originHpsList.forEach((v) => {
          if (v.hps_name.includes(value)) {
            filteredData.push(v);
          }
        });
      } else {
        originHpsList.forEach((v) => {
          filteredData.push(v);
        });
      }

      newState.hpsList = filteredData;
    }

    const ownerSortedData = [];

    if (selectedOwner.value === 'toolOwner') {
      newState.toolSelectedOwner = selectedOwner;

      if (toolType === 'hps') {
        filteredData.forEach((v) => {
          if (owner.label === v.hps_runner_name) {
            ownerSortedData.push(v);
          }
        });
        newState.hpsList = ownerSortedData;
      } else if (toolType === 'job') {
        filteredData.forEach((v) => {
          if (owner.label === v.job_runner_name) {
            ownerSortedData.push(v);
          }
        });
        newState.jobList = ownerSortedData;
      }
    } else if (selectedOwner.value === 'toolAll') {
      newState.toolSelectedOwner = selectedOwner;
      filteredData.forEach((v) => {
        ownerSortedData.push(v);
      });

      if (toolType === 'hps') {
        newState.hpsList = ownerSortedData;
      } else if (toolType === 'job') {
        newState.jobList = ownerSortedData;
      }
    }

    this.setState(newState);
  };

  trainingSortHandler = ({
    e = { target: { value: '' } },
    type,
    selectedItem,
  }) => {
    let { value } = e.target;
    const newState = {};

    newState.trainingInputValue = value;

    const {
      originTrainingList,
      trainingSelectedOwner,
      trainingSelectedType,
      owner,
    } = this.state;
    const filteredData = [];
    const typeSortedData = [];
    let selectedType = '';
    let selectedOwner = '';

    if (!selectedItem) {
      selectedType = trainingSelectedType;
      selectedOwner = trainingSelectedOwner;
    } else {
      if (selectedItem.value === 'owner' || selectedItem.value === 'allOwner') {
        selectedOwner = selectedItem;
        selectedType = trainingSelectedType;
      } else {
        selectedType = selectedItem;
        selectedOwner = trainingSelectedOwner;
      }
    }

    if (value !== '' && value) {
      originTrainingList.usertrained_training_list.forEach((v) => {
        if (
          v.training_name.includes(value) ||
          v.training_description.includes(value)
        ) {
          filteredData.push(v);
        }
      });
    } else {
      originTrainingList.usertrained_training_list.forEach((v) => {
        filteredData.push(v);
      });
    }
    const ownerSortedData = [];
    if (selectedOwner.value === 'owner') {
      newState.trainingSelectedOwner = selectedOwner;
      filteredData.forEach((v) => {
        if (owner.label === v.training_user_name) {
          ownerSortedData.push(v);
        }
      });
    } else if (selectedOwner.value === 'allOwner') {
      newState.trainingSelectedOwner = selectedOwner;
      filteredData.forEach((v) => {
        ownerSortedData.push(v);
      });
    }
    if (selectedType.value === 'custom') {
      newState.trainingSelectedType = selectedType;
      ownerSortedData.forEach((list) => {
        if (list.training_type === 'advanced') {
          typeSortedData.push(list);
        }
      });
    } else if (selectedType.value === 'builtIn') {
      newState.trainingSelectedType = selectedType;
      ownerSortedData.forEach((list) => {
        if (list.training_type === 'built-in') {
          typeSortedData.push(list);
        }
      });
    } else if (selectedType.value === 'all') {
      newState.trainingSelectedType = selectedType;
      ownerSortedData.forEach((list) => {
        typeSortedData.push(list);
      });
    }

    newState.trainingList = {
      built_in_model_kind_list: originTrainingList.built_in_model_kind_list,
      built_in_model_thumbnail_image_info:
        originTrainingList.built_in_model_thumbnail_image_info,
      usertrained_training_list: typeSortedData,
    };

    this.setState(newState);
  };

  variablesSortHandler = ({ e = { target: { value: '' } } }) => {
    const { originCustomList } = this.state;

    const newCustomList = [];
    let { value } = e.target;
    const newState = {};
    newState.customSearchValue = value;

    if (value !== '' && value) {
      originCustomList.forEach((runCode) => {
        if (runCode.includes(value)) {
          newCustomList.push(runCode);
        }
      });
      newState.customList = newCustomList;
    } else {
      newState.customList = originCustomList;
    }

    this.setState(newState);
  };

  // 학습에서 가져오기 유형, 소유자 Submenu 선택
  trainingTypeSelectHandler = (type, selectedItem) => {
    const {
      originTrainingList,
      trainingSelectedOwner,
      trainingSelectedType,
      owner,
    } = this.state;
    const trainingTableData = JSON.parse(
      JSON.stringify(originTrainingList?.usertrained_training_list),
    );
    let copiedTableData = [...trainingTableData];

    const newTrainingList = [];

    const newState = {};

    if (type === 'type') {
      newState.trainingSelectedType = selectedItem;
      const ownerSortedData = [];

      if (trainingSelectedOwner.value === 'owner') {
        copiedTableData.forEach((v) => {
          if (owner.label === v.training_user_name) {
            ownerSortedData.push(v);
          }
        });
        copiedTableData = [...ownerSortedData];
      }

      if (selectedItem.value === 'custom') {
        copiedTableData.forEach((list) => {
          if (list.training_type === 'advanced') {
            newTrainingList.push(list);
          }
        });
      } else if (selectedItem.value === 'builtIn') {
        copiedTableData.forEach((list) => {
          if (list.training_type === 'built-in') {
            newTrainingList.push(list);
          }
        });
      } else {
        newTrainingList.push(...ownerSortedData);
      }
    } else if (type === 'owner') {
      newState.trainingSelectedOwner = selectedItem;
      const typeSortedData = [];
      if (trainingSelectedType.value === 'custom') {
        copiedTableData.forEach((list) => {
          if (list.training_type === 'advanced') {
            typeSortedData.push(list);
          }
        });
      } else if (trainingSelectedType.value === 'all') {
        copiedTableData.forEach((list) => {
          typeSortedData.push(list);
        });
      } else if (trainingSelectedType.value === 'builtIn') {
        copiedTableData.forEach((list) => {
          if (list.training_type === 'advanced') {
            typeSortedData.push(list);
          }
        });
      }
      copiedTableData = [...typeSortedData];
      if (selectedItem.value === 'owner') {
        copiedTableData.forEach((v) => {
          if (owner.label === v.training_user_name) {
            newTrainingList.push(v);
          }
        });
      } else if (selectedItem.value === 'allOwner') {
        copiedTableData.forEach((v) => newTrainingList.push(v));
      }
    }
    newState.trainingList = {
      built_in_model_kind_list: originTrainingList.built_in_model_kind_list,
      built_in_model_thumbnail_image_info:
        originTrainingList.built_in_model_thumbnail_image_info,
      usertrained_training_list: newTrainingList,
    };

    this.setState(newState);
  };

  // GPU 모델 관련 상태 정의
  gpuModelState = (options, gpuModelList, gpuUsage, gpuUsageError = '') => {
    const { gpuModelType, gpuTotalCountForRandom, maxGpuUsageCountForRandom } =
      this.state;
    let migCount = 0;
    let totalCount = 0;
    let avalCount = 0;

    gpuModelList.map(({ type, node_list: nodeList }) => {
      if (type === 'mig') {
        migCount += 1;
      }
      nodeList.map(({ total, aval, selected }) => {
        if (selected) {
          totalCount += total;
          avalCount += aval;
        }
        return true;
      });
      return true;
    });

    if (gpuTotalCountForRandom < totalCount) {
      totalCount = gpuTotalCountForRandom;
    }

    if (maxGpuUsageCountForRandom < avalCount) {
      avalCount = maxGpuUsageCountForRandom;
    }

    let gpuCount = gpuUsage;
    let gpuCountError = gpuUsageError;
    if (gpuModelType === 1) {
      if (gpuModelList.length === 0) {
        gpuCountError = null;
      } else if (migCount > 0) {
        gpuCount = 1;
        gpuCountError = '';
      } else {
        gpuCount = 1;
        gpuCountError = '';
      }
    }

    const gpuState = {
      gpuModelListOptions: options,
      gpuModelList,
      isMigModel: migCount > 0,
      maxGpuUsageCount: avalCount,
      gpuTotalCount: totalCount,
      gpuUsage: gpuCount,
      gpuUsageError: gpuCountError,
    };

    return gpuState;
  };

  // 유효성 검증
  validate = (name, value) => {
    const newState = {};
    newState.gpuUsageError = '';

    if (name === 'deploymentName') {
      // const regType1 = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      const forbiddenChars = /[\\<>:*?"'|:;`{}^$ &[\]!]/;

      const regType = !forbiddenChars.test(value);
      if (value === '') {
        return 'deploymentName.empty.message';
      }
      // if (!value.match(regType1) || value.match(regType1)[0] !== value) {
      //   return 'nameRule.message';
      // }
      if (!regType) {
        return 'newNameRule.message';
      }
    } else if (name === 'gpuUsage') {
      if (value === '') {
        return 'gpuUsage.empty.message';
      } else if (this.state.gpuTotal !== 0 && value > this.state.gpuTotal) {
      }
    } else if (name === 'selectedList') {
      if (value.length === 0) {
        return 'userSelectedList.empty.message';
      }
    }
    return null;
  };

  // submit 버튼 활성/비활성 함수
  submitBtnCheck = () => {
    const { type } = this.props;
    const { state } = this;
    const {
      owner,
      dockerImage,
      dockerImageError,
      deploymentType,
      instanceType,
      gpuModelType,
      gpuModelList,
      modelType,
      selectedTraining,
      selectedTrainingData,
      selectedDeploymentType,
      selectedTool,
      selectedHpsScore,
      trainingToolTab,
      jobModelSelectValue,
      hpsModelSelectValue,
      selectedModel,
      jsonDataError,
      templateNameError,
      groupNameError,
      gpuUsage,
      deploymentTemplateType,
    } = state;
    const stateKeys = Object.keys(state);
    let validateCount = 0;
    for (let i = 0; i < stateKeys.length; i += 1) {
      const key = stateKeys[i];
      if (
        key.indexOf('Error') !== -1 &&
        state[key] !== '' &&
        key !== 'deploymentDescError' &&
        key !== 'templateNameError' &&
        key !== 'groupNameError' &&
        key !== 'dockerImageError' &&
        key !== 'jsonDataError'
      ) {
        validateCount += 1;
      }
    }
    if (dockerImage === null) {
      validateCount += 1;
    }

    if (templateNameError || groupNameError) {
      validateCount += 1;
    }

    if (selectedDeploymentType === 'usertrained') {
      if (!selectedTraining) {
        validateCount += 1;
      }

      if (selectedTrainingData?.deployment_type === 'built-in') {
        // 빌트인

        if (!selectedTool || selectedTool === '') {
          validateCount += 1;
        }
        if (trainingToolTab === 0) {
          if (!jobModelSelectValue || jobModelSelectValue === '') {
            validateCount += 1;
          }
        } else if (trainingToolTab === 1) {
          if (selectedHpsScore === '') {
            validateCount += 1;
          }
          if (!hpsModelSelectValue || hpsModelSelectValue === '') {
            validateCount += 1;
          }
        }

        if (
          selectedModel?.deployment_type === 'built-in' &&
          selectedModel?.enable_to_deploy_with_gpu
        ) {
          if (gpuUsage === '' || !gpuUsage) {
            validateCount += 1;
          }
        }
      } else if (selectedTrainingData?.deployment_type === 'custom') {
        if (modelType !== 1 && (gpuUsage === '' || !gpuUsage)) {
          validateCount += 1;
        }
      }
    } else if (selectedDeploymentType === 'pretrained') {
      if (!selectedModel || !selectedModel?.built_in_model_name) {
        validateCount += 1;
      }
    } else if (
      selectedDeploymentType === 'sandbox' ||
      deploymentTemplateType === 'sandbox'
    ) {
      if (jsonDataError) {
        validateCount += 1;
      }
      if ((gpuUsage === '' || gpuUsage === null) && instanceType === 'gpu') {
        validateCount += 1;
      }
    } else {
      validateCount += 1;
    }
    if (deploymentType === 'custom' && deploymentTemplateType !== 'sandbox') {
      if (
        (dockerImageError === null || dockerImageError === '') &&
        validateCount > 0 &&
        type === 'EDIT_DEPLOYMENT'
      ) {
        validateCount -= 1;
      }
      if (!dockerImage?.label) {
        validateCount += 1;
      }
    }
    if (instanceType === 'gpu' && gpuModelType === 1) {
      if (gpuModelList?.length === 0) {
        validateCount += 1;
      }
    }

    if (!owner) {
      validateCount += 1;
    }

    const validateState = { validate: false };

    if (validateCount === 0) {
      if (this.state.sliderIsValidate) {
        validateState.validate = true;
      }
    }
    this.setState(validateState);
  };

  modelTypeHandler = (type, multiGpuMode) => {
    const { gpuModelType, cpuModelType, gpuUsage } = this.state;
    const newState = {};
    if (type === 0) {
      newState.instanceType = 'gpu';
      if (gpuModelType === 0) {
        if (gpuUsage === '' || gpuUsage === null || gpuUsage === 0) {
          newState.gpuUsageError = null;
        }
        if (multiGpuMode === 0) {
          newState.gpuUsage = 1;
          newState.gpuUsageError = '';
        }
        newState.sliderIsValidate = true;
      } else {
        this.resourceTypeHandler(type, 1);
      }
    } else if (type === 1) {
      // cpu일때
      newState.instanceType = 'cpu';
      newState.gpuUsageError = '';
      if (cpuModelType === 0) {
        newState.sliderIsValidate = true;
      } else {
        this.resourceTypeHandler(type, 1);
      }
    }
    newState.modelType = type;
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  trainingTypeArrowCustomHandler = (type, bool) => {
    const { trainingTypeArrow } = this.state;
    let newArrow = {
      ...trainingTypeArrow,
      [type]: bool,
    };

    this.setState({ trainingTypeArrow: newArrow });
  };

  trainingTypeArrowHandler = (type) => {
    const { trainingTypeArrow } = this.state;
    let newArrow = {
      ...trainingTypeArrow,
      [type]: !trainingTypeArrow[type],
    };

    this.setState({ trainingTypeArrow: newArrow });
  };

  // resource Type Check Hanlder
  resourceTypeHandler = (type, model) => {
    const { gpuSelectedOptions, cpuSelectedOptions } = this.state;
    const newState = {};
    type = Number(type);
    model = Number(model);
    const isTrue = (checkbox = []) => {
      if (checkbox.length > 0) {
        const checkTrue = checkbox.filter((check) => check);
        return checkTrue.length > 0;
      }
    };
    if (type === 0) {
      if (model === 1) {
        gpuSelectedOptions.forEach((e, i) => {
          const check = isTrue(Object.values(e));
          if (check) {
            newState.sliderIsValidate = true;
          }
          if (
            gpuSelectedOptions.length - 1 === i &&
            !check &&
            !newState?.sliderIsValidate
          ) {
            newState.sliderIsValidate = false;
          }
        });
      } else {
        newState.sliderIsValidate = true;
      }
    }
    if (type === 1) {
      if (model === 1) {
        if (cpuSelectedOptions.length > 0) {
          cpuSelectedOptions.forEach((e, i) => {
            const check = isTrue(Object.values(e));
            if (check) {
              newState.sliderIsValidate = true;
            }
            if (
              cpuSelectedOptions.length - 1 === i &&
              !check &&
              !newState?.sliderIsValidate
            ) {
              newState.sliderIsValidate = false;
            }
          });
        } else {
          newState.sliderIsValidate = false;
        }
      } else {
        newState.sliderIsValidate = true;
      }
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 다시 선택
  backBtnHandler = () => {
    const newState = {};
    newState.selectedDeploymentType = null;

    // Deployment Type 관련 state 모두 초기화
    newState.toolSearchValue = '';
    newState.selectedTraining = '';
    newState.toolModelSearchValue = '';
    newState.hpsModelSelectValue = '';
    newState.jobModelSelectValue = '';
    newState.trainingSelectedType = {
      label: 'all.label',
      value: 'all',
    };
    newState.selectedTool = null;
    newState.selectedToolType = null;
    newState.trainingTypeArrow = {
      train: true,
      tool: true,
      model: true,
      variable: true,
      hps: false,
      hpsModel: true,
      jobModel: true,
    };

    newState.trainingSelectedOwner = {
      label: 'all.label',
      value: 'allOwner',
    };
    newState.selectedHpsScore = '';
    newState.selectedHps = null;
    newState.trainingToolTab = 0;
    newState.selectedTool = null;
    newState.jobList = null;
    newState.jobDetailList = null;
    newState.jobDetailOpenList = [];
    newState.hpsList = null;
    newState.hpsDetailList = null;
    newState.hpsDetailOpenList = [];
    newState.trainingToolTab = 0;
    newState.customLan = 'python';
    newState.customFile = '';
    newState.customParam = '';
    newState.customSearchValue = '';
    newState.customRuncode = '';
    newState.variablesValues = [{ name: '', value: '' }];
    newState.trainingInputValue = '';
    newState.templateNewName = '';
    newState.templateNewDescription = '';
    newState.newGroupName = '';
    newState.newGroupDescription = '';
    newState.clickedDataList = null;
    newState.groupSelect = false;
    newState.templateNameError = false;
    newState.groupNameError = false;
    newState.makeNewGroup = false;
    newState.templateOpenStatus = false;
    newState.selectedModel = null;
    newState.modelSelectStatus = true;
    newState.clickedTemplateLists = null;
    newState.clickedGroupDataList = null;
    newState.jsonData = {};
    newState.dockerImage = this.state.dockerImageOptions.filter(
      ({ label }) => label === 'jf-default',
    )[0];
    newState.deploymentType = 'built-in';

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 배포 유형 선택 핸들러
  deploymentTypeHandler = async (type) => {
    const { t } = this.props;
    const { workspaceId } = this.props.data;
    if (!workspaceId && !this.state.workspace) {
      toast.info(t('workspaceFirst.toast.message'));
      return;
    }
    const newState = {};
    newState.selectedDeploymentType = type;
    this.getTemplateListHandler();
    this.getGroupData();

    switch (type) {
      case 'usertrained':
        this.getTrainingTypeData(type);
        break;
      case 'pretrained':
        this.getBuiltInModelList(type);
        break;
      case 'sandbox':
        newState.selectedModel = null;
        newState.deploymentType = 'custom';
        break;
      default:
        break;
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // CPU 타입 이벤트 핸들러
  cpuModelTypeHandler = (value) => {
    const newState = {};
    newState.cpuModelType = Number(value);
    if (value === 0) {
      newState.sliderIsValidate = true;
    } else {
      this.resourceTypeHandler(1, value);
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // GPU 타입 이벤트 핸들러
  gpuModelTypeHandler = (value) => {
    const { gpuModelList, isMigModel } = this.state;
    const newState = {};

    newState.gpuModelType = parseInt(value, 10);
    if (!gpuModelList || gpuModelList.length === 0) {
      newState.gpuUsageError = null;
    } else if (isMigModel) {
      newState.gpuUsage = 1;
      newState.gpuUsageError = '';
    }

    // gpu일때
    if (value === 0) {
      newState.sliderCheck = true;
    } else {
      this.resourceTypeHandler(0, value);
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  sliderSwitchHandler = (type) => {
    const {
      cpuSwitchStatus,
      gpuSwitchStatus,
      ramTotalValue,
      cpuTotalValue,
      gpuTotalValue,
      gpuRamTotalValue,
    } = this.state;

    const newState = {};

    if (type === 'cpu') {
      newState.cpuSwitchStatus = !cpuSwitchStatus;
      newState.cpuSliderMove = !cpuSwitchStatus;
      if (cpuSwitchStatus) {
        this.totalValueChange(ramTotalValue, 'ram', type);
        this.totalValueChange(cpuTotalValue, 'cpu', type);
      }
    } else if (type === 'gpu') {
      if (gpuSwitchStatus) {
        this.totalValueChange(gpuRamTotalValue, 'ram', type);
        this.totalValueChange(gpuTotalValue, 'gpu', type);
      }
      newState.gpuTotalSliderMove = !gpuSwitchStatus;
      newState.gpuSwitchStatus = !gpuSwitchStatus;
    }
    this.setState(newState);
  };

  totalValueChange = (v, option, type) => {
    const { cpuModelStatus, gpuModelListOptions } = this.state;
    const newState = {};
    // 전체 슬라이더 조정
    if (v === 0 || v < 0) {
      v = 1;
    }
    if (type === 'cpu') {
      newState.cpuSliderMove = true;
    }
    if (type === 'gpu') {
      newState.gpuTotalSliderMove = true;
    }
    let nodeObj = {};
    const newObj = {};

    if (cpuModelStatus.length > 0 && type === 'cpu') {
      cpuModelStatus.forEach(({ node_list: nodeList }, idx) => {
        nodeObj = {};
        if (nodeList?.length > 0) {
          nodeList.forEach((value, i) => {
            if (option === 'cpu') {
              const cpuMaxValue = value?.resource_info?.cpu_cores_limit_per_pod;

              if (cpuMaxValue < v) {
                nodeObj[i] = cpuMaxValue;
              } else {
                nodeObj[i] = v;
              }
            } else if (option === 'ram') {
              const ramMaxValue = value?.resource_info?.ram_limit_per_pod;
              if (ramMaxValue < v) {
                nodeObj[i] = ramMaxValue;
              } else {
                nodeObj[i] = v;
              }
            }
          });
          newObj[idx] = nodeObj;
        }
      });
      if (option === 'cpu') {
        newState.cpuDetailValue = newObj;
      } else if (option === 'ram') {
        newState.ramDetailValue = newObj;
      }
    }
    if (gpuModelListOptions.length > 0 && type === 'gpu') {
      gpuModelListOptions.forEach(({ node_list: nodeList }, idx) => {
        nodeObj = {};
        if (nodeList?.length > 0) {
          nodeList.forEach((value, i) => {
            if (option === 'gpu') {
              const gpuMaxValue = value?.resource_info?.cpu_cores_limit_per_gpu;

              if (gpuMaxValue < v) {
                nodeObj[i] = gpuMaxValue;
              } else {
                nodeObj[i] = v;
              }
            } else if (option === 'ram') {
              const ramMaxValue = value?.resource_info?.ram_limit_per_gpu;

              if (ramMaxValue < v) {
                nodeObj[i] = ramMaxValue;
              } else {
                nodeObj[i] = v;
              }
            }
          });
          newObj[idx] = nodeObj;
        }
      });
      if (option === 'gpu') {
        newState.gpuDetailValue = newObj;
      } else if (option === 'ram') {
        newState.gpuRamDetailValue = newObj;
      }
    }
    this.setState(newState);
  };

  totalValueHandler = (v, option, type) => {
    const newState = {};

    if (v === 0 || v < 0) {
      v = 1;
    }
    if (type === 'cpu') {
      if (option === 'cpu') {
        newState.cpuTotalValue = v;
        newState.cpuSliderMove = true;
      } else if (option === 'ram') {
        newState.ramTotalValue = v;
        newState.cpuSliderMove = true;
      }
    } else if (type === 'gpu') {
      if (option === 'gpu') {
        newState.gpuTotalValue = v;
        newState.gpuTotalSliderMove = true;
      } else if (option === 'ram') {
        newState.gpuRamTotalValue = v;
        newState.gpuTotalSliderMove = true;
      }
    }

    this.totalValueChange(v, option, type);
    this.setState(newState);
  };

  hpsLogSortHandler = async ({ title, sortBy, isParam, id }) => {
    const { selectedTrainingData } = this.state;

    const newState = {};
    const hpsDetailLength = [];
    const url = `options/deployments/templates/usertrained?training_id=${selectedTrainingData?.training_id}&sort_key=${title}&order_by=${sortBy}&is_param=${isParam}`;

    const response = await callApi({
      url,
      method: 'get',
    });

    const { result, status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      const { hps_list } = result;
      hps_list.forEach((v) => {
        hpsDetailLength.push({ arrow: false });
      });
      newState.hpsList = hps_list;
      newState.originHpsList = hps_list;
      newState.hpsDetailOpenList = hpsDetailLength;
      hps_list.forEach((v) => {
        if (v?.hps_group_list?.length > 0) {
          v.hps_group_list?.forEach((hps) => {
            if (hps?.hps_id === id) {
              newState.hpsLogTable = hps?.hps_number_info;
            }
          });
        }
      });
    } else {
      errorToastMessage(error, message);
    }

    this.setState(newState);
  };

  totalSliderHandler = (type) => {
    // total false로 바꾸는 함수 detail에서 사용
    const newState = {};
    if (type === 'cpu') {
      newState.cpuSliderMove = false;
    } else if (type === 'gpu') {
      newState.gpuTotalSliderMove = false;
    }
    this.setState(newState);
  };

  detailGpuValueHandler = (idx, id, value, option) => {
    // detial slider value 조정할 때 실행하는 함수
    const { gpuDetailValue, gpuModelListOptions, gpuRamDetailValue } =
      this.state;
    const newState = {};
    if (value === 0 || value < 0) {
      value = 1;
    }
    newState.gpuTotalSliderMove = false;
    // detail slider 핸들러
    if (option === 'gpu') {
      const copiedDetailValue = JSON.parse(JSON.stringify(gpuDetailValue));
      const nodeName = gpuModelListOptions[idx]?.node_list[id]?.name;

      gpuModelListOptions.forEach((v, i) => {
        v.node_list.forEach((node, index) => {
          if (node.name === nodeName) {
            copiedDetailValue[i][index] = value;
          }
        });
      });

      newState.gpuDetailValue = copiedDetailValue;
    } else if (option === 'ram') {
      const copiedDetailValue = JSON.parse(JSON.stringify(gpuRamDetailValue));
      copiedDetailValue[idx][id] = value;
      newState.gpuRamDetailValue = copiedDetailValue;
    }
    this.setState(newState);
  };

  detailCpuValueHandler = (idx, id, value, option) => {
    const { cpuDetailValue, ramDetailValue } = this.state;

    const newState = {};

    if (value === 0 || value < 0) {
      value = 1;
    }
    newState.cpuSliderMove = false;
    if (option === 'cpu') {
      const copiedDetailValue = JSON.parse(JSON.stringify(cpuDetailValue));
      copiedDetailValue[idx][id] = value;
      newState.cpuDetailValue = copiedDetailValue;
    } else if (option === 'ram') {
      const copiedDetailValue = JSON.parse(JSON.stringify(ramDetailValue));
      copiedDetailValue[idx][id] = value;
      newState.ramDetailValue = copiedDetailValue;
    }

    this.setState(newState);
  };

  checkboxHandler = ({ idx, status, cpuIdx, type }) => {
    let typeNumber = 0;
    const {
      cpuSelectedOptions,
      gpuSelectedOptions,
      detailSelectedOptions,
      gpuDetailSelectedOptions,
      cpuDetailValue,
      ramDetailValue,
      cpuTotalValue,
      gpuTotalValue,
      gpuRamTotalValue,
      gpuDetailValue,
      gpuRamDetailValue,
      ramTotalValue,
      gpuModelListOptions,
      cpuModelStatus,
    } = this.state;
    const newState = {};
    const isTrue = (el) => {
      if (el) return true;
    };
    const trueCheckHandler = (checkbox = []) => {
      if (checkbox.length > 0) {
        const checkTrue = checkbox.filter((check) => check);
        return checkTrue.length > 0;
      }
    };
    if (type === 'cpu') {
      typeNumber = 1;
      const cpuDetail = cloneDeep(cpuDetailValue);
      const cpuRamDetail = cloneDeep(ramDetailValue);

      if (status === 'all') {
        // 전체 체크 클릭 시

        const newCpuDetail = {};
        const newCpuRamDetail = {};
        // 체크박스 클릭했을 때 제한 수 확인하고 totalvalue 할당

        if (cpuModelStatus?.length > 0) {
          cpuModelStatus[idx]?.node_list.forEach((v, i) => {
            const cpuMaxValue = v?.resource_info?.cpu_cores_limit_per_pod;

            if (cpuMaxValue < cpuTotalValue) {
              newCpuDetail[i] = cpuMaxValue;
            } else {
              newCpuDetail[i] = cpuTotalValue;
            }

            const ramMaxValue = v?.resource_info?.ram_limit_per_pod;
            if (ramMaxValue < ramTotalValue) {
              newCpuRamDetail[i] = ramMaxValue;
            } else {
              newCpuRamDetail[i] = ramTotalValue;
            }
          });
        }

        cpuDetail[idx] = newCpuDetail;
        cpuRamDetail[idx] = newCpuRamDetail;

        newState.cpuDetailValue = cpuDetail;
        newState.ramDetailValue = cpuRamDetail;

        const prevSelectedOptions = cpuSelectedOptions.slice(0, idx);
        const currSelectedOptions = {
          [idx]: !Object.values(cpuSelectedOptions[idx])[0],
        };
        const nextSelectedOptions = cpuSelectedOptions.slice(
          idx + 1,
          cpuSelectedOptions.length,
        );
        const newSelectedOptions = [
          ...prevSelectedOptions,
          currSelectedOptions,
          ...nextSelectedOptions,
        ];

        newState.cpuSelectedOptions = newSelectedOptions;

        const [allCheck] = Object.values(currSelectedOptions);

        let [arrayLength] = Object.values(detailSelectedOptions[idx]);
        let newDetailValues = [];
        if (allCheck) {
          // 전체 선택 체크
          newDetailValues = Array(arrayLength?.length).fill(true);
          newState.sliderIsValidate = true;
        } else {
          // 전체 선택 해제
          newDetailValues = Array(arrayLength?.length).fill(false);
        }
        // 0이 들어오면
        const newDetailOptions = [];
        detailSelectedOptions.forEach((value, index) => {
          if (index === idx) {
            newDetailOptions.push({ [idx]: newDetailValues });
          } else {
            newDetailOptions.push(value);
          }
        });
        newState.detailSelectedOptions = newDetailOptions;

        let noCheck = true;
        newDetailOptions?.forEach((el) => {
          const [detailChecked] = Object.values(el);
          const check = trueCheckHandler(detailChecked);
          if (check) {
            noCheck = false;
            newState.sliderIsValidate = true;
          }
        });

        if (noCheck) {
          newState.sliderIsValidate = false;
        }
      } else if (status === 'detail') {
        // cpu 모델 특정 - detail
        // 체크박스 클릭했을 때 제한 수 확인하고 totalvalue 할당
        let cpuDetailValue =
          cpuModelStatus[cpuIdx]?.node_list[idx]?.resource_info
            .cpu_cores_limit_per_gpu;
        if (cpuDetailValue > cpuTotalValue) {
          cpuDetailValue = cpuTotalValue;
        }
        let cpuRamDetailValue =
          cpuModelStatus[cpuIdx]?.node_list[idx]?.resource_info
            .ram_limit_per_gpu;

        if (cpuRamDetailValue > ramTotalValue) {
          cpuRamDetailValue = ramTotalValue;
        }
        cpuDetail[cpuIdx][idx] = cpuDetailValue;
        cpuRamDetail[cpuIdx][idx] = cpuRamDetailValue;

        newState.cpuDetailValue = cpuDetail;
        newState.RamDetailValue = cpuRamDetail;

        const [copiedDetailValues] = Object.values(
          detailSelectedOptions[cpuIdx],
        ).slice();

        const copiedDetailObject = detailSelectedOptions.slice();
        const prevDetailObject = copiedDetailObject.slice(0, cpuIdx);
        const nextDetailObject = copiedDetailObject.slice(
          cpuIdx + 1,
          copiedDetailObject.length,
        );
        const prevSelectedValue = copiedDetailValues.slice(0, idx);
        const currSelectedValue = !copiedDetailValues[idx];
        const nextSelectedValue = copiedDetailValues.slice(
          idx + 1,
          copiedDetailValues.length,
        );

        const detailArrayValues = [
          ...prevSelectedValue,
          currSelectedValue,
          ...nextSelectedValue,
        ];

        const currDetailObject = {
          [cpuIdx]: detailArrayValues,
        };

        const newDetailSelectedValues = [
          ...prevDetailObject,
          currDetailObject,
          ...nextDetailObject,
        ];

        newState.detailSelectedOptions = newDetailSelectedValues;

        const [valueCheck] = detailArrayValues.filter(isTrue);

        if (valueCheck) {
          newState.sliderIsValidate = true;
          const newCpuSelectedOptions = [];
          cpuSelectedOptions.forEach((option, idx) => {
            if (idx === cpuIdx) {
              newCpuSelectedOptions.push({ [cpuIdx]: true });
            } else {
              newCpuSelectedOptions.push(option);
            }
          });
          newState.cpuSelectedOptions = newCpuSelectedOptions;
        } else {
          const newCpuSelectedOptions = [];
          cpuSelectedOptions.forEach((option, idx) => {
            if (idx === cpuIdx) {
              newCpuSelectedOptions.push({ [cpuIdx]: false });
            } else {
              newCpuSelectedOptions.push(option);
            }
          });
          newState.cpuSelectedOptions = newCpuSelectedOptions;
          const isTrue = (checkbox = []) => {
            if (checkbox.length > 0) {
              const checkTrue = checkbox.filter((check) => check);
              return checkTrue.length > 0;
            }
          };
          newCpuSelectedOptions?.forEach((el) => {
            const check = isTrue(Object.values(el));
            if (check) {
              newState.sliderIsValidate = true;
            } else {
              newState.sliderIsValidate = false;
            }
          });
        }
      }
    } else if (type === 'gpu') {
      // 새로운 gpu 로직
      const gpuDetail = cloneDeep(gpuDetailValue);
      const gpuRamDetail = cloneDeep(gpuRamDetailValue);

      if (status === 'all') {
        const newGpuDetail = {};
        const newGpuRamDetail = {};

        if (gpuModelListOptions?.length > 0) {
          gpuModelListOptions[idx]?.node_list.forEach((v, i) => {
            const gpuMaxValue = v?.resource_info?.cpu_cores_limit_per_gpu;
            if (gpuMaxValue < gpuTotalValue) {
              newGpuDetail[i] = gpuMaxValue;
            } else {
              newGpuDetail[i] = gpuTotalValue;
            }

            const ramMaxValue = v?.resource_info?.ram_limit_per_gpu;
            if (ramMaxValue < gpuRamTotalValue) {
              newGpuRamDetail[i] = ramMaxValue;
            } else {
              newGpuRamDetail[i] = gpuRamTotalValue;
            }
          });
        }

        gpuDetail[idx] = newGpuDetail;
        gpuRamDetail[idx] = newGpuRamDetail;

        newState.gpuDetailValue = gpuDetail;
        newState.gpuRamDetailValue = gpuRamDetail;

        // 첫번째 전체 체크 클릭 시 idx 0

        const prevSelectedOptions = gpuSelectedOptions.slice(0, idx);
        const currSelectedOptions = {
          [idx]: !Object.values(gpuSelectedOptions[idx])[0],
        };
        const nextSelectedOptions = gpuSelectedOptions.slice(
          idx + 1,
          gpuSelectedOptions.length,
        );
        const newSelectedOptions = [
          ...prevSelectedOptions,
          currSelectedOptions,
          ...nextSelectedOptions,
        ];
        newState.gpuSelectedOptions = newSelectedOptions;

        const [allCheck] = Object.values(currSelectedOptions);
        let [arrayLength] = Object.values(gpuDetailSelectedOptions[idx]);

        let newDetailValues = [];
        if (allCheck) {
          // 전체 선택 체크
          newDetailValues = Array(arrayLength?.length).fill(true);
          newState.sliderIsValidate = true;
        } else {
          // 전체 선택 해제
          newDetailValues = Array(arrayLength?.length).fill(false);
        }
        // 0이 들어오면
        const newDetailOptions = [];
        gpuDetailSelectedOptions.forEach((value, index) => {
          if (index === idx) {
            newDetailOptions.push({ [idx]: newDetailValues });
          } else {
            newDetailOptions.push(value);
          }
        });
        newState.gpuDetailSelectedOptions = newDetailOptions;

        let noChecked = true;
        newDetailOptions?.forEach((el) => {
          const [detailChecked] = Object.values(el);

          const check = trueCheckHandler(detailChecked);

          if (check) {
            noChecked = false;
            newState.sliderIsValidate = true;
          }
        });
        if (noChecked) {
          newState.sliderIsValidate = false;
        }
      } else if (status === 'detail') {
        const [copiedDetailValues] = Object.values(
          gpuDetailSelectedOptions[cpuIdx],
        ).slice();

        const copiedDetailObject = gpuDetailSelectedOptions.slice();
        const prevDetailObject = copiedDetailObject.slice(0, cpuIdx);
        const nextDetailObject = copiedDetailObject.slice(
          cpuIdx + 1,
          copiedDetailObject.length,
        );
        const prevSelectedValue = copiedDetailValues.slice(0, idx);
        const currSelectedValue = !copiedDetailValues[idx];
        const nextSelectedValue = copiedDetailValues.slice(
          idx + 1,
          copiedDetailValues.length,
        );

        const detailArrayValues = [
          ...prevSelectedValue,
          currSelectedValue,
          ...nextSelectedValue,
        ];

        const currDetailObject = {
          [cpuIdx]: detailArrayValues,
        };

        const newDetailSelectedValues = [
          ...prevDetailObject,
          currDetailObject,
          ...nextDetailObject,
        ];

        newState.gpuDetailSelectedOptions = newDetailSelectedValues;
        const [valueCheck] = detailArrayValues.filter(isTrue);

        let noChecked = true;
        newDetailSelectedValues?.forEach((el) => {
          const [detailChecked] = Object.values(el);

          const check = trueCheckHandler(detailChecked);

          if (check) {
            noChecked = false;
            newState.sliderIsValidate = true;
          }
        });
        if (noChecked) {
          newState.sliderIsValidate = false;
        }
        if (valueCheck) {
          const newGpuSelectedOptions = [];

          gpuSelectedOptions.forEach((option, idx) => {
            if (idx === cpuIdx) {
              newGpuSelectedOptions.push({ [cpuIdx]: true });
            } else {
              newGpuSelectedOptions.push(option);
            }
          });
          newState.gpuSelectedOptions = newGpuSelectedOptions;
        } else {
          const newGpuSelectedOptions = [];
          gpuSelectedOptions.forEach((option, idx) => {
            if (idx === cpuIdx) {
              newGpuSelectedOptions.push({ [cpuIdx]: false });
            } else {
              newGpuSelectedOptions.push(option);
            }
          });
          newState.gpuSelectedOptions = newGpuSelectedOptions;
        }
      }
    }
    this.setState(newState, () => {
      this.resourceTypeHandler(typeNumber, 1);
    });
  };

  // tool - 모델 선택 핸들러
  toolModelSelectHandler = (model, type) => {
    const newState = {};
    this.templateIdReset();
    if (type === 'hps') {
      newState.hpsModelSelectValue = model;
      this.trainingTypeArrowHandler('hpsModel');
    } else if (type === 'job') {
      newState.jobModelSelectValue = model;
      this.trainingTypeArrowHandler('jobModel');
    }
    this.setState(newState, () => this.submitBtnCheck());
  };

  toolModelSortHandler = ({ e = { target: { value: '' } }, tool }) => {
    const { originJobModelList, originHpsModelList } = this.state;

    let { value } = e.target;
    const newState = {};

    newState.toolModelSearchValue = value;
    const filteredData = [];
    if (tool === 'hps') {
      if (value !== '' && value) {
        originHpsModelList.forEach((v) => {
          if (v.includes(value)) {
            filteredData.push(v);
          }
        });
      } else if (value === '') {
        originHpsModelList.forEach((v) => {
          filteredData.push(v);
        });
      }
      newState.hpsModelList = filteredData;
    } else if (tool === 'job') {
      if (value !== '' && value) {
        originJobModelList.forEach((v) => {
          if (v.includes(value)) {
            filteredData.push(v);
          }
        });
      } else if (value === '') {
        originJobModelList.forEach((v) => {
          filteredData.push(v);
        });
      }
      newState.jobModelList = filteredData;
    }
    this.setState(newState);
  };

  /** ================================================================================
   * Event Handler END
   ================================================================================ */

  parseOption = (option) => {
    const {
      built_in_model_kind_list: builtInFilterList = [],
      built_in_model_list: builtInModelList = [],
      trained_built_in_model_list: trainedBuiltInModelList = [],
      trained_custom_model_list: customModelList = [],
      user_list: ownerOptions = [],
      workspace_list: workspaceOptions = [],
      docker_image_list: dockerImageOptions = [],
      gpu_usage_status: gpuUsageStatus,
      gpu_model_status: gpuModelStatus = [],
      cpu_model_status: cpuModelStatus = [],
    } = option;
    let gpuFree = 0;
    let gpuTotal = 0;
    if (gpuUsageStatus) {
      const { free_gpu: gpuFreeVal, total_gpu: gpuTotalVal } = gpuUsageStatus;
      gpuFree = gpuFreeVal;
      gpuTotal = gpuTotalVal;
    }

    // Custom 모델 옵션(Selectbox에 input에 적합한 형태로 변경)
    const customModelOptions = customModelList.map(
      ({ name: label, id: value, run_code_list: runCodeList }) => ({
        label,
        value,
        isDisable: runCodeList?.length < 1,
      }),
    );

    // Built-in 모델 옵션
    const builtInUserTrainedModelOptions = []; // user-trained (Custom)
    const builtInPreTrainedModelOptions = []; // pre-trained (Default)

    // built-in의 user-trained 모델 옵션 필터링
    for (let i = 0; i < trainedBuiltInModelList.length; i += 1) {
      const {
        name: label,
        id: value,
        job_list: jobList,
        docker_image_id: dockerImageId,
        built_in_model_name: modelName,
        deployment_multi_gpu_mode: multiGpuMode, // 0 | 1
        enable_to_deploy_with_gpu: enableGpu, // 0 | 1
        enable_to_deploy_with_cpu: enableCpu, // 0 | 1
        deployment_status: deploymentStatus, // 0 | 1 | -1
      } = trainedBuiltInModelList[i];
      const item = {
        isTrained: true,
        title: label,
        name: modelName,
        label,
        id: value,
        value,
        jobList,
        disabled: !jobList || deploymentStatus !== 1,
        dockerImageId,
        multiGpuMode,
        enableGpu,
        enableCpu,
      };
      builtInUserTrainedModelOptions.push(item);
    }

    // built-in의 pre-trained 모델 옵션 필터링
    for (let i = 0; i < builtInModelList.length; i += 1) {
      const {
        id,
        created_by: createdBy,
        kind,
        name,
        docker_image_id: dockerImageId,
        description: desc,
        exist_default_checkpoint: existDefaultCheckpoint,
        deployment_multi_gpu_mode: multiGpuMode,
        enable_to_deploy_with_gpu: enableGpu,
        enable_to_deploy_with_cpu: enableCpu,
        deployment_status: deploymentStatus, // 0 | 1 | -1
      } = builtInModelList[i];
      const item = {
        id,
        createdBy,
        kind,
        name,
        title: name,
        desc,
        disabled: !existDefaultCheckpoint || deploymentStatus !== 1,
        enableGpu,
        enableCpu,
        multiGpuMode,
        dockerImageId,
      };
      builtInPreTrainedModelOptions.push(item);
    }

    const builtInModelOptions = [];
    const parseBuiltInModelList = [];
    for (let i = 0; i < trainedBuiltInModelList.length; i += 1) {
      const {
        name: label,
        id: value,
        job_list: jobList,
        docker_image_id: dockerImageId,
      } = trainedBuiltInModelList[i];
      const item = {
        label,
        value,
        jobList,
        disabled: !jobList,
        dockerImageId,
      };
      builtInModelOptions.push(item);
      parseBuiltInModelList.push(item);
    }

    // 빌트인 모델 카테고리 옵션
    const builtInFilterOptions = builtInFilterList.map(
      ({ kind, created_by: createdBy }) => {
        return {
          label: kind,
          value: kind,
          createdBy,
        };
      },
    );
    builtInFilterOptions.unshift({ label: 'all.label', value: 'all' });

    return {
      gpuTotal,
      gpuFree,
      // Built-in 모델 옵션
      builtInUserTrainedModelOptions,
      builtInPreTrainedModelOptions,
      // 커스텀 모델 옵션
      customModelOptions,
      trainedBuiltInModelList: parseBuiltInModelList,
      builtInModelOptions,
      cpuModelStatus, // slider에 쓸 cpu 데이터
      ownerOptions: ownerOptions.map(({ name: label, id: value }) => ({
        label,
        value,
      })),
      workspaceOptions: workspaceOptions.map(({ name: label, id: value }) => ({
        label,
        value,
      })),
      dockerImageOptions: dockerImageOptions.map(
        ({ name: label, id: value }) => ({ label, value }),
      ),
      builtInFilterOptions,
      gpuModelListOptions: gpuModelStatus.map((v) => ({
        ...v,
        selected: false,
        node_list: v.node_list.map((n) => ({
          ...n,
          selected: false,
        })),
      })),
    };
  };

  // 모델 옵션에서 모델 id로 해당 모델 찾기
  findModelAndBuiltInType = (
    {
      builtInUserTrainedModelOptions,
      builtInPreTrainedModelOptions,
      customModelOptions,
    },
    deploymentType,
    modelId,
  ) => {
    let modelArr = [];
    if (deploymentType === 'built-in') {
      modelArr = builtInPreTrainedModelOptions.filter(
        ({ id }) => modelId === id,
      );
      if (modelArr.length === 0) {
        modelArr = builtInUserTrainedModelOptions.filter(
          ({ id }) => modelId === id,
        );
      }
    } else {
      modelArr = customModelOptions.filter(({ value }) => modelId === value);
    }
    return {
      model: modelArr[0],
    };
  };

  getGroupData = async () => {
    let workspaceId = this.props.data.workspaceId;
    if (this.state.workspace?.label) {
      workspaceId = this.state.workspace.value;
    }
    const response = await callApi({
      url: `deployments/template-group-list?workspace_id=${workspaceId}`,
      method: 'GET',
    });
    const { result } = response;
    result.deployment_template_group_info_list?.forEach((data, index) => {
      if (data.description) {
        result.deployment_template_group_info_list[index].descriptionAssemble =
          Hangul.make(data.description);
      }
    });
    this.setState({
      groupData: result.deployment_template_group_info_list,
      defaultGroupName: result.deployment_template_group_new_name,
    });
  };

  getTemplateListHandler = async (id) => {
    let workspaceId = this.props.data.workspaceId;

    if (this.state.workspace?.label) {
      workspaceId = this.state.workspace.value;
    }
    let url = `deployments/template-list?workspace_id=${workspaceId}`;
    if (id !== undefined) url += `&deployment_template_group_id=${id}`;
    if (this.state.deploymentNoGroupSelected) url += `&is_ungrouped_template=1`;
    const response = await callApi({
      url,
      method: 'GET',
    });
    const { result } = response;

    this.setState({
      templateData: result?.deployment_template_info_list
        ? result.deployment_template_info_list
        : [],
      defaultTemplateName: result.deployment_template_new_name,
    });
  };

  onClickGroupSelect = () => {
    if (!this.state.groupSelect) {
      this.setState({ clickedTemplateLists: null, clickedDataList: null });
    }
    this.setState({ groupSelect: !this.state.groupSelect });
  };

  onClickGroupList = (data) => {
    if (data.id === this.state.clickedDataList?.id) {
      this.setState({
        clickedDataList: null,
        templateData: null,
        clickedTemplateLists: null,
      });
      this.setState({ deploymentNoGroupSelected: false }, () =>
        this.getTemplateListHandler(),
      );
    } else {
      this.setState({ clickedDataList: data, clickedTemplateLists: null });
      this.setState({ deploymentNoGroupSelected: false }, () =>
        this.getTemplateListHandler(data.id),
      );
    }
    this.setState({ deploymentNoGroupSelected: false, makeNewGroup: false });
  };

  onClickTemplateList = (data) => {
    if (this.state.clickedTemplateLists?.id === data.id) {
      this.setState({
        clickedTemplateLists: null,
      });
    } else {
      this.setState({
        clickedTemplateLists: data,
      });
    }
  };

  setClickedDataList = (data) => {
    this.setState({ clickedDataList: data });
  };

  setMakeNewGroup = (data) => {
    this.setState({ makeNewGroup: data });
  };

  onClickNewGroup = () => {
    this.setState({
      clickedDataList: null,
      makeNewGroup: !this.state.makeNewGroup,
      newGroupName: '',
      newGroupDescription: '',
      groupNameError: false,
    });
  };

  checkGroupNameDuplicate = async (value) => {
    const { workspaceId } = this.props.data;
    const resp = await callApi({
      url: `options/deployments/templates/check-group-name?deployment_template_group_name=${value}&workspace_id=${workspaceId}`,
      method: 'GET',
    });
    const newState = {};
    if (resp.result.is_duplicated) {
      newState.groupNameError = 'template.duplicate.name.label';
    } else {
      newState.groupNameError = false;
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  checkTemplateNameDuplicate = async (value) => {
    const { workspaceId } = this.props.data;
    const resp = await callApi({
      url: `options/deployments/templates/check-name?deployment_template_name=${value}&workspace_id=${workspaceId}`,
      method: 'GET',
    });
    const newState = {};
    if (resp.result.is_duplicated) {
      newState.templateNameError = 'template.duplicate.name.label';
    } else {
      newState.templateNameError = false;
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  logClickHandler = ({ id, target, checkpointList }) => {
    this.templateIdReset();
    const newState = {};
    newState.hpsModelSelectValue = '';
    newState.selectedLogId = id;
    newState.selectedHpsScore = target;
    newState.hpsModelList = checkpointList;
    newState.originHpsModelList = checkpointList;
    this.trainingTypeArrowCustomHandler('tool', false);
    this.trainingTypeArrowCustomHandler('hps', false);
    this.setState(newState, () => this.submitBtnCheck());
  };

  templateValidate = (value) => {
    const regType1 = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (value === '') {
      return false;
    }
    if (!value.match(regType1) || value.match(regType1)[0] !== value) {
      return true;
    }
    return null;
  };

  groupNameInputHandler = (e) => {
    const validation = this.templateValidate(e.target.value);
    const newState = {};
    newState.newGroupName = e.target.value;
    if (validation) {
      newState.groupNameError = 'nameRule.message';
    } else {
      this.checkGroupNameDuplicate(e.target.value);
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  groupDescriptionInputHandler = (e) => {
    this.setState({ newGroupDescription: e.target.value });
  };

  templateNewNameInputHandler = (e) => {
    const validation = this.templateValidate(e.target.value);
    const newState = {};
    newState.templateNewName = e.target.value;
    if (validation) {
      newState.templateNameError = 'nameRule.message';
    } else {
      this.checkTemplateNameDuplicate(e.target.value);
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  templateNewDescriptionInputHandler = (e) => {
    this.setState({ templateNewDescription: e.target.value });
  };

  /**
   * 설정 -> 템플릿 취소 버튼 눌렀을 때 초기화
   */
  onClickTemplateBox = () => {
    this.setState({ templateOpenStatus: !this.state.templateOpenStatus }, () =>
      this.submitBtnCheck(),
    );
    if (!this.state.templateOpenStatus) {
      /**
       * 초기화
       */
      this.setState({
        templateNewName: '',
        templateNewDescription: '',
        newGroupName: '',
        newGroupDescription: '',
        clickedDataList: null,
        groupSelect: false,
        templateNameError: false,
        groupNameError: false,
        makeNewGroup: false,
      });
    }
  };

  getBuiltInModelList = async (type) => {
    let workspaceId = this.props.data.workspaceId;

    if (this.state.workspace) {
      workspaceId = this.state.workspace.value;
    }

    const response = await callApi({
      url: `options/deployments/templates?workspace_id=${workspaceId}&deployment_template_type=${type}`,
      method: 'GET',
    });
    const { result, status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      result.pretrained_built_in_model_list?.forEach((item) => {
        if (item.built_in_model_name) {
          const dis_name = Hangul.make(item.built_in_model_name);
          Object.assign(item, { dis_name });
        }
        if (item.built_in_model_description) {
          const dis_desc = Hangul.make(item.built_in_model_description);
          Object.assign(item, { dis_desc });
        }
      });
      this.setState({ modelList: result, originModelList: result });
      return result;
    } else {
      errorToastMessage(error, message);
    }
  };

  searchModelHandler = (e) => {
    const value = e.target.value;
    this.setState({ modelSearchValue: value });
    if (value !== '') {
      this.modelFilterHandler({ searchValue: value.toLowerCase() });
    } else if (this.state.modelCategorySelect.value === 'all' && value === '') {
      this.setState({ modelList: this.state.originModelList });
    }
  };

  categoryHandler = (value) => {
    this.setState({ modelCategorySelect: value });
    this.modelFilterHandler({ categoryValue: value });
  };

  modelFilterHandler = ({
    searchValue = this.state.modelSearchValue,
    categoryValue = this.state.modelCategorySelect,
  }) => {
    let filteredData;
    const cloneList = cloneDeep(this.state.originModelList);
    if (searchValue) {
      filteredData = cloneList.pretrained_built_in_model_list.filter((data) => {
        if (
          data.dis_name?.toLowerCase().includes(searchValue) ||
          data.dis_desc?.toLowerCase().includes(searchValue) ||
          data.built_in_model_description
            ?.toLowerCase()
            .includes(searchValue) ||
          data.built_in_model_name?.toLowerCase().includes(searchValue)
        ) {
          return data;
        }
        return null;
      });
      cloneList.pretrained_built_in_model_list = filteredData;
    }
    if (categoryValue) {
      if (categoryValue?.value !== 'all') {
        filteredData = cloneList.pretrained_built_in_model_list.filter(
          (data) => {
            if (data.built_in_model_kind === categoryValue.label) {
              return data;
            }
            return null;
          },
        );
        cloneList.pretrained_built_in_model_list = filteredData;
      }
      this.setState({ modelList: cloneList });
    }
  };

  /**
   *
   *  built-in 모델 사용하기 list 선택 함수
   */
  onClickModelList = (list) => {
    let selectedModel = this.state.dockerImageOptions.filter(
      (image) => image.value === list.docker_image_id,
    );
    const newState = {};
    if (list.enable_to_deploy_with_gpu && !list.deployment_multi_gpu_mode) {
      newState.gpuUsage = 1;
    }
    if (!list.enable_to_deploy_with_gpu || !list.enable_to_deploy_with_cpu) {
      if (list.enable_to_deploy_with_gpu) {
        newState.modelType = 0;
      } else {
        newState.modelType = 1;
      }
    }
    this.templateIdReset();
    this.setState(
      {
        ...newState,
        dockerImage: selectedModel[0],
        selectedModel: { ...list, deployment_type: 'built-in' },
        modelSelectStatus: !this.state.modelSelectStatus,
        modelCategorySelect: { value: 'all' },
        modelSearchValue: null,
        modelList: this.state.originModelList,
      },
      () => this.submitBtnCheck(),
    );
  };

  // 템플릿 id 초기화
  templateIdReset = () => {
    this.setState({ templateId: null });
  };

  modelSelectStatusHanlder = () => {
    this.setState({ modelSelectStatus: !this.state.modelSelectStatus });
  };

  jsonDataHandler = () => (json) => {
    this.templateIdReset();
    setTimeout(() => {
      if (
        this.state.jsonRef.current.jsonEditor.aceEditor.session.getAnnotations()
          .length > 0 ||
        !json
      ) {
        this.setState({ jsonDataError: true }, () => this.submitBtnCheck());
      } else
        this.setState({ jsonDataError: false, jsonData: json }, () =>
          this.submitBtnCheck(),
        );
    }, [500]);
  };

  getDockerImageId = async (id) => {
    const response = await callApi({
      url: `options/deployments/templates/docker-image-id?built_in_model_id=${id}`,
      method: 'get',
    });
    const { result, status } = response;
    if (status === STATUS_SUCCESS) {
      return result.docker_image_id;
    }
  };

  setData = async (data) => {
    const templateData = data.deployment_template;
    const type = data.deployment_template_type;
    const builtInModelid = data.deployment_template.built_in_model_id;
    const newState = {};
    if (templateData.deployment_type === 'built-in') {
      const dockerImageId = await this.getDockerImageId(builtInModelid);
      const { dockerImageOptions } = this.state;
      let filteredSelectedModel = {};
      if (type === 'usertrained') {
        filteredSelectedModel =
          this.state.modelList.usertrained_training_list?.filter(
            (d) => d.built_in_model_id === builtInModelid,
          )[0];
      } else if (type === 'pretrained') {
        filteredSelectedModel =
          this.state.modelList.pretrained_built_in_model_list?.filter(
            (d) => d.built_in_model_id === builtInModelid,
          )[0];
      }
      newState.selectedModel = filteredSelectedModel;

      if (filteredSelectedModel.enable_to_deploy_with_gpu) {
        newState.gpuUsage = 1;
      }
      newState.dockerImage = dockerImageOptions.filter(
        ({ value }) => dockerImageId === value,
      )[0];
    }
    if (type === 'usertrained' || type === 'custom') {
      newState.trainingTypeData = 'usertrained';

      if (templateData.deployment_type === 'built-in') {
        newState.trainingType = 'built-in';
        newState.selectedDeploymentType = 'usertrained';
        newState.selectedTraining = templateData.training_name;
        const { jobListItem, hpsListItem } = await this.getJobList(
          templateData,
          templateData.training_name,
        );

        const splitedChekcpoint = templateData.checkpoint.split('/');
        if (templateData.training_type === 'hps') {
          const hpsName = templateData.hps_name;
          const hpsId = templateData.hps_id;
          const hpsIdx = templateData.hps_group_index;
          newState.trainingToolTab = 1;
          newState.trainingType = 'built-in';

          let hpsLogTable = [];
          hpsListItem.forEach((v, i) => {
            if (v.hps_name === hpsName) {
              v.hps_group_list.forEach((model) => {
                if (model.hps_id === hpsId) {
                  hpsLogTable = model.hps_number_info;
                }
              });
            }
          });

          this.toolSelectHandler({
            type: 'HPS',
            name: hpsName,
            jobId: hpsId,
            detailNumber: hpsIdx + 1,
            hpsLogTable: hpsLogTable,
            hpsCheckpoint: hpsLogTable.max_item.checkpoint_list,
          });

          newState.hpsModelSelectValue = splitedChekcpoint.at(-1);
        } else if (templateData.training_type === 'job') {
          newState.jobModelSelectValue = splitedChekcpoint.at(-1);

          const jobName = templateData.job_name;
          const jobId = templateData.job_id;
          const jobIdx = templateData.job_group_index;
          let checkpoint = [];
          jobListItem.forEach((v, i) => {
            if (v.job_name === jobName) {
              v.job_group_list.forEach((model) => {
                if (model.job_id === jobId) {
                  checkpoint = model.checkpoint_list;
                }
              });
            }
          });
          this.toolSelectHandler({
            type: 'JOB',
            name: jobName,
            jobId: jobId,
            detailNumber: jobIdx + 1,
            jobCheckpoint: checkpoint,
          });
          newState.trainingToolTab = 0;
          newState.trainingType = 'built-in';
        }
        this.setState(newState, () => {
          this.submitBtnCheck();
        });
      }
      if (templateData.deployment_type === 'custom') {
        await this.getJobList(templateData, templateData.training_name);
        this.getCustomList(templateData);
        if (
          templateData?.environments &&
          templateData?.environments.length > 0
        ) {
          newState.variablesValues = templateData.environments;
        }

        newState.selectedTraining = templateData.training_name;
        newState.trainingType = 'advanced';
        newState.selectedDeploymentType = 'usertrained';

        if (templateData.command) {
          if (templateData.command.arguments) {
            newState.customParam = templateData.command.arguments;
          }
          if (templateData.command.binary) {
            newState.customLan = templateData.command.binary;
          }
          if (templateData.command.script) {
            newState.customFile = templateData.command.script;
          }
        }
      }
      this.deploymentTypeHandler(type === 'custom' ? 'usertrained' : type);
    } else if (
      type === 'pretrained' &&
      templateData.deployment_type !== 'built-in'
    ) {
      newState.selectedModel = data.deployment_template;
    } else if (type === 'sandbox') {
      newState.selectedModel = data.deployment_template;
      newState.jsonData = data.deployment_template;
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  /**
   * 배포 유형 -> 템플릿 사용하기 -> 템플릿 적용 버튼
   * clickedDeployTemplateLists - 선택된 템플릿
   */
  applyButtonClicked = async () => {
    const type = this.state.clickedTemplateLists.deployment_template_type;

    const { pretrained_built_in_model_list: modelList } =
      await this.getBuiltInModelList(type);

    this.setState({
      trainingTypeArrow: {
        train: false,
        tool: false,
        model: false,
        variable: false,
        hps: false,
        hpsModel: false,
        jobModel: false,
      },
      modelSelectStatus: false,
    });

    this.setState({
      templateId: this.state.clickedTemplateLists.id,
    });
    const selectedBuiltInId =
      this.state.clickedTemplateLists?.deployment_template?.built_in_model_id;
    if (modelList && modelList.length > 0) {
      modelList.forEach((v) => {
        if (v?.built_in_model_id === selectedBuiltInId) {
        }
      });
    }
    this.setData(this.state.clickedTemplateLists);

    this.deploymentTypeHandler(
      this.state.clickedTemplateLists.deployment_template_type,
    );
  };

  jsonDataErrorHandler = (e) => {
    if (e.length > 0) {
      this.setState({ jsonDataError: true }, () => this.submitBtnCheck());
    }
  };

  onClickNoGroup = () => {
    this.setState(
      {
        deploymentNoGroupSelected: !this.state.deploymentNoGroupSelected,
        clickedDataList: null,
      },
      () => this.getTemplateListHandler(),
    );
  };

  render() {
    const {
      state,
      props,
      radioBtnHandler,
      textInputHandler,
      numberInputHandler,
      selectInputHandler,
      multiSelectHandler,
      selectGpuModelHandler,
      modelTypeHandler,
      resourceTypeHandler,
      cpuModelTypeHandler,
      gpuModelTypeHandler,
      totalValueHandler,
      sliderSwitchHandler,
      totalSliderHandler,
      detailCpuValueHandler,
      detailGpuValueHandler,
      checkboxHandler,
      deploymentTypeHandler,
      trainingTypeSelectHandler,
      trainingSearch,
      trainingSortHandler,
      backBtnHandler,
      getJobList,
      getCustomList,
      tabClickHandler,
      toolDetailOpenHandler,
      trainingToolTabHandler,
      toolSelectHandler,
      trainingSelectHandler,
      paramsInputHandler,
      runcodeClickHandler,
      variablesAdd,
      variablesDelete,
      variableInputHandler,
      variablesSortHandler,
      onSubmit,
      onClickGroupSelect,
      onClickTemplateList,
      onClickGroupList,
      setClickedDataList,
      setMakeNewGroup,
      getTemplateListHandler,
      onClickNewGroup,
      groupNameInputHandler,
      groupDescriptionInputHandler,
      templateNewNameInputHandler,
      templateNewDescriptionInputHandler,
      applyButtonClicked,
      toolSortHandler,
      hpsLogSortHandler,
      onClickTemplateBox,
      logClickHandler,
      toolModelSortHandler,
      trainingTypeArrowHandler,
      toolModelSelectHandler,
      getBuiltInModelList,
      searchModelHandler,
      categoryHandler,
      onClickModelList,
      modelSelectStatusHanlder,
      jsonDataHandler,
      jsonDataErrorHandler,
      onClickNoGroup,
    } = this;

    return (
      <DeploymentFormModal
        {...state}
        {...props}
        textInputHandler={textInputHandler}
        numberInputHandler={numberInputHandler}
        radioBtnHandler={radioBtnHandler}
        selectInputHandler={selectInputHandler}
        multiSelectHandler={multiSelectHandler}
        selectGpuModelHandler={selectGpuModelHandler}
        modelTypeHandler={modelTypeHandler}
        resourceTypeHandler={resourceTypeHandler}
        cpuModelTypeHandler={cpuModelTypeHandler}
        gpuModelTypeHandler={gpuModelTypeHandler}
        totalValueHandler={totalValueHandler}
        sliderSwitchHandler={sliderSwitchHandler}
        totalSliderHandler={totalSliderHandler}
        detailCpuValueHandler={detailCpuValueHandler}
        detailGpuValueHandler={detailGpuValueHandler}
        checkboxHandler={checkboxHandler}
        trainingTypeSelectHandler={trainingTypeSelectHandler}
        deploymentTypeHandler={deploymentTypeHandler}
        trainingSearch={trainingSearch}
        trainingSortHandler={trainingSortHandler}
        backBtnHandler={backBtnHandler}
        tabClickHandle={tabClickHandler}
        toolDetailOpenHandler={toolDetailOpenHandler}
        trainingToolTabHandler={trainingToolTabHandler}
        getJobList={getJobList}
        toolSelectHandler={toolSelectHandler}
        trainingSelectHandler={trainingSelectHandler}
        getCustomList={getCustomList}
        paramsInputHandler={paramsInputHandler}
        runcodeClickHandler={runcodeClickHandler}
        variablesAdd={variablesAdd}
        variableInputHandler={variableInputHandler}
        variablesDelete={variablesDelete}
        variablesSortHandler={variablesSortHandler}
        onSubmit={onSubmit}
        onClickGroupSelect={onClickGroupSelect}
        onClickTemplateList={onClickTemplateList}
        onClickGroupList={onClickGroupList}
        setClickedDataList={setClickedDataList}
        setMakeNewGroup={setMakeNewGroup}
        getTemplateListHandler={getTemplateListHandler}
        onClickNewGroup={onClickNewGroup}
        groupNameInputHandler={groupNameInputHandler}
        groupDescriptionInputHandler={groupDescriptionInputHandler}
        templateNewNameInputHandler={templateNewNameInputHandler}
        templateNewDescriptionInputHandler={templateNewDescriptionInputHandler}
        applyButtonClicked={applyButtonClicked}
        toolSortHandler={toolSortHandler}
        hpsLogSortHandler={hpsLogSortHandler}
        onClickTemplateBox={onClickTemplateBox}
        logClickHandler={logClickHandler}
        trainingTypeArrowHandler={trainingTypeArrowHandler}
        toolModelSelectHandler={toolModelSelectHandler}
        toolModelSortHandler={toolModelSortHandler}
        getBuiltInModelList={getBuiltInModelList}
        searchModelHandler={searchModelHandler}
        categoryHandler={categoryHandler}
        onClickModelList={onClickModelList}
        modelSelectStatusHanlder={modelSelectStatusHanlder}
        jsonDataHandler={jsonDataHandler}
        jsonDataErrorHandler={jsonDataErrorHandler}
        onClickNoGroup={onClickNoGroup}
      />
    );
  }
}

export default withTranslation()(DeploymentFormModalContainer);

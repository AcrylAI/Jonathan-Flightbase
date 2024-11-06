import { PureComponent } from 'react';

// i18n
import { withTranslation } from 'react-i18next';

// Components
import TrainingFormModal from '@src/components/Modal/TrainingFormModal';
import { toast } from '@src/components/Toast';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import Hangul from '@src/koreaUtils';
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

// 연합 학습 유무
const IS_FL = import.meta.env.VITE_REACT_APP_IS_FEDERATED_LEARNING === 'true';

class TrainingFormModalContainer extends PureComponent {
  _MODE = import.meta.env.VITE_REACT_APP_MODE;
  // 드론 챌린지 모드 여부
  _IS_DNADRONECHALLENGE =
    import.meta.env.VITE_REACT_APP_SERVICE_LOGO === 'DNA+DRONE' &&
    import.meta.env.VITE_REACT_APP_IS_CHALLENGE === 'true';

  state = {
    validate: false, // 모달의 submit 버튼 활성/비활성 여부 상태 값
    trainingId: '', // Training id 값
    trainingType: 'advanced', // Training Type
    trainingTypeOptions: [
      {
        label: 'Built-in',
        value: 'built-in',
        disabled: this._IS_DNADRONECHALLENGE,
        tooltip: true,
      },
      {
        label: 'Custom',
        value: 'advanced',
      },
    ], // Training Type 선택 옵션
    trainingName: '', // Training Name 값
    trainingNameError: null, // Training Name 인풋 에러 텍스트
    trainingDesc: '', // Training Description 값
    trainingDescError: null, // Training Description 인풋 에러 텍스트
    workspace: null, // 선택한 Workspace 값
    workspaceOptions: [], // Workspace 선택 옵션
    builtInFilterOptions: [],
    builtInFilter: null,
    builtInModelOptions: [], // Built-in Model 선택 옵션
    builtInModelSearchResult: null, // Built-in Model 검색 데이터
    builtInModel: null, // Built-in Model 값
    gpuUsage: '', // 사용할 GPU(GPU usage) 수 값
    gpuUsageError: null, // 사용할 GPU 인풋 에러 텍스트
    modelType: 0, // cpu or gpu 선택 값
    maxGpuUsageCountForRandom: 0, // 사용 가능한 GPU 수 (GPU 모델 랜덤)
    gpuTotalCountForRandom: 0, // 모든 GPU 수 (GPU 모델 랜덤)
    maxGpuUsageCount: 0, // 사용 가능한 GPU 수
    minGpuUsage: 0, // 반드시 사용해야할 최소 GPU 수
    maxGpuUsage: 10000, // 반드시 넘으면 안되는 최대 GPU 수
    gpuTotalCount: 0, // 모든 GPU 수
    isGuranteedGpu: false, // GPU 보장 여부
    dockerImage: null, // 선택한 Docker Image 값
    dockerImageOptions: [], // DOcker Image 옵션
    gpuModelTypeOptions: [
      { label: 'random.label', value: 0 },
      { label: 'specificModel.label', value: 1 },
    ],
    cpuModelTypeOptions: [
      { label: 'random.label', value: 0 },
      { label: 'specificModel.label', value: 1 },
    ],
    modelTypeOptions: [
      {
        label: 'gpuModel.label',
        value: 0,
      },
      { label: 'cpuModel.label', value: 1 },
    ],
    // config의 옵션으로 모델 특정 기능을 숨기는 경우, 디폴트 값이 반드시 무작위가 되어야 하므로,
    // 아래 디폴트 값 0(무작위)을 1(모델 특정)로 바꾸면 안됨
    gpuModelType: 0,
    cpuModelType: 0,
    gpuModelListOptions: [], // GPU 모델 선택 옵션
    gpuModelList: null, // 선택한 GPU 모델 리스트
    cpuModelList: [], // 선택한 CPU 모델 리스트 (노드)
    cpuModelInfo: [],
    gpuModelInfo: [],
    resourceTypeReadOnly: false,
    isMigModel: false, // 선택한 gpu model 리스트에 MIG 모델 포함 여부
    accessTypeOptions: [
      // Access Type 선택 옵션
      { label: 'Public', value: 1 },
      { label: 'Private', value: 0 },
    ],
    accessType: 1, // 선택한 Access Type 값
    trainingStatus: '',
    ownerOptions: [], // Owner 선택 옵션
    owner: null, // 선택한 Owner 값
    userList: [], // 유저 멀티 선택 옵션
    selectedList: [], // 선택된 유저 값
    tmpSelectedList: [],
    thumbnailList: [],
    permissionLevel: -1,
    //* slider 관련 state
    //gpu
    gpuSliderSwitch: false,
    gpuSelectedOptions: [],
    gpuDetailSelectedOptions: [],
    gpuTotalValue: 1,
    gpuRamTotalValue: 1,
    gpuDetailValue: 1,
    gpuRamDetailValue: 1,
    gpuTotalSliderMove: false,
    gpuSwitchStatus: false,
    gpuAndRamSliderValue: {
      cpu: 1,
      ram: 1,
    },
    //cpu
    sliderSwitchStatus: false,
    cpuSwitchStatus: false,
    cpuSliderMove: false,
    cpuSelectedOptions: [],
    detailSelectedOptions: [],
    cpuTotalValue: 1,
    ramTotalValue: 1,
    cpuDetailValue: 1,
    ramDetailValue: 1,
    totalSliderMove: false,
    cpuAndRamSliderValue: {
      cpu: 1,
      ram: 1,
    },
  };

  async componentDidMount() {
    let newState = {};

    let {
      type,
      data: { data: trainingData, trainingId },
    } = this.props;

    if (trainingId) {
      const res = await callApi({
        url: `trainings/${trainingId}`,
        method: 'get',
      });
      const { result, status } = res;

      if (status === STATUS_SUCCESS) {
        trainingData = result;
      } else {
        return;
      }
    }

    let currentWorkspaceId = this.props.data.workspaceId;

    // 워크스페이스 설정
    if (this.props.data.workspaceId) {
      // 유저 페이지에서 프로젝트 생성
      newState.workspace = { value: this.props.data.workspaceId };
    } else {
      // 어드민 페이지에서 프로젝트 생성
      const { workspaceListInfo } = await this.getAdminTrainingInfo();
      // workspace 목록 조회
      if (workspaceListInfo) {
        newState.workspaceOptions = workspaceListInfo.map(({ id, name }) => ({
          label: name,
          value: id,
        }));
      }
    }
    // Training 옵션 정보 조회
    const {
      builtInModelListInfo,
      dockerImageListInfo,
      thumbnailList,
      gpuStatusInfo,
      gpuModelStatusInfo,
      cpuModelStatusInfo,
      userListInfo = [],
      builtInFilterListInfo,
    } = await this.getTrainingInfo(currentWorkspaceId);

    // 컴포넌트 state에 맞게 데이터 파싱
    newState = {
      ...newState,
      cpuModelInfo: cpuModelStatusInfo,
      gpuModelInfo: gpuModelStatusInfo,
      thumbnailList,
      builtInFilter: { label: 'all.label', value: 'all' },
      ...this.parseStateData({
        builtInModelListInfo,
        dockerImageListInfo,
        gpuStatusInfo,
        gpuModelStatusInfo,
        builtInFilterListInfo,
      }),
      ...this.cpuGetHandler(cpuModelStatusInfo),
      ...this.gpuGetHandler(gpuModelStatusInfo),
    };
    let selectedList = [];

    if (type === 'EDIT_TRAINING') {
      const response = await callApi({
        url: `trainings/${trainingData.id}`,
        method: 'get',
      });

      const { result, status, message, error } = response;
      if (status === STATUS_SUCCESS) {
        const {
          id: trainingId,
          type: trainingType,
          training_name: trainingName,
          workspace_id: workspaceId,
          workspace_name: workspaceName,
          gpu_model: gpuModel,
          gpu_count: gpuUsage,
          image_id: dockerImageId,
          image_name: dockerImageName,
          user_id: ownerId,
          user_name: ownerName,
          users: selectedUsers,
          access: accessType,
          description: trainingDesc,
          status: trainingStatus,
          permission_level: permissionLevel,
          built_in_model_id: builtInModelId,
        } = result;
        currentWorkspaceId = workspaceId;
        // id 값으로 필요한 이름 찾기 workspace, owner, dockerImage
        const workspace = { label: workspaceName, value: workspaceId };
        const dockerImage = { label: dockerImageName, value: dockerImageId };
        const owner = { label: ownerName, value: ownerId };
        const builtInModel = newState.builtInModelOptions.filter(
          ({ id }) => id === builtInModelId,
        )[0];
        selectedList = selectedUsers.map(({ user_name: label, id: value }) => ({
          label,
          value,
        }));

        // gpu model 선택 넣기
        let gpuModelListOptions = [];
        const gpuModelObj = gpuModel !== null ? gpuModel : {};
        gpuModelListOptions = gpuModelStatusInfo.map((v) => {
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
        gpuModelListOptions.map(({ node_list: nodeList }, idx) => {
          cpuModelList[idx] = nodeList.filter(({ selected }) => selected);
          return cpuModelList;
        });
        const gpuModelList = gpuModelListOptions.filter(
          ({ selected }) => selected,
        );
        const gpuState = this.gpuModelState(
          gpuModelListOptions,
          gpuModelList,
          gpuUsage,
        );

        newState = {
          ...newState,
          ...gpuState,
          cpuModelList,
          trainingId,
          trainingName,
          trainingNameError: '',
          trainingType,
          workspace,
          trainingDesc: !trainingDesc ? '' : trainingDesc,
          trainingDescError: trainingDesc ? '' : null,
          gpuModelType: gpuModel ? 1 : 0,
          dockerImage,
          owner,
          selectedList,
          accessType,
          trainingStatus,
          permissionLevel,
          builtInModel,
        };
      } else {
        errorToastMessage(error, message);
      }
    } else if (type === 'CREATE_TRAINING') {
      const loginUserName = sessionStorage.getItem('user_name');
      const ownerTmp = userListInfo.filter(
        ({ name }) => name === loginUserName,
      );

      if (ownerTmp.length === 1) {
        const owner = { label: ownerTmp[0].name, value: ownerTmp[0].id };
        newState.owner = owner;
      }
    }

    const { userList, ownerOptions } = this.parseStateData({
      userListInfo,
      selectedListInfo: selectedList,
    });
    newState.userList = userList;
    newState.ownerOptions = ownerOptions;

    // 연합 학습 유무에 따라 학습 유형 변경
    if (IS_FL) {
      let newTraningTypeOptions = this.state.trainingTypeOptions;
      newTraningTypeOptions.splice(1, 0, {
        label: 'builtInFederatedLearning.label',
        value: 'federated-learning',
      });
      newState.trainingTypeOptions = newTraningTypeOptions;
    }
    this.setState(newState);
  }

  // gpu get
  gpuGetHandler = (gpuModelStatusInfo = []) => {
    const newState = {};
    // gpu 기본 state 깔기
    if (gpuModelStatusInfo?.length > 0) {
      let selectedOptions = [];
      let detailSelectedOption = [];
      let selectedItemValue = [];
      let nodeObj = {};
      const gpuObj = {};
      const ramObj = {};
      let gpuPerPod = 1;
      let ramPerPod = 1;
      gpuModelStatusInfo.forEach(({ node_list: nodeList }, idx) => {
        nodeObj = {};
        selectedItemValue = [];
        selectedOptions.push({ [idx]: false });
        if (nodeList?.length > 0) {
          nodeList.forEach(({ resource_info }) => {
            selectedItemValue.push(false);
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

          nodeList.forEach((v, i) => (nodeObj[i] = 1)); //최솟값 넣기

          detailSelectedOption.push({ [idx]: selectedItemValue });
          gpuObj[idx] = nodeObj;
          ramObj[idx] = nodeObj;
        }
      });

      newState.gpuDetailValue = gpuObj;
      newState.gpuRamDetailValue = ramObj;
      newState.gpuSelectedOptions = selectedOptions;
      newState.gpuDetailSelectedOptions = detailSelectedOption;
    }
    return newState;
  };

  // cpu get
  cpuGetHandler = (cpuModelStatusInfo = []) => {
    const newState = {};
    // cpu 기본 state 깔기
    if (cpuModelStatusInfo?.length > 0) {
      let selectedOptions = [];
      let detailSelectedOption = [];
      let selectedItemBucket = [];
      let nodeObj = {};
      const cpuObj = {};
      const ramObj = {};
      let cpuPerPod = 1;
      let ramPerPod = 1;
      cpuModelStatusInfo.forEach(({ node_list: nodeList }, idx) => {
        nodeObj = {};
        selectedItemBucket = [];
        selectedOptions.push({ [idx]: false });
        if (nodeList?.length > 0) {
          nodeList.forEach(({ resource_info }) => {
            selectedItemBucket.push(false);
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

          nodeList.forEach((v, i) => (nodeObj[i] = 1)); //최솟값 넣기

          detailSelectedOption.push({ [idx]: selectedItemBucket });
          cpuObj[idx] = nodeObj;
          ramObj[idx] = nodeObj;
        }
      });
      newState.cpuDetailValue = cpuObj;
      newState.ramDetailValue = ramObj;
      newState.cpuSelectedOptions = selectedOptions;
      newState.detailSelectedOptions = detailSelectedOption;
    }

    return newState;
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
      newState.cpuSliderMove = cpuSwitchStatus;
      if (cpuSwitchStatus) {
        this.totalValueChange(ramTotalValue, 'ram', type);
        this.totalValueChange(cpuTotalValue, 'cpu', type);
      }
    } else if (type === 'gpu') {
      if (gpuSwitchStatus) {
        this.totalValueChange(gpuRamTotalValue, 'ram', type);
        this.totalValueChange(gpuTotalValue, 'gpu', type);
      }
      newState.gpuSwitchStatus = !gpuSwitchStatus;
      newState.gpuTotalSliderMove = gpuSwitchStatus;
    }

    this.setState(newState);
  };

  totalSliderHandler = (type) => {
    // * total false로 바꾸는 함수
    const newState = {};
    if (type === 'cpu') {
      newState.cpuSliderMove = false;
    } else if (type === 'gpu') {
      newState.gpuTotalSliderMove = false;
    }
    this.setState(newState);
  };

  totalValueChange = (v, option, type) => {
    // * 전체 슬라이더 조정
    if (v === 0 || v < 0) {
      v = 1;
    }
    const newState = {};
    let nodeObj = {};
    const newObj = {};
    if (type === 'cpu') {
      newState.cpuSliderMove = true;
    }
    if (type === 'gpu') {
      newState.gpuTotalSliderMove = true;
    }
    const { cpuModelInfo, gpuModelInfo } = this.state;

    if (cpuModelInfo?.length > 0 && type === 'cpu') {
      cpuModelInfo.forEach(({ node_list: nodeList }, idx) => {
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

    if (gpuModelInfo?.length > 0 && type === 'gpu') {
      gpuModelInfo.forEach(({ node_list: nodeList }, idx) => {
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
    if (v === 0 || v < 0) {
      v = 1;
    }
    const newState = {};
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
    this.setState(newState);
    this.totalValueChange(v, option, type);
  };

  /** ================================================================================
   * API START
   ================================================================================ */

  // Training Options 가져오기, workspaceId가 없으면 빈 Info들을 반환
  getTrainingInfo = async (workspaceId) => {
    if (!workspaceId) {
      return {
        builtInModelListInfo: [],
        dockerImageListInfo: [],
        gpuStatusInfo: { gpuTotal: 0, gpuFree: 0 },
        gpuModelStatusInfo: [],
        cpuModelStatusInfo: [],
        userListInfo: [],
      };
    }

    const response = await callApi({
      url: `options/trainings?workspace_id=${workspaceId}`,
      method: 'get',
    });

    const { result, status, message, error } = response;

    if (status !== STATUS_SUCCESS) {
      errorToastMessage(error, message);
      return {};
    }

    const {
      built_in_model_kind_list: builtInFilterListInfo,
      built_in_model_list: builtInModelListInfo,
      built_in_model_thumbnail_image_info: thumbnailList,
      docker_image_list: dockerImageListInfo,
      gpu_usage_status: gpuUsageStatus,
      gpu_model_status: gpuModelStatus,
      cpu_model_status: cpuModelStatus,
      user_list: userListInfo,
    } = result;

    const gpuStatusInfo = gpuUsageStatus
      ? {
          gpuTotal: gpuUsageStatus.total_gpu,
          gpuFree: gpuUsageStatus.free_gpu,
          isGuranteedGpu: gpuUsageStatus.guaranteed_gpu === 1,
        }
      : { gpuTotal: 0, gpuFree: 0 };
    return {
      builtInModelListInfo: builtInModelListInfo || [],
      dockerImageListInfo: dockerImageListInfo || [],
      thumbnailList: thumbnailList || [],
      gpuStatusInfo: gpuStatusInfo || { gpuTotal: 0, gpuFree: 0 },
      gpuModelStatusInfo: gpuModelStatus || [],
      cpuModelStatusInfo: cpuModelStatus || [],
      userListInfo: userListInfo || [],
      builtInFilterListInfo: builtInFilterListInfo || [],
    };
  };

  detailCpuValueHandler = (idx, id, value, option) => {
    const { cpuDetailValue, ramDetailValue, totalSliderMove } = this.state;
    const newState = {};

    if (value === 0 || value < 0) {
      value = 1;
    }
    newState.totalSliderMove = false;

    // setTotalSliderMove(false);
    if (!totalSliderMove) {
      if (option === 'cpu') {
        const copiedDetailValue = JSON.parse(JSON.stringify(cpuDetailValue));
        copiedDetailValue[idx][id] = value;

        newState.cpuDetailValue = copiedDetailValue;
      } else if (option === 'ram') {
        const copiedDetailValue = JSON.parse(JSON.stringify(ramDetailValue));
        copiedDetailValue[idx][id] = value;

        newState.ramDetailValue = copiedDetailValue;
      }
    }
    this.setState(newState);
  };

  detailGpuValueHandler = (idx, id, value, option) => {
    // detail slider 핸들러
    const { gpuDetailValue, gpuRamDetailValue } = this.state;
    const newState = {};
    if (value === 0 || value < 0) {
      value = 1;
    }
    if (option === 'gpu') {
      const copiedDetailValue = JSON.parse(JSON.stringify(gpuDetailValue));
      copiedDetailValue[idx][id] = value;

      newState.gpuDetailValue = copiedDetailValue;
    } else if (option === 'ram') {
      const copiedDetailValue = JSON.parse(JSON.stringify(gpuRamDetailValue));
      copiedDetailValue[idx][id] = value;

      newState.gpuRamDetailValue = copiedDetailValue;
    }

    this.setState(newState);
  };

  getSliderData = () => {
    const {
      cpuModelInfo,
      gpuModelInfo,
      detailSelectedOptions,
      gpuDetailSelectedOptions,
      gpuDetailValue,
      gpuRamDetailValue,
      gpuTotalValue,
      gpuRamTotalValue,
      gpuTotalSliderMove,
      cpuDetailValue,
      ramDetailValue,

      cpuSliderMove,
      cpuTotalValue,
      ramTotalValue,
    } = this.state;
    const node_name_cpu = {};
    const node_name_gpu = {};
    cpuModelInfo?.forEach((v, i) => {
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

    gpuModelInfo?.forEach((v, i) => {
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
        // detail과 같은 key로 total값 넣는다.
        cpu_cores_limit_per_gpu: gpuTotalValue,
        ram_limit_per_gpu: gpuRamTotalValue,
      },
    };

    Object.assign(node_name_gpu, gpuAllData);

    return { node_name_gpu, node_name_cpu };
  };

  checkboxHandler = ({ idx, status, cpuIdx, type }) => {
    const {
      cpuSelectedOptions,
      detailSelectedOptions,
      gpuSelectedOptions,
      gpuDetailSelectedOptions,
      gpuUsage,
    } = this.state;
    const isTrue = (el) => {
      if (el) return true;
    };

    if (type === 'cpu') {
      // * 기존 로직
      if (status === 'all') {
        //* 첫번째 전체 체크 클릭 시 idx 0

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

        this.setState({ cpuSelectedOptions: newSelectedOptions }, () => {
          this.submitBtnCheck();
        });

        const [allCheck2] = Object.values(currSelectedOptions);

        let [arrayLength] = Object.values(detailSelectedOptions[idx]);
        let newDetailValues = [];
        if (allCheck2) {
          //* 전체 선택 체크면
          newDetailValues = Array(arrayLength?.length).fill(true);
        } else {
          //* 전체 선택 해제면
          newDetailValues = Array(arrayLength?.length).fill(false);
        }
        //* 0이 들어오면
        const newDetailOptions = [];
        detailSelectedOptions.forEach((value, index) => {
          if (index === idx) {
            newDetailOptions.push({ [idx]: newDetailValues });
          } else {
            newDetailOptions.push(value);
          }
        });
        // setDetailSelectedOptions(newDetailOptions);
        this.setState({ detailSelectedOptions: newDetailOptions }, () => {
          this.submitBtnCheck();
        });
      } else if (status === 'detail') {
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
        this.setState(
          { detailSelectedOptions: newDetailSelectedValues },
          () => {
            this.submitBtnCheck();
          },
        );

        const [valueCheck] = detailArrayValues.filter(isTrue);

        if (valueCheck) {
          const newCpuSelectedOptions = [];
          cpuSelectedOptions.forEach((option, idx) => {
            if (idx === cpuIdx) {
              newCpuSelectedOptions.push({ [cpuIdx]: true });
            } else {
              newCpuSelectedOptions.push(option);
            }
          });

          this.setState({ cpuSelectedOptions: newCpuSelectedOptions }, () => {
            this.submitBtnCheck();
          });
        } else {
          const newCpuSelectedOptions = [];
          cpuSelectedOptions.forEach((option, idx) => {
            if (idx === cpuIdx) {
              newCpuSelectedOptions.push({ [cpuIdx]: false });
            } else {
              newCpuSelectedOptions.push(option);
            }
          });

          this.setState({ cpuSelectedOptions: newCpuSelectedOptions }, () => {
            this.submitBtnCheck();
          });
        }
      }
    } else if (type === 'gpu') {
      if (status === 'all') {
        const newState = {};
        //* 첫번째 전체 체크 클릭 시 idx 0
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

        if (gpuUsage !== 0) {
          newState.gpuUsageError = '';
        }

        newState.gpuSelectedOptions = newSelectedOptions;

        this.setState(newState, () => {
          this.submitBtnCheck();
        });

        const [allCheck2] = Object.values(currSelectedOptions);

        let [arrayLength] = Object.values(gpuDetailSelectedOptions[idx]);
        let newDetailValues = [];
        if (allCheck2) {
          //* 전체 선택 체크면
          newDetailValues = Array(arrayLength?.length).fill(true);
        } else {
          //* 전체 선택 해제면
          newDetailValues = Array(arrayLength?.length).fill(false);
        }
        //* 0이 들어오면

        const newDetailOptions = [];
        gpuDetailSelectedOptions.forEach((value, index) => {
          if (index === idx) {
            newDetailOptions.push({ [idx]: newDetailValues });
          } else {
            newDetailOptions.push(value);
          }
        });
        newState.gpuDetailSelectedOptions = newDetailOptions;

        if (gpuUsage !== 0) {
          newState.gpuUsageError = '';
        }
        this.setState(newState, () => {
          this.submitBtnCheck();
        });
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

        this.setState(
          { gpuDetailSelectedOptions: newDetailSelectedValues },
          () => {
            this.submitBtnCheck();
          },
        );

        const [valueCheck] = detailArrayValues.filter(isTrue);

        if (valueCheck) {
          const newGpuSelectedOptions = [];
          gpuSelectedOptions.forEach((option, idx) => {
            if (idx === cpuIdx) {
              newGpuSelectedOptions.push({ [cpuIdx]: true });
            } else {
              newGpuSelectedOptions.push(option);
            }
          });

          this.setState({ gpuSelectedOptions: newGpuSelectedOptions }, () => {
            this.submitBtnCheck();
          });
        } else {
          const newGpuSelectedOptions = [];
          gpuSelectedOptions.forEach((option, idx) => {
            if (idx === cpuIdx) {
              newGpuSelectedOptions.push({ [cpuIdx]: false });
            } else {
              newGpuSelectedOptions.push(option);
            }
          });

          this.setState({ gpuSelectedOptions: newGpuSelectedOptions }, () => {
            this.submitBtnCheck();
          });
        }
      }
    }
  };

  // Admin의 Training Options 가져오기
  getAdminTrainingInfo = async () => {
    const response = await callApi({
      url: 'options/trainings',
      method: 'get',
    });

    const { result, status, message, error } = response;
    if (status !== STATUS_SUCCESS) {
      errorToastMessage(error, message);
      return {};
    }

    const { workspace_list: workspaceListInfo } = result;
    return { workspaceListInfo };
  };

  // state 포맷에 맞게 데이터를 파싱
  parseStateData = ({
    builtInModelListInfo,
    builtInFilterListInfo,
    dockerImageListInfo,
    gpuStatusInfo,
    gpuModelStatusInfo,
    selectedListInfo = [],
    userListInfo,
  }) => {
    const resultState = {};
    if (builtInModelListInfo) {
      resultState.builtInModelOptions = builtInModelListInfo.map(
        ({
          id,
          created_by: createdBy,
          kind,
          name,
          docker_image_id: dockerImageId,
          description: desc,
          horovod_training_multi_gpu_mode: multiGpuModeHorovod,
          nonhorovod_training_multi_gpu_mode: multiGpuModeNonHorovod,
          enable_to_train_with_gpu: enableGpu, // 0 | 1
          enable_to_train_with_cpu: enableCpu, // 0 | 1
          run_docker_name: runDockerName,
          training_status: trainingStatus, // 0 | 1 | -1
          thumbnail_path: thumbnailImageInfo,
        }) => ({
          id,
          createdBy,
          kind,
          name,
          title: name,
          desc,
          disabled: (!enableGpu && !enableCpu) || trainingStatus !== 1,
          enableGpu,
          enableCpu,
          multiGpuMode: multiGpuModeHorovod || multiGpuModeNonHorovod,
          dockerImageId,
          runDockerName,
          thumbnailImageInfo,
        }),
      );
    }
    if (builtInFilterListInfo) {
      const builtInFilterOptions = builtInFilterListInfo.map(
        ({ kind, created_by: createdBy }) => {
          return {
            label: kind,
            value: kind,
            createdBy,
          };
        },
      );
      builtInFilterOptions.unshift({ label: 'all.label', value: 'all' });
      resultState.builtInFilterOptions = builtInFilterOptions;
    }
    if (dockerImageListInfo) {
      resultState.dockerImageOptions = dockerImageListInfo.map(
        ({ id, name }) => ({ label: name, value: id }),
      );
    }
    if (gpuStatusInfo) {
      resultState.maxGpuUsageCountForRandom = gpuStatusInfo.gpuFree;
      resultState.gpuTotalCountForRandom = gpuStatusInfo.gpuTotal;
      resultState.isGuranteedGpu = gpuStatusInfo.isGuranteedGpu;
    }
    if (gpuModelStatusInfo) {
      resultState.gpuModelListOptions = gpuModelStatusInfo.map((v) => ({
        ...v,
        selected: false,
        node_list: v.node_list.map((n) => ({
          ...n,
          selected: false,
        })),
      }));
    }
    if (userListInfo) {
      const userName = sessionStorage.getItem('user_name');
      resultState.ownerOptions = userListInfo.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
      resultState.userList = userListInfo
        .filter(({ id, name }) => {
          let isSelected = false;
          for (let i = 0; i < selectedListInfo.length; i += 1) {
            if (id === selectedListInfo[i].value) {
              isSelected = true;
              break;
            }
          }
          return !(name === userName || isSelected);
        })
        .map(({ id, name }) => ({ label: name, value: id }));
    }

    return resultState;
  };

  // 프로젝트 생성/수정
  onSubmit = async (callback) => {
    const { type, t } = this.props;
    const url = 'trainings';
    let method = 'POST';
    const {
      trainingName,
      trainingType,
      workspace,
      gpuUsage,
      dockerImage,
      accessType,
      owner,
      tmpSelectedList: selectedList,
      trainingId,
      trainingDesc: description,
      builtInModel,
      dockerImageOptions,
      gpuModelType,
      cpuModelList,
      modelType,
    } = this.state;

    let body = {
      training_name: trainingName,
      training_type: trainingType,
      workspace_id: workspace.value,
      owner_id: owner.value,
      access: accessType,
      description,
      gpu_count: 1,
    };

    if (trainingType !== 'federated-learning') {
      const gpuModelNodeListJson = {};
      if (gpuModelType === 1) {
        cpuModelList.map((v) => {
          if (v.length > 0) {
            v.map(({ name, model }, idx) => {
              if (idx === 0) {
                gpuModelNodeListJson[model] = [name];
              } else {
                gpuModelNodeListJson[model].push(name);
              }
              return gpuModelNodeListJson[model];
            });
          }
          return gpuModelNodeListJson;
        });
      }

      const { node_name_gpu, node_name_cpu } = this.getSliderData();
      body = {
        ...body,
        node_name_gpu,
        node_name_cpu,
        gpu_model: gpuModelType === 1 ? gpuModelNodeListJson : null,
        gpu_count: modelType === 1 ? 0 : parseInt(gpuUsage, 10),
      };
    }

    if (type === 'EDIT_TRAINING') {
      method = 'PUT';
      body.training_id = trainingId;
    }

    // accessType이 private 일 때 users_id 추가
    if (accessType === 0) {
      body.users_id = selectedList.map(({ value }) => value);
    }

    if (trainingType === 'built-in') {
      let dockerImageId;
      for (let i = 0; i < dockerImageOptions.length; i += 1) {
        const { label: dockerName, value } = dockerImageOptions[i];
        if (
          builtInModel.runDockerName === null &&
          dockerName === 'jf-default'
        ) {
          dockerImageId = value;
          break;
        } else if (
          builtInModel.runDockerName !== null &&
          dockerName === builtInModel.runDockerName
        ) {
          dockerImageId = value;
          break;
        }
      }
      body.built_in_model_id = builtInModel.id;
      body.docker_image_id = dockerImageId;
    } else if (trainingType === 'advanced') {
      body.docker_image_id = dockerImage.value;
    }
    if (trainingType !== 'federated-learning' && !body.docker_image_id) {
      toast.error(t('noDockerImage.error.message'));
      return false;
    }
    const response = await callApi({ url, method, body });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      if (callback) callback();
      if (type === 'CREATE_TRAINING') {
        defaultSuccessToastMessage('create');
      } else {
        defaultSuccessToastMessage('update');
      }
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

  // 라디오 버튼 이벤트 핸들러 (Training Type)
  radioBtnHandler = (name, value) => {
    const { modelType, gpuUsage, builtInModel } = this.state;
    const newState = {};
    if (!builtInModel) {
      newState.resourceTypeReadOnly = false;
    }
    if (name === 'trainingType') {
      newState[name] = value;
      newState.builtInFilter = null;
      newState.builtInModel = null;

      newState.minGpuUsage = 0;
      newState.maxGpuUsage = 10000;
    } else if (name === 'gpuModelType') {
      newState[name] = parseInt(value, 10);
      const { gpuModelList, isMigModel } = this.state;

      // * isMigModel

      if (
        (!gpuModelList || gpuModelList.length === 0) &&
        parseInt(value) === 1
      ) {
        newState.gpuUsageError = null;
      } else if (isMigModel) {
        newState.gpuUsage = 1;
        newState.gpuUsageError = '';
      }

      if (
        modelType === 0 &&
        parseInt(value) === 0 &&
        gpuUsage !== 0 &&
        gpuUsage !== ''
      ) {
        newState.gpuUsageError = '';
      }
    } else if (name === 'cpuModelType') {
      newState[name] = parseInt(value, 10);
    } else {
      newState[name] = name === 'accessType' ? parseInt(value, 10) : value;
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  modelRadioBtnHandler = (name) => {
    const { gpuUsage } = this.state;
    const newState = {};

    if (name === 1) {
      newState.gpuUsageError = '';
      newState.modelType = 1;
    } else if (name === 0) {
      newState.modelType = 0;
      if (gpuUsage === '' || gpuUsage === null || gpuUsage === 0) {
        newState.gpuUsageError = null;
      }
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 텍스트 인풋 이벤트 핸들러 (Training Name)
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
    } else if (name === 'trainingDesc' && value.trim() === '') {
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

  sliderCheckHandler = (type) => {
    const { gpuSelectedOptions, cpuSelectedOptions } = this.state;
    if (!type) {
      // 0 gpu
      let check = 0;
      gpuSelectedOptions.forEach((v) => {
        Object.values(v).forEach((boolean) => {
          if (boolean) {
            check++;
          }
        });
      });
      return check;
    } else if (type) {
      // 1 cpu
    }
  };

  // 셀렉트 박스 이벤트 핸들러 (Workspace)
  selectInputHandler = async (name, value) => {
    let newState = {
      [name]: value,
    };
    if (name === 'workspace') {
      // 유저 목록 설정
      const { workspace } = this.state;
      const { value: newWorkspace } = value;
      if (workspace && workspace.value === newWorkspace) return;
      // Training Info 업데이트
      const trainingInfoData = await this.getTrainingInfo(newWorkspace);
      const trainingInfoState = this.parseStateData(trainingInfoData);

      const cpuData = trainingInfoData?.cpuModelStatusInfo;
      const gpuData = trainingInfoData?.gpuModelStatusInfo;

      newState = {
        ...newState,
        ...trainingInfoState,
        ...this.gpuGetHandler(gpuData),
        ...this.cpuGetHandler(cpuData),
        thumbnailList: trainingInfoData?.thumbnailList,
        cpuModelInfo: cpuData,
      };

      // 선택된 옵션 초기화
      newState.builtInModel = null;
      newState.owner = null;
      newState.dockerImage = null;
      newState.gpuUsage = '';
      newState.gpuUsageError = null;
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

  // 모델 선택 이벤트 핸들러
  selectBuiltInModelHandler = (builtInModel) => {
    let newState = { builtInModel };
    if (builtInModel.enableGpu === 0) {
      // GPU 사용이 안될때 gpuUsage 값을 0으로
      newState.gpuUsage = 0;
      newState.gpuUsageError = '';
      newState.minGpuUsage = 0;
      newState.resourceTypeReadOnly = true;
      if (builtInModel.enableCpu) {
        newState.modelType = 1;
      }

      newState.maxGpuUsage = 0;
    } else if (builtInModel.enableCpu === 0) {
      // CPU 사용이 안될때 gpuUsage 값을 1 이상으로
      newState.resourceTypeReadOnly = true;
      newState.gpuUsage = 1;
      newState.gpuUsageError = '';
      newState.minGpuUsage = 0;
      newState.maxGpuUsage = 10000;
      if (builtInModel.enableGpu) {
        newState.modelType = 0;
      }
      newState.modelType = 0;
    } else {
      newState.modelType = 0;
      newState.resourceTypeReadOnly = false;
      newState.gpuUsage = '';
      newState.minGpuUsage = 0;
      newState.maxGpuUsage = 10000;
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
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
      } else if (gpuUsage !== 0) {
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
    if (name === 'trainingName') {
      // const regType1 = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      const forbiddenChars = /[\\<>:*?"'|:;`{}^$ &[\]!]/;

      const regType = !forbiddenChars.test(value);
      if (value === '') {
        return 'trainingName.empty.message';
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
      }
    } else if (name === 'selectedList') {
      if (value.length === 0) {
        return 'userSelectedList.empty.message';
      }
    }
    return null;
  };

  submitBtnCheck = (toggleChange) => {
    // submit 버튼 활성/비활성
    const { type } = this.props;

    const { state } = this;
    const {
      trainingNameError,
      dockerImage,
      owner,
      trainingType,
      builtInModel,
      modelType,
      cpuModelType,
      cpuSelectedOptions,
      gpuUsage,
      gpuModelType,
    } = state;
    const validateState = { validate: false };
    const stateKeys = Object.keys(state);

    let validateCount = 0;

    if (trainingType === 'federated-learning') {
      if (trainingNameError === '') {
        this.setState({ validate: true });
      }
    } else {
      if (type === 'CREATE_TRAINING' && gpuUsage === 0 && modelType === 0) {
        validateCount++;
      }

      for (let i = 0; i < stateKeys.length; i += 1) {
        const key = stateKeys[i];
        if (
          key.indexOf('Error') !== -1 &&
          state[key] !== '' &&
          key !== 'trainingDescError'
        ) {
          validateCount += 1;
        }
      }
      if (!owner) {
        validateCount += 1;
      }
      if (type === 'EDIT_TRAINING') {
        if (toggleChange !== 'toggle' && validateCount === 0) {
          validateState.validate = true;
          this.setState(validateState);
        }
      }

      if (modelType === 0) {
        if (builtInModel?.enableGpu && (gpuUsage === '' || gpuUsage === 0)) {
          validateCount++;
        }
        if (gpuModelType === 1) {
          const check = this.sliderCheckHandler(0);
          if (check < 1) {
            validateCount += 1;
          } else {
            if (gpuUsage === '' || gpuUsage === 0) {
              validateCount += 1;
            }
          }
        }
      }
      if (type === 'CREATE_TRAINING') {
        if (!builtInModel && trainingType === 'built-in') {
          validateCount += 1;
        }
        if (!dockerImage && trainingType === 'advanced') {
          validateCount += 1;
        }

        if (modelType === 1 && cpuModelType === 1) {
          let validateCountPlus = 1;
          cpuSelectedOptions.forEach((v) =>
            Object.values(v).forEach((selected) => {
              if (selected) {
                validateCountPlus = 0;
              }
            }),
          );
          validateCount = validateCount + validateCountPlus;
        }
        if (validateCount === 0) {
          validateState.validate = true;
        }
        this.setState(validateState);
      }
    }
  };

  onBuiltInModelSearch = (e) => {
    let searchValue = e.target.value;
    searchValue = searchValue.toLowerCase();
    let modelOption = this.state.builtInModelOptions;

    modelOption.forEach((item) => {
      if (item.name) {
        const dis_name = Hangul.make(item.name, true);
        Object.assign(item, { dis_name });
      }
      if (item.desc) {
        const dis_desc = Hangul.make(item.desc, true);
        Object.assign(item, { dis_desc });
      }
    });

    const result = modelOption.filter((item) => {
      const { name, desc, dis_name, dis_desc } = item;
      return (
        name?.toLowerCase().includes(searchValue) ||
        desc?.toLowerCase().includes(searchValue) ||
        dis_name?.toLowerCase().includes(searchValue) ||
        dis_desc?.toLowerCase().includes(searchValue)
      );
    });
    this.setState({ builtInModelSearchResult: result });
  };

  /** ================================================================================
   * Event Handler END
   ================================================================================ */

  render() {
    const {
      state,
      props,
      radioBtnHandler,
      textInputHandler,
      numberInputHandler,
      selectInputHandler,
      multiSelectHandler,
      selectBuiltInModelHandler,
      selectGpuModelHandler,
      onBuiltInModelSearch,
      onSubmit,
      modelRadioBtnHandler,
      checkboxHandler,
      detailCpuValueHandler,
      detailGpuValueHandler,
      totalValueHandler,
      totalSliderHandler,
      sliderSwitchHandler,
    } = this;
    return (
      <TrainingFormModal
        {...state}
        {...props}
        textInputHandler={textInputHandler}
        numberInputHandler={numberInputHandler}
        radioBtnHandler={radioBtnHandler}
        selectInputHandler={selectInputHandler}
        multiSelectHandler={multiSelectHandler}
        selectBuiltInModelHandler={selectBuiltInModelHandler}
        selectGpuModelHandler={selectGpuModelHandler}
        onBuiltInModelSearch={onBuiltInModelSearch}
        onSubmit={onSubmit}
        modelRadioBtnHandler={modelRadioBtnHandler}
        // * ---- slider props
        checkboxHandler={checkboxHandler}
        detailCpuValueHandler={detailCpuValueHandler}
        detailGpuValueHandler={detailGpuValueHandler}
        totalValueHandler={totalValueHandler}
        totalSliderHandler={totalSliderHandler}
        sliderSwitchHandler={sliderSwitchHandler}
      />
    );
  }
}

export default withTranslation()(TrainingFormModalContainer);

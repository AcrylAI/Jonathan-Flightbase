import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';

// i18n
import { withTranslation } from 'react-i18next';

// Action
import { closeModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';

// Components
import JobCreateFormModal from '@src/components/Modal/JobCreateFormModal';
import OptionLabel from '@src/components/atoms/OptionLabel';

// utils
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

class JobCreateFormModalContainer extends PureComponent {
  constructor(props) {
    super(props);
    const { t } = this.props;

    this._MODE = import.meta.env.VITE_REACT_APP_MODE;
    this.state = {
      userId: '', // 유저 id 값
      validate: false, // Create 버튼 활성/비활성 여부 상태 값
      builtInModelName: '', // built in model 이름 값
      builtName: '',
      trainingType: '', // training type 값
      name: '', // job or HPS name
      nameError: null, // 이름 유효성 검증 텍스트
      dataset: null, // dataset 이름 값
      datasetRootCategory: '-', // dataset root category 값
      datasetError: null, // dataset 이름 유효성 검증 텍스트
      datasetOptions: [{ label: t('noSelectDataset.label'), value: '/' }],
      dataTrainingForm: [], // model dataset type
      datasetCategoryList: [],
      runcodeOptions: [],
      runcodeName: null,
      runcodeNameError: null,
      hpsResultOptions: [
        { label: 'load.label', value: 0 },
        { label: 'new.label', value: 1 },
      ],
      hpsResult: 0,
      loadFile: null,
      loadFileOptions: [],
      saveFile: '',
      // saveFileError: null,
      searchMethod: null,
      searchMethodOptions: [],
      initPoint: '3',
      searchCount: '',
      interval: '',
      hpsParameter: [],
      hpsParameterError: null,
      defaultHpsParameter: null,
      staticParameterInfo: {},
      imageOptions: [],
      selectedImage: null,
      parameterValues: [],
      defaultParameter: null,
      parameterError: '',
      additionalFeatures: [],
      newDatasetList: [],
      modelInfo: [],
      //*
      retrainingOption: {},
      checkpointList: [],
      checkpoint: null,
      //* deploymentType
      trainingToolTab: 0,
      jobDetailOpenList: [],
      hpsDetailOpenList: [],
      selectedTool: null,
      hpsLogTable: [],
      selectedHpsScore: '',
      selectedToolType: null,
      toolSearchValue: '',
      toolSelectedOwner: {
        label: 'all.label',
        value: 'toolAll',
      },
      selectedHpsId: '',
      selectedLogId: '',
      toolModelSearchValue: '',
      hpsModelSelectValue: '',
      hpsModelList: [],
      jobModelList: [],
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
    };
  }

  paramTypeOptions = [
    {
      label: this.props.t('staticValue.label'),
      value: 0,
      labelStyle: { marginRight: '20px' },
    },
    {
      label: this.props.t('searchRange.label'),
      value: 1,
      labelStyle: { marginRight: '20px' },
    },
  ];

  async componentDidMount() {
    const { data: modalData, groupId, builtName } = this.props.data;
    this.setState(
      {
        data: modalData,
        builtName,
      },
      async () => {
        await this.getJobInfo(groupId);
      },
    );

    const newState = {};
    const jobDetailLength = [];
    const hpsDetailLength = [];

    const response = await callApi({
      url: `options/deployments/templates/usertrained?training_id=${modalData?.tid}`,
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
  }

  /** ================================================================================
   * API START
   ================================================================================ */

  // Job 생성을 위한 옵션 조회
  getJobInfo = async (hpsGroupId) => {
    const { type: modalType } = this.props;
    const { data } = this.state;
    let url = `options/jobs?training_id=${data.tid}`;
    if (modalType === 'CREATE_HPS_GROUP' || modalType === 'ADD_HPS')
      url = `options/hyperparamsearchs?training_id=${data.tid}${
        hpsGroupId ? `&hps_group_id=${hpsGroupId}` : ''
      }`;
    const response = await callApi({
      url,
      method: 'GET',
    });
    const { status, result, message, error } = response;

    const newModelInfo = result?.model_info;
    this.setState({ modelInfo: newModelInfo });

    if (status !== STATUS_SUCCESS) {
      errorToastMessage(error, message);
      return;
    }

    this.setState({ newDatasetList: result.dataset_list });

    let hpsGroupData = {};
    if (modalType === 'ADD_HPS')
      hpsGroupData = await this.getHPSInfo(hpsGroupId);
    const {
      retraining_option: retrainingOptions,
      dataset_list: datasetList,
      image_list: imageList,
      run_code_list: runCodeList,
      built_in_model_name: builtInModelName,
      training_type: trainingType,
      parameters_info: defaultParameter,
      gpu_options: gpuOptions = {},
      default_image: defaultImage,
      model_info: modelInfo,
      load_file_list: loadFileList,
      method_list: methodList = [],
    } = result;
    // Docker image 설정

    const imageOptions = imageList.map(({ name, id }) => ({
      label: name,
      value: id,
    }));
    const selectedImage = {
      label: defaultImage.name ? defaultImage.name : 'jf-default',
      value: defaultImage.id ? defaultImage.id : 'default',
    };
    // jf-default가 imageList에 있으면, value를 해당 value값으로 대체합니다.
    if (!defaultImage.id) {
      for (let i = 0; i < imageOptions.length; i += 1) {
        if (imageOptions[i].label === 'jf-default') {
          selectedImage.value = imageOptions[i].value;
          break;
        }
      }
    }

    //*체크포인트 리스트 변경
    const checkpoints = retrainingOptions?.checkpoint_list;
    const checkpointOption = [];
    checkpoints?.forEach((list) => {
      checkpointOption.push({
        label: list.item_name + '/' + list.group_index,
        value: list.item_id,
      });
    });

    // 실행 코드 설정
    let runcodeName = null;
    const runcodeOptions = runCodeList.map((runCode) => {
      if (runCode === 'built_in_run_code') {
        runcodeName = { label: runCode, value: runCode };
      }
      if (runCode.indexOf('====') !== -1) {
        return { label: runCode, value: runCode, isDisable: true };
      }
      return { label: runCode, value: runCode };
    });
    if (hpsGroupData.runCodeName) runcodeName = hpsGroupData.runCodeName;

    // 데이터셋 설정
    const { data_training_form: dataTrainingForm = [] } = modelInfo;
    const { dataset: prevDataset } = hpsGroupData;
    //const defaultDataset = prevDataset || { label: 'None', value: '/' }; // if there is dataset list, first element in the list is used for default value.
    let defaultDataset = null;
    const { t } = this.props;
    const datasetOptions = datasetList.map(
      ({
        name,
        id,
        type,
        file_list: fileList,
        dir_list: dirList,
        generable,
        unsatisfied,
      }) => {
        const newOptionObj = {
          label: name,
          value: id,
          fileList,
          dirList,
          generable,
          unsatisfied,
          StatusIcon: () => (
            <>
              <OptionLabel align={'RIGHT'}>
                {type === '1' ? 'RW' : 'RO'}
              </OptionLabel>
              {!generable && (
                <OptionLabel
                  align={'RIGHT'}
                  borderColor={'#ff2211'}
                  textColor={'#ff2211'}
                  width={
                    t('inadequate.label').length > 3 &&
                    t('inadequate.label').length * 6
                  }
                >
                  {t('inadequate.label')}
                </OptionLabel>
              )}
            </>
          ),
        };

        if (prevDataset && id === prevDataset.value)
          defaultDataset = newOptionObj;
        return newOptionObj;
      },
    );
    let datasetRootCategory = dataTrainingForm.filter(
      ({ name }) => name === '/',
    )[0];
    datasetRootCategory = datasetRootCategory
      ? datasetRootCategory.category
      : '-';
    const {
      datasetOptions: prevDatasetOptions,
      runcodeOptions: prevRunCodeOptions,
      imageOptions: prevImageOptions,
    } = this.state;

    const additionalFeatures = [
      {
        name: 'gpu_acceleration',
        label: 'gpuAcceleration.label',
        subtext: ['gpuAcceleration.message'],
        value: 1,
        checked: false,
        readOnly: !gpuOptions.gpu_acceleration,
        disabled: !gpuOptions.gpu_acceleration,
      },
      {
        name: 'unified_memory',
        label: 'unifiedMemory.label',
        subtext: ['unifiedMemory.message'],
        value: 1,
        checked: false,
        readOnly: !gpuOptions.unified_memory,
        disabled: !gpuOptions.unified_memory,
      },
      {
        name: 'rdma',
        label: 'rdmaViaInfiniBand.label',
        subtext: ['rdmaViaInfiniBand.message'],
        value: 1,
        checked: false,
        readOnly: !gpuOptions.rdma,
        disabled: !gpuOptions.rdma,
      },
    ];

    // Load file, Save file 설정
    let loadFileOptions = [];
    let loadFile = null;
    let saveFile = '';
    let initPoint = '3';
    if (loadFileList) {
      loadFileOptions = [
        { label: 'None', value: null },
        ...loadFileList.map((v) => ({ label: v, value: v })),
      ];
    }
    if (hpsGroupData.prevSaveFile) {
      const { prevSaveFile } = hpsGroupData;
      loadFile = { label: prevSaveFile, value: prevSaveFile };
      [saveFile] = prevSaveFile.split('.');
      initPoint = '0';
    }

    // Seach method 설정
    let searchMethod = null;
    if (methodList && methodList.length > 0) {
      const [searchMethodItem] = methodList;
      searchMethod = hpsGroupData.defaultSearchMethod || searchMethodItem.value;
      if (hpsGroupData.numOfSearchParam > 1) methodList[2].disabled = true;
    }

    // HPS parameter
    const { hpsParameter, defaultHpsParameter } =
      this.getHyperParameterDataForm({
        modalType,
        trainingType,
        defaultParameter,
        staticParameterInfo: hpsGroupData.parameterInfo,
        searchMethod: hpsGroupData.defaultSearchMethod,
      });

    this.setState(
      {
        selectedImage, // temporary code
        imageOptions: [...prevImageOptions, ...imageOptions],
        runcodeOptions: [...prevRunCodeOptions, ...runcodeOptions],
        datasetOptions:
          trainingType === 'built-in'
            ? [...datasetOptions]
            : [...prevDatasetOptions, ...datasetOptions],
        dataset: trainingType === 'built-in' ? null : defaultDataset,
        datasetError:
          trainingType === 'advanced' || trainingType === 'basic' ? '' : null,
        builtInModelName,
        dataTrainingForm,
        datasetRootCategory,
        trainingType,
        runcodeName,
        additionalFeatures,
        parameterValues:
          trainingType === 'built-in' ? [defaultParameter] : [{ val: '' }],
        defaultParameter,
        loadFileOptions,
        loadFile,
        saveFile,
        initPoint,
        searchMethodOptions: methodList,
        searchMethod,
        hpsParameter,
        defaultHpsParameter,
        staticParameterInfo: hpsGroupData.parameterInfo,
        validate: modalType === 'ADD_HPS',
        //*
        checkpointList: checkpointOption,
        retrainingOption: retrainingOptions,
      },
      () => {
        if (modalType === 'ADD_HPS' && trainingType === 'built-in')
          this.searchSelectHandler(
            defaultDataset,
            'dataset',
            hpsGroupData.defaultCategoryData,
          );
      },
    );
  };

  getHPSInfo = async (groupId) => {
    const url = `trainings/hyperparam_search/${groupId}`;
    const response = await callApi({
      url,
      method: 'GET',
    });
    const { status, result, message, error } = response;

    if (status !== STATUS_SUCCESS) {
      errorToastMessage(error, message);
      return {};
    }
    return this.parseHPSGroupData(result);
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

  toolSelectHandler = ({
    type,
    name,
    jobId,
    jobIdx,
    hpsIdx,
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
      newState.jobName = name;
      newState.jobIdx = jobIdx;
    } else {
      newState.selectedHpsId = hpsLogTable?.max_item?.hps_id;
      newState.selectedHpsScore = hpsLogTable?.max_item?.target;
      newState.selectedLogId = hpsLogTable?.max_item?.id;
      newState.hpsLogTable = hpsLogTable;
      newState.selectedToolType = 'hps';
      newState.hpsModelSelectValue = '';
      newState.hpsModelList = hpsCheckpoint;
      newState.originHpsModelList = hpsCheckpoint;
      newState.hpsName = name;
      newState.hpsIdx = hpsIdx;
    }
    newState.selectedTool = `${type} / ${name} / ${type}${detailNumber}`;

    this.trainingTypeArrowCustomHandler('tool', false);
    this.setState(newState, () => this.submitBtnCheck());
  };

  // tool sort
  toolSortHandler = ({ e = { target: { value: '' } }, type, selectedItem }) => {
    //new
    const userName = sessionStorage.getItem('user_name');
    const {
      originJobList = [],
      originHpsList = [],
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
          if (userName === v.hps_runner_name) {
            ownerSortedData.push(v);
          }
        });
        newState.hpsList = ownerSortedData;
      } else if (toolType === 'job') {
        filteredData.forEach((v) => {
          if (userName === v.job_runner_name) {
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

  logClickHandler = ({ id, target, checkpointList }) => {
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

  // tool - 모델 선택 핸들러
  toolModelSelectHandler = (model, type) => {
    const newState = {};
    if (type === 'hps') {
      newState.hpsModelSelectValue = model;
      this.trainingTypeArrowHandler('hpsModel');
    } else if (type === 'job') {
      newState.jobModelSelectValue = model;
      this.trainingTypeArrowHandler('jobModel');
    }
    this.setState(newState, () => this.submitBtnCheck());
  };

  trainingTypeArrowHandler = (type) => {
    const { trainingTypeArrow } = this.state;
    let newArrow = {
      ...trainingTypeArrow,
      [type]: !trainingTypeArrow[type],
    };

    this.setState({ trainingTypeArrow: newArrow });
  };
  trainingTypeArrowCustomHandler = (type, bool) => {
    const { trainingTypeArrow } = this.state;
    let newArrow = {
      ...trainingTypeArrow,
      [type]: bool,
    };

    this.setState({ trainingTypeArrow: newArrow });
  };

  /** ================================================================================
   * API END
   ================================================================================ */

  /** ================================================================================
   * Event Handler START
   ================================================================================ */

  textInputHandler = (e) => {
    const { name, value } = e.target;
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

  // 파라미터 텍스트 인풋 이벤트 핸들러
  paramInputHandler = (e, pIdx) => {
    const { name, value: v } = e.target;
    if (v === undefined) return;

    let tmpV = Math.floor(Number(v));
    if (name === 'searchCount') {
      tmpV = v === '' ? v : Math.floor(Number(v));
    } else if (name === 'interval') {
      tmpV = Number(v);
    } else {
      tmpV = v;
    }

    const value = name === 'searchCount' ? `${tmpV < 1 ? '' : tmpV}` : v;
    const newState = {
      [name]: value,
      [`${name}Error`]: null,
    };

    // Search method가 Grid일 때 interval이나 search count값을 변경할 때
    // interval 값 : (max - min) / search count
    // search count 값 : (max - min) / interval
    const { searchMethod } = this.state;
    if (searchMethod === 2 && (name === 'searchCount' || name === 'interval')) {
      const { hpsParameter, searchCount, interval } = this.state;
      const [, , minData, maxData] = hpsParameter[pIdx].paramList;
      const { value: min } = minData;
      const { value: max } = maxData;
      if (name === 'searchCount') {
        const currentValue = {
          min,
          max,
          searchCount: value,
          interval,
        };
        const newIntervalValue = this.getGridInputValue(
          'searchCount',
          currentValue,
        );
        newState.interval = newIntervalValue;
      } else if (name === 'interval') {
        const currentValue = {
          min,
          max,
          searchCount,
          interval: value,
        };
        const newSearchCountValue = this.getGridInputValue(
          'interval',
          currentValue,
        );
        newState.searchCount = newSearchCountValue;
      }
    }

    const validate = this.validate(name, value);
    if (validate) {
      newState[`${name}Error`] = validate;
    } else {
      newState[`${name}Error`] = '';
    }
    this.setState(newState, () => {
      if (
        name === 'initPoint' ||
        name === 'searchCount' ||
        name === 'interval'
      ) {
        const newState2 = {};
        const { hpsParameter } = this.state;
        const hpsValidate = this.validate('hpsParameter', hpsParameter);
        if (hpsValidate) {
          newState2.hpsParameterError = hpsValidate;
        } else {
          newState2.hpsParameterError = '';
        }
        this.setState(newState2, () => {
          this.submitBtnCheck();
        });
      } else {
        this.submitBtnCheck();
      }
    });
  };

  // submit 버튼 활성/비활성 함수
  submitBtnCheck = () => {
    // submit 버튼 활성/비활성
    const { state } = this;
    const { type: modalType } = this.props;
    const stateKeys = Object.keys(state);
    const { hpsParameter } = state;
    let validateCount = 0;

    for (let i = 0; i < stateKeys.length; i += 1) {
      const key = stateKeys[i];
      if (key?.indexOf('Error') !== -1) {
        if (
          state[key] !== '' &&
          key !== 'runcodeNameError' &&
          key !== 'hpsParameterError'
        ) {
          validateCount += 1;
        }
        if (
          modalType === 'CREATE_HPS_GROUP' &&
          state[key] !== '' &&
          key === 'hpsParameterError'
        ) {
          validateCount += 1;
        }
      }
    }

    //  // 데이터셋 카테고리
    //   if (trainingType === 'built-in') {
    //     if (datasetCategoryList.length === 0) {
    //       validateCount += 1;
    //     }
    //     for (let i = 0; i < datasetCategoryList.length; i += 1) {
    //       const { name, selected } = datasetCategoryList[i];
    //       if (name !== '/' && !selected) validateCount += 1;
    //     }
    //   }

    // HPS 생성 모달일 때
    if (modalType === 'CREATE_HPS_GROUP') {
      if (this.hpsParameterValidate(hpsParameter)) validateCount += 1;
    }

    if (!state.selectedImage) {
      validateCount += 1;
    }

    if (!state.runcodeName) {
      validateCount += 1;
    }
    const validateState = { validate: false };
    if (validateCount === 0) {
      validateState.validate = true;
    }

    this.setState(validateState);
  };

  // submit 버튼 클릭 이벤트
  onSubmit = async (callback, parserList) => {
    const { type } = this.props;
    const {
      name: jobNames,
      dataset,
      runcodeName,
      data,
      selectedImage,
      parameterValues,
      additionalFeatures,
      trainingType,
      datasetCategoryList,
    } = this.state;
    const jobs = [];

    const jobCheckpointBodys = {};
    for (let i = 0; i < parameterValues.length; i += 1) {
      let parameter = '';
      if (trainingType === 'built-in') {
        parameter = JSON.parse(JSON.stringify(parserList));

        const ObjKeyArr = Object.keys(parameterValues[i]);

        // [batch_size, data, dropuput_rate ....];
        for (let j = 0; j < ObjKeyArr.length; j += 1) {
          const keyItem = ObjKeyArr[j];
          parameter[keyItem] = parameterValues[i][keyItem].default_value;
        }

        for (let j = 0; j < datasetCategoryList.length; j += 1) {
          const { argparse, selected, name } = datasetCategoryList[j];
          // eslint-disable-next-line no-continue
          if (!selected && name !== '/') continue;
          if (name === '/') {
            parameter[argparse] = '/user_dataset/';
          } else {
            parameter[argparse] = `/user_dataset/${selected.name}`;
          }
        }
      } else {
        const { val } = parameterValues[i];
        parameter = val;
      }

      const param = {
        training_id: parseInt(data?.tid, 10),
        job_name: jobNames,
        docker_image_id: selectedImage?.value,
        dataset_id: dataset?.value,
        run_code: runcodeName?.value,
        parameter,
      };
      // 참고용 코드
      for (let j = 0; j < additionalFeatures.length; j += 1) {
        const { name, checked, value } = additionalFeatures[j];
        param[name] = checked ? value : 0;
      }
      jobs.push(param);
    }

    const body = {
      jobs,
      ...jobCheckpointBodys,
    };

    const response = await callApi({
      url: 'trainings/run_job',
      method: 'POST',
      body,
    });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      this.props.closeModal(type);
      if (callback) callback();
      defaultSuccessToastMessage('create');
      return true;
    }
    errorToastMessage(error, message);
    return false;
  };

  onCreateHps = async (parserList) => {
    const {
      name: hpsName,
      runcodeName,
      data,
      selectedImage,
      dataset,
      additionalFeatures,
      datasetCategoryList,
      hpsParameter,
      loadFile,
      searchCount,
      initPoint,
      searchMethod,
      interval,
      trainingType,
    } = this.state;

    const body = {
      hps_name: hpsName,
      training_id: parseInt(data.tid, 10),
      docker_image_id: selectedImage.value,
      dataset_id: dataset.value,
      run_code: runcodeName.value,
    };

    const hpsOption = {};

    // GPU 가속, 통합 메모리, 인피니밴드를 통한 RDMA 옵션
    for (let j = 0; j < additionalFeatures.length; j += 1) {
      const { name, checked, value } = additionalFeatures[j];
      hpsOption[name] = checked ? value : 0;
    }

    let trainingParams = {};
    const searchParams = {};
    // dataset param
    for (let j = 0; j < datasetCategoryList.length; j += 1) {
      const { argparse, selected, name } = datasetCategoryList[j];
      // eslint-disable-next-line no-continue

      if (!selected && name !== '/') continue;
      if (name === '/') {
        trainingParams[argparse] = '/user_dataset/';
      } else {
        trainingParams[argparse] = `/user_dataset/${selected.name}`;
      }
    }

    // Baysian Optimization - static param
    const intParams = [];
    for (let i = 0; i < hpsParameter.length; i += 1) {
      const { paramType, paramList, isInt } = hpsParameter[i];
      const [paramNameData, staticValueData, minData, maxData] = paramList;
      // static value
      if (paramType === 0) {
        trainingParams[paramNameData.value] = staticValueData.value;
      } else if (paramType === 1) {
        if (isInt) intParams.push(paramList[0].value);
        searchParams[
          paramNameData.value
        ] = `(${minData.value},${maxData.value})`;
        // searchParams[paramNameData.value] = `(${isInt ? (minData.value) : (`${minData.value}${intCheck(Number(minData.value)) ? '.0' : ''}`)},${isInt ? (maxData.value) : (`${maxData.value}${intCheck(Number(maxData.value)) ? '.0' : ''}`)})`;
      }
    }

    hpsOption.int_params = intParams.join(',');

    hpsOption.search_count = searchCount;
    if (searchMethod === 0) hpsOption.init_points = initPoint;
    if (searchMethod === 2) hpsOption.search_interval = interval;
    if (trainingType === 'built-in' && parserList) {
      trainingParams = { ...trainingParams, ...parserList };
    }
    hpsOption.training_params = trainingParams;
    hpsOption.search_params = searchParams;

    // save load 파일
    hpsOption.save_file_name = hpsName;
    if (loadFile) hpsOption.load_file_name = loadFile.value;

    // Search Method
    hpsOption.method = searchMethod;

    body.hps_option = hpsOption;
    const { type: modalType, data: modalData } = this.props;
    const { groupId } = modalData;
    if (groupId) body.hps_group_id = groupId;
    const response = await callApi({
      url:
        modalType === 'CREATE_HPS_GROUP'
          ? 'trainings/hyperparam_search'
          : 'trainings/hyperparam_search_add',
      method: 'POST',
      body,
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      defaultSuccessToastMessage('create');
      return true;
    }
    errorToastMessage(error, message);
    return false;
  };

  // 파라미터 인풋 추가 이벤트 핸들러
  onAdd = () => {
    const { trainingType, defaultParameter } = this.state;
    const parameterValues = [...this.state.parameterValues];
    if (parameterValues.length > 9) return;
    parameterValues.push(
      trainingType === 'built-in' ? { ...defaultParameter } : { val: '' },
    );
    const parameterError = '';
    this.setState(
      {
        parameterValues,
        parameterError,
      },
      () => {
        this.submitBtnCheck();
      },
    );
  };

  // 파라미터 인풋 삭제 이벤트 핸들러
  onRemove = (idx) => {
    let parameterValues = [...this.state.parameterValues];
    parameterValues = [
      ...parameterValues.slice(0, idx),
      ...parameterValues.slice(idx + 1, parameterValues.length),
    ];
    const validate = this.validate('parameters', parameterValues);
    let parameterError = '';
    if (validate) {
      parameterError = validate;
    }
    this.setState({
      parameterValues,
      parameterError,
    });
  };

  // Basic Advanced 타입일 때 파라미터 변경 이벤트 핸들러
  onChangeParameter = (e, idx) => {
    const { value } = e.target;
    const number = parseInt(idx, 10);
    const parameterValues = [...this.state.parameterValues];
    parameterValues[number].val = value;
    this.setState({
      parameterValues,
    });
  };

  // 빌트인 타입일 때 파라미터 변경 이벤트 핸들러
  onChangeBuiltInParameter = (e, idx, key) => {
    const { value } = e.target;
    const parameterValues = [...this.state.parameterValues];
    const params = parameterValues[idx][key];
    parameterValues[idx][key] = { ...params, default_value: value };
    this.setState({
      parameterValues,
    });
  };

  // 셀렉트 박스 핸들러
  selectInputHandler = (name, value) => {
    const newState = {
      [name]: value.value === null ? null : value,
    };
    if (name === 'loadFile') {
      const [saveFileName] = value.value ? value.value.split('.') : [''];
      newState.saveFile = saveFileName;
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 라디오 버튼 이벤트 핸들러
  radioBtnHandler = (e) => {
    const { name, value } = e.target;
    const { trainingType, defaultParameter, staticParameterInfo } = this.state;
    const newState = { [name]: Number(value) };
    if (name === 'searchMethod') {
      const { hpsParameter, defaultHpsParameter } =
        this.getHyperParameterDataForm({
          modalType: 'CREATE_HPS_GROUP',
          trainingType,
          defaultParameter,
          searchMethod: value,
          staticParameterInfo,
        });
      newState.defaultHpsParameter = defaultHpsParameter;
      newState.hpsParameter = hpsParameter;

      if (staticParameterInfo) {
        const staticParamKeys = Object.keys(staticParameterInfo);
        const { searchCount } = this.state;
        let interval = '';
        for (let i = 0; i < staticParamKeys.length; i += 1) {
          const parameterName = staticParamKeys[i];
          const {
            range_value_max: max,
            range_value_min: min,
            static: isStatic,
          } = staticParameterInfo[parameterName];
          if (!isStatic) {
            const param = {
              max,
              min,
              searchCount,
            };
            interval = this.getGridInputValue('searchCount', param);
          }
        }
        newState.interval = interval !== undefined ? interval : '';
      }
    } else if (name === 'hpsResult') {
      newState.loadFile = null;
      newState.saveFile = '';
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // Static value, range 사용 여부 라디오 버튼 이벤트 핸들러
  hyperParamRadioBtnHandler = (i, e) => {
    const { hpsParameter, searchMethod } = this.state;
    const tmpHpsParameter = [...hpsParameter];
    if (searchMethod === 2) {
      for (let idx = 0; idx < tmpHpsParameter.length; idx += 1) {
        if (idx === i) tmpHpsParameter[idx].paramType = Number(e.target.value);
        else tmpHpsParameter[idx].paramType = 0;
      }
    } else {
      tmpHpsParameter[i].paramType = Number(e.target.value);
    }

    const newState = {
      hpsParameter: tmpHpsParameter,
      hpsParameterError: null,
    };
    const validate = this.validate('hpsParameter', tmpHpsParameter);
    if (validate) {
      newState.hpsParameterError = validate;
    } else {
      newState.hpsParameterError = '';
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // Hyper Parameter 추가
  addHyperParameter = () => {
    const { hpsParameter, defaultHpsParameter } = this.state;
    const tmpHpsParameter = [...hpsParameter];
    tmpHpsParameter.push(cloneDeep(defaultHpsParameter));
    const newState = {
      hpsParameter: tmpHpsParameter,
      hpsParameterError: null,
    };
    const validate = this.validate('hpsParameter', tmpHpsParameter);
    if (validate) {
      newState.hpsParameterError = validate;
    } else {
      newState.hpsParameterError = '';
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // Hyper Parameter 삭제
  removeHyperParameter = (idx) => {
    const { hpsParameter } = this.state;
    const tmpHpsParameter = [...hpsParameter];
    tmpHpsParameter.splice(idx, 1);
    const newState = {
      hpsParameter: tmpHpsParameter,
      hpsParameterError: null,
    };
    const validate = this.validate('hpsParameter', tmpHpsParameter);
    if (validate) {
      newState.hpsParameterError = validate;
    } else {
      newState.hpsParameterError = '';
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // Hyper Parameter 데이터 타입 체크 박스 이벤트 핸들러(true: INT, false: float)
  hyperParameterDataTypeHandler = (idx, isInt) => {
    const { hpsParameter } = this.state;
    const tmpHpsParameter = [...hpsParameter];

    // min max Int 형으로 변경
    const { paramList } = tmpHpsParameter[idx];
    const tmpParamList = [];
    for (let j = 0; j < paramList.length; j += 1) {
      const tmpParam = { ...paramList[j] };
      const { label, value } = tmpParam;
      if ((label === 'min.label' || label === 'max.label') && !isInt) {
        if (
          (value !== undefined && value !== '') ||
          typeof value === 'number'
        ) {
          tmpParam.value = parseInt(value, 10);
        } else if (typeof value === 'string') {
          tmpParam.value = parseInt(Number(value), 10);
        } else {
          tmpParam.value = '0';
        }
      }
      tmpParamList.push(tmpParam);
    }
    tmpHpsParameter[idx].paramList = tmpParamList;

    tmpHpsParameter[idx].isInt = !isInt;
    const newState = {
      hpsParameter: tmpHpsParameter,
      hpsParameterError: null,
    };
    const validate = this.validate('hpsParameter', tmpHpsParameter);
    if (validate) {
      newState.hpsParameterError = validate;
    } else {
      newState.hpsParameterError = '';
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // Hyper Parameter 인풋 텍스트 이벤트 핸들러
  hyperParameterInputTextHandler = (i, j, value, isInt) => {
    const { hpsParameter, searchMethod } = this.state;
    const tmpHpsParameter = [...hpsParameter];
    if (isInt) {
      if (isNaN(value) || value === '') {
        value = 0;
      } else {
        value = Number(value);
      }
    }
    tmpHpsParameter[i].paramList[j].value = value;
    const newState = {
      hpsParameter: tmpHpsParameter,
      hpsParameterError: null,
    };

    if (searchMethod === 2) {
      const { interval, searchCount } = this.state;
      const [, , minData, maxData] = hpsParameter[i].paramList;
      let newSearchCount = searchCount;
      if (j === 2) {
        // min input 입력 시
        newSearchCount = this.getGridInputValue('min', {
          min: Number(value),
          max: maxData.value,
          interval,
          searchCount,
        });
      } else if (j === 3) {
        // max input 입력 시
        newSearchCount = this.getGridInputValue('max', {
          min: minData.value,
          max: Number(value),
          interval,
          searchCount,
        });
      }
      newState.searchCount = newSearchCount;
    }
    this.setState(newState, () => {
      const validate = this.validate('hpsParameter', tmpHpsParameter);
      const validateState = {};
      if (validate) {
        validateState.hpsParameterError = validate;
      } else {
        validateState.hpsParameterError = '';
      }
      this.setState(validateState, () => {
        this.submitBtnCheck();
      });
    });
  };

  // 데이터셋 셀렉트 박스 이벤트 핸들러
  searchSelectHandler = (selected, name, defaultCategoryData) => {
    const { trainingType, dataset } = this.state;
    if (dataset && dataset.value === selected.value) return;
    const newState = {
      [name]: selected,
      [`${name}Error`]: '',
    };
    if (
      trainingType === 'built-in' &&
      name === 'dataset' &&
      selected.label !== 'None'
    ) {
      const validate = this.validate(name, selected);
      // 데이터셋 카테고리별 옵션
      let datasetError = '';
      if (validate) {
        datasetError = validate;
      }

      newState.datasetError = datasetError;
    }

    this.setState(newState, () => this.submitBtnCheck());
  };

  // 데이터셋 카테고리 셀렉트 박스 이벤트 핸들러
  datasetCategoryHandler = (index, selected) => {
    const { datasetCategoryList } = this.state;
    const newList = [...datasetCategoryList];
    newList[index].selected = selected;
    newList[index].selectedError = '';
    this.setState(
      {
        datasetCategoryList: newList,
      },
      this.submitBtnCheck,
    );
  };

  additionalFeaturesHandler = (index) => {
    const { additionalFeatures: prevAdditionalFeatures } = this.state;
    const additionalFeatures = prevAdditionalFeatures.map((v, i) => {
      const value = { ...v };
      if (i === index) {
        value.checked = !v.checked;
        return value;
      }
      return value;
    });

    /**
     * 인피니밴드를 통한 RDMA GPU 가속 통신 선택시 GPU 가속 통신은 자동 선택
     * GPU 가속통신 선택 해제할 때 인피니밴드 선택되어 있으면 같이 선택 해제
     */
    const { checked } = additionalFeatures[2];
    if (index === 2 && checked) {
      additionalFeatures[0].checked = true;
    } else if (index === 0 && checked) {
      additionalFeatures[2].checked = false;
    }

    this.setState(
      {
        additionalFeatures,
      },
      () => this.submitBtnCheck(),
    );
  };
  /** ================================================================================
   * Event Handler END
   ================================================================================ */

  /** ================================================================================
   * Validate START
   ================================================================================ */
  // 데이터셋 유효성 체크
  datasetValidate = (categoryList, dirs) => {
    let matchCount = 0;
    let rootCount = 0;
    for (let i = 0; i < categoryList.length; i += 1) {
      const { name: categoryName } = categoryList[i];
      let flag = false;
      for (let j = 0; j < dirs.length; j += 1) {
        const { name } = dirs[j];
        if (categoryName === '/') {
          if (rootCount === 0) rootCount += 1;
          // eslint-disable-next-line no-continue
          continue;
        }
        if (name === categoryName) {
          flag = true;
          matchCount += 1;
        }
        if (flag) break;
      }
    }
    return matchCount === categoryList.length - rootCount;
  };

  // 유효성 검증
  validate = (name, value) => {
    const { type: modalType } = this.props;
    if (name === 'name') {
      // const regType1 = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (value === '') {
        return `${
          modalType === 'CREATE_JOB'
            ? 'jobName.empty.message'
            : 'hpsName.empty.message'
        }`;
      }
      const forbiddenChars = /[\\<>:*?"'|:;`{}^$ &[\]!]/;

      const regType = !forbiddenChars.test(value);

      if (!regType) {
        return 'newNameRule.message';
      }
      // if (!value.match(regType1) || value.match(regType1)[0] !== value) {
      //   return 'nameRule.message';
      // }
    } else if (name === 'dataset') {
      if (!value.generable) {
        const {
          unsatisfied: { dir, file },
        } = value;
        const { t } = this.props;
        return `${t('datasetFormRule.error.message')} ( Dir: ${
          dir.length !== 0 ? dir.join(',') : ' - '
        } File: ${file.length !== 0 ? file.join(',') : ' - '} )`;
      }
    } else if (name === 'parameters') {
      if (value.length === 0) {
        return 'parameter.empty.message';
      }
    } else if (name === 'saveFile') {
      if (value === '') {
        return 'save file을 입력하세요';
      }
    } else if (name === 'hpsParameter') {
      const hpsValidate = this.hpsParameterValidate(value);
      if (hpsValidate) {
        return hpsValidate;
      }
    }
    return null;
  };

  hpsParameterValidate = (hpsParameter) => {
    const { searchMethod, searchCount, initPoint, interval } = this.state;
    let validateCount = 0;
    // 파라미터가 하나도 없을 경우
    if (hpsParameter.length === 0) {
      validateCount += 1;
      return 'hyperParameter.empty.message';
    }
    let searchRangeCount = 0;
    let minMaxCount = 0;
    // HPS 파라미터 인풋 검증

    for (let i = 0; i < hpsParameter.length; i += 1) {
      const { paramType, paramList } = hpsParameter[i];
      const [paramNameData, staticValueData, minData, maxData] = paramList;
      const { value: paramName } = paramNameData;
      const { value: staticValue } = staticValueData;
      const { value: min } = minData;
      const { value: max } = maxData;

      if (paramType === 0) {
        // static value
        if (!paramName || !staticValue) {
          validateCount += 1;
        }
      } else if (paramType === 1) {
        // search range
        searchRangeCount += 1;
        if (
          !paramName ||
          min === undefined ||
          max === undefined ||
          searchCount === ''
        ) {
          validateCount += 1;
        }
        if (searchMethod === 0 && initPoint === '') {
          validateCount += 1;
        }
        if (searchMethod === 2 && interval === '') {
          validateCount += 1;
        }
        if (min && max && Number(max) <= Number(min)) {
          minMaxCount += 1;
        }
      }
    }

    // TODO 정확한 진단과 치료법이 사료되는 친구임
    searchRangeCount += 1;
    if (searchRangeCount === 0)
      return 'hyperParameterSearchRange.empty.message';
    if (minMaxCount > 0) return 'hyperParameterMinMax.error.message';
    if (validateCount > 0) {
      return 'hyperParameterInput.error.message';
    }

    return false;
  };
  /** ================================================================================
   * Validate END
   ================================================================================ */

  /** ================================================================================
   * Parse START
   ================================================================================ */

  // 데이터셋 카테고리 리스트의 선택 옵션
  parseDatasetCategoryListOptions = (selected, defaultCategoryData) => {
    const { dataTrainingForm } = this.state;
    // const datasetCategoryList = dataTrainingForm;
    const datasetCategoryList = dataTrainingForm.filter(
      ({ argparse }) => argparse,
    );
    const result = datasetCategoryList.map((category) => {
      const { dirList, fileList } = selected;
      const { type, name, argparse } = category;
      let options = [];
      let selectedData = null;
      if (type === 'file') {
        options = fileList[name].item_list.map((v) => {
          const newItem = { ...v, label: v.name, value: v.name };
          if (
            defaultCategoryData &&
            defaultCategoryData[argparse] === v.name &&
            !selectedData
          ) {
            selectedData = newItem;
          } else if (
            !defaultCategoryData &&
            category.name === v.name &&
            !selectedData
          ) {
            selectedData = newItem;
          }
          return newItem;
        });
      } else if (type === 'dir') {
        options = dirList[name].item_list.map((v) => {
          const newItem = { ...v, label: v.name, value: v.name };
          if (
            defaultCategoryData &&
            defaultCategoryData[argparse] === v.name &&
            !selectedData
          ) {
            selectedData = newItem;
          } else if (
            !defaultCategoryData &&
            category.name === v.name &&
            !selectedData
          ) {
            selectedData = newItem;
          }
          return newItem;
        });
      }
      return {
        ...category,
        selected: selectedData,
        selectedError: null,
        options,
      };
    });

    return result;
  };

  // Search Method가 Grid일 때 min, max, interval 입력 시 searchCount 값 설정
  // searchCount 입력 시 interval 값 설정
  getGridInputValue = (target, currentValue) => {
    const { min, max, searchCount, interval } = currentValue;
    if (target === 'searchCount') {
      const result = (Number(max) - Number(min)) / Number(searchCount);
      if (result === Infinity) return '';
      return result;
    }
    if (target === 'interval') {
      const result = Math.floor((Number(max) - Number(min)) / Number(interval));
      if (result === Infinity) return '';
      return result < 1 ? '' : result;
    }
    if (target === 'min' || target === 'max') {
      if (interval === '' || min === '' || max === '') return '';
      const result = Math.floor((Number(max) - Number(min)) / Number(interval));
      if (result === Infinity) return '';
      return result < 1 ? '' : result;
    }
    return '';
  };

  // 하이퍼 파라미터 데이터 폼 가져오기
  getHyperParameterDataForm = ({
    modalType,
    trainingType,
    defaultParameter,
    searchMethod,
    staticParameterInfo,
    defaultSearchMethod,
  }) => {
    const hpsParameter = [];
    let defaultHpsParameter;
    if (modalType === 'CREATE_HPS_GROUP' || modalType === 'ADD_HPS') {
      if (trainingType === 'built-in') {
        const defaultParamKeys = Object.keys(defaultParameter);
        for (let i = 0; i < defaultParamKeys.length; i += 1) {
          const parameterName = defaultParamKeys[i];
          if (staticParameterInfo && staticParameterInfo[parameterName]) {
            const {
              static: isStatic,
              default_value: defaultValue,
              init_points: initPoints,
              range_value_max: max,
              range_value_min: min,
              search_count: searchCount,
              searchInterval: interval,
              is_int: isInt,
            } = staticParameterInfo[parameterName];
            const param = {
              parameterName,
              defaultValue,
              initPoints,
              max,
              min,
              searchCount,
              interval,
              isBuiltIn: true,
            };
            hpsParameter.push(
              this.getBuiltInDataForm(
                param,
                defaultSearchMethod || searchMethod,
                true,
                isStatic ? 0 : 1,
                isInt,
              ),
            );
          } else {
            const { default_value: defaultValue } =
              defaultParameter[parameterName];
            hpsParameter.push(
              this.getBuiltInDataForm(
                { parameterName, defaultValue, isBuiltIn: true },
                searchMethod,
              ),
            );
          }
        }
      } else if (trainingType === 'advanced' || trainingType === 'basic') {
        defaultHpsParameter = this.getDefalutDataForm(
          null,
          defaultSearchMethod || searchMethod,
        );
        if (staticParameterInfo) {
          const staticParamKeys = Object.keys(staticParameterInfo);
          for (let i = 0; i < staticParamKeys.length; i += 1) {
            const parameterName = staticParamKeys[i];
            const {
              static: isStatic,
              default_value: defaultValue,
              init_points: initPoints,
              range_value_max: max,
              range_value_min: min,
              search_count: searchCount,
              searchInterval: interval,
              is_int: isInt,
            } = staticParameterInfo[parameterName];
            const param = {
              parameterName,
              defaultValue,
              initPoints,
              max,
              min,
              searchCount,
              interval,
            };
            const staticParam = this.getDefalutDataForm(
              param,
              defaultSearchMethod || searchMethod,
              true,
              isStatic ? 0 : 1,
              isInt,
            );
            hpsParameter.push(staticParam);
          }
        } else {
          hpsParameter.push(cloneDeep(defaultHpsParameter));
        }
      }
    }
    return { hpsParameter, defaultHpsParameter };
  };

  // Bayesian Probability 하이퍼 파라미터 데이터 폼 가져오기
  getBayesianDataForm = (paramInfo) => {
    return [
      {
        label: 'parameterName.label',
        value: paramInfo ? paramInfo.parameterName : '',
        readOnly: paramInfo && paramInfo.readOnly,
        isBuiltIn: paramInfo && paramInfo.isBuiltIn,
      },
      {
        label: 'value.label',
        value: paramInfo ? paramInfo.defaultValue : '',
      },
      {
        label: 'min.label',
        value: paramInfo ? paramInfo.min : '',
      },
      {
        label: 'max.label',
        value: paramInfo ? paramInfo.max : '',
      },
      {
        label: 'count.label',
        value: paramInfo ? paramInfo.searchCount : '',
      },
      {
        label: 'initPoints.label',
        value: paramInfo ? paramInfo.initPoints : '',
      },
    ];
  };

  // Normal Distribution 하이퍼 파라미터 데이터 폼 가져오기
  getNormalRandomDataForm = (paramInfo) => {
    return [
      {
        label: 'parameterName.label',
        value: paramInfo ? paramInfo.parameterName : '',
        readOnly: paramInfo && paramInfo.readOnly,
        isBuiltIn: paramInfo && paramInfo.isBuiltIn,
      },
      {
        label: 'value.label',
        value: paramInfo ? paramInfo.defaultValue : '',
      },
      {
        label: 'min.label',
        value: paramInfo ? paramInfo.min : '',
      },
      {
        label: 'max.label',
        value: paramInfo ? paramInfo.max : '',
      },
      {
        label: 'count.label',
        value: paramInfo ? paramInfo.searchCount : '',
      },
    ];
  };

  // Uniform Grid 하이퍼 파라미터 데이터 폼 가져오기
  getGridDataForm = (paramInfo) => {
    return [
      {
        label: 'parameterName.label',
        value: paramInfo ? paramInfo.parameterName : '',
        readOnly: paramInfo && paramInfo.readOnly,
        isBuiltIn: paramInfo && paramInfo.isBuiltIn,
      },
      {
        label: 'value.label',
        value: paramInfo ? paramInfo.defaultValue : '',
      },
      {
        label: 'min.label',
        value: paramInfo ? paramInfo.min : '',
      },
      {
        label: 'max.label',
        value: paramInfo ? paramInfo.max : '',
      },
      {
        label: 'interval.label',
        value: paramInfo
          ? this.getGridInputValue('searchCount', paramInfo)
          : '',
      },
      {
        label: 'count.label',
        value: paramInfo ? paramInfo.searchCount : '',
      },
    ];
  };

  // 빌트인 하이퍼 파라미터 데이터 폼 가져오기
  getBuiltInDataForm = (
    paramInfo,
    currentSearchMethod,
    isStatic,
    paramType,
    isInt,
  ) => {
    const { searchMethod } = this.state;
    let paramList;
    if (
      Number(
        currentSearchMethod !== undefined ? currentSearchMethod : searchMethod,
      ) === 0
    ) {
      paramList = this.getBayesianDataForm(paramInfo);
    } else if (
      Number(
        currentSearchMethod !== undefined ? currentSearchMethod : searchMethod,
      ) === 1
    ) {
      paramList = this.getNormalRandomDataForm(paramInfo);
    } else if (
      Number(
        currentSearchMethod !== undefined ? currentSearchMethod : searchMethod,
      ) === 2
    ) {
      paramList = this.getGridDataForm(paramInfo);
    }
    return {
      paramList,
      paramTypeOptions: this.paramTypeOptions,
      paramType: paramType || 0,
      isStatic,
      isInt: isInt === true,
    };
  };

  // Advanced, Basic 하이퍼 파라미터 데이터 폼 가져오기
  getDefalutDataForm = (
    paramInfo,
    currentSearchMethod,
    isStatic,
    paramType,
    isInt,
  ) => {
    const { searchMethod } = this.state;
    let paramList;
    if (
      Number(
        currentSearchMethod !== undefined ? currentSearchMethod : searchMethod,
      ) === 0
    ) {
      paramList = this.getBayesianDataForm(paramInfo);
    } else if (
      Number(
        currentSearchMethod !== undefined ? currentSearchMethod : searchMethod,
      ) === 1
    ) {
      paramList = this.getNormalRandomDataForm(paramInfo);
    } else if (
      Number(
        currentSearchMethod !== undefined ? currentSearchMethod : searchMethod,
      ) === 2
    ) {
      paramList = this.getGridDataForm(paramInfo);
    }
    return {
      paramList,
      paramTypeOptions: this.paramTypeOptions,
      paramType: paramType || 0,
      isStatic,
      isInt: isInt === true,
    };
  };

  // HPS 추가 폼에서 기존에 저장된 HPS group 정보 파싱
  parseHPSGroupData = (hpsGroupData) => {
    const {
      hps_name: name,
      default_parameters_info: parameterInfo,
      default_search_method: defaultSearchMethod,
      default_load_file_name: prevSaveFile,
      default_run_code: runCode,
      default_dataset: defaultDataset,
      default_dataset_sub: defaultCategoryData,
      num_of_search_parameter: numOfSearchParam,
    } = hpsGroupData;
    const paramKeys = Object.keys(parameterInfo);
    const newState = {
      name,
      nameError: '',
      searchMethod: Number(defaultSearchMethod),
    };
    for (let i = 0; i < paramKeys.length; i += 1) {
      const key = paramKeys[i];
      const {
        init_points: initPoint,
        search_count: searchCount,
        search_interval: interval,
      } = parameterInfo[key];
      if (newState.initPoint === undefined && initPoint !== undefined)
        newState.initPoint = initPoint;
      if (newState.searchCount === undefined && searchCount !== undefined)
        newState.searchCount = searchCount;
      if (newState.interval === undefined && interval !== undefined)
        newState.interval = interval;
    }
    this.setState(newState);
    return {
      name,
      nameError: '',
      parameterInfo,
      defaultSearchMethod: Number(defaultSearchMethod),
      prevSaveFile,
      runCodeName: { label: runCode, value: runCode },
      dataset: defaultDataset.id
        ? { label: defaultDataset.name, value: defaultDataset.id }
        : null,
      defaultCategoryData,
      numOfSearchParam,
    };
  };

  /** ================================================================================
   * Parse END
   ================================================================================ */

  render() {
    const {
      state,
      props,
      textInputHandler,
      paramInputHandler,
      onSubmit,
      onCreateHps,
      onAdd,
      onChangeParameter,
      onChangeBuiltInParameter,
      onRemove,
      selectInputHandler,
      radioBtnHandler,
      hyperParamRadioBtnHandler,
      addHyperParameter,
      removeHyperParameter,
      hyperParameterInputTextHandler,
      searchSelectHandler,
      datasetCategoryHandler,
      additionalFeaturesHandler,
      hyperParameterDataTypeHandler,
      trainingTypeArrowHandler,
      trainingToolTabHandler,
      toolSortHandler,
      toolDetailOpenHandler,
      toolSelectHandler,
      toolModelSelectHandler,
      toolModelSortHandler,
      logClickHandler,
      hpsLogSortHandler,
    } = this;
    return (
      <JobCreateFormModal
        {...state}
        {...props}
        textInputHandler={textInputHandler}
        paramInputHandler={paramInputHandler}
        onChangeParameter={onChangeParameter}
        onChangeBuiltInParameter={onChangeBuiltInParameter}
        selectInputHandler={selectInputHandler}
        radioBtnHandler={radioBtnHandler}
        hyperParamRadioBtnHandler={hyperParamRadioBtnHandler}
        addHyperParameter={addHyperParameter}
        removeHyperParameter={removeHyperParameter}
        hyperParameterInputTextHandler={hyperParameterInputTextHandler}
        additionalFeaturesHandler={additionalFeaturesHandler}
        hyperParameterDataTypeHandler={hyperParameterDataTypeHandler}
        onSubmit={onSubmit}
        onCreateHps={onCreateHps}
        onAdd={onAdd}
        onRemove={onRemove}
        searchSelectHandler={searchSelectHandler}
        datasetCategoryHandler={datasetCategoryHandler}
        trainingTypeArrowHandler={trainingTypeArrowHandler}
        trainingToolTabHandler={trainingToolTabHandler}
        toolSortHandler={toolSortHandler}
        toolDetailOpenHandler={toolDetailOpenHandler}
        toolSelectHandler={toolSelectHandler}
        toolModelSelectHandler={toolModelSelectHandler}
        toolModelSortHandler={toolModelSortHandler}
        logClickHandler={logClickHandler}
        hpsLogSortHandler={hpsLogSortHandler}
      />
    );
  }
}

export default connect(null, { closeModal, openConfirm })(
  withTranslation()(JobCreateFormModalContainer),
);

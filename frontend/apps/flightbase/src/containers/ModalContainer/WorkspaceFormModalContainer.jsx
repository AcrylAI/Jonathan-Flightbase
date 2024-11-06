import { PureComponent } from 'react';
import dayjs from 'dayjs';
import { uniqBy } from 'lodash';

// Utils
import { convertLocalTimeObj, convertUTCTime } from '@src/datetimeUtils';
import {
  convertSizeToBinaryBytes,
  convertBinaryByte,
  convertSizeTo,
  defaultSuccessToastMessage,
  errorToastMessage,
} from '@src/utils';

// Components
import WorkspaceFormModal from '@src/components/Modal/WorkspaceFormModal';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

class WorkspaceFormModalContainer extends PureComponent {
  constructor(props) {
    super(props);
    const now = new Date();

    // 기간(Period of Use)의 초기 값
    const startdatetime = dayjs(); // 시작 날짜 (현재 시간으로 설정)
    const enddatetime = dayjs(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    ) // 종료 날짜 (현재 시간 기준 해당 날짜의 11:59:59)
      .add(31, 'days')
      .subtract(1, 'seconds');
    const minDate = dayjs();

    this.state = {
      userInit: true,
      validate: false, // 모달의 submit 버튼 활성/비활성 여부 상태 값
      workspaceId: '', // Workspace id 값
      workspace: '', // Workspace Name 값
      workspaceError: null, // Workspace Name input 에러 텍스트
      startdatetime, // 기간 시작 날짜 값
      prevStartdatetime: startdatetime, // 현재 저장된 시작 날짜
      enddatetime, // 기간 종료 날짜 값
      minDate, //최소 날짜 값
      periodError: '', // 기간 에러 텍스트
      guarantee: true, // gpu 보장 여부
      trainingGpu: '', // Training GPU
      trainingGpuError: null, // Training GPU input 에러 텍스트
      deploymentGpu: '', // Service GPU
      deploymentGpuError: null, // Service GPU input 에러 텍스트
      manager: '', // Workspace 관리자 이름
      managerList: [], // Workspace 관리자 목록
      managerError: null, // Workspace 관리자 input 에러 텍스트
      selectedManager: null, // 선택된 Workspace 관리자
      userList: [], // 초기 유저 목록
      groupList: [], // 사용자 그룹 목록
      userGroupOptions: [],
      selectedList: [], // 초기 선택된 유저 목록
      tmpSelectedList: [], // 선택된 Users 값 생성 수정시 파라미터로 쓰임
      description: '', // Workspace 설명
      descriptionError: null, // Workspace 설명 에러
      gpuCount: 0,
      gpuTotal: 0,
      gpuFreeMap: {},
      storageList: [],
      storageInputValue: '',
      storageInputValueByte: 0,
      storageError: null,
      storageMessage: null,
      storageSelectedModel: null,
      editStorageAvailableSize: 0,
      createStorageAvailableSize: 0,
      prevStorageModel: [],
      storageBarData: {},
      workspaceListData: [],
      workspaceUsage: 0,
    };
  }

  _isMounted = false;

  _isRequestGpuInfo = {};

  async componentDidMount() {
    this._isMounted = true;
    // 유저 목록 조회
    const {
      userList: users,
      groupList: groups,
      storageList,
    } = await this.getUsersData();

    const {
      type,
      data: { data: workspaceData, workspaceListData },
    } = this.props;

    if (type === 'EDIT_WORKSPACE') {
      const response = await callApi({
        url: `workspaces/${workspaceData.id}`,
        method: 'get',
      });
      const { result, status } = response;

      if (status === STATUS_SUCCESS) {
        const {
          id: workspaceId,
          workspace_name: workspace,
          start_datetime: startdatetime,
          end_datetime: enddatetime,
          gpu_training_total: trainingGpu,
          gpu_deployment_total: deploymentGpu,
          manager_id: managerId,
          user: selectedUsers,
          description,
          guaranteed_gpu: guarantee,
        } = result;

        const userList = [];
        const selectedList = [];
        for (let i = 0; i < users.length; i += 1) {
          const userItem = users[i];
          const { id: userId } = userItem;
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
        const prevStorageData = [];
        let workspaceUsage = 0;

        // eslint-disable-next-line no-unused-vars
        let prevUsed = '';

        const storageId = workspaceData.usage?.storage_id;

        workspaceListData.forEach((list) => {
          if (list.name === workspace) {
            if (list.usage) {
              workspaceUsage = Number(list.usage.size);
            }
          }
        });

        storageList.forEach((list) => {
          if (list.id === storageId) {
            prevStorageData.push(list);
            // default min capacity - 공유형
            let minCapacity = convertBinaryByte(list.usage?.used);
            let otherStorageSize =
              prevStorageData[0]?.usage.allocate_used - workspaceUsage;

            if (list.share === 0) {
              minCapacity = convertSizeTo(workspaceData?.usage?.size, 'GiB');
              if (otherStorageSize !== 0) {
                if (
                  isNaN(
                    Number(
                      convertBinaryByte(otherStorageSize).split(' GiB')[0],
                    ),
                  )
                ) {
                  otherStorageSize = Math.ceil(
                    Number(
                      convertBinaryByte(otherStorageSize).split(' TiB')[0],
                    ),
                  );
                } else {
                  otherStorageSize = Math.ceil(
                    Number(
                      convertBinaryByte(otherStorageSize).split(' GiB')[0],
                    ),
                  );
                }
              }
            }

            if (isNaN(Math.ceil(Number(minCapacity.split(' GiB')[0])))) {
              prevUsed = Math.ceil(Number(minCapacity.split(' TiB')[0]));
            } else {
              prevUsed = Math.ceil(Number(minCapacity.split(' GiB')[0]));
            }
          }
        });

        const maxSize = Math.floor(
          prevStorageData[0]?.size / Math.pow(1024, 3),
        );

        let otherSize =
          prevStorageData[0]?.usage.allocate_used / Math.pow(1024, 3);

        let currUsage = Number(
          convertSizeTo(workspaceUsage, 'GiB').split(' GiB')[0],
        );

        otherSize = otherSize - currUsage;
        const maxInputValue = Math.floor(maxSize - otherSize - currUsage) + 1;

        const storageSize = prevStorageData[0]?.size;

        let otherStorageUsage =
          prevStorageData[0]?.usage.allocate_used - workspaceUsage;
        // 여기서 otherStorageUsage 다른 사용량 바이트값

        const otherStorageUsagePcent = (otherStorageUsage / storageSize) * 100;

        const resultUserList = userList.map(
          ({ name: userName, id: userId }) => ({
            label: userName,
            value: userId,
          }),
        );

        let manager = {};

        if (Array.isArray(users)) {
          const { id: value, name: label } = users.filter(
            ({ id }) => id === parseInt(managerId, 10),
          )[0];
          manager = { label, value };
        }
        // gpu 사용 가능 수 조회
        const sDateTime = convertLocalTimeObj(startdatetime);
        const eDateTime = convertLocalTimeObj(enddatetime);

        const { gpuCount, gpuTotal } = await this.getGpuInfo(
          sDateTime,
          eDateTime,
          guarantee,
        );

        // storage.usage.allocate_used -
        // state 하나 더 만들어서 계속 체크 그것보다 작아졌는지

        this.setState({
          workspaceId,
          workspace,
          workspaceError: '',
          startdatetime: sDateTime,
          prevStartdatetime: sDateTime,
          enddatetime: eDateTime,
          minDate: sDateTime.isAfter(dayjs()) ? dayjs() : sDateTime,
          trainingGpu,
          trainingGpuError: '',
          deploymentGpu,
          deploymentGpuError: '',
          manager,
          managerError: '',
          userList: resultUserList,
          groupList: groups,
          userGroupOptions: [...groups, ...resultUserList],
          selectedList: selectedList.map(({ name: userName, id: userId }) => ({
            label: userName,
            value: userId,
          })),
          selectedListError: '',
          gpuCount,
          gpuTotal,
          storageList,
          description: !description ? '' : description,
          descriptionError: description ? '' : null,
          guarantee: guarantee === 1,
          storageError: '',
          editStorageAvailableSize: maxInputValue,
          // storageInputValue: prevUsed,
          storageInputValue: '',
          workspaceUsage: workspaceUsage,
          prevStorageModel: prevStorageData,
          storageBarData: {
            ...this.state.storageBarData,
            otherUsage: {
              pcent: otherStorageUsagePcent,
              usage: otherStorageUsage,
            },
            currUsage: {
              pcent: (workspaceUsage / storageSize) * 100,
              usage: workspaceUsage,
            },
            // remaining: remainingSize,
          },
        });
      }
    } else {
      // gpu 사용 가능 수 조회
      const { gpuCount, gpuTotal } = await this.getGpuInfo();

      this.setState({
        gpuCount,
        gpuTotal,
        storageList,
        userGroupOptions: [
          ...groups,
          ...users.map(({ name: userName, id: userId }) => ({
            label: userName,
            value: userId,
          })),
        ],
        storageError: !storageList ? '' : null,
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Storage 목록 조회
  getStorageData = async () => {
    const url = 'storage';
    const response = await callApi({
      url,
      method: 'get',
    });
    const { status, result, error, message } = response;

    if (status === STATUS_SUCCESS) {
      return result;
    } else {
      errorToastMessage(error, message);
      return { list: null };
    }
  };

  /** ================================================================================
   * API START
   ================================================================================ */
  // 유저 목록 조회
  getUsersData = async () => {
    const url = 'options/workspaces';
    const response = await callApi({
      url,
      method: 'get',
    });
    const { status, result } = response;

    if (!this._isMounted) return { userList: [], groupList: [] };
    if (status === STATUS_SUCCESS) {
      const {
        user_list: userList,
        group_list: groupList,
        storage_list: storageList,
      } = result;
      const parseGroupList = groupList.map(
        ({ name: label, id: value, user_list: memberList }) => {
          return {
            label,
            value,
            memberList: memberList.map(({ name, id }) => ({
              label: name,
              value: id,
            })),
          };
        },
      );
      this.setState({
        userList: userList.map(({ name: userName, id: userId }) => ({
          label: userName,
          value: userId,
        })),
        groupList: parseGroupList,
        managerList: [...userList],
      });
      return { userList, groupList: parseGroupList, storageList };
    }
    return { userList: [], groupList: [] };
  };

  // 생성 가능한 gpu수 조회
  getGpuInfo = async (sdate, edate, currentGuarantee) => {
    const {
      type,
      data: { data: workspaceData },
    } = this.props;
    const { startdatetime, enddatetime, guarantee } = this.state;
    const s = !sdate ? startdatetime : sdate;
    const e = !edate ? enddatetime : edate;

    let url = `gpu/workspace_aval_gpu?guaranteed_gpu=${(() => {
      if (currentGuarantee === undefined && guarantee === true) {
        return 1;
      } else if (currentGuarantee === undefined && guarantee === false) {
        return 0;
      }
      if (currentGuarantee === true) {
        return 1;
      } else {
        return 0;
      }
    })()}&start_datetime=${convertUTCTime(
      s,
      'YYYY-MM-DD HH:mm',
    )}&end_datetime=${convertUTCTime(e, 'YYYY-MM-DD HH:mm')}`;
    if (type === 'EDIT_WORKSPACE') {
      url = `${url}&workspace_id=${workspaceData.id}`;
    }

    const requestOpt = { method: 'GET', url };
    const response = await callApi(requestOpt);

    const { result, status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      const { gpu_free: gpuCount, gpu_total: gpuTotal } = result;
      return { gpuCount: gpuCount < 0 ? 0 : gpuCount, gpuTotal };
    }
    errorToastMessage(error, message);
    return 0;
  };

  getGpuFreeInCalendar = async (sdate, edate) => {
    const {
      type,
      data: { data: workspaceData },
    } = this.props;
    const { guarantee } = this.state;
    const reqKey = `${sdate.format('YYYY-MM-DD')}_${edate.format(
      'YYYY-MM-DD',
    )}`;
    if (this._isRequestGpuInfo[reqKey]) return {};

    this._isRequestGpuInfo[reqKey] = true;

    let url = `gpu/workspace_aval_gpu_timeline?guaranteed_gpu=${
      guarantee ? 1 : 0
    }&start_datetime=${convertUTCTime(
      sdate,
      'YYYY-MM-DD HH:mm',
    )}&end_datetime=${convertUTCTime(edate, 'YYYY-MM-DD HH:mm')}`;

    if (type === 'EDIT_WORKSPACE') {
      url = `${url}&workspace_id=${workspaceData.id}`;
    }

    const response = await callApi({
      url,
      method: 'get',
    });

    const { result, status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      return result;
    }
    this._isRequestGpuInfo[reqKey] = false;
    errorToastMessage(error, message);
    return {};
  };

  // 모달의 Submit 버튼 클릭 시 실행되는 함수 (워크스페이스 생성 또는 수정)
  onSubmit = async (callback) => {
    const { type } = this.props;
    const url = 'workspaces';
    let method = 'POST';
    const {
      workspaceId,
      workspace,
      trainingGpu,
      startdatetime,
      enddatetime,
      deploymentGpu,
      manager,
      tmpSelectedList: selectedList,
      description,
      guarantee,
      storageSelectedModel,
      storageInputValueByte,
      prevStorageModel,
    } = this.state;

    let body;

    if (type === 'CREATE_WORKSPACE') {
      body = {
        workspace_name: workspace,
        training_gpu: parseInt(trainingGpu, 10),
        deployment_gpu: parseInt(deploymentGpu, 10),
        start_datetime: convertUTCTime(startdatetime, 'YYYY-MM-DD HH:mm'),
        end_datetime: convertUTCTime(enddatetime, 'YYYY-MM-DD HH:mm'),
        manager_id: manager.value,
        users_id: selectedList
          .map(({ value }) => value)
          .filter((value) => value !== manager.value),
        description,
        guaranteed_gpu: guarantee ? 1 : 0,
        storage_id: storageSelectedModel?.id,
      };
      if (storageSelectedModel?.share === 0) {
        body.workspace_size = storageInputValueByte;
      }
    } else if (type === 'EDIT_WORKSPACE') {
      method = 'PUT';
      body = {
        workspace_id: workspaceId,
        workspace_name: workspace,
        training_gpu: parseInt(trainingGpu, 10),
        deployment_gpu: parseInt(deploymentGpu, 10),
        start_datetime: convertUTCTime(startdatetime, 'YYYY-MM-DD HH:mm'),
        end_datetime: convertUTCTime(enddatetime, 'YYYY-MM-DD HH:mm'),
        manager_id: manager.value,
        users_id: selectedList
          .map(({ value }) => value)
          .filter((value) => value !== manager.value),
        description,
        guaranteed_gpu: guarantee ? 1 : 0,
      };
      if (prevStorageModel[0]?.share === 0) {
        body.workspace_size = storageInputValueByte;
      }
    }

    const response = await callApi({ url, method, body });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      if (callback) callback();
      if (type === 'CREATE_WORKSPACE') {
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
   * Event handler START
   ================================================================================ */

  // 텍스트 인풋 이벤트 핸들러
  inputHandler = (e) => {
    const { name, value } = e.target;

    const newState = {
      [name]: value,
      [`${name}Error`]: null,
    };

    const validate = this.validate(name, value);

    if (validate) {
      newState[`${name}Error`] = validate;
    } else if (name === 'description' && value.trim() === '') {
      newState[`${name}Error`] = null;
    } else {
      newState[`${name}Error`] = '';
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 넘버 인풋 이벤트 핸들러
  numberInputHandler = (data) => {
    const { name, value } = data;
    const { gpuCount } = this.state;
    const newState = {
      [name]: value,
      [`${name}Error`]: null,
    };
    const cnt = parseInt(newState[name], 10);

    if ((name === 'trainingGpu' || name === 'deploymentGpu') && value !== '') {
      if (gpuCount < cnt) {
        newState[name] = gpuCount;
      } else if (cnt < 0) {
        newState[name] = 0;
      }
    }

    const validate = this.validate(
      name,
      (name === 'trainingGpu' || name === 'deploymentGpu') && value !== ''
        ? cnt
        : value,
    );

    if (validate) {
      newState[`${name}Error`] = validate;
    } else {
      newState[`${name}Error`] = '';
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // storage select 핸들러
  storageSelectHandler = (storage) => {
    const {
      data: { workspaceListData },
      type,
    } = this.props;

    const {
      storageInputValue,
      storageInputValueByte,
      storageError,
      storageMessage,
    } = this.state;

    const newState = {
      storageBarData: {
        otherUsage: { pcent: null, usage: null },
        currUsage: { pcent: null, usage: null },
      },
    };

    if (storageInputValue !== '') {
      newState.storageInputValue = '';
    }
    if (storageInputValueByte !== 0) {
      newState.storageInputValueByte = 0;
    }
    if (storageError === null) {
      newState.storageError = '';
    }
    if (storageMessage !== null) {
      newState.storageMessage = null;
    }

    newState.storageSelectedModel = storage;

    if (storage.share === 0) {
      // * 할당형이면
      const id = storage.id;
      let size = 0;

      workspaceListData.forEach((v) => {
        if (v.usage) {
          if (v.usage.storage_id === id) {
            size = size + v.usage.size;
          }
        }
      });

      if (type === 'CREATE_WORKSPACE' && storage.share === 0) {
        newState.storageBarData.currUsage.pcent = storageInputValue === '' && 0;
        newState.storageBarData.currUsage.usage =
          storageInputValue === '' && '0';

        const storageSizeGib = Number(
          convertSizeTo(storage.size, 'GiB')?.split(' GiB')[0],
        );
        const otherUsage = convertSizeTo(storage.usage.allocate_used, 'GiB');
        const otherPcent =
          (Number(
            convertSizeTo(storage.usage.allocate_used, 'GiB')?.split(' GiB')[0],
          ) /
            storageSizeGib) *
          100;
        newState.storageBarData.otherUsage.pcent = otherPcent;
        newState.storageBarData.otherUsage.usage = otherUsage;
        newState.createStorageAvailableSize = Math.floor(
          storageSizeGib - Number(otherUsage.split(' GiB')[0]) + 1,
        );
      }
    }
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 스위치 버튼 이벤트 핸들러
  switchHandler = async () => {
    const { startdatetime, enddatetime, guarantee } = this.state;
    const { gpuCount, gpuTotal } = await this.getGpuInfo(
      startdatetime,
      enddatetime,
      !guarantee,
    );

    this.setState({
      gpuCount,
      gpuTotal,
      trainingGpu: '',
      trainingGpuError: null,
      deploymentGpu: '',
      deploymentGpuError: null,
      guarantee: !guarantee,
    });

    this.getGpuFreeInCalendar(startdatetime, enddatetime);
  };

  // 달력 인풋 핸들러
  calendarHandler = async (from, to) => {
    const f = dayjs(from);
    const t = dayjs(to);
    const { gpuCount } = await this.getGpuInfo(f, t);
    this.setState(
      {
        startdatetime: f,
        enddatetime: t,
        gpuCount,
        trainingGpu: '',
        deploymentGpu: '',
      },
      () => {
        this.submitBtnCheck();
      },
    );
  };

  // 달력 변경 감지
  calenderDetector = async (leftD, rightD, isHandle) => {
    if (isHandle) return;
    const { gpuFreeMap: prevGpuFreeMap } = this.state;
    const gpuFreeMap = { ...prevGpuFreeMap };
    let res1 = {};
    let res2 = {};
    if (leftD) {
      const s = dayjs(leftD).startOf('year');
      const e = dayjs(leftD).endOf('year');
      res1 = await this.getGpuFreeInCalendar(s, e);
    }
    if (rightD) {
      const s = dayjs(rightD).startOf('year');
      const e = dayjs(rightD).endOf('year');
      res2 = await this.getGpuFreeInCalendar(s, e);
    }
    const keys1 = Object.keys(res1);
    for (let i = 0; i < keys1.length; i += 1) {
      gpuFreeMap[keys1[i]] = res1[keys1[i]];
    }
    const keys2 = Object.keys(res2);
    for (let i = 0; i < keys2.length; i += 1) {
      gpuFreeMap[keys2[i]] = res2[keys2[i]];
    }

    if (!this._isMounted) return;
    this.setState({ gpuFreeMap });
  };

  // 달력 마운트 감지
  calenderMountDetector = () => {
    this._isRequestGpuInfo = {};
    this.calenderDetector(
      this.state.startdatetime.format('YYYY-MM-DD'),
      this.state.enddatetime.format('YYYY-MM-DD'),
    );
  };

  // 셀렉트 박스 인풋 핸들러
  selectManager = (selectedManager) => {
    const newState = {
      manager: selectedManager,
    };
    if (selectedManager) newState.managerError = '';
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 할당용량 input handler
  storageInputHandler = (usage, size) => {
    const { prevStorageModel, storageSelectedModel, workspace } = this.state;
    const {
      type,
      data: { workspaceListData },
    } = this.props;

    const newState = {};

    let byteUsage = convertSizeToBinaryBytes(usage, 'GiB');

    let defaultUsage = 10;
    let minCapacity = convertSizeToBinaryBytes(10, 'GiB');
    let workspaceUsage = 0;

    if (type === 'EDIT_WORKSPACE') {
      minCapacity = convertBinaryByte(prevStorageModel[0]?.usage.used);

      if (prevStorageModel[0]?.share === 0) {
        minCapacity = convertBinaryByte(
          prevStorageModel[0]?.usage.allocate_used,
        );
      }
      if (minCapacity.indexOf(' GiB') !== -1) {
        minCapacity = Math.ceil(Number(minCapacity.split(' GiB')[0]));
        workspaceListData.forEach((list) => {
          if (list.name === workspace) {
            workspaceUsage = Number(list.usage.size);
          }
        });

        const currUsage = Math.ceil(
          Number(convertBinaryByte(workspaceUsage).split(' GiB')[0]),
        );

        defaultUsage = currUsage;
      } else if (minCapacity.indexOf(' TB') !== -1) {
        minCapacity = Math.ceil(Number(minCapacity.split(' TiB')[0]));
      }
    }

    if (type === 'CREATE_WORKSPACE') {
      byteUsage = byteUsage + storageSelectedModel.usage.allocate_used;
    } else {
      workspaceListData.forEach((list) => {
        if (list.name === workspace) {
          workspaceUsage = Number(list.usage.size);
        }
      });
      byteUsage =
        byteUsage + prevStorageModel[0].usage.allocate_used - workspaceUsage;
    }

    let avaliableSize = 9999;
    if (type === 'EDIT_WORKSPACE') {
      let currUsage = Number(
        convertSizeTo(workspaceUsage, 'GiB').split(' GiB')[0],
      );
      const totalOtherSize =
        prevStorageModel[0].usage.allocate_used / Math.pow(1024, 3);

      const nonWorkspace = totalOtherSize - currUsage;
      let availableUsage = Number(
        convertSizeTo(prevStorageModel[0]?.size, 'GiB')?.split(' GiB')[0],
      );
      avaliableSize = Math.floor(availableUsage - (nonWorkspace + currUsage));
    }

    if (usage > avaliableSize && type === 'EDIT_WORKSPACE') {
      newState.storageError = null;
      newState.storageMessage = 'enterMaxCapacity.message';

      const maxSize = Math.floor(size / Math.pow(1024, 3));
      let otherSize = 0;
      otherSize = prevStorageModel[0].usage.allocate_used / Math.pow(1024, 3);
      let currUsage = Number(
        convertSizeTo(workspaceUsage, 'GiB').split(' GiB')[0],
      );
      otherSize = otherSize - currUsage;
      const maxInputValue = Math.floor(maxSize - otherSize - currUsage) + 1;

      newState.storageInputValue = maxInputValue;
    } else if (byteUsage > size) {
      newState.storageError = null;
      newState.storageMessage = 'enterMaxCapacity.message';

      const maxSize = Math.floor(size / Math.pow(1024, 3));
      let otherSize = 0;
      if (type === 'CREATE_WORKSPACE') {
        otherSize = Math.floor(
          storageSelectedModel.usage.allocate_used / Math.pow(1024, 3),
        );
      } else {
        otherSize = prevStorageModel[0].usage.allocate_used / Math.pow(1024, 3);
      }

      newState.storageInputValue = maxSize;
      if (type === 'CREATE_WORKSPACE') {
        newState.storageInputValue = maxSize - otherSize + 1;
      } else {
        let currUsage = Number(
          convertSizeTo(workspaceUsage, 'GiB').split(' GiB')[0],
        );
        otherSize = otherSize - currUsage;
        const maxInputValue = Math.floor(maxSize - otherSize - currUsage) + 1;
        newState.storageInputValue = maxInputValue;
      }
    } else if (usage < defaultUsage && type === 'CREATE_WORKSPACE') {
      newState.storageMessage = 'enterMinCapacity.message';
      newState.storageError = null;
      newState.storageInputValue = usage;
    } else if (minCapacity > size) {
      newState.storageMessage = 'noStorageCapacity.message';
      newState.storageError = null;
    } else {
      newState.storageInputValueByte = usage + 'G';
      newState.storageMessage = 'storageCapacityValid.message';
      newState.storageError = '';
      newState.storageInputValue = usage;
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  multiSelectHandler = ({ selectedList }) => {
    const tmpSelectedList = [];
    for (let i = 0; i < selectedList.length; i += 1) {
      const item = selectedList[i];
      const { memberList } = item;
      if (memberList) {
        for (let j = 0; j < memberList.length; j += 1) {
          const member = memberList[j];
          tmpSelectedList.push(member);
        }
      } else {
        tmpSelectedList.push(item);
      }
    }

    this.setState({ tmpSelectedList: uniqBy(tmpSelectedList, 'value') }, () => {
      this.submitBtnCheck();
    });
  };

  // 유효성 검증 함수
  validate = (name, value) => {
    if (name === 'workspace') {
      const regType1 = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (value === '') {
        return 'workspaceName.empty.message';
      }
      if (!value.match(regType1) || value.match(regType1)[0] !== value) {
        return 'nameRule.message';
      }
    } else if (name === 'period') {
      if (value === 1) {
        return 'startDate.error.message';
      }
      if (value === 2) {
        return 'endDate.error.message';
      }
    } else if (name === 'trainingGpu') {
      const { gpuCount, deploymentGpu } = this.state;
      if (value === '') {
        return 'trainingGpuCount.empty.message';
      }
      if (gpuCount - deploymentGpu < value && gpuCount - deploymentGpu > 0) {
        return 'trainingGpuCount.error.message';
      }
    } else if (name === 'deploymentGpu') {
      const { gpuCount, trainingGpu } = this.state;
      if (value === '') {
        return 'deploymentGpuCount.empty.message';
      }
      if (gpuCount - trainingGpu < value && gpuCount - trainingGpu > 0) {
        return 'deploymentGpuCount.error.message';
      }
    } else if (name === 'manager') {
      if (value === '') {
        return 'workspaceManager.empty.message';
      }
    }
    return null;
  };

  // submit 버튼 활성 여부 체크 함수
  submitBtnCheck = () => {
    // submit 버튼 활성/비활성
    const { state } = this;
    const { storageInputValueByte, storageSelectedModel } = state;
    const { type } = this.props;
    const stateKeys = Object.keys(state);
    let validateCount = 0;
    for (let i = 0; i < stateKeys.length; i += 1) {
      const key = stateKeys[i];

      if (key !== 'descriptionError' && key.indexOf('Error') !== -1) {
        if (state[key] !== '') {
          validateCount += 1;
        }
      }
    }

    if (
      storageSelectedModel &&
      type === 'CREATE_WORKSPACE' &&
      storageInputValueByte === 0 &&
      storageSelectedModel &&
      storageSelectedModel.share === 0
    ) {
      validateCount += 1;
    }
    const validateState = { validate: false };
    if (validateCount === 0) {
      validateState.validate = true;
    }

    this.setState(validateState);
  };

  /** ================================================================================
   * Event handler END
   ================================================================================ */

  render() {
    const {
      state,
      props,
      inputHandler,
      numberInputHandler,
      switchHandler,
      calendarHandler,
      calenderDetector,
      calenderMountDetector,
      selectManager,
      multiSelectHandler,
      storageSelectHandler,
      storageInputHandler,
      onSubmit,
    } = this;

    return (
      <WorkspaceFormModal
        {...state}
        {...props}
        inputHandler={inputHandler}
        numberInputHandler={numberInputHandler}
        switchHandler={switchHandler}
        calendarHandler={calendarHandler}
        calenderDetector={calenderDetector}
        calenderMountDetector={calenderMountDetector}
        selectManager={selectManager}
        multiSelectHandler={multiSelectHandler}
        storageSelectHandler={storageSelectHandler}
        onSubmit={onSubmit}
        storageInputHandler={storageInputHandler}
      />
    );
  }
}

export default WorkspaceFormModalContainer;

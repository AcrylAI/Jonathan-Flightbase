import { useState, useEffect } from 'react';

// i18n
import { withTranslation } from 'react-i18next';

// Components
import ModalFrame from '../ModalFrame';
import { InputText, Selectbox, Tooltip } from '@jonathan/ui-react';
import Radio from '@src/components/atoms/input/Radio';
import SearchSelect from '@src/components/molecules/SearchSelect';
import CheckboxList from '@src/components/molecules/CheckboxList';
import MultiText from '@src/components/molecules/MultiText';
import InputBoxWithLabel from '@src/components/molecules/InputBoxWithLabel';
import TrainingTool from '@src/components/organisms/DeploymentType/TrainingType/TrainingTool/TrainingTool';
import ParameterInput from './ParameterInput';
import HPSParameterForm from './HPSParameterForm';

// Utils
import { errorToastMessage } from '@src/utils';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// CSS module
import classNames from 'classnames/bind';
import style from './JobCreateFormModal.module.scss';
const cx = classNames.bind(style);

const JobCreateFormModal = ({
  validate,
  data,
  type: modalType, // modal type
  builtInModelName, // built in model name
  trainingType, // training type
  datasetRootCategory, // dataset root category
  name,
  nameError,
  dataset,
  datasetError,
  datasetOptions,
  datasetCategoryList,
  runcodeName,
  runcodeNameError,
  runcodeOptions,
  // hpsResultOptions,
  // hpsResult,
  loadFile,
  // loadFileOptions,
  // saveFile,
  searchMethod,
  searchMethodOptions,
  hpsParameter,
  hpsParameterError,
  initPoint,
  searchCount,
  interval,
  parameterValues,
  parameterError,
  onAdd,
  onRemove,
  onChangeParameter,
  onChangeBuiltInParameter,
  textInputHandler,
  paramInputHandler,
  imageOptions,
  selectedImage,
  selectInputHandler,
  radioBtnHandler,
  hyperParamRadioBtnHandler,
  addHyperParameter,
  removeHyperParameter,
  hyperParameterInputTextHandler,
  onSubmit,
  onCreateHps,
  searchSelectHandler,
  datasetCategoryHandler,
  additionalFeaturesHandler,
  additionalFeatures,
  hyperParameterDataTypeHandler,
  newDatasetList,
  modelInfo,
  retrainingOption,
  checkpointList,
  checkpoint,
  jobList,
  trainingToolTab,
  trainingToolTabHandler,
  hpsList,
  toolDetailOpenHandler,
  jobDetailOpenList,
  hpsDetailOpenList,
  toolSelectHandler,
  selectedTool,
  hpsLogTable,
  selectedHpsScore,
  selectedToolType,
  toolSortHandler,
  toolSearchValue,
  toolSelectedOwner,
  hpsLogSortHandler,
  selectedHpsId,
  selectedLogId,
  logClickHandler,
  toolModelSearchValue,
  toolModelSortHandler,
  hpsModelList,
  jobModelList,
  hpsModelSelectValue,
  jobModelSelectValue,
  toolModelSelectHandler,
  trainingTypeArrow,
  trainingTypeArrowHandler,
  jobName,
  jobIdx,
  hpsName,
  hpsIdx,
  t,
}) => {
  const [selectedDataset, setSelectedDataset] = useState([]);
  const [selectedDatasetName, setSelectedDatasetName] = useState('');
  const [originData, setOriginData] = useState([]);
  const [newClick, setNewClick] = useState(false);
  const [submitBtn, setSubmitBtn] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [rootData, setRootData] = useState([]);
  const [selectedFileItem, setSelectedFileItem] = useState(null); // item_file_list에서 선택한 값
  const [selectedCheckpoint, setSelectedCheckpoint] = useState([]); // 선택된 checkpoint 아이템 전체
  const [fileListOption, setFileListOption] = useState([]);

  const { submit, cancel } = data;
  const newSubmit = {
    text: submit.text,
    func: async () => {
      if (modalType === 'CREATE_HPS_GROUP' || modalType === 'ADD_HPS') {
        const res = await onCreate();
        return res;
      }
      const res = await onCreate();
      return res;
    },
  };
  let titleTKey = '';
  if (modalType === 'CREATE_JOB') titleTKey = 'createJobForm.title.label';
  else if (modalType === 'CREATE_HPS_GROUP')
    titleTKey = 'createHPSForm.title.label';
  else if (modalType === 'ADD_HPS') titleTKey = 'addHPSForm.title.label';

  const toolOwnerOptions = [
    { label: 'all.label', value: 'toolAll' },
    { label: 'owner', value: 'toolOwner' },
  ];
  /**
   * 데이터셋 하위 인풋 클릭하면 selected라는 키값에 해당 name을 추가해서
   * 백에 보내야 하기 때문에 받은 selected 키에 name 값을 할당하기 위한 함수
   * @param {Array} data
   * @param {Array} indexValue
   * @param {String} selectedValue
   */
  const changeSelectedValue = (data, indexValue, selectedValue) => {
    if (indexValue.length === 0) {
      return null;
    } else if (indexValue.length === 1) {
      data[indexValue[0]].selected = selectedValue;
    } else {
      let copiedIndex = indexValue[0];
      let copiedIndexValue = [...indexValue];
      copiedIndexValue?.shift();
      changeSelectedValue(
        data[copiedIndex]?.children,
        copiedIndexValue,
        selectedValue,
      );
    }
  };

  /**
   * 데이터셋 하위 인풋 클릭 시 newName이라는 새로운 키값 생성하는 함수
   * 백과 주고받기 위해 사용
   * @param {Array} data
   * @param {Array} indexValue 클릭한 값의 인덱스
   * @param {String} selectedValue
   */
  const changeSelectedName = (data, indexValue, selectedValue) => {
    if (indexValue.length === 0) {
      return null;
    } else if (indexValue.length === 1) {
      data[indexValue[0]].newName = selectedValue;
    } else {
      let copiedIndex = indexValue[0];
      let copiedIndexValue = [...indexValue];
      copiedIndexValue?.shift();
      changeSelectedName(
        data[copiedIndex]?.children,
        copiedIndexValue,
        selectedValue,
      );
    }
  };

  /**
   * 데이터셋 하위 generable 체크
   * @param {Object} list
   */
  const checkGenerable = (list) => {
    let valid = true;

    if (list?.name === '/') return true;

    if (list?.generable && list?.selected && list?.selected !== '') {
      if (list?.children?.length > 0) {
        list?.children?.forEach((childrenList) => {
          const result = checkGenerable(childrenList);
          setSubmitBtn(result);
          if (!result) {
            valid = false;
            return false;
          }
        });
      }

      if (!valid) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  // /**
  //  * 선택한 retrainingOption의 전체 데이터를 뽑기위한 함수
  //  * @param {Number} selectId
  //  */
  // const selectedRetrainingOption = (selectId) => {
  //   setSelectedFileItem(null);
  //   const selectedCheckpoint = retrainingOption?.checkpoint_list?.filter(
  //     (list) => list.item_id === selectId,
  //   );
  //   setSelectedCheckpoint(selectedCheckpoint);

  //   const fileListOptions = [];

  //   selectedCheckpoint[0].item_file_list.forEach((fileList) =>
  //     fileListOptions.push({
  //       label: fileList,
  //       value: fileList,
  //     }),
  //   );

  //   setFileListOption(fileListOptions);

  //   // if (fileListOptions.length === 1) {
  //   //   setSelectedFileItem(fileListOptions[0]?.label);
  //   // }
  // };

  /**
   * file list 선택
   * @param {String} fileName
   */
  const fileSelectHandler = (fileName) => {
    setSelectedFileItem({ label: fileName, value: fileName });
  };

  /**
   * 데이터셋 하위들 모두 selected가 있는지 검사
   * @returns boolean
   */
  const onCreate = async () => {
    let parserList = {};
    const createData = [...rootData, ...selectedDataset];

    createData?.forEach((datasetList) => {
      onExtract(datasetList, parserList);
    });

    //check point
    if (retrainingOption?.enable_retraining) {
      // 0 or 1
      const fileRetraining =
        retrainingOption?.checkpoint_load_file_path_parser_retraining;
      const dirRetraining =
        retrainingOption?.checkpoint_load_dir_path_parser_retraining;

      if (
        fileRetraining &&
        fileRetraining !== '' &&
        (jobModelSelectValue !== '' || hpsModelSelectValue !== '')
      ) {
        // parserList[fileRetraining] =
        //   selectedCheckpoint[0]?.item_file_path + selectedFileItem?.label;
        let filePath = '';
        if (trainingToolTab === 0) {
          filePath = `/jf-training-home/job-checkpoints/${jobName}/${jobIdx}/${jobModelSelectValue}`;
        } else {
          filePath = `/jf-training-home/hps-checkpoints/${hpsName}/${hpsIdx}/${selectedLogId}/${hpsModelSelectValue}`;
        }
        parserList[fileRetraining] = filePath;
      }

      if (
        dirRetraining &&
        dirRetraining !== '' &&
        selectedCheckpoint?.length > 0
      ) {
        parserList[dirRetraining] = selectedCheckpoint[0]?.item_dir_path;
      }
    }
    if (modalType === 'CREATE_HPS_GROUP' || modalType === 'ADD_HPS') {
      return await onCreateHps(parserList);
    }

    return await onSubmit(submit.func, parserList);
  };

  /**
   * submit 버튼 데이터셋 부분 활성/비활성 함수
   * @param {Array} list
   */
  const submitBtnCheck = (list) => {
    let result = true;
    if (list?.length === 0) {
      setSubmitBtn(false);
      return null;
    }

    list?.forEach((dataList) => {
      const valid = checkGenerable(dataList);
      if (!valid) {
        result = false;
        setSubmitBtn(false);
        return null;
      }
    });

    setSubmitBtn(result);
  };

  /**
   * 데이터셋 하위 인풋 클릭 시 백과 주고받기 위한 함수
   * @param {Object} selectedName
   * @param {Array} list
   */
  const dataListClickHandler = async (selectedName, list) => {
    const deepCopiedData = JSON.parse(JSON.stringify([...selectedDataset]));
    const validRootData = selectedDataset?.filter((item) => item.name === '/');
    let newSelectedData = [];
    if (validRootData.length === 0) {
      newSelectedData = originData[0]?.data_training_form?.filter(
        (item) => item?.name === '/',
      );
    }

    let testValue = [...newSelectedData, ...deepCopiedData];
    let indexValue = [...list?.temp_index];

    changeSelectedValue(testValue, indexValue, selectedName?.label);

    const body = {
      dataset_id: originData[0].id,
      data_training_form: testValue,
    };
    const response = await callApi({
      url: 'options/data_training_form',
      method: 'POST',
      body,
    });

    const { status, result, error, message } = response;
    if (status === STATUS_SUCCESS) {
      let testValue = JSON.parse(JSON.stringify([...result]));
      let indexValue = [...list?.temp_index];

      changeSelectedName(testValue, indexValue, selectedName?.label);
      setSelectedDataset(testValue);
      submitBtnCheck(testValue);
    } else {
      // 응답이 잘못되면 false
      setSubmitBtn(false);
      errorToastMessage(error, message);
    }
    setNewClick(!newClick);
  };

  /**
   * 리스트 받아서 parser가 있는 것의 selected 추출 함수
   * @param {Object} dataList
   */
  const onExtract = (dataList, bucket) => {
    if (dataList?.name === '/') {
      if (dataList?.argparse && dataList?.argparse !== '') {
        bucket[dataList?.argparse] = '/user_dataset/';
        return null;
      }
    }
    if (dataList?.argparse && dataList?.selected) {
      bucket[
        dataList?.argparse
      ] = `/user_dataset${dataList?.selected_full_path}`;
      if (dataList?.children?.length > 0) {
        dataList?.children?.forEach((list) => {
          onExtract(list, bucket);
        });
      }
    } else if (
      !dataList?.argparse &&
      dataList?.children?.length > 0 &&
      dataList?.selected_full_path !== '' &&
      dataList?.selected_full_path
    ) {
      if (dataList?.children?.length > 0) {
        dataList?.children?.forEach((list) => {
          onExtract(list, bucket);
        });
      }
    } else {
      return false;
    }
  };

  /**
   * 데이터셋 인풋 클릭 핸들러
   * @param {Array} datasetItem
   */
  const datasetClickHandler = (datasetItem) => {
    setSubmitBtn(false);

    const copiedData = JSON.parse(JSON.stringify(newDatasetList));

    const selectedData = copiedData?.filter(
      (item) => item?.name === datasetItem,
    );

    const newSelectedData = selectedData[0]?.data_training_form?.filter(
      (item) => item?.name !== '/',
    );

    const selectedRootData = selectedData[0]?.data_training_form?.filter(
      (item) => item?.name === '/',
    );

    setRootData(selectedRootData);
    setNewClick(!newClick);
    setOriginData(selectedData);
    setSelectedDatasetName(datasetItem);
    setSelectedDataset(newSelectedData);
    submitBtnCheck(newSelectedData);
    if (newSelectedData?.length < 1 && selectedRootData[0]?.generable) {
      setSubmitBtn(true);
    }
  };

  /**
   * 데이터셋 하위 옵션들 리턴 함수
   * @param {Array} options
   */
  const optionMakeHandler = (options) => {
    if (!options) {
      return [];
    }
    if (options?.length > 0) {
      let newOption = [];
      options?.forEach((option, idx) => {
        newOption.push({
          label: option,
          value: idx,
        });
      });
      return newOption;
    } else {
      return [];
    }
  };

  /**
   * 데이터셋 리스트 재귀로 뿌려주는 함수
   * @param {Object, Array} list 뿌려줄 리스트
   * @param {*} bucket html 태그가 포함된 ui 데이터
   * @param {String} sort 처음과 children 구분
   * @param {String} path 처음 선택한 데이터셋
   * @param {Boolean} token placeholder '적합한 폴더..' <-> '상위 폴더..' 구분하기 위한 값
   * @param {Boolean} parentParser 부모에 파서가 있는지
   * @param {String} prevPath 파란색으로 나타내기 위한 경로
   * @param {String} childPath 자식에게 넘겨줄 회색 경로
   * @returns html태그가 포함된 모두 합쳐진 ui 데이터
   */
  const datasetViewHandler = ({
    list,
    bucket,
    sort,
    path,
    token,
    parentParser,
    prevPath,
    childPath,
  }) => {
    let currParser = false; // 현재 파서있으면

    if (!prevPath) {
      prevPath = '';
    }

    if (!path) {
      path = `${selectedDatasetName}`;
    }

    if (list?.argparse && list?.argparse !== '') {
      currParser = true;
    }

    let childrenPath = '';

    if (sort !== 'start' && !bucket) {
      //자식들
      if (list?.newName) {
        childrenPath = list?.newName;
      } else {
        childrenPath = list?.name;
      }

      if (!list?.selected) {
        childrenPath = list?.name;
      } else {
        childrenPath = list?.selected;
      }
      let valid = false;
      let select = false;

      if (list?.data_list?.length === 0 || !list?.data_list) {
        valid = true;
      }

      if (!valid) {
        if (list?.argparse === 0 || !list?.argparse) {
          valid = true;
        }
      }
      if (list?.generable) {
        select = true;
      }

      let parentStatus = false;
      if (sort === 'children' && !token && list?.depth !== 1) {
        parentStatus = true;
      }

      let currValid = false;
      if (!list?.generable && list?.depth !== 1 && token) {
        currValid = true;
      }

      if (list?.depth === 1 && list?.data_list?.length < 1) {
        currValid = true;
      }

      let currParserValid =
        list?.argparse && list?.argparse !== '' ? true : false;

      let currPath = '';
      if (currParserValid) {
        currPath = list?.name;
      }

      let parserValid = prevPath && prevPath !== '' ? true : false;
      let childPathValid = childPath && childPath !== '' ? true : false;

      const newBucket = (
        <>
          <div className={cx('title-wrap')}>
            <div className={cx('left-icon-box')}>
              <span className={cx('prev-path')}>{path}/</span>
              <span className={cx(parentParser ? 'parser-path' : 'prev-path')}>
                {parserValid && prevPath + `/`}
              </span>
              <span className={cx('prev-path')}>
                {childPathValid ? childPath + '/' : ''}
              </span>
              <span className={cx('curr-path')}>
                {currPath !== '' ? currPath : childrenPath}
              </span>
            </div>
            <div className={cx('right-icon-box')}>
              <span
                className={cx(
                  list?.category && list?.category !== ''
                    ? 'dataset-type-box'
                    : 'no-type-box',
                  list?.category_description !== '' &&
                    list?.category_description &&
                    'description-box',
                )}
              >
                {list?.category}
                {list?.category_description !== '' &&
                  list?.category_description && (
                    <span className={cx('description')}>
                      <Tooltip
                        contents={list.category_description}
                        contentsAlign={{ vertical: 'top', horizontal: 'right' }}
                      />
                    </span>
                  )}
              </span>
              <span className={cx(list?.argparse !== null ? 'parse-box' : '')}>
                {list?.argparse !== null && 'parser'}
              </span>
            </div>
          </div>

          <div className={cx('datasest-select-box')}>
            <SearchSelect
              placeholder={
                parentStatus
                  ? 'selectParentFolder.message'
                  : currValid
                  ? 'noMatchFile.message'
                  : 'dataset.placeholder'
              }
              selected={
                !valid && list?.selected
                  ? { label: list?.selected }
                  : select && list?.selected
                  ? { label: list?.selected }
                  : ''
              }
              options={optionMakeHandler(list?.data_list)}
              readOnly={currValid || valid}
              disabledErrorText
              onSelect={(selectItem) => {
                dataListClickHandler(selectItem, list);
              }}
              checkBox={true}
            />
          </div>
        </>
      );
      bucket = newBucket;

      if (currParser) {
        // 현재 parser
        if (parserValid) {
          // prevPath
          if (currParserValid && list?.selected) {
            prevPath = prevPath + '/' + list?.selected;
            childPath = '';
            parentParser = true;
          } else {
            childPath =
              childPath && childPath !== ''
                ? childPath + '/' + currPath
                : currPath;
          }
        } else {
          prevPath = childrenPath;
        }
      } else {
        path = `${path}/${childrenPath}`;
      }

      if (!childPath) {
        childPath = '';
      }
    }

    if (Array.isArray(list) && list?.length > 0) {
      let childrenBucket = [];
      list.forEach((item, idx) => {
        if (idx !== 0) {
          childrenBucket.push(
            <span key={idx}>
              {datasetViewHandler({
                list: item,
                bucket: false,
                sort: 'children',
                path,
                token,
                parentParser,
                prevPath,
                childPath,
              })}
            </span>,
          );
        } else if (idx === 0 && item?.children?.length > 0) {
          let childrenPathBucket = item?.name;
          if (item?.selected && item?.selected !== '') {
            childrenPathBucket = '';
          }
          if (childPath && childPath !== '') {
            childrenPathBucket = childPath;
          }
          let newToken = false;
          if (item?.selected) {
            newToken = true;
          }
          childrenBucket.push(
            <span key={idx}>
              {datasetViewHandler({
                list: item.children[0],
                bucket: false,
                sort: 'children',
                path,
                token: newToken,
                parentParser,
                prevPath,
                childPath: childrenPathBucket,
              })}
            </span>,
          );
        }
      });

      let newBucket = (
        <>
          {bucket}
          {childrenBucket}
        </>
      );
      return newBucket;
    }

    if (list?.children?.length > 0) {
      const objectKeys = Object.keys(list);
      let valid = objectKeys.includes('data_list');
      if (
        list?.children[0]?.data_list?.length === 0 ||
        !list?.children[0]?.data_list ||
        !list?.children[0]?.argparse
      ) {
        valid = true;
      } else {
        valid = false;
      }

      let childrenPath = list?.children[0]?.name;
      if (list?.children[0]?.newName) {
        childrenPath = list?.children[0]?.newName;
        if (!list?.children[0]?.selected) {
          childrenPath = list?.children[0]?.name;
        }
      }

      let generable = list?.children[0]?.generable ? true : false;
      let token = list?.selected ? true : false;
      let currParserValid =
        list?.children[0]?.argparse && list?.children[0]?.argparse !== ''
          ? true
          : false;
      let currPath = '';
      if (currParserValid) {
        currPath = list?.children[0]?.name;
      }
      if (!parentParser) {
        parentParser =
          list?.argparse && list?.argparse !== '' && list?.selected
            ? true
            : false;
      }
      let childPathValid = childPath && childPath !== '' ? true : false;

      const newBucket = (
        <>
          {bucket}
          <div className={cx('title-wrap')}>
            <div className={cx('left-icon-box')}>
              <span className={cx('prev-path')}>{path}/</span>
              <span className={cx(parentParser ? 'parser-path' : 'prev-path')}>
                {prevPath && prevPath !== '' ? prevPath + '/' : ''}
              </span>
              <span className={cx('prev-path')}>
                {childPathValid ? childPath + '/' : ''}
              </span>
              <span className={cx('curr-path')}>
                {currPath !== '' ? currPath : childrenPath}
              </span>
            </div>
            <div className={cx('right-icon-box')}>
              <span
                className={cx(
                  list?.children[0]?.category &&
                    list?.children[0]?.category !== ''
                    ? 'dataset-type-box'
                    : 'no-type-box',
                  list?.children[0]?.category_description !== '' &&
                    list?.children[0]?.category_description &&
                    'description-box',
                )}
              >
                {list?.children[0]?.category}
                {list?.children[0]?.category_description !== '' &&
                  list?.children[0]?.category_description && (
                    <span className={cx('description')}>
                      <Tooltip
                        contents={list.children[0].category_description}
                        contentsAlign={{ vertical: 'top', horizontal: 'right' }}
                      />
                    </span>
                  )}
              </span>
              <span
                className={cx(
                  list?.children[0]?.argparse !== null ? 'parse-box' : '',
                )}
              >
                {list?.children[0]?.argparse !== null && 'parser'}
              </span>
            </div>
          </div>

          <div className={cx('datasest-select-box')}>
            <SearchSelect
              placeholder={
                !token
                  ? 'selectParentFolder.message'
                  : !generable && valid
                  ? 'noMatchFile.message'
                  : 'dataset.placeholder'
              }
              selected={
                generable && list?.children[0]?.selected //? generable trur or false
                  ? { label: list?.children[0]?.selected }
                  : !valid && list?.children[0]?.selected
                  ? { label: list?.children[0]?.selected }
                  : ''
              }
              options={optionMakeHandler(list?.children[0]?.data_list)}
              readOnly={valid}
              disabledErrorText
              onSelect={(selectItem) => {
                dataListClickHandler(selectItem, list?.children[0]);
              }}
              checkBox={true}
            />
          </div>
        </>
      );
      if (!generable && valid) {
        token = false;
      }
      if (list?.selected) {
        token = true;
      }
      if (
        parentParser &&
        currParserValid &&
        list?.children[0]?.selected &&
        list?.children[0]?.children?.length > 0
      ) {
        prevPath = prevPath + '/' + list?.children[0]?.selected;
      } else if (
        parentParser &&
        currParserValid &&
        !list?.children[0]?.selected
      ) {
        childPath =
          childPath !== '' ? childPath + '/' + childrenPath : childrenPath;
      } else {
        if (!childPath) {
          childPath = '';
          childPath = childrenPath;
        } else {
          childPath = childPath + '/' + childrenPath;
        }
      }
      if (!list?.children[0]?.children?.length > 0) {
        childPath = '';
      }
      return datasetViewHandler({
        list: list?.children,
        bucket: newBucket,
        sort: 'start',
        path,
        token,
        parentParser,
        prevPath,
        childPath,
      });
    } else {
      return bucket;
    }
  };

  /**
   * 데이터셋 뿌려줄 데이터 맵핑 함수
   * @param {Array} list 데이터셋 목록 데이터
   */
  const listHandler = (list) => {
    const newList = list?.filter((item) => item.name !== '/');
    let result = [];
    if (newList?.length > 0) {
      newList?.forEach((data, idx) => {
        result.push(
          // unique key
          <div key={idx} className={cx('sort-box')}>
            {datasetViewHandler({ list: data })}
          </div>,
        );
      });
      setDataList(result);
    }
  };

  useEffect(() => {
    listHandler(selectedDataset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newClick]);
  const dataTrainingForm = modelInfo?.data_training_form;

  return (
    <ModalFrame
      submit={newSubmit}
      cancel={cancel}
      type={modalType}
      validate={validate && submitBtn}
      isResize={true}
      isMinimize={true}
      title={`${t(titleTKey)}${
        trainingType === 'built-in' ? ` - ${builtInModelName}` : ''
      }`}
    >
      <h2 className={cx('title')}>
        {t(titleTKey)}
        {`${trainingType === 'built-in' ? ` - ${builtInModelName}` : ''}`}
      </h2>
      <div className={cx('form')}>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={
              modalType === 'CREATE_JOB'
                ? t('jobName.label')
                : t('hpsName.label')
            }
            labelSize='large'
            errorMsg={t(nameError)}
          >
            <InputText
              size='large'
              placeholder={
                modalType === 'CREATE_JOB'
                  ? t('jobName.placeholder')
                  : t('hpsName.placeholder')
              }
              value={name}
              name='name'
              onChange={textInputHandler}
              onClear={() =>
                textInputHandler({ target: { value: '', name: 'name' } })
              }
              status={nameError ? 'error' : 'default'}
              options={{ maxLength: 50 }}
              isReadOnly={modalType === 'ADD_HPS'}
              isLowercase
              disableLeftIcon
              disableClearBtn={false}
              autoFocus
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('dockerImage.label')}
            labelSize='large'
          >
            <Selectbox
              size='large'
              placeholder={t('dockerImage.placeholder')}
              list={imageOptions}
              selectedItem={selectedImage}
              onChange={(v) => {
                selectInputHandler('selectedImage', v);
              }}
              customStyle={{
                fontStyle: {
                  selectbox: {
                    color: '#121619',
                    textShadow: 'None',
                  },
                },
              }}
            />
          </InputBoxWithLabel>
        </div>
        {trainingType === 'built-in' ? (
          <>
            <div className={cx('float-box', 'dataset-category')}>
              <div className={cx('dataset-title')}>{t('dataset.label')}</div>
              <span>{selectedDatasetName}</span>
              <span
                className={cx(
                  dataTrainingForm[0]?.category &&
                    dataTrainingForm[0]?.category !== ''
                    ? 'dataset-type-box'
                    : 'no-type-box',
                  dataTrainingForm[0]?.category_description &&
                    dataTrainingForm[0]?.category_description !== '' &&
                    'description-box',
                )}
              >
                {/* {selectedDataset} */}
                {dataTrainingForm[0]?.category}
                {dataTrainingForm[0]?.category_description &&
                  dataTrainingForm[0]?.category_description !== '' && (
                    <span className={cx('description')}>
                      <Tooltip
                        contents={dataTrainingForm[0]?.category_description}
                        contentsAlign={{ vertical: 'top', horizontal: 'left' }}
                      />
                    </span>
                  )}
              </span>
              <span
                className={cx(
                  dataTrainingForm[0]?.argparse !== null ? 'parse-box' : '',
                )}
              >
                {dataTrainingForm[0]?.argparse !== null && 'parser'}
              </span>
              <div className={cx('datasest-select-box')}>
                {/* catch */}
                <Selectbox
                  test='test'
                  size='large'
                  type='search'
                  status={datasetError ? 'error' : 'default'}
                  placeholder={t('dataset.placeholder')}
                  selectedItem={
                    selectedDatasetName &&
                    (() => {
                      const fIdx = datasetOptions.findIndex(
                        (v) => v.label === selectedDatasetName,
                      );
                      return {
                        label: selectedDatasetName,
                        value: fIdx === -1 ? 0 : datasetOptions[fIdx].value,
                      };
                    })()
                  }
                  list={datasetOptions}
                  onChange={(selectItem) => {
                    datasetClickHandler(selectItem?.label);
                    searchSelectHandler(selectItem, 'dataset');
                  }}
                  isShowStatusCheck={true}
                  customStyle={{
                    fontStyle: {
                      selectbox: {
                        color: '#121619',
                        textShadow: 'None',
                      },
                    },
                  }}
                />
              </div>
              <div>
                {datasetError === '' &&
                  datasetCategoryList.map(
                    (
                      {
                        category,
                        options,
                        selected,
                        selectedError,
                        name: categoryName,
                      },
                      key,
                    ) =>
                      categoryName !== '/' && (
                        <div
                          className={cx('float-box', 'dataset-category')}
                          key={key}
                        >
                          <div className={cx('dataset-input-type-box')}>
                            <InputText
                              size='large'
                              value={category}
                              name='datasetRootCategory'
                              onChange={() => {}}
                              isReadOnly={true}
                            />
                          </div>
                          <div className={cx('datasest-select-box')}>
                            <Selectbox
                              size='large'
                              type='search'
                              status={selectedError ? 'error' : 'default'}
                              selectedItem={selected}
                              list={options}
                              placeholder={t('dataset.placeholder')}
                              onChange={(selectItem) => {
                                datasetCategoryHandler(key, selectItem);
                              }}
                              customStyle={{
                                fontStyle: {
                                  selectbox: {
                                    color: '#121619',
                                    textShadow: 'None',
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      ),
                  )}
              </div>
              {/**----------------- */}
              {selectedDataset?.length !== 0 && datasetError === '' ? (
                <span className={cx('dataset-error', 'dataset-form-rule')}>
                  {t('datasetFormRule.message')}
                </span>
              ) : (
                <span className={cx('dataset-error')}>{datasetError}</span>
              )}
              {dataList}
            </div>
            {checkpointList.length > 0 && retrainingOption?.enable_retraining && (
              <div className={cx('row', 'check-point-box')}>
                <div
                  className={cx(
                    fileListOption.length > 0 && 'check-point-content',
                  )}
                >
                  <InputBoxWithLabel
                    labelText={t('checkpoint.label')}
                    labelSize='large'
                    disableErrorMsg={fileListOption.length > 0}
                  >
                    <div className={cx('checkpoint-border')}>
                      <TrainingTool
                        trainingToolTab={trainingToolTab}
                        trainingToolTabHandler={trainingToolTabHandler}
                        hpsList={hpsList}
                        jobList={jobList}
                        toolDetailOpenHandler={toolDetailOpenHandler}
                        jobDetailOpenList={jobDetailOpenList}
                        toolSelectHandler={toolSelectHandler}
                        hpsDetailOpenList={hpsDetailOpenList}
                        trainingType={trainingType}
                        toolOwnerOptions={toolOwnerOptions}
                        selectedTool={selectedTool}
                        selectedToolType={selectedToolType}
                        hpsLogTable={hpsLogTable}
                        selectedHpsScore={selectedHpsScore}
                        toolSortHandler={toolSortHandler}
                        toolSearchValue={toolSearchValue}
                        toolSelectedOwner={toolSelectedOwner}
                        hpsLogSortHandler={hpsLogSortHandler}
                        selectedHpsId={selectedHpsId}
                        selectedLogId={selectedLogId}
                        logClickHandler={logClickHandler}
                        toolModelSearchValue={toolModelSearchValue}
                        toolModelSortHandler={toolModelSortHandler}
                        hpsModelList={hpsModelList}
                        jobModelList={jobModelList}
                        jobModelSelectValue={jobModelSelectValue}
                        hpsModelSelectValue={hpsModelSelectValue}
                        toolModelSelectHandler={toolModelSelectHandler}
                        trainingTypeArrow={trainingTypeArrow}
                        trainingTypeArrowHandler={trainingTypeArrowHandler}
                        t={t}
                        // readOnly={readOnly}
                      />
                    </div>
                  </InputBoxWithLabel>
                </div>
                {selectedCheckpoint.length > 0 && (
                  <InputBoxWithLabel error={t(runcodeNameError)}>
                    <Selectbox
                      size='large'
                      type='search'
                      status={runcodeNameError ? 'error' : 'default'}
                      selectedItem={selectedFileItem}
                      list={fileListOption}
                      onChange={(selectItem) => {
                        fileSelectHandler(selectItem.label);
                      }}
                      placeholder={t('fileListSelect.placeholder')}
                      customStyle={{
                        globalForm: {
                          marginTop: '10px',
                        },
                        fontStyle: {
                          selectbox: {
                            color: '#121619',
                            textShadow: 'None',
                          },
                        },
                      }}
                    />
                  </InputBoxWithLabel>
                )}
              </div>
            )}
          </>
        ) : (
          <div>
            <InputBoxWithLabel
              labelText={t('dataset.label')}
              labelSize='large'
              errorMsg={t(datasetError)}
            >
              <Selectbox
                size='large'
                type='search'
                status={datasetError ? 'error' : 'default'}
                selectedItem={dataset}
                list={datasetOptions}
                placeholder={t('dataset.placeholder')}
                onChange={(selectItem) => {
                  searchSelectHandler(selectItem, 'dataset');
                  setSubmitBtn(true);
                }}
                customStyle={{
                  fontStyle: {
                    selectbox: {
                      color: '#121619',
                      textShadow: 'None',
                    },
                  },
                }}
              />
            </InputBoxWithLabel>
          </div>
        )}
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('runCode.label')}
            labelSize='large'
            errorMsg={t(runcodeNameError)}
          >
            <Selectbox
              size='large'
              type='search'
              status={runcodeNameError ? 'error' : 'default'}
              placeholder={t('runCode.placeholder')}
              list={runcodeOptions}
              selectedItem={runcodeName}
              onChange={(selectItem) => {
                searchSelectHandler(selectItem, 'runcodeName');
              }}
              isReadOnly={runcodeName && trainingType === 'built-in'}
              customStyle={{
                fontStyle: {
                  selectbox: {
                    color: '#121619',
                    textShadow: 'None',
                  },
                },
              }}
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <CheckboxList
            label='additionalFeatures.label'
            options={additionalFeatures}
            onChange={(_, idx) => additionalFeaturesHandler(idx)}
            optional
          />
        </div>
        {(modalType === 'CREATE_HPS_GROUP' || modalType === 'ADD_HPS') && (
          <>
            <div className={cx('row', 'search-method-row')}>
              <InputBoxWithLabel
                labelText={t('hpsMethod.label')}
                labelSize='large'
                disableErrorMsg
              />
              <Radio
                options={searchMethodOptions}
                name='searchMethod'
                value={searchMethod}
                onChange={radioBtnHandler}
              />
            </div>
            <HPSParameterForm
              loadFile={loadFile}
              trainingType={trainingType}
              searchMethod={searchMethod}
              hpsParameter={hpsParameter}
              initPoint={initPoint}
              searchCount={searchCount}
              interval={interval}
              paramInputHandler={paramInputHandler}
              hyperParamRadioBtnHandler={hyperParamRadioBtnHandler}
              addHyperParameter={addHyperParameter}
              removeHyperParameter={removeHyperParameter}
              hyperParameterInputTextHandler={hyperParameterInputTextHandler}
              hyperParameterDataTypeHandler={hyperParameterDataTypeHandler}
              error={hpsParameterError}
              modalType={modalType}
              t={t}
            />
          </>
        )}
        {modalType === 'CREATE_JOB' && (
          <div className={cx('row')}>
            {trainingType === 'built-in' ? (
              <ParameterInput
                label='parameters.label'
                multiValues={parameterValues}
                onChange={onChangeBuiltInParameter}
                onAdd={onAdd}
                name='params'
                onRemove={onRemove}
                error={parameterError}
              />
            ) : (
              <MultiText
                label='parameters.label'
                multiValues={parameterValues}
                onChange={onChangeParameter}
                onAdd={onAdd}
                name='params'
                onRemove={onRemove}
                error={parameterError}
              />
            )}
          </div>
        )}
      </div>
    </ModalFrame>
  );
};

export default withTranslation()(JobCreateFormModal);

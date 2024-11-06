import { useCallback, useEffect, useState } from 'react';

import { Modal } from '@jonathan/ui-react';

// i18n
import { useTranslation } from 'react-i18next';

// Network
import { deepCopy } from '@src/utils/utils';

function RoundModal({ data, type }) {
  const { t } = useTranslation();

  const { headerRender, contentRender, footerRender, contentData, submit } =
    data;

  const [seedModelData, setSeedModelData] = useState(null);
  const [trainingData, setTrainingData] = useState(null);
  const [aggregationData, setAggregationData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [roundGroupName, setRoundGroupName] = useState(null);
  const [roundName, setRoundName] = useState(null);
  const [trainingHyperParameter, setTrainingHyperParameter] = useState(null);
  const [selectedClientCheckbox, setSelectedClientCheckbox] = useState([]);
  const [totalRoundCount, setTotalRoundCount] = useState(null);
  const [createdRoundName, setCreatedRoundName] = useState(null);
  const [defaultSelectedRound, setDefaultSelectedRound] = useState(null);
  const [aggregationParameter, setAggregationParamter] = useState(null);
  const [systemParameter, setSystemParameter] = useState(null);
  const [roundStartButtonDisabled, setRoundStartbuttonDisabled] =
    useState(false);
  const [aggregationCheckedValue, setAggregationCheckedValue] = useState(0); // 모델 합성 방법
  const [hpsMethod, setHpsMethod] = useState(0);
  const [hpsCount, setHpsCount] = useState(10);

  /**
   *
   * @param {*} model 마지막 라운드 데이터 정보
   * 시드모델 SelectBox가 default로 마지막 데이터를 가지고 있어야 하므로
   * 미리 roundGroupName과 roundName을 넣어주어야 한다.
   */
  const setDefaultSeedModel = (seedDataLists) => {
    const lastModel = seedDataLists[seedDataLists.length - 1];
    if (lastModel) {
      setDefaultSelectedRound(lastModel);
      setRoundGroupName(lastModel.roundGroupName);
      setRoundName(lastModel.roundName);
    }
  };

  /**
   * Seed Model data
   * [{ key: value}] create function
   */
  const makeSeedModelData = useCallback(() => {
    const labelData = [];
    const seedDataLists = contentData.seed_model_list;

    seedDataLists?.forEach((seedDataList, index) => {
      let list = {
        label: `Round #${seedDataList.round_name} | `,
        value: index,
        roundGroupName: seedDataList.round_group_name,
        roundName: seedDataList.round_name,
      };
      const metricsKeyList = Object.keys(seedDataList.metrics);
      for (let i = 0; i < metricsKeyList.length; i++) {
        let label = `${metricsKeyList[i]}: ${
          seedDataList.metrics[metricsKeyList[i]]
        }`;
        if (metricsKeyList.length !== i + 1) {
          label = label + ', ';
        }
        list.label += label;
      }
      labelData.push(list);
    });
    setDefaultSeedModel(labelData);
    setSeedModelData(labelData);
  }, [contentData.seed_model_list]);

  /**
   * Training Hyper Parameter data
   * [{
   *  key: value
   *  defaultValue: value
   *  description:value
   * }]
   */
  const makeTrainingData = useCallback(() => {
    const trainingDatas = contentData.training_hyperparameter.hyperparameter;
    const training = [];
    let defaultTrainingData = {};
    for (let trainingDataKey in trainingDatas) {
      let list = {
        key: trainingDataKey,
        defaultValue: trainingDatas[trainingDataKey].default,
        description: trainingDatas[trainingDataKey].description,
      };
      training.push(list);
      Object.assign(defaultTrainingData, {
        [trainingDataKey]: trainingDatas[trainingDataKey].default,
      });
    }
    setTrainingData(training);
    setTrainingHyperParameter(defaultTrainingData);
  }, [contentData.training_hyperparameter.hyperparameter]);

  /**
   * Aggregation Method(모델 합성 방법) -> Custom Patameter
   * 모델 집계 하이퍼 파라미터 데이터
   * [{
   *  key: value
   *  defaultValue: value
   *  description:value
   * }]
   */
  const makeAggregationData = useCallback(() => {
    const aggregationDatas =
      contentData.aggregation_parameter.aggregation_custom_parameter;
    const aggregation = [];
    const systemParameters =
      contentData.training_hyperparameter.system_parameter;
    for (let aggregationDataKey in aggregationDatas) {
      let list = {
        key: aggregationDataKey,
        defaultValue: aggregationDatas[aggregationDataKey].default,
        description: aggregationDatas[aggregationDataKey].description,
      };
      aggregation.push(list);
    }
    const system = {};
    for (let systemParameter in systemParameters) {
      Object.assign(system, {
        [systemParameter]: systemParameters[systemParameter].default,
      });
    }
    setAggregationData(aggregation);
    makeAggragtionParamter(aggregation);
    setSystemParameter(system);
  }, [
    contentData.aggregation_parameter.aggregation_custom_parameter,
    contentData.training_hyperparameter.system_parameter,
  ]);

  const makeAggragtionParamter = (arr) => {
    let parameter = {};
    arr.forEach((data) => {
      let k = data.key;
      Object.assign(parameter, { [k]: data.defaultValue });
    });
    setAggregationParamter(parameter);
  };

  /**
   * custom Parameter  값 변경 & 서버에 보낼 데이터 생성
   */
  const changeAggregationData = (e, data) => {
    let arr = [...aggregationData];
    arr.map(
      (data1) =>
        data1.key === data.key && (data1.defaultValue = e.target.value),
    );
    setAggregationData(arr);
    makeAggragtionParamter(arr);
  };
  /**
   * default selected ClientList
   * @param {*} clientLists
   */
  const makeDefaultClient = (clientLists) => {
    let checkArr = [];
    clientLists?.forEach((clientList, index) => {
      if (clientList.ready) {
        checkArr[index] = true;
      } else {
        checkArr[index] = false;
      }
    });
    setSelectedClientCheckbox(checkArr);
  };

  useEffect(() => {
    makeSeedModelData();
    makeTrainingData();
    makeAggregationData();
    setClientData(contentData.clinet_list);
    setCreatedRoundName(contentData.round_name);
    makeDefaultClient(contentData.clinet_list);
  }, [contentData, makeAggregationData, makeSeedModelData, makeTrainingData]);

  const requireValidation = useCallback(() => {
    const unCheckedClientCount = selectedClientCheckbox?.filter(
      (data) => !data,
    ).length;
    const checkTraining = Object.keys(trainingHyperParameter).filter(
      (data) => trainingHyperParameter[data] === '',
    );
    if (
      checkTraining.length > 0 ||
      unCheckedClientCount === selectedClientCheckbox.length
    ) {
      setRoundStartbuttonDisabled(true);
    } else {
      setRoundStartbuttonDisabled(false);
    }
  }, [selectedClientCheckbox, trainingHyperParameter]);

  useEffect(() => {
    trainingHyperParameter && requireValidation();
  }, [requireValidation, selectedClientCheckbox, trainingHyperParameter]);

  const changeSeedModel = (model) => {
    setRoundGroupName(model.roundGroupName);
    setRoundName(model.roundName);
  };

  const changeTrainingHyperParameters = (dataKey, data) => {
    setTrainingHyperParameter({
      ...trainingHyperParameter,
      [dataKey]: data.target.value,
    });
  };

  const changeSelectedClient = (idx, data) => {
    const copySelectedClient = deepCopy(selectedClientCheckbox);
    copySelectedClient[idx] = !copySelectedClient[idx];
    setSelectedClientCheckbox(copySelectedClient);
  };

  const onClickStartRound = async () => {
    const clientAddressList = [];
    clientData.forEach((data, index) => {
      if (selectedClientCheckbox[index]) clientAddressList.push(data.address);
    });
    const data = {
      seed_model_round_group_name: roundGroupName,
      seed_model_round_name: roundName,
      training_hyperparameter: {
        hyperparameter: trainingHyperParameter,
        dataset_parameter: { data_root: '/federated-learning-dataset' },
        system_parameter: systemParameter,
      },
      aggregation_custom_parameter: aggregationParameter,
      client_address_list: clientAddressList,
      training_local_model_selection: 0,
      aggregation_method: aggregationCheckedValue,
      global_model_broadcasting_mode: 0,
    };
    if (aggregationCheckedValue === 0) {
      data.hyperparamsearch_method = hpsMethod;
      data.hyperparamsearch_search_count = hpsCount;
    }
    submit(data, totalRoundCount);
  };

  const changeTotalRoundCount = (e) => {
    setTotalRoundCount(e.value);
  };

  const changeAggregationMethodHandler = (e) => {
    setAggregationCheckedValue(Number(e.target.value));
  };

  const changeHpsMethodHandler = (e) => {
    setHpsMethod(Number(e.target.value));
  };

  const changeHpsCountHandler = (e) => {
    setHpsCount(e.value);
  };

  return (
    <>
      <Modal
        theme='jp-dark'
        HeaderRender={headerRender}
        ContentRender={contentRender}
        FooterRender={footerRender}
        headerProps={{
          type,
          createdRoundName,
          t,
        }}
        headerStyle={{
          padding: '0px',
        }}
        contentStyle={{
          padding: '0px',
        }}
        topAnimation='50px'
        windowStyle={{ width: '520px' }}
        contentProps={{
          seedModelData,
          trainingData,
          aggregationData,
          clientList: clientData,
          selectedClientCheckbox,
          totalRoundCount,
          defaultSelectedRound,
          trainingHyperParameter,
          aggregationCheckedValue,
          hpsMethod,
          changeSeedModel,
          changeTrainingHyperParameters,
          changeSelectedClient,
          changeAggregationData,
          changeTotalRoundCount,
          changeAggregationMethodHandler,
          changeHpsMethodHandler,
          changeHpsCountHandler,
          t,
        }}
        footerProps={{
          createdRoundName,
          roundStartButtonDisabled,
          onClickStartRound,
          t,
        }}
      />
    </>
  );
}

export default RoundModal;

import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import _ from 'lodash';

//Components
import RoundPageContents from '@src/components/pageContents/RoundPageContents/RoundPageContents';
import RoundModalContents from '@src/components/pageContents/RoundPageContents/RoundModal/RoundModalContents';
import RoundModalHeader from '@src/components/pageContents/RoundPageContents/RoundModal/RoundModalHeader/RoundModalHeader';
import RoundModalFooter from '@src/components/pageContents/RoundPageContents/RoundModal/RoundModalFooter';
import { toast } from '@src/components/uiContents/Toast';

// Custom hooks
import { useTrie } from '@jonathan/react-utils';

// moduls
import { closeModal, openModal } from '@src/store/modules/modal';
import { MODAL_CREATE_ROUND, MODAL_STOP_ROUND } from '@src/utils/types';

// utils
import { deepCopy } from '@src/utils/utils';

// i18n
import { useTranslation } from 'react-i18next';

// API hooks
import useOpenRoundModal from './hooks/api/useOpenRoundModal';
import useRequestStageData from './hooks/api/useRequestStageData';
import useRequestRoundTable from './hooks/api/useRequestRoundTable';
import useCreateRound from './hooks/api/useCreateRound';
import usePostAutoRun from './hooks/api/usePostAutoRun';
import useStopRound from './hooks/api/useStopRound';
import useEditDescription from './hooks/api/useEditDescription';

function RoundsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const dashboardRoute = history.location?.state?.dashboard;
  const [keyMetrics, setKeyMetrics] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [stageData, setStageData] = useState([]);
  const [prevStageData, setPrevStageData] = useState(null);
  const [currStatus, setCurrStatus] = useState(0);
  const [roundProgressTotalCount, setRoundProgressTotalCount] = useState(null);
  const [roundProgressCurrentCount, setRoundProgressCurrentCount] =
    useState(null);
  // 필터용 테이블 데이터
  const [dynamicTableData, setDynamicTableData] = useState([]);

  const onStopRound = async () => {
    const response = await stopRoundQuery.onMutateAsync({});
    const { status } = response;
    status === 200 && dispatch(closeModal(MODAL_STOP_ROUND));
  };

  const trie = useTrie(
    (() => {
      let trieForm = [];

      tableData.forEach((data, index1) => {
        Object.keys(data).forEach((d, index2) => {
          if (
            d !== 'round_group_name' &&
            d !== 'round_status' &&
            d !== 'seed_model_round_group_name' &&
            d !== 'seed_model_round_name'
          ) {
            if (d === 'metrics' && data[d]) {
              Object.keys(data[d][d]).forEach((m, index3) => {
                const s = String(data[d][d][m]);
                if (s) {
                  trieForm.push({
                    key: `${index1}-${index2}-${index3}`,
                    label: s,
                  });
                }
              });
            } else if (data[d]) {
              trieForm.push({
                key: `${index1}-${index2}`,
                label: data[d],
              });
            }
          }
        });
      });
      return trieForm;
    })(),
  );

  const onStopRoundModal = () => {
    dispatch(
      openModal({
        modalType: MODAL_STOP_ROUND,
        modalData: {
          onCancel: () => {
            dispatch(closeModal(MODAL_STOP_ROUND));
          },
          onStop: () => {
            onStopRound();
          },
        },
      }),
    );
  };

  /**
   * Round 상세 페이지로 이동
   */
  const onMoveToRoundDetailPage = useCallback(
    (id, groupId) => {
      history.push({
        pathname: `/rounds/${id}/rounds`,
        state: {
          groupId,
        },
      });
    },
    [history],
  );

  /**
   * data table 필터링
   */
  const onFilterDataTable = (inputed) => {
    if (!inputed) {
      setDynamicTableData([...tableData]);
      return;
    }

    let newTable = [];
    const tableDictionary = new Set();
    const filter = trie.containList(inputed);
    filter.sort((a, b) => a.key - b.key);
    filter.forEach((data) => {
      const { key } = data;
      const idx = key[0];

      if (!tableDictionary.has(idx)) {
        tableDictionary.add(idx);
        newTable = [...newTable, tableData[idx]];
      }
    });
    setDynamicTableData(newTable);
  };

  const getTableData = useCallback(async (result) => {
    if (result) {
      setKeyMetrics(result.key_metrics);
      setTableData(result.list);
      setDynamicTableData(result.list);
      if (result.list.length > 0) {
        const roundStage = result.list[0]?.round_stage;
        setCurrStatus(roundStage);
      }
    }
  }, []);

  /**
   * round 생성 모달 submit
   */
  const onCreateRound = async (data, totalRoundCount) => {
    const response = await createRoundQuery.onMutateAsync({
      body: data,
    });
    const { status } = response.data;
    status === 1 && roundAutoRun(totalRoundCount);
    status === 1 && (await useRequestStageDataQuery.onRefetch());
    status === 0 && roundAlreadyRuning();
  };

  const roundAlreadyRuning = () => {
    toast.error(t('round.toast.roundCreateError.message'));
    dispatch(closeModal(MODAL_CREATE_ROUND));
  };

  const roundAutoRun = async (totalRoundCount) => {
    const response = await postAutoRunQuery.onMutateAsync({
      body: {
        number_of_trial: totalRoundCount || 1,
      },
    });
    const { status } = response;
    status === 200 && showToastMessage();
  };

  const showToastMessage = () => {
    dispatch(closeModal(MODAL_CREATE_ROUND));
    toast.success(t('round.toast.roundCreateSuccess.message'));
  };

  const onOpenRoundModal = async (response) => {
    const { result, status } = response.data;
    if (status === 1) {
      dispatch(
        openModal({
          modalType: MODAL_CREATE_ROUND,
          modalData: {
            headerRender: RoundModalHeader,
            contentRender: RoundModalContents,
            contentData: result,
            footerRender: RoundModalFooter,
            submit: (data, totalRoundCount) => {
              dispatch(closeModal(MODAL_CREATE_ROUND));
              onCreateRound(data, totalRoundCount);
            },
          },
        }),
      );
    } else {
      toast.error(`${t('roundCreate.error.message')}`);
    }
  };

  /* stage 데이터가 변했을 때 테이블 라운드 데이터 재 요청 */
  const getStageData = async (response) => {
    if (response.data.result.empty) {
      setStageData(null);
    } else {
      const { result } = response.data;
      setStageData(result);
      if (!_.isEqual(result, prevStageData)) {
        const { number_of_trial, current_trial } = result.auto_run;
        setRoundProgressTotalCount(number_of_trial);
        setRoundProgressCurrentCount(current_trial);
        setPrevStageData(deepCopy(result));
        await requestRoundTable.onRefetch();
      }
    }
    return true;
  };

  const openRoundModalQuery = useOpenRoundModal({
    dashboardRoute,
    onOpenRoundModal,
  });

  // 테이블 메모 수정
  const putDescription = useEditDescription();
  // 테이블 데이터 요청
  const requestRoundTable = useRequestRoundTable({ getTableData });

  /**
   * 메모 수정
   * @param {String} groupName
   * @param {String} roundName
   * @param {String} description
   */
  const descriptionHandler = useCallback(
    async ({ groupName, roundName, description }) => {
      const {
        data: { status, message },
      } = await putDescription.onMutateAsync({
        body: {
          round_group_name: groupName,
          round_name: roundName,
          description,
        },
      });
      if (status === 0) {
        toast.error(message);
        return;
      }

      toast.success(message);
      requestRoundTable.onRefetch();
    },
    [putDescription, requestRoundTable],
  );

  // stage, flow 데이터 요청
  const useRequestStageDataQuery = useRequestStageData({ getStageData });
  const createRoundQuery = useCreateRound();
  const postAutoRunQuery = usePostAutoRun();
  const stopRoundQuery = useStopRound();

  return (
    <>
      <RoundPageContents
        onFilterDataTable={onFilterDataTable}
        onMoveToRoundDetailPage={onMoveToRoundDetailPage}
        onOpenRoundModal={() => openRoundModalQuery.onRefetch()}
        onStopRoundModal={onStopRoundModal}
        keyMetrics={keyMetrics}
        tableData={dynamicTableData}
        stageData={stageData}
        currStatus={currStatus}
        t={t}
        roundProgressCurrentCount={roundProgressCurrentCount}
        roundProgressTotalCount={roundProgressTotalCount}
        descriptionHandler={descriptionHandler}
      />
    </>
  );
}

export default RoundsPage;

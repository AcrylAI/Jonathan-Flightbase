import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import ModelsPageContents from '@src/components/pageContents/ModelsPageContents';
import { toast } from '@src/components/uiContents/Toast';

// ModalContents
import BroadcastModelModalHeader from '@src/components/pageContents/ModelsPageContents/BroadcastModelModal/BroadcastModelModalHeader';
import BroadcastModelModalContents from '@src/components/pageContents/ModelsPageContents/BroadcastModelModal/BroadcastModelModalContents';
import BroadcastModelModalFooter from '@src/components/pageContents/ModelsPageContents/BroadcastModelModal/BroadcastModelModalFooter';

// moduls
import { closeModal, openModal } from '@src/store/modules/modal';

// Custom hooks
import { useTrie } from '@jonathan/react-utils';

// Modal types
import { MODAL_BROADCAST_MODEL, MODAL_EDIT_MEMO } from '@src/utils/types';
import useOpenBroadcastingModel from './hooks/api/useOpenBroadcastingModel';
import useRequestModelData from './hooks/api/useRequestModelData';
import useRequestBroadcastModel from './hooks/api/useRequestBroadcastModel';
import useRequestEditMemo from './hooks/api/useRequestEditMemo';
import useRequestDownloadModel from './hooks/api/useRequestDownloadModel';

function ModelsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();

  // 전체 테이블 데이터
  const [staticTableData, setStaticTableData] = useState([]);
  // 필터용 테이블 데이터
  const [dynamicTableData, setDynamicTableData] = useState([]);
  const [modelsTableResponse, setModelsTableResponse] = useState(null);

  const trie = useTrie(
    (() => {
      let trieForm = [];
      staticTableData.forEach((data, index) => {
        Object.keys(data).forEach((d) => {
          if (d !== 'round_group_name') {
            if (d === 'metrics') {
              Object.keys(data[d]).forEach((m) => {
                trieForm.push({
                  key: index,
                  label: data.metrics[m].toString(),
                });
              });
            } else {
              trieForm.push({
                key: index,
                label: data[d],
              });
            }
          }
        });
      });
      return trieForm;
    })(),
  );

  /**
   * 모델 테이블 데이터
   */
  useEffect(() => {
    if (!modelsTableResponse) return;
    const { result, status, message } = modelsTableResponse;
    if (status === 1) {
      if (result.list) {
        const data = result.list.map((v, idx) => {
          return { ...v, index: idx };
        });
        const staticData = [...data];
        setDynamicTableData(data);
        setStaticTableData(staticData);
      }
    } else {
      toast.error('Server Error', message);
    }
  }, [modelsTableResponse]);

  /**
   * data table 필터링
   */
  const onFilterDataTable = (inputed) => {
    if (!inputed) {
      setDynamicTableData([...staticTableData]);
      return;
    }

    let newTable = [];
    const tableDictionary = new Set();
    const filter = trie.containList(inputed);
    filter.sort((a, b) => a.key - b.key);

    filter.forEach((data) => {
      const { key: idx } = data;

      if (!tableDictionary.has(idx)) {
        tableDictionary.add(idx);
        newTable = [...newTable, staticTableData[idx]];
      }
    });

    setDynamicTableData(newTable);
  };

  /**
   * Round 상세 페이지로 이동
   */
  const onMoveToRoundDetailPage = (id, groupName) => {
    history.push({
      pathname: `/rounds/${id}/rounds`,
      state: { groupId: groupName },
    });
  };

  /**
   * 모델 전송 모달 클라이언트 목록 받아오는 API & 모달 오픈
   * @param {string} version 모델 라운드 이름
   */
  const onOpenBroadcastModelModal = async (version) => {
    const response = await openBroadcastingModelQuery.onRefetch();
    const { result, status, message } = response.data.data;
    if (status === 1) {
      const clientList = result.client_list.map((v) => {
        return { ...v, checked: v.connection.toLowerCase() === 'connected' };
      });
      dispatch(
        openModal({
          modalType: MODAL_BROADCAST_MODEL,
          modalData: {
            headerRender: BroadcastModelModalHeader,
            contentRender: BroadcastModelModalContents,
            footerRender: BroadcastModelModalFooter,
            version,
            clientList,
            onSubmit: (clientNameList) => {
              requestBroadcastModel(version, clientNameList);
              dispatch(closeModal(MODAL_BROADCAST_MODEL));
            },
          },
        }),
      );
    } else {
      toast.error(`${t('model.toast.clientListFailed.message')}`, message);
    }
  };

  /**
   * 모델 전송 API
   * @param {string} version 모델 라운드 이름
   * @param {Array} clientList 선택된 클라이언트 목록
   */
  const requestBroadcastModel = async (version, clientList) => {
    const {
      data: { status, message },
    } = await requestBroadcastQuery.onMutateAsync({
      body: {
        round_group_name: 'default',
        round_name: version,
        client_list: clientList,
      },
    });
    if (status === 1) {
      dispatch(closeModal(MODAL_BROADCAST_MODEL));
      toast.success(
        `${t('model.toast.broadcastComplete.message', { version })}`,
      );
    } else {
      toast.error(
        `${t('model.toast.broadcastFailed.message', { version })}`,
        message,
      );
    }
  };

  /**
   * 메모 수정 API
   * @param {string} version 모델 라운드 이름
   * @param {string} memo 메모 내용
   */
  const requestEditMemo = async (version, memo) => {
    const {
      data: { status, message },
    } = await requestEditMomoQuery.onMutateAsync({
      body: {
        round_group_name: 'default',
        round_name: version,
        edit_description: memo,
      },
    });

    if (status === 1) {
      dispatch(closeModal(MODAL_EDIT_MEMO));
      toast.success(
        `${t('model.toast.editMemoComplete.message', { version })}`,
      );
      requestModelDataQuery.onRefetch();
    } else {
      toast.error(
        `${t('model.toast.editMemoFailed.message', { version })}`,
        message,
      );
    }
  };
  /**
   * 모델 삭제 API
   * @param {string} version 모델 라운드 이름
   */
  // const requestDeleteModel = async (version) => {
  //   const response = await network.callApi({
  //     url: 'models',
  //     method: 'delete',
  //     body: {
  //       round_group_name: 'default',
  //       round_name: version,
  //     },
  //   });
  //   const { status, message } = response.data;

  //   if (status === 1) {
  //     dispatch(closeModal(MODAL_DELETE_MODEL));
  //     toast.success(
  //       `${t('model.toast.deleteModelComplete.message', { version })}`,
  //     );
  //     requestModelPageData();
  //   } else {
  //     toast.error(
  //       `${t('model.toast.deleteModelFailed.message', { version })}`,
  //       message,
  //     );
  //   }
  // };

  /**
   * 모델 다운로드 API
   * @param {string} version 모델 라운드 이름
   */
  const requestDownloadModel = async (version) => {
    const response = await requestDownloadModelQuery.onMutateAsync({
      queryString: `round_group_name=default&round_name=${version}`,
    });

    const { data, status, statusText, headers } = response;
    if (status === 200) {
      if (data.status === 0) {
        toast.error(data.message);
      } else {
        let fileName = `Model_Round${version}`;
        const contentDisposition = headers['content-disposition']; // 파일 이름
        if (contentDisposition) {
          const [fileNameMatch] = contentDisposition
            .split(';')
            .filter((str) => str.includes('filename'));
          if (fileNameMatch) {
            [, fileName] = fileNameMatch.split('=');
          }
        }
        downloadFile(data, fileName);
        toast.success(
          `${t('model.toast.downloadComplete.message', { version })}`,
        );
      }
    } else {
      toast.error(
        `${t('model.toast.downloadFailed.message', { version })}`,
        statusText,
      );
    }
  };

  /**
   * Model페이지 데이터 요청
   */
  const requestModelPageData = async (data) => {
    setModelsTableResponse(data);
  };

  const requestModelDataQuery = useRequestModelData({ requestModelPageData });

  const openBroadcastingModelQuery = useOpenBroadcastingModel();

  const requestBroadcastQuery = useRequestBroadcastModel();

  const requestEditMomoQuery = useRequestEditMemo();

  const requestDownloadModelQuery = useRequestDownloadModel();

  /**
   * 파일 다운로드
   * @param {string} data 파일 내용
   * @param {string} fileName 파일 이름
   */
  const downloadFile = (data, fileName) => {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ModelsPageContents
      tableData={dynamicTableData}
      onFilterDataTable={onFilterDataTable}
      onMoveToRoundDetailPage={onMoveToRoundDetailPage}
      onOpenBroadcastModelModal={onOpenBroadcastModelModal}
      requestEditMemo={requestEditMemo}
      requestDownloadModel={requestDownloadModel}
    />
  );
}

export default ModelsPage;

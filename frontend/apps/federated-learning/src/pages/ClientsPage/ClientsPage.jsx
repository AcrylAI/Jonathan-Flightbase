import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import ClientPageContents from '@src/components/pageContents/ClientPageContents';
import { toast } from '@src/components/uiContents/Toast';

// moduls
import { closeModal, openModal } from '@src/store/modules/modal';

// Custom hooks
import { useTrie } from '@jonathan/react-utils';

// Modal types
import {
  MODAL_JOINED_REQUESTS,
  MODAL_EDIT_CLIENT_NAME,
  MODAL_DELETE_CLIENT,
} from '@src/utils/types';

// API hooks
import useRequestClientsPageTable from './hooks/api/useRequestClientsPageTable';
import useJoinRequestQuery from './hooks/api/useJoinRequestQuery';
import useEditClientName from './hooks/api/useEditClientName';
import useDeleteClient from './hooks/api/useDeleteClient';
import useDisconnectClient from './hooks/api/useDisconnectClient';
import useReconnectClient from './hooks/api/useReconnectClient';

function ClientsPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();

  // 비교용 테이블 데이터
  const [staticTableData, setStaticTableData] = useState([]);
  // 출력용 테이블 데이터
  const [outputTableData, setOutputTableData] = useState([]);
  const [isJoinRequest, setIsJoinRequest] = useState(false);

  /**
   * 테이블 데이터 설정
   * @param {Array<{
   *  no: number,
   *  id: number,
   *  address: string,
   *  name: string,
   *  joinedDateTime: string,
   *  spec: {
   *    cpu: string,
   *    gpu: Array<{
   *      gpu_count: number,
   *      gpu_name: string,
   *      gpu_memory_total: number,
   *    }>,
   *    memory: string,
   *    os: string,
   *    storage: Array<Array<string>>,
   *  },
   *  tableIndex: number,
   * }>} tableData
   */
  const responseTableData = (tableData) => {
    setOutputTableData(tableData);
    setStaticTableData([...tableData]);
  };

  /**
   * 합류 요청 유무 설정
   * @param {boolean} joinReq
   */
  const confirmIsJoinRequest = (joinReq) => {
    setIsJoinRequest(joinReq);
  };

  // 테이블 데이터 조회
  const clientsPageTableQuery = useRequestClientsPageTable({
    responseTableData,
  });

  // 합류 요청 조회
  const isJoinRequestsQuery = useJoinRequestQuery({
    confirmIsJoinRequest,
  });

  // 클라이언트 이름 변경
  const editClientNameMutation = useEditClientName();

  // 클라이언트 삭제
  const deleteClientMutation = useDeleteClient();

  // 클라이언트 연결 해제
  const disconnectClientMutation = useDisconnectClient();

  // 클라이언트 재연결
  const reconnectClientMutation = useReconnectClient();

  // 테이블 trie 생성
  const trie = useTrie(
    (() => {
      let trieForm = [];
      staticTableData.forEach((data, index1) => {
        Object.keys(data).forEach((d, index2) => {
          if (
            d !== 'no' &&
            d !== 'connectionStatus' &&
            d !== 'connectionDateTime' &&
            d !== 'id' &&
            d !== 'lastestParticipated' &&
            d !== 'index'
          ) {
            if (d === 'spec') {
              const { cpu, memory, os } = data[d];
              trieForm.push({
                key: `${index1}-${index2}-0`,
                label: cpu,
              });
              trieForm.push({
                key: `${index1}-${index2}-1`,
                label: memory,
              });
              trieForm.push({
                key: `${index1}-${index2}-2`,
                label: os,
              });
              if (data[d].gpu) {
                const { gpu } = data[d];
                gpu.forEach((g, gIdx) => {
                  const { gpu_name: gpuName } = g;
                  trieForm.push({
                    key: `${index1}-${index2}-3-${gIdx}`,
                    label: gpuName,
                  });
                });
              }
            } else {
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

  /**
   * Join Request 모달창 open
   */
  const onOpenJoinRequestsModal = () => {
    dispatch(
      openModal({
        modalType: MODAL_JOINED_REQUESTS,
        modalData: {
          getClientTableData: () => {
            clientsPageTableQuery.onRefetch();
          },
          getIsJoinRequest: () => {
            isJoinRequestsQuery.onRefetch();
          },
        },
      }),
    );
  };

  /**
   * 클라이언트 연결 해제
   * @param {string} address
   */
  const onDisconnectClient = (address) => {
    disconnectClientMutation.onMutateAsync({
      body: {
        client_address: address,
      },
    });
  };

  /**
   * 클라이언트 연결
   * @param {string} address
   */
  const onReconnectClient = (address) => {
    reconnectClientMutation.onMutateAsync({
      body: {
        client_address: address,
      },
    });
  };

  /**
   * 클라이언트 페이지 동기화
   */
  const onSync = async () => {
    const { data: resTableData } = await clientsPageTableQuery.onRefetch();

    const { status: tStatus, message: tMessage } = resTableData.data;

    if (tStatus === 0) {
      toast.error(tMessage);
      return;
    }

    const { data: resJoinReqData } = await isJoinRequestsQuery.onRefetch();

    const { status: jStatus, message: jMessage } = resJoinReqData.data;

    if (jStatus === 0) {
      toast.error(jMessage);
      return;
    }

    toast.success(t('sync.completed'));
  };

  /**
   * 클라이언트 이름 변경
   * @param {string} name
   * @param {string} address
   */
  const onEditClientName = async (name, address) => {
    const {
      data: { status, message },
    } = await editClientNameMutation.onMutateAsync({
      body: {
        name,
        client_address: address,
      },
    });

    if (status === 0) {
      toast.error(message);
      return;
    }

    toast.success(t('clients.toast.editNameSuccess.label'));

    // 테이블 데이터 재요청
    clientsPageTableQuery.onRefetch();
  };

  /**
   * 클라이언트 삭제
   * @param {string} address
   * @returns
   */
  const onDeleteClient = async (address) => {
    const {
      data: { status, message },
    } = await deleteClientMutation.onMutateAsync({
      body: {
        client_address: address,
      },
    });

    if (status === 0) {
      toast.error(message);
      return;
    }

    toast.success(t('clients.toast.deleteClient.success.label'));

    // 테이블 데이터 재요청
    clientsPageTableQuery.onRefetch();
  };

  /**
   * 클라이언트 이름 변경 모달창 open
   * @param {string} name
   * @param {string} address
   */
  const onOpenEditClientModal = (name, address) => {
    dispatch(
      openModal({
        modalType: MODAL_EDIT_CLIENT_NAME,
        modalData: {
          name,
          onSubmit: (value) => {
            onEditClientName(value, address);
            dispatch(closeModal(MODAL_EDIT_CLIENT_NAME));
          },
        },
      }),
    );
  };

  /**
   * 클라이언트 삭제 모달창 open
   * @param {string} address
   */
  const onOpenDeleteClientModal = (name, address) => {
    dispatch(
      openModal({
        modalType: MODAL_DELETE_CLIENT,
        modalData: {
          name,
          onCancel: () => {
            dispatch(closeModal(MODAL_DELETE_CLIENT));
          },
          onDelete: () => {
            // address로 요청
            onDeleteClient(address);
            dispatch(closeModal(MODAL_DELETE_CLIENT));
          },
        },
      }),
    );
  };

  /**
   * Round 페이지 이동
   * @param {string} id
   */
  const onMoveToRoundDetailPage = (id, roundGroupName) => {
    history.push({
      pathname: `/rounds/${id}/rounds`,
      state: { groupId: roundGroupName },
    });
  };

  /**
   * data table 필터링
   * @param {string} inputed
   */
  const onFilterDataTable = (inputed) => {
    if (!inputed) {
      setOutputTableData([...staticTableData]);
      return;
    }

    let newTable = [];
    const tableDictionary = new Set();
    const filter = trie.containList(inputed);
    filter.sort((a, b) => a.key - b.key);

    filter.forEach((data) => {
      const { key } = data;
      const tableIdx = key[0];

      if (!tableDictionary.has(tableIdx)) {
        tableDictionary.add(tableIdx);
        newTable = [...newTable, staticTableData[tableIdx]];
      }
    });

    setOutputTableData(newTable);
  };

  return (
    <ClientPageContents
      tableData={outputTableData}
      isJoinRequest={isJoinRequest}
      tableLoading={clientsPageTableQuery.isLoading}
      onSync={onSync}
      onFilterDataTable={onFilterDataTable}
      onReconnectClient={onReconnectClient}
      onDisconnectClient={onDisconnectClient}
      onOpenEditClientModal={onOpenEditClientModal}
      onMoveToRoundDetailPage={onMoveToRoundDetailPage}
      onOpenDeleteClientModal={onOpenDeleteClientModal}
      onOpenJoinRequestsModal={onOpenJoinRequestsModal}
    />
  );
}

export default ClientsPage;

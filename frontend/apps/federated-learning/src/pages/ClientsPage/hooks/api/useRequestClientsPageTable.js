import useHttpRequestQuery from '@src/hooks/useHttpRequestQuery';

import { toast } from '@src/components/uiContents/Toast';

/**
 * 클라이언트 테이블 데이터 조회
 * @param {{
 *  responseTableData: (tableData: Array<{
 *    no: number,
 *    id: number,
 *    address: string,
 *    name: string,
 *    joinedDatetime: string,
 *    spec: {
 *      cpu: string,
 *      gpu: Array<{
 *        gpu_name: string,
 *        gpu_count: number,
 *        gpu_memory_total: number,
 *      }>,
 *    },
 *    connectionStatus: string,
 *    connectionDateTime: string,
 *    lastestParticipated: {
 *      last_round_group_name: string,
 *      last_round_name: string,
 *    },
 *    tableIndex: number,
 *  }>) => void;
 * }} param0
 * @returns
 */
function useRequestClientsPageTable({ responseTableData }) {
  const { data, error, isLoading, onRefetch } = useHttpRequestQuery(
    ['clients/joined-clients'],
    {
      url: 'clients/joined-clients',
    },
    {
      onSuccess: (response) => {
        const { data } = response;
        const tableData = data.result.map((d, idx) => {
          const {
            address,
            connection_datetime: connectionDateTime,
            connection_status: connectionStatus,
            joined_datetime: joinedDatetime,
            latest_participated: lastestParticipated,
            name,
            number,
            spec,
          } = d;

          return {
            no: number,
            id: idx,
            address,
            name,
            joinedDatetime,
            spec,
            connectionStatus,
            connectionDateTime,
            lastestParticipated,
            tableIndex: idx,
          };
        });

        responseTableData(tableData);
      },
      onError: () => {
        toast.error('Network error');
      },
    },
  );

  return {
    data,
    error,
    isLoading,
    onRefetch,
  };
}

export default useRequestClientsPageTable;

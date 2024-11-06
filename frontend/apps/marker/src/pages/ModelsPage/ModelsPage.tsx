import { useEffect, useState } from 'react';

import { Sypo } from '@src/components/atoms';

import { PageHeader } from '@src/components/molecules';

import ModelsPageContents from '@src/components/pageContents/ModelsPageContents/ModelsPageContents';

import { MONO205 } from '@src/utils/color';
import { ModelsTableColumnType } from '@src/utils/types/data';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import { useGetModels, useModelActive, useSync } from './hooks/useModel';

import { ModelPageCautionIcon } from '@src/static/images';

import style from './ModelsPages.module.scss';
import classNames from 'classnames/bind';

import { HttpResponseType } from '@src/network/api/types';
const cx = classNames.bind(style);

function ModelsPage() {
  const { t } = useT();
  const {
    userSession: { workspaceId, token, session },
  } = useUserSession();

  const [page, setPage] = useState<number>(1);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [tableList, setTableList] = useState<HttpResponseType | undefined>();
  const [resetTable, setResetTable] = useState<boolean>(false);
  const [syncFlag, setSyncFlag] = useState<boolean>(true);
  const { data, refetch } = useGetModels(
    (() => {
      if (resetTable) {
        return {
          params: {
            workspaceId,
            limit: rowPerPage,
          },
          token,
          session,
        };
      }

      return {
        params: {
          workspaceId,
          page,
          limit: rowPerPage,
          sort,
          order,
        },
        token,
        session,
      };
    })(),
  );

  const { mutateAsync: activeMutate } = useModelActive(token, session);

  const {
    data: syncData,
    refetch: syncRefetch,
    isFetching: syncLoading,
  } = useSync({ workspaceId }, token, session);

  const onChangeActiveStatus = (row: ModelsTableColumnType) => {
    const status = row.status ? 0 : 1;
    activeMutate({ id: row.id, status });
  };

  // const onClickSync = async () => {
  //   setResetTable(true);
  //   const resp = await syncRefetch();
  //   if (resp?.status === 'success') {
  //     refetch();
  //   }
  // };

  useEffect(() => {
    refetch();
  }, [page, rowPerPage, sort, order, refetch]);

  useEffect(() => {
    setResetTable(false);
    setTableList(data ?? undefined);
  }, [data]);

  useEffect(() => {
    if (syncData?.httpStatus === 200) {
      refetch();
      setSyncFlag(false);
    }
  }, [syncFlag, refetch, syncData]);

  return (
    <>
      <PageHeader
        leftSection='tooltip'
        pageTitle={t('page.models.header')}
        tooltipDesc={t(`component.toolTip.jonathanModels`)}
        // onClickSync={onClickSync}
      />
      {tableList?.result?.list.length > 0 && (
        <ModelsPageContents
          tableList={tableList?.result.list}
          total={tableList?.result.total}
          setPage={setPage}
          setRowPerPage={setRowPerPage}
          setSort={setSort}
          setOrder={setOrder}
          onChangeActiveStatus={onChangeActiveStatus}
          resetFlag={resetTable}
          loading={syncLoading}
        />
      )}
      {tableList?.result?.list.length === 0 && (
        <div className={cx('noModelSection')}>
          <img src={ModelPageCautionIcon} alt='' />
          <Sypo weight='medium' color={MONO205} type='H4'>
            {t('page.models.noDeployment')}
          </Sypo>
          <Sypo weight='medium' color={MONO205} type='H4'>
            {t('page.models.goFlightbase')}
          </Sypo>
        </div>
      )}
    </>
  );
}

export default ModelsPage;

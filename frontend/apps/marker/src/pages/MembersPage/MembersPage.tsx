import { useEffect, useState } from 'react';
import { debounce } from 'lodash';

import MemberPageContents from '@src/components/pageContents/MemberPageContents/MemberPageContents';

import { MemberTableColumnType } from '@src/utils/types/data';

import useUserSession from '@src/hooks/auth/useUserSession';

import { useActive, useGetMembers } from './hooks/useGetMembers';

const MembersPage = () => {
  const {
    userSession: { workspaceId, token },
  } = useUserSession();

  const [page, setPage] = useState<number>(1);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [memberType, setMemberType] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>('');

  const { data, refetch, isLoading } = useGetMembers(
    (() => {
      if (memberType) {
        return {
          page,
          workspaceId,
          limit: rowPerPage,
          order,
          sort,
          memberType,
        };
      }
      if (search) {
        return {
          page,
          workspaceId,
          limit: rowPerPage,
          order,
          sort,
          memberType,
          search,
        };
      }
      return {
        page,
        workspaceId,
        limit: rowPerPage,
        order,
        sort,
      };
    })(),
  );

  const { mutateAsync } = useActive(token);

  const onChangeActiveStatus = (row: MemberTableColumnType) => {
    const status = row.status ? 0 : 1;
    mutateAsync({ id: row.id, status });
  };

  const searchRefetch = debounce(() => {
    refetch();
  }, 250);

  useEffect(() => {
    searchRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const reload = () => {
    refetch();
  };

  useEffect(() => {
    refetch();
  }, [page, rowPerPage, sort, order, refetch, memberType]);

  return (
    <MemberPageContents
      tableList={data?.result.list}
      reload={reload}
      total={data?.result.total}
      setPage={setPage}
      setRowPerPage={setRowPerPage}
      setOrder={setOrder}
      setSort={setSort}
      setSearch={setSearch}
      onChangeActiveStatus={(row) => onChangeActiveStatus(row)}
      setMemberType={setMemberType}
      memberType={memberType}
      loading={isLoading}
      search={search}
    />
  );
};

export default MembersPage;

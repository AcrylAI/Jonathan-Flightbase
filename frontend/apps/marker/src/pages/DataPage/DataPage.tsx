import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { debounce } from 'lodash';

import { Mypo, Sypo } from '@src/components/atoms';

import { PageHeader } from '@src/components/molecules';

import { useGetProjectMetaData } from '@src/components/organisms/Modal/AssignModal/hooks/useGetProjectMetaData';

import DataContents from '@src/components/pageContents/DataContents/DataContents';

import { MONO205 } from '@src/utils/color';
import { FilterDataType } from '@src/utils/types/data';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import { useFilterData, usePostDataInfo, useProgress } from './hooks/useData';

import { EmptyFolder } from '@src/static/images';

import style from './DataPage.module.scss';
import classNames from 'classnames/bind';

import { HttpResponseType } from '@src/network/api/types';
const cx = classNames.bind(style);

export type APIProps = {
  page?: number;
  order?: string;
  sort?: string;
  condition?: number;
  filter?: any;
  keyword?: string;
  limit?: number;
};

export type LabelerDataType = {
  id: number;
  name: string;
};

export type ReviewerDataType = {
  id: number;
  name: string;
};

function DataPage() {
  const { t } = useT();
  const params = useParams();

  const {
    userSession: { token },
  } = useUserSession();

  const [dataInfo, setDataInfo] = useState<HttpResponseType>();
  const [labelerData, setLabelerData] = useState<Array<LabelerDataType>>([]);
  const [reviewerData, setReviewerData] = useState<Array<ReviewerDataType>>([]);
  const [filteredData, setFilteredData] = useState<FilterDataType[]>([]);
  const [filterButtonState, setFilterButtonState] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [order, setOrder] = useState<string>('date');
  const [sort, setSort] = useState<string>('DESC');
  const [filterCondition, setFilterCondition] = useState<number>(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);

  const { mutateAsync, isLoading } = usePostDataInfo(token);
  const filterData = useFilterData({ projectId: Number(params.pid) });

  const [progressData, setProgressData] = useState(0);
  const { refetch: progressRefetch } = useProgress(
    { projectId: Number(params.pid) },
    setProgressData,
  );
  const { data: metaData } = useGetProjectMetaData({
    projectId: Number(params.pid),
  });
  const [searchData, setSearchData] = useState<string>('');
  const callTableAPI = async ({
    page,
    order,
    sort,
    condition,
    filter,
    keyword,
    limit,
  }: APIProps) => {
    const resp = await mutateAsync({
      projectId: params.pid,
      page,
      limit,
      order,
      sort,
      condition,
      filter,
      keyword: keyword || searchData,
    });
    setDataInfo(resp);
    if (resp.result.empty === 2) {
      await progressRefetch();
    }
    return resp;
  };

  const onClickFilterHandler = () => {
    setFilterButtonState((state) => !state);
  };

  const cancelFilterHandler = () => {
    setFilterButtonState(false);
  };

  const onChangeSearch = debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchData(e.target.value);
      const resp = await mutateAsync({
        projectId: params.pid,
        page,
        order,
        sort,
        condition: filterCondition,
        filter: filteredData,
        keyword: e.target.value,
      });
      setDataInfo(resp);
    },
    250,
  );

  useEffect(() => {
    if (filterData) {
      setLabelerData(filterData.result.labeler ?? []);
      setReviewerData(filterData.result.reviewer ?? []);
    }
  }, [filterData]);

  useEffect(() => {
    const filterData = localStorage.getItem('filter');
    if (filterData) {
      setFilteredData(JSON.parse(filterData));
    }
    callTableAPI({ page: 1 });

    return () => {
      localStorage.removeItem('filter');
    };
  }, []);

  useEffect(() => {
    if (progressData === 100) callTableAPI({ page: 1 });
  }, [progressData]);

  return (
    <div className={cx('container')}>
      <PageHeader
        pageTitle={t('component.lnb.data')}
        projectTitle
        loading={isLoading}
        leftSection='spinner'
        projectTitleValue={metaData?.result?.name ?? ''}
        onChangeSearch={(e: any) => onChangeSearch(e)}
      ></PageHeader>
      {dataInfo?.result?.empty === 0 && (
        <div className={cx('noDatasetSection')}>
          <img src={EmptyFolder} alt='' />
          <Mypo weight='medium' color={MONO205} type='h4'>
            {t('page.data.emptyData')}
          </Mypo>
          <Mypo weight='R' color={MONO205} type='h4'>
            {t('page.data.connectDataset')}
          </Mypo>
        </div>
      )}
      {(dataInfo?.result?.empty === 1 || dataInfo?.result?.empty === 2) && (
        <DataContents
          data={dataInfo}
          callTableAPI={callTableAPI}
          filteredData={filteredData}
          setFilteredData={setFilteredData}
          page={page}
          setPage={setPage}
          sort={sort}
          setSort={setSort}
          order={order}
          setOrder={setOrder}
          filterCondition={filterCondition}
          setFilterCondition={setFilterCondition}
          rowPerPage={rowPerPage}
          setRowPerPage={setRowPerPage}
          progressData={progressData}
          dataStatus={dataInfo.result.empty}
          filterButtonState={filterButtonState}
          reviewerData={reviewerData}
          labelerData={labelerData}
          cancelHandler={onClickFilterHandler}
          filterButtonDisable={
            dataInfo?.result?.empty === 0 ||
            (dataInfo?.result?.empty === 1 &&
              dataInfo?.result?.list.length === 0)
          }
          cancelFilterHandler={cancelFilterHandler}
          onChangeSearch={(e: any) => onChangeSearch(e)}
        />
      )}
    </div>
  );
}
export default DataPage;

import { useState, useEffect, useCallback, Fragment } from 'react';

// i18n
import { withTranslation } from 'react-i18next';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import { now, convertLocalTime, convertDuration } from '@src/datetimeUtils';

// Containers
import InstanceTabSearchBoxContainer from './InstanceTabSearchBoxContainer';

// Components
import ExportButton from '../ExportButton';
import SubMenu from '@src/components/molecules/SubMenu';
import MultipleTimeSeriesChart from '@src/components/molecules/chart/MultipleTimeSeriesChart';
import TitleSelect from '@src/components/molecules/TitleSelect';
import Table from '@src/components/molecules/Table';
import { toast } from '@src/components/Toast';
import { Button, Selectbox } from '@jonathan/ui-react';

// Custom Hooks
import { useStateCallback } from '@src/customHooks';

// Utils
import { errorToastMessage, numberWithCommas } from '@src/utils';

// CSS module
import classNames from 'classnames/bind';
import style from './InstanceTab.module.scss';
const cx = classNames.bind(style);

const InstanceTab = ({ t }) => {
  const columns = [
    {
      name: t('resource.label'),
      selector: 'instance',
      sortable: false,
      maxWidth: '84px',
      cell: ({ instance }) => instance.toUpperCase(),
    },
    {
      name: t('configurations.label'),
      selector: 'configuration',
      sortable: false,
      minWidth: '218px',
      cell: ({ configuration }) => {
        const confArr = configuration.split(',');
        const rowStyle = {};
        if (confArr.length > 2) {
          rowStyle.height = '36px';
          rowStyle.overflow = 'auto';
        }
        return (
          <div style={rowStyle} title={configuration}>
            {confArr.map((conf, key) => (
              <p
                key={key}
                style={{
                  margin: '0',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {conf.replace('GeForce ', '')}
              </p>
            ))}
          </div>
        );
      },
    },
    {
      name: t('usageType.label'),
      selector: 'usage_type',
      sortable: false,
      maxWidth: '150px',
      cell: ({ usage_type: usageType }) => {
        return t(`${usageType}.label`);
      },
    },
    {
      name: t('workspace.label'),
      selector: 'worksapce',
      sortable: false,
    },
    {
      name: t('training.label'),
      selector: 'training',
      sortable: false,
    },
    {
      name: t('jobDeployment.label'),
      selector: 'job_deployment',
      sortable: false,
      minWidth: '120px',
    },
    {
      name: t('startTime.label'),
      selector: 'start_time',
      sortable: false,
      maxWidth: '200px',
      cell: ({ start_time: time }) => convertLocalTime(time),
    },
    {
      name: t('stopTime.label'),
      selector: 'stop_time',
      sortable: false,
      maxWidth: '200px',
      cell: ({ stop_time: time }) =>
        time !== '-' ? convertLocalTime(time) : time,
    },
    {
      name: t('uptime.label'),
      selector: 'uptime',
      sortable: false,
      maxWidth: '200px',
      cell: ({ uptime }) => {
        return convertDuration(uptime);
      },
    },
  ];

  const usageTypeOptions = [
    { label: t('allUsageType.label'), value: 'all' },
    { label: t('editor.label'), value: 'editor' },
    { label: t('job.label'), value: 'job' },
    { label: t('hps.label'), value: 'hyperparamsearch' },
    { label: t('deployment.label'), value: 'deployment' },
  ];

  const searchOptions = [
    { label: t('workspace.label'), value: 'workspace' },
    { label: t('training.label'), value: 'training' },
    { label: t('jobDeployment.label'), value: 'job_deployment' },
  ];

  const subMenuOptions = [
    { label: t('all.label'), value: 'all' },
    { label: 'GPU', value: 'gpu' },
    { label: 'CPU', value: 'cpu' },
  ];

  const [groupType, setGroupType] = useState({
    label: t('workspace.label'),
    value: 'workspace',
  }); // groupType: workspace|usergroup

  const groupTypeOptions = [
    { label: t('workspace.label'), value: 'workspace' },
    { label: t('userGroup.label'), value: 'usergroup' },
  ];

  const [group, setGroup] = useState(null);
  const [groupOptions, setGroupOptions] = useState([]);

  const axisSeriesArr = [
    {
      dateX: 'date',
      valueY: 'usage_gpu',
      maxValue: groupType.value === 'workspace' && 100,
      tooltipText:
        groupType.value === 'workspace'
          ? `GPU ${t(
              'usage.label',
            )}: {used_gpu}/{total_gpu} ({valueY.value.formatNumber('#.##')}%)`
          : `GPU ${t('usage.label')}: {valueY.value}`,
      opposite: false,
      legendLabel: 'GPU',
      color: '#00c775',
    },
    {
      dateX: 'date',
      valueY: 'usage_cpu',
      tooltipText: `CPU ${t('usage.label')}: {valueY.value}`,
      opposite: true,
      legendLabel: 'CPU',
      color: '#ffab0e',
    },
  ];

  const [info, setInfo] = useState({
    period_gpu_allocation: [],
    records_of_cpu: 0,
    records_of_gpu: 0,
    uptime_cpu: 0,
    uptime_gpu: 0,
  });
  const [timeline, setTimeline] = useState([]);
  const [chipList, setChipList] = useState([]);
  const [history, setHistory] = useState([]);
  const [totalRow, setTotalRow] = useState(0);

  const [searchParam, setSearchParam] = useState({
    page: 1,
    size: 10,
    usageType: { label: t('allUsageType.label'), value: 'all' },
    searchKey: { label: t('workspace.label'), value: 'workspace' },
    keyword: '',
  });

  const [subMenu, setSubMenu] = useState({ label: 'all.label', value: 'all' });

  const [excelData, setExcelData] = useStateCallback([]);

  const [expand, setExpand] = useState(true);

  const [loading, setLoading] = useState(false);

  const getInstanceData = useCallback(
    async (id) => {
      if (!id) return;
      const queryParam = [];
      const monthsParam = [];
      const trainingsParam = [];
      queryParam.push(`${groupType.value}_id=${id}`);
      for (let i = 0; i < chipList.length; i += 1) {
        const {
          param: { key, value },
        } = chipList[i];
        switch (key) {
          case 'year':
            if (value !== 'all') queryParam.push(`${key}=${value}`);
            break;
          case 'months':
            if (value !== 'all') monthsParam.push(value);
            break;
          case 'training':
            if (value !== 'all') trainingsParam.push(value);
            break;
          default:
        }
      }
      if (monthsParam.length !== 0) {
        queryParam.push(`months=${monthsParam.join(',')}`);
      }
      if (trainingsParam.length !== 0) {
        queryParam.push(`training_ids=${trainingsParam.join(',')}`);
      }
      const url = `records/instance${
        queryParam.length !== 0 ? `?${queryParam.join('&')}` : ''
      }`;
      const response = await callApi({
        url,
        method: 'get',
      });

      const { result, status, message } = response;
      if (status === STATUS_SUCCESS) {
        const { info: infoData, timeline: timelineData } = result;
        setInfo(infoData);
        setTimeline(timelineData);
      } else {
        toast.error(message);
      }
    },
    [chipList, groupType.value],
  );

  const getHistoryData = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      const queryParam = [];
      const monthsParam = [];
      const trainingsParam = [];
      queryParam.push(`${groupType.value}_id=${id}`);
      for (let i = 0; i < chipList.length; i += 1) {
        const {
          param: { key, value },
        } = chipList[i];

        switch (key) {
          case 'year':
            if (value !== 'all') queryParam.push(`${key}=${value}`);
            break;
          case 'months':
            if (value !== 'all') monthsParam.push(value);
            break;
          case 'training':
            if (value !== 'all') trainingsParam.push(value);
            break;
          default:
        }
      }
      if (monthsParam.length !== 0) {
        queryParam.push(`months=${monthsParam.join(',')}`);
      }
      if (trainingsParam.length !== 0) {
        queryParam.push(`training_ids=${trainingsParam.join(',')}`);
      }

      const { page, size, keyword, searchKey, usageType } = searchParam;

      let url = `records/instance_history?page=${page}&size=${size}${
        queryParam.length !== 0 ? `&${queryParam.join('&')}` : ''
      }`;
      if (usageType.value !== 'all') url += `&usage_type=${usageType.value}`;
      if (subMenu.value !== 'all') url += `&type=${subMenu.value}`;
      if (keyword !== '')
        url += `&searchKey=${searchKey.value}&keyword=${keyword}`;
      const response = await callApi({
        url,
        method: 'get',
      });

      const { result, status, message } = response;
      if (status === STATUS_SUCCESS) {
        const { list, total } = result;
        setHistory(list);
        setTotalRow(total);
      } else {
        toast.error(message);
      }
      setLoading(false);
    },
    [searchParam, setTotalRow, setHistory, chipList, subMenu, groupType.value],
  );

  // 설정한 조건으로 workspace 목록 조회
  const onSearch = useCallback(
    (chips) => {
      setChipList(chips);
    },
    [setChipList],
  );

  // 조건 삭제
  const removeChip = useCallback(
    (idx) => {
      let newChipList = [
        ...chipList.slice(0, idx),
        ...chipList.slice(idx + 1, chipList.length),
      ];
      if (chipList[idx].param.key === 'year') {
        newChipList = newChipList.filter(
          ({ param: { key } }) => key !== 'months',
        );
      }
      setChipList(newChipList);
    },
    [setChipList, chipList],
  );

  // 테이블 페이지 이동
  const onChangePage = useCallback(
    (page) => {
      setSearchParam({
        ...searchParam,
        page,
      });
    },
    [searchParam, setSearchParam],
  );

  // 테이블 한번에 볼 갯수 변경
  const onChangeRowsPerPage = useCallback(
    (size) => {
      setSearchParam({
        ...searchParam,
        page: 1,
        size,
      });
    },
    [searchParam, setSearchParam],
  );

  // 필터 변경 이벤트
  const onChangeFilter = useCallback(
    (target, filter) => {
      setSearchParam({
        ...searchParam,
        [target]: filter,
      });
    },
    [setSearchParam, searchParam],
  );

  const onChangeSearchKeyword = useCallback(
    (e) => {
      setSearchParam({
        ...searchParam,
        keyword: e.target.value,
      });
    },
    [setSearchParam, searchParam],
  );

  // workspace 옵션 목록 조회
  const getWorkspaceOptions = async () => {
    const response = await callApi({
      url: 'options/records',
      method: 'get',
    });
    const { result, status, message } = response;

    if (status === STATUS_SUCCESS) {
      const { workspace_list: wOptions } = result;
      setGroup(
        wOptions.length !== 0
          ? { label: wOptions[0].name, value: wOptions[0].id }
          : null,
      );
      setGroupOptions([
        ...wOptions.map(({ id, name }) => ({
          label: name,
          value: id,
          checked: false,
        })),
      ]);
    } else {
      toast.error(message);
    }
  };

  // 사용자 그룹 옵션 목록 조회
  const getUserGroupOptions = async () => {
    const response = await callApi({
      url: 'users/group',
      method: 'get',
    });
    const { result, status, message } = response;
    if (status === STATUS_SUCCESS) {
      const { list: gOptions } = result;
      setGroup(
        gOptions.length !== 0
          ? { label: gOptions[0].name, value: gOptions[0].id }
          : null,
      );
      setGroupOptions([
        ...gOptions.map(({ id, name }) => ({
          label: name,
          value: id,
          checked: false,
        })),
      ]);
    } else {
      toast.error(message);
    }
  };

  /**
   * 검색 내용 제거
   */
  const onClear = () => {
    onChangeSearchKeyword({ target: { value: '' } });
  };

  const onChangeSelectBox = useCallback(
    async (target, value) => {
      setChipList([]);
      if (target === 'groupType') {
        setGroupType(value);
        setGroup(null);
        setGroupOptions([]);
        if (value.value === 'workspace') {
          await getWorkspaceOptions();
        } else if (value.value === 'usergroup') {
          await getUserGroupOptions();
        }
      } else if (target === 'group') {
        setGroup(value);
      }
    },
    [setGroupType, setGroup],
  );

  // 엑셀 다운로드 이벤트
  const excelDownload = useCallback(
    async (button) => {
      if (!group) return;
      const queryParam = [];
      const monthsParam = [];
      const trainingsParam = [];
      queryParam.push(`${groupType.value}_id=${group.value}`);
      let yearValue = 'All';
      for (let i = 0; i < chipList.length; i += 1) {
        const {
          param: { key, value },
          origin: { label },
        } = chipList[i];
        switch (key) {
          case 'year':
            queryParam.push(`${key}=${value}`);
            yearValue = value;
            break;
          case 'months':
            monthsParam.push(value);
            break;
          case 'training':
            trainingsParam.push(label);
            break;
          default:
        }
      }
      if (monthsParam.length !== 0) {
        queryParam.push(`months=${monthsParam.join(',')}`);
      }
      if (trainingsParam.length !== 0) {
        queryParam.push(`trainings=${trainingsParam.join(',')}`);
      }

      const { keyword, searchKey, usageType } = searchParam;

      let historyUrl = `records/instance_history${
        queryParam.length !== 0 ? `?${queryParam.join('&')}` : ''
      }`;
      historyUrl += `&usageType=${usageType.value}`;
      historyUrl += `&type=${subMenu.value}`;
      if (keyword !== '')
        historyUrl += `&searchKey=${searchKey.value}&keyword=${keyword}`;

      // history 정보 조회
      let historyData = [];
      const historyRes = await callApi({
        url: historyUrl,
        method: 'get',
      });
      const {
        result: historyResult,
        status: historyStatus,
        message: historyMsg,
        error: historyError,
      } = historyRes;
      if (historyStatus === STATUS_SUCCESS) {
        historyData = historyResult.list.map(
          ({
            instance: instanceItem,
            configuration: configItem,
            usage_type: usageTypeItem,
            worksapce: workspaceItem,
            training: trainingItem,
            job_deployment: jobDeploymentItem,
            start_time: startTimeItem,
            stop_time: stopTimeItem,
            uptime: uptimeItem,
          }) => [
            instanceItem,
            configItem,
            usageTypeItem,
            workspaceItem,
            trainingItem,
            jobDeploymentItem,
            startTimeItem,
            stopTimeItem,
            convertDuration(uptimeItem),
          ],
        );
      } else {
        errorToastMessage(historyError, historyMsg);
        return false;
      }

      // 자원 기록 정보 조회
      let gpuAllocationData = [];
      let gpuCountData = [];
      const instanceUrl = `records/instance${
        queryParam.length !== 0 ? `?${queryParam.join('&')}` : ''
      }`;
      const response = await callApi({
        url: instanceUrl,
        method: 'get',
      });
      const {
        result: instanceResult,
        status: instanceStatus,
        message: instanceMsg,
        error: instanceError,
      } = response;
      if (instanceStatus === STATUS_SUCCESS) {
        const { info: instanceInfo } = instanceResult;
        const {
          period_gpu_allocation: allocationList,
          records_of_gpu: recordsOfGpu,
          records_of_cpu: recordsOfCpu,
          uptime_gpu: uptimeGpu,
          uptime_cpu: uptimeCpu,
        } = instanceInfo;
        gpuAllocationData = allocationList.map(
          ({
            period: periodItem,
            for_deployment: forDeployment,
            for_training: forTraining,
          }) => {
            const [start, end] = periodItem.split('~');
            return [start, end, forTraining, forDeployment];
          },
        );

        gpuCountData = [[recordsOfGpu, recordsOfCpu, uptimeGpu, uptimeCpu]];
      } else {
        errorToastMessage(instanceError, instanceMsg);
        return false;
      }

      let monthValue = monthsParam.join(',');
      if (monthValue === '') monthValue = 'All';
      let trainingsValue = trainingsParam.join(',');
      if (trainingsValue === '') trainingsValue = 'All';

      const excelResult = [
        {
          ySteps: 1,
          columns: [t('searchParameter.label')],
          data: [
            [
              t(`${groupType.label}`),
              t('year.label'),
              t('months.label'),
              t('training.label'),
            ],
            [group.label, yearValue, monthValue, trainingsValue],
          ],
        },
        {
          ySteps: 1,
          columns: [`${t('period.label')} & ${t('gpuAllocationCount.label')}`],
          data: [
            [
              t('startDate.label'),
              t('endDate.label'),
              t('forTraining.label'),
              t('forDeployment.label'),
            ],
            ...gpuAllocationData,
          ],
        },
        {
          ySteps: 1,
          columns: [''],
          data: [
            [
              t('recordsOfGpu.label'),
              t('recordsOfCpu.label'),
              t('uptimeOfGpu.label'),
              t('uptimeOfCpu.label'),
            ],
            ...gpuCountData,
          ],
        },
        {
          ySteps: 1,
          columns: [t('historyData.label')],
          data: [
            [
              t('resource.label'),
              t('configurations.label'),
              t('usageType.label'),
              t('workspace.label'),
              t('training.label'),
              t('jobDeployment.label'),
              t('startTime.label'),
              t('stopTime.label'),
              t('uptime.label'),
            ],
            ...historyData,
          ],
        },
      ];

      setExcelData(excelResult, () => {
        button.click();
      });
      toast.success(t('excelExport.success.toast'));
    },
    [setExcelData, groupType, group, chipList, searchParam, subMenu, t],
  );

  const showHideChart = () => {
    setExpand(!expand);
  };

  useEffect(() => {
    getWorkspaceOptions();
  }, []);

  useEffect(() => {
    if (group) getHistoryData(group.value);
  }, [getHistoryData, group]);

  useEffect(() => {
    if (group) getInstanceData(group.value);
  }, [getInstanceData, group]);

  const { usageType, searchKey, keyword } = searchParam;

  const filterList = (
    <>
      <Button
        type='primary-light'
        size='medium'
        onClick={() => {
          if (group) getHistoryData(group.value);
        }}
        iconAlign='left'
        icon={
          loading
            ? '/images/icon/spinner-1s-58.svg'
            : '/images/icon/ic-refresh-blue.svg'
        }
      >
        {t('refresh.label')}
      </Button>
      <div style={{ width: '184px' }}>
        <Selectbox
          list={usageTypeOptions}
          selectedItem={usageType}
          onChange={(d) => {
            onChangeFilter('usageType', d);
          }}
          customStyle={{
            fontStyle: {
              selectbox: {
                fontSize: '14px',
              },
            },
          }}
        />
      </div>
    </>
  );

  const { value: selectedMenu } = subMenu;

  return (
    <div id='resource-tab'>
      <div className={cx('header')}>
        <h3 className={cx('title')}>
          {t('resourceUsageRecords.title.label')}
          <div className={cx('title-select-box')}>
            <TitleSelect
              options={groupTypeOptions}
              placeholder={t('selectGroup.placeholder')}
              sizeType={'small'}
              selected={groupType}
              onChange={(value) => {
                onChangeSelectBox('groupType', value);
              }}
              disabledErrorText
            />
            {groupType && (
              <Fragment>
                <span className={cx('group-select-divide')}>:</span>
                <TitleSelect
                  options={groupOptions}
                  placeholder={
                    groupType.value === 'workspace'
                      ? t('selectWorkspace.placeholder')
                      : t('selectUserGroup.placeholder')
                  }
                  sizeType={'small'}
                  selected={group}
                  onChange={(value) => {
                    onChangeSelectBox('group', value);
                  }}
                  disabledErrorText
                  searchable
                />
              </Fragment>
            )}
          </div>
        </h3>
        <ExportButton
          excelDownload={excelDownload}
          excelDataFormat={{
            sheetName: t('resourceUsageRecords.label'),
            sheetData: excelData,
          }}
          excelFileName={`${group ? `[${group.label}]` : ''} ${t(
            'resourceUsageRecords.file.label',
          )}_${now()}`}
          pdfTargetId='resource-tab'
        />
      </div>
      <InstanceTabSearchBoxContainer
        onSearch={onSearch}
        chipList={chipList}
        removeChip={removeChip}
        groupType={groupType}
        group={group}
      />
      {info && (
        <div className={cx('summary')}>
          <div className={cx('card', 'gpu-allocation')}>
            <label className={cx('label')}>
              {t('period.label')} &amp; {t('gpuAllocationCount.label')}
            </label>
            {info.period_gpu_allocation.length !== 0 ? (
              <div className={cx('list-box')}>
                {info.period_gpu_allocation.map(
                  (
                    {
                      start_datetime: start,
                      end_datetime: end,
                      for_training: training,
                      for_deployment: deployment,
                    },
                    idx,
                  ) => (
                    <div className={cx('list')} key={idx}>
                      <span className={cx('period', 'bold')}>
                        <span className={cx('start')}>
                          {convertLocalTime(start)}
                        </span>
                        <span>~</span>
                        <span className={cx('end')}>
                          {convertLocalTime(end)}
                        </span>
                      </span>
                      <span className={cx('gpus')}>
                        {t('forTraining.label')}:{' '}
                        <span className={cx('bold')}>{training} GPUs</span>
                        &nbsp;| {t('forDeployment.label')}:{' '}
                        <span className={cx('bold')}>{deployment} GPUs</span>
                      </span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className={cx('no-data')}>{t('noData.message')}</div>
            )}
          </div>
          <div className={cx('instance-uptime')}>
            <div className={cx('card')}>
              <ul className={cx('info')}>
                <li className={cx('list')}>
                  <p className={cx('label')}>
                    <img src='/images/icon/ic-gpu.svg' alt='GPU icon' />
                    <label>{t('recordsOfGpu.label')}</label>
                  </p>
                  <span className={cx('value')}>
                    {numberWithCommas(info.records_of_gpu)}
                  </span>
                </li>
                <li className={cx('list')}>
                  <p className={cx('label')}>
                    <img src='/images/icon/ic-gpu.svg' alt='GPU icon' />
                    <label>{t('uptimeOfGpu.label')}</label>
                  </p>
                  <span className={cx('value')}>
                    {convertDuration(info.uptime_gpu)}
                  </span>
                </li>
              </ul>
            </div>
            <div className={cx('card')}>
              <ul className={cx('info')}>
                <li className={cx('list')}>
                  <p className={cx('label')}>
                    <img src='/images/icon/ic-cpu.svg' alt='CPU icon' />
                    <label>{t('recordsOfCpu.label')}</label>
                  </p>
                  <span className={cx('value')}>
                    {numberWithCommas(info.records_of_cpu)}
                  </span>
                </li>
                <li className={cx('list')}>
                  <p className={cx('label')}>
                    <img src='/images/icon/ic-cpu.svg' alt='CPU icon' />
                    <label>{t('uptimeOfCpu.label')}</label>
                  </p>
                  <span className={cx('value')}>
                    {convertDuration(info.uptime_cpu)}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      <SubMenu
        option={subMenuOptions}
        select={subMenu}
        onChangeHandler={setSubMenu}
      />
      {timeline && (
        <div
          className={cx('chart-box')}
          style={{ height: expand ? '508px' : 'auto' }}
        >
          <div
            className={cx('title')}
            style={{ marginBottom: expand ? '20px' : '0px' }}
          >
            <label>
              {subMenu.value === 'all'
                ? t('resource.label')
                : subMenu.value.toUpperCase()}{' '}
              {t('maximumUsageByDaily.title.label')}
            </label>
            <button className={cx('chart-hide-btn')} onClick={showHideChart}>
              <img
                src='/images/icon/angle-up.svg'
                className={cx(!expand && 'hide')}
                alt='show/hide button'
              />
            </button>
          </div>
          {expand && (
            <>
              {subMenu.value === 'all' ? (
                // All Tab Chart
                <MultipleTimeSeriesChart
                  tagId='allchart'
                  data={timeline}
                  axisSeriesArr={axisSeriesArr}
                  customStyle={{
                    width: '100%',
                    height: '395px',
                  }}
                />
              ) : (
                <>
                  {/* GPU, CPU Chart */}
                  {(() => {
                    const chartOpt = {
                      data: timeline,
                      customStyle: {
                        width: '100%',
                        height: '395px',
                      },
                    };
                    if (selectedMenu === 'gpu') {
                      chartOpt.tagId = 'gpuchart';
                      chartOpt.axisSeriesArr = [
                        {
                          dateX: 'date',
                          valueY: 'usage_gpu',
                          maxValue: groupType.value === 'workspace' && 100,
                          tooltipText:
                            groupType.value === 'workspace'
                              ? `GPU ${t(
                                  'usage.label',
                                )}: {used_gpu}/{total_gpu} ({valueY.value.formatNumber('#.##')}%)`
                              : `GPU ${t('usage.label')}: {valueY.value}`,
                          opposite: false,
                          legendLabel: 'GPU',
                          color: '#00c775',
                        },
                      ];
                    } else if (selectedMenu === 'cpu') {
                      chartOpt.tagId = 'cpuchart';
                      chartOpt.axisSeriesArr = [
                        {
                          dateX: 'date',
                          valueY: 'usage_cpu',
                          tooltipText: `CPU ${t(
                            'usage.label',
                          )}: {valueY.value}`,
                          opposite: false,
                          legendLabel: 'CPU',
                          color: '#ffab0e',
                        },
                      ];
                    }
                    return <MultipleTimeSeriesChart {...chartOpt} />;
                  })()}
                </>
              )}
            </>
          )}
        </div>
      )}
      <Table
        columns={columns}
        data={history}
        totalRows={totalRow}
        selectableRows={false}
        paginationServer
        onChangeRowsPerPage={onChangeRowsPerPage}
        onChangePage={onChangePage}
        defaultSortField='time_stamp'
        toggledClearRows={false}
        hideButtons
        filterList={filterList}
        searchOptions={searchOptions}
        searchKey={searchKey}
        keyword={keyword}
        onSearchKeyChange={(d) => {
          onChangeFilter('searchKey', d);
        }}
        onSearch={onChangeSearchKeyword}
        onClear={onClear}
      />
    </div>
  );
};
export default withTranslation()(InstanceTab);

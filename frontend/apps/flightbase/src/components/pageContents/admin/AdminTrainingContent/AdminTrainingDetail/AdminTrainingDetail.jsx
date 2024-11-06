import { useState, useEffect, Fragment } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Progress } from 'react-sweet-progress';
import Table from '@src/components/molecules/Table';
import 'react-sweet-progress/lib/style.css';
import { toast } from '@src/components/Toast';

// Network
import { callApi, STATUS_SUCCESS, STATUS_FAIL } from '@src/network';

// Utils
import { copyToClipboard, errorToastMessage } from '@src/utils';

// Type
import { TRAINING_TOOL_TYPE } from '@src/types';

// CSS module
import style from './AdminTrainingDetail.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

const AdminTrainingDetail = ({ data, tableData, getTrainingsData }) => {
  const { t } = useTranslation();

  // State
  const [queueData, setQueueData] = useState([]);
  const [integratedData, setIntegratedData] = useState([]);
  const [sshIds, setSshIds] = useState([]);
  const [toolIds, setToolIds] = useState([]);
  const [stoppedIds, setStoppedIds] = useState([]);
  const [queueIds, setQueueIds] = useState([]);
  const [progress, setProgress] = useState([]);
  const [toolLoading, setToolLoading] = useState(false);
  const [inteStopLoading, setInteStopLoading] = useState(false);
  const [queueStopLoading, setQueueStopLoading] = useState(false);

  const {
    type,
    training_name: trainingName,
    description,
    access,
    users,
    built_in_model_name: builtInModelName,
    create_datetime: dateTime,
  } = data;

  const userList = users.map(({ user_name: user }) => {
    return user;
  });

  const integratedColumns = [
    {
      name: t('toolName.label'),
      selector: 'toolName',
      sotrable: false,
      minWidth: '220px',
      maxWidth: '300px',
      cell: ({ toolName, toolType, replicaNum }) => {
        const toolTypeText = TRAINING_TOOL_TYPE[toolType]?.type ?? 'default';
        let toolNameData = toolName;
        if (!toolNameData) {
          toolNameData = TRAINING_TOOL_TYPE[toolType]?.label;
        }
        return (
          <>
            {toolTypeText === 'default' ? (
              toolNameData && (
                <div className={cx('initial')}>
                  {toolNameData.slice(0, 1).toUpperCase()}
                </div>
              )
            ) : (
              <img
                className={cx('table-icon')}
                src={`/images/icon/ic-${toolTypeText}.svg`}
                alt={`${toolTypeText} icon`}
              />
            )}
            <div className={cx('tool-replica-number')}>
              {replicaNum < 10 ? `0${replicaNum}` : replicaNum}
            </div>
            <span className={cx('tool-name')}>{toolNameData}</span>
          </>
        );
      },
    },
    {
      name: t('status.label'),
      selector: 'status',
      sortable: false,
      maxWidth: '90px',
      cell: ({ status }) => {
        return t(status);
      },
    },
    {
      name: t('configuration.label'),
      selector: 'configuration',
      sortable: false,
      minWidth: '150px',
      maxWidth: '350px',
    },
    {
      name: t('dockerImage.label'),
      selector: 'dockerImage',
      sortable: false,
      minWidth: '120px',
    },
    {
      name: t('access.label'),
      sortable: false,
      minWidth: '224px',
      cell: ({ access, toolId, toolType }) => {
        const toolLink = access.map((type, key) => {
          if (type === 'ssh') {
            return (
              <div
                key={key}
                className={cx('access-content')}
                onClick={() => {
                  accessClickHandler(type, toolId);
                }}
              >
                <div className={cx('access-title')}>SSH</div>
                <img
                  className={cx('access-icon')}
                  src='/images/icon/00-ic-basic-copy-o.svg'
                  alt='copy'
                />
              </div>
            );
          } else if (type === 'link') {
            return (
              <div
                key={key}
                className={cx('access-content')}
                onClick={() => {
                  accessClickHandler(type, toolId);
                }}
              >
                <div className={cx('access-title')}>
                  {TRAINING_TOOL_TYPE[toolType]?.label}
                </div>
                <img
                  className={cx('access-icon')}
                  src={
                    toolLoading && toolIds.includes(toolId)
                      ? '/images/icon/spinner-1s-58.svg'
                      : '/images/icon/00-ic-basic-link-external.svg'
                  }
                  alt='link'
                />
              </div>
            );
          } else {
            return <Fragment key={key}></Fragment>;
          }
        });
        return <div className={cx('access-box')}>{toolLink}</div>;
      },
    },
    {
      name: t('stop.label'),
      minWidth: '80px',
      maxWidth: '80px',
      cell: ({ toolId, toolName, toolType }) => {
        let toolNameData = toolName;
        if (!toolNameData) {
          toolNameData = TRAINING_TOOL_TYPE[toolType]?.label;
        }
        return (
          <img
            className={cx(
              'table-icon',
              inteStopLoading && stoppedIds.includes(toolId)
                ? 'icon-block'
                : '',
            )}
            src={
              inteStopLoading && stoppedIds.includes(toolId)
                ? '/images/icon/spinner-1s-58.svg'
                : '/images/icon/ic-stop.svg'
            }
            alt='stop'
            onClick={() => {
              toolHandler(toolId, toolNameData);
            }}
          />
        );
      },
      button: true,
    },
  ];

  /**
   * 대기열 도구 중지 핸들러
   * @param {*} type 도구 타입
   * @param {*} groupId 그룹 id
   * @param {*} itemId 해당 id
   * @param {*} id tool id
   */
  const queueStopHandler = async (type, groupId, itemId, id) => {
    let queueIdsBucket = [...queueIds];
    queueIdsBucket.push(id);
    setQueueIds([...queueIdsBucket]);
    setQueueStopLoading(true);

    let url = 'trainings/stop_';
    if (type === 'hps') {
      url += `hyperparam_searchs?hps_id=${itemId}`;
    } else if (type === 'job') {
      url += `jobs?training_id=${id}&group_id=${groupId}`;
    }
    const response = await callApi({
      url,
      method: 'get',
    });

    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      getTrainingsData();
      toast.success(t('stopTool.message'));
    } else {
      errorToastMessage(error, message);
    }
    const newQueueIds = queueIdsBucket.filter((item) => item !== id);
    setQueueStopLoading(newQueueIds.length > 0);
    setQueueIds([...newQueueIds]);
  };

  /**
   * 통합 도구 접근 클릭 핸들러
   * @param {*} name ssh or link
   * @param {*} id 해당 tool id
   */
  const accessClickHandler = (name, id) => {
    if (name === 'ssh') {
      copySSHAddress(id);
    } else if (name === 'link') {
      moveToolLink(id);
    }
  };

  /**
   * SSH 주소 복사
   */
  const copySSHAddress = async (id) => {
    let sshIdsBucket = [...sshIds];
    sshIdsBucket.push(id);
    setSshIds([...sshIdsBucket]);
    const response = await callApi({
      url: `trainings/ssh_login_cmd?training_tool_id=${id}`,
      method: 'get',
    });

    const { result, status, message, error } = response;

    if (status === STATUS_SUCCESS) {
      copyToClipboard(result);
      toast.success(result);
    } else {
      errorToastMessage(error, message);
    }
    const newAccessIds = sshIdsBucket.filter((item) => item !== id);
    setSshIds([...newAccessIds]);
  };

  /**
   * 통합 도구 중지 핸들러
   * @param {number} toolId
   * @param {string} toolName
   */
  const toolHandler = async (toolId, toolName) => {
    const stoppedIdsBucket = [...stoppedIds];
    stoppedIdsBucket.push(toolId);
    setStoppedIds([...stoppedIdsBucket]);
    setInteStopLoading(true);

    const response = await callApi({
      url: 'trainings/control_training_tool',
      method: 'put',
      body: {
        training_tool_id: toolId,
        action: 'off',
      },
    });
    const { status: apiStatus, message, error } = response;
    if (apiStatus === STATUS_SUCCESS) {
      getTrainingsData();
      toast.success(t('stopTool.message', { tool: toolName }));
    } else if (apiStatus === STATUS_FAIL) {
      errorToastMessage(error, message);
    } else {
      toast.error(message);
    }
    const newStoppedIds = stoppedIdsBucket.filter((item) => item !== toolId);
    setInteStopLoading(newStoppedIds.length > 0);
    setStoppedIds([...newStoppedIds]);
  };

  /**
   * Tool 새창에서 열기
   * @param {string} id 학습 툴 id
   */
  const moveToolLink = async (id) => {
    let toolIdsBucket = [...toolIds];
    toolIdsBucket.push(id);
    setToolIds([...toolIdsBucket]);
    setToolLoading(true);
    const response = await callApi({
      url: `trainings/tool-url?training_tool_id=${id}&protocol=${window.location.protocol.replace(
        ':',
        '',
      )}`,
      method: 'get',
    });

    const { result, status: apiStatus, message, error } = response;
    if (apiStatus === STATUS_SUCCESS) {
      window.open(result.url, '_blank');
    } else if (apiStatus === STATUS_FAIL) {
      errorToastMessage(error, message);
    } else {
      toast.error(message);
    }
    const newDownIds = toolIdsBucket.filter((item) => item !== id);
    setToolLoading(newDownIds.length > 0);
    setToolIds([...newDownIds]);
  };

  useEffect(() => {
    const [detailData] = tableData?.filter((item) => item.id === data?.id);
    setProgress(detailData?.item_progress?.status);
    const integratedList = detailData?.training_tool_list;
    let queueToolData = [
      {
        type: detailData?.item_progress?.type ?? '-',
        status: detailData.item_progress?.status.status ?? '-',
        configuration: detailData?.item_progress?.configurations ?? '-',
        dockerImage: detailData?.item_progress?.docker_image_name ?? '-',
        progress: detailData?.item_progress?.progress ?? '-',
        groupId: detailData?.item_progress?.item_group_id ?? '-',
        itemId: detailData?.item_progress?.item_id ?? '-',
        id: detailData?.id,
      },
    ];

    const integratedToolData = [];
    integratedList?.forEach((item) => {
      integratedToolData.push({
        toolName: item?.tool_name,
        status: item?.tool_status?.status,
        configuration: item?.tool_configuration,
        dockerImage: item?.tool_image_name,
        access: item?.function_info, //배열
        toolType: item?.tool_type,
        replicaNum: item?.tool_replica_number,
        toolId: item?.tool_id,
      });
    });
    if (queueToolData[0]?.status === 'stop') {
      queueToolData = [];
    }
    setQueueData(queueToolData);
    setIntegratedData(integratedToolData);
  }, [data, tableData]);

  const columns = [
    {
      name: t('toolName.label'),
      selector: 'type',
      sortable: false,
      maxWidth: '120px',
    },
    {
      name: t('status.label'),
      selector: 'status',
      sortable: false,
      minWidth: '60px',
      maxWidth: '90px',
      cell: ({ status }) => {
        return t(status);
      },
    },
    {
      name: t('configurations.label'),
      selector: 'configuration',
      sortable: false,
      minWidth: '90px',
    },
    {
      name: t('dockerImage.label'),
      selector: 'dockerImage',
      sotrable: false,
      minWidth: '90px',
    },
    {
      name: t('progressStatus.label'),
      selector: 'c',
      sortable: false,
      minWidth: '170px',
      cell: () => {
        return (
          <div className={cx('progress-box')}>
            <div className={cx('progress-value')}>
              <Progress
                percent={queueData?.progress}
                status={'active'}
                theme={{
                  active: {
                    symbol: '',
                    color: '#2d76f8',
                    trailColor: '#dee9ff',
                  },
                }}
              />
            </div>
            <div className={cx('progress-status')}>
              {`(${progress?.done + progress?.running}/${progress?.total})`}
            </div>
          </div>
        );
      },
    },
    {
      name: t('stop.label'),
      minWidth: '80px',
      maxWidth: '80px',
      cell: ({ type, groupId, itemId, id }) => {
        return (
          <img
            className={cx(
              'table-icon',
              queueStopLoading && queueIds.includes(id) ? 'icon-block' : '',
            )}
            src={
              queueStopLoading && queueIds.includes(id)
                ? '/images/icon/spinner-1s-58.svg'
                : '/images/icon/ic-stop.svg'
            }
            alt='stop'
            onClick={() => {
              queueStopHandler(type, groupId, itemId, id);
            }}
          />
        );
      },
      button: true,
    },
  ];

  return (
    <div className={cx('detail')}>
      <div className={cx('header')}>
        <h3 className={cx('title')}>
          {t('detailsOf.label', { name: trainingName })}
        </h3>
        <p className={cx('desc')}>{description}</p>
      </div>
      <div className={cx('info-list')}>
        <div className={cx('list-item')}>
          <label className={cx('label')}>{t('createdAt.label')}</label>
          <div className={cx('value')} title={dateTime}>
            {dateTime ?? '-'}
          </div>
        </div>
        <div className={cx('list-item')}>
          <label className={cx('label')}>{t('accessType.label')}</label>
          <div className={cx('value')}>
            {access === 1 ? 'Public' : 'Private'}
          </div>
        </div>
        <div className={cx('list-item', type)}>
          <label className={cx('label')}>
            {t('users.label')} ({users.length})
          </label>
          <div className={cx('value', 'user')} title={userList.join(', ')}>
            {userList.join(', ')}
          </div>
        </div>
        {type === 'built-in' && (
          <div className={cx('list-item')}>
            <label className={cx('label')}>{t('model.label')}</label>
            <div className={cx('value')} title={builtInModelName}>
              {builtInModelName ?? '-'}
            </div>
          </div>
        )}
      </div>
      <div className={cx('table-box')}>
        <div className={cx('table-title')}>{t('queueTool.label')}</div>
        <Table
          data={queueData}
          columns={columns}
          selectableRows={false}
          totalRows={queueData.length}
          hideSearchBox={true}
          loading={false}
          fixedHeader={true}
          fixedHeaderScrollHeight='200px'
          noDataMessage={'noActiveTool.message'}
        />
      </div>
      <div className={cx('table-box')}>
        <div className={cx('table-title')}>{t('integratedTool.label')}</div>
        <Table
          data={integratedData}
          columns={integratedColumns}
          selectableRows={false}
          totalRows={integratedData.length}
          hideSearchBox={true}
          loading={false}
          fixedHeader={true}
          fixedHeaderScrollHeight='200px'
          noDataMessage={'noActiveTool.message'}
        />
      </div>
    </div>
  );
};

export default AdminTrainingDetail;

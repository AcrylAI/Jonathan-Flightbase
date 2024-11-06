import { useState, useEffect, Fragment } from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import Table from '@src/components/molecules/Table';
import { toast } from '@src/components/Toast';
import { CopyToClipboard } from 'react-copy-to-clipboard';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';

// Utils
import { convertLocalTime } from '@src/datetimeUtils';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// CSS module
import style from './AdminDeploymentDetail.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const AdminDeploymentDetail = ({ data, onRefresh }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    id: deploymentId,
    deployment_name: deploymentName,
    description,
    access,
    users,
    create_datetime: createdDatetime,
    deployment_worker_list: workerList,
    api_address: apiAddress,
  } = data;
  const [detailTableData, setDetailTableData] = useState([]);
  const userList = users?.map(({ user_name: user }) => {
    return user;
  });

  const columns = [
    {
      name: t('name.label'),
      selector: 'id',
      minWidth: '120px',
      maxWidth: '140px',
      cell: ({ id }) => {
        return `${t('worker.label')} ${id}`;
      },
    },
    {
      name: t('status.label'),
      selector: 'status',
      minWidth: '60px',
      maxWidth: '90px',
      cell: ({ status }) => {
        return t(status);
      },
    },
    {
      name: t('configurations.label'),
      selector: 'configurations',
      minWidth: '160px',
    },
    {
      name: t('description.label'),
      selector: 'description',
      minWidth: '80px',
      cell: ({ description }) => {
        return description ?? '-';
      },
    },
    {
      name: t('createdDatetime.label'),
      selector: 'create_datetime',
      minWidth: '90px',
      maxWidth: '180px',
    },
    {
      name: t('stop.label'),
      maxWidth: '86px',
      cell: ({ id }) => {
        return (
          <img
            className='table-icon'
            src='/images/icon/ic-stop.svg'
            alt='stop'
            onClick={() => {
              onStopWorker(id);
            }}
          />
        );
      },
      button: true,
    },
  ];

  /**
   * 워커 중지
   *
   * @param {number} id worker ID
   */
  const onStopWorker = async (id) => {
    const response = await callApi({
      url: `deployments/worker/stop?deployment_worker_id=${id}`,
      method: 'GET',
    });
    const { status, message } = response;
    if (status === STATUS_SUCCESS) {
      toast.success(t('workerStop.toast.message', { worker: id }));
    } else {
      toast.error(message);
    }
    setTimeout(() => {
      onRefresh();
    }, 1000);
  };

  const onCopy = () => {
    toast.success(t('copyToClipboard.success.message'));
  };

  /**
   * API 수정 모달 오픈
   */
  const openEditApiModal = () => {
    dispatch(
      openModal({
        modalType: 'EDIT_API',
        modalData: {
          submit: {
            text: t('edit.label'),
            func: () => {
              dispatch(closeModal('EDIT_API'));
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
          deploymentId,
          apiAddress,
        },
      }),
    );
  };

  useEffect(() => {
    setDetailTableData(workerList);
  }, [workerList]);

  return (
    <div className={cx('detail')}>
      <div className={cx('header')}>
        <h3 className={cx('title')}>
          {t('detailsOf.label', { name: deploymentName })}
        </h3>
        <p className={cx('desc')}>{description}</p>
      </div>
      <div className={cx('horizon-box')}>
        <div className={cx('box')}>
          <span className={cx('label')}>{t('createdDatetime.label')}</span>
          <span className={cx('value')}>
            {createdDatetime ? convertLocalTime(createdDatetime) : '-'}
          </span>
        </div>
        <div className={cx('box')}>
          <span className={cx('label')}>{t('accessType.label')}</span>
          <span className={cx('value')}>
            {access === 0 ? 'Private' : 'Public'}
          </span>
        </div>
        <div className={cx('box', 'two-column')}>
          <label className={cx('label')}>
            {t('users.label')} ({users ? users.length : 0})
          </label>
          {userList && (
            <div className={cx('value', 'user')} title={userList.join(', ')}>
              {userList.join(', ') ?? '-'}
            </div>
          )}
        </div>

        <div className={cx('box', 'two-column')}>
          <div className={cx('label')}>{t('apiAddress.label')}</div>
          <div className={cx('value-box')}>
            <span className={cx('value')} title={apiAddress}>
              {apiAddress ?? '-'}
            </span>
            {apiAddress && (
              <Fragment>
                <CopyToClipboard text={apiAddress} onCopy={onCopy}>
                  <button
                    className={cx('btn', 'copy-btn')}
                    title={t('copyToClipboard.message')}
                  ></button>
                </CopyToClipboard>
                <button
                  className={cx('btn', 'edit-btn')}
                  onClick={openEditApiModal}
                ></button>
              </Fragment>
            )}
          </div>
        </div>
      </div>
      <label className={cx('table-title')}>{t('worker.label')}</label>
      <Table
        data={detailTableData}
        columns={columns}
        selectableRows={false}
        totalRows={detailTableData.length}
        defaultSortField='create_datetime'
        hideSearchBox={true}
        fixedHeader={true}
        fixedHeaderScrollHeight='200px'
      />
    </div>
  );
};

export default AdminDeploymentDetail;

import { Fragment } from 'react';

// i18n
import { withTranslation } from 'react-i18next';

// CSS module
import style from './AdminNodeDetail.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const AdminNodeDetail = ({ data, t }) => {
  const {
    node_name: nodeName,
    system_info: {
      cpu,
      cpu_cores: cpuCores,
      os,
      ram,
      driver_version: gpuDriverVersion,
    },
    gpu_list: gpuList,
    partition_info: partitionList,
    gpu_node_options: gpuNodeOptions,
    cpu_node_options: cpuNodeOptions,
  } = data;

  let isMigEnabled = -1;
  if (gpuList) {
    isMigEnabled = gpuList.findIndex(
      ({ mig_mode: migMode }) => migMode.toLowerCase() === 'enabled',
    );
  }

  return (
    <div className={cx('detail')}>
      <div className={cx('header')}>
        <h3 className={cx('title')}>
          {t('detailsOf.label', { name: nodeName })}
        </h3>
      </div>
      <ul className={cx('horizon-box')}>
        <li className={cx('box')}>
          <span className={cx('label')}>CPU</span>
          <span className={cx('value')}>{cpu || '-'}</span>
        </li>
        <li className={cx('box')}>
          <span className={cx('label')}>CPU Cores</span>
          <span className={cx('value')}>{cpuCores || '-'}</span>
        </li>
        <li className={cx('box')}>
          <span className={cx('label')}>OS</span>
          <span className={cx('value')}>{os || '-'}</span>
        </li>
        <li className={cx('box')}>
          <span className={cx('label')}>RAM</span>
          <span className={cx('value')}>{ram || '-'}</span>
        </li>
        {!cpuNodeOptions && (
          <li className={cx('box')}>
            <span className={cx('label')}>{t('gpuDriverVerseion.label')}</span>
            <span className={cx('value')}>{gpuDriverVersion || '-'}</span>
          </li>
        )}
      </ul>
      {gpuNodeOptions && (
        <div className={cx('block')}>
          <p className={cx('block-title')}>
            {t('gpuServerSettingsInfo.label')}
          </p>
          <ul className={cx('horizon-box')}>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('coresPerPod.label')}</span>
              <span className={cx('value')}>
                {gpuNodeOptions.cpu_cores_limit || '-'}
              </span>
            </li>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('CoreUsagePerPod.label')}</span>
              <span className={cx('value')}>
                {gpuNodeOptions.cpu_cores_limit_rate
                  ? `${gpuNodeOptions.cpu_cores_limit_rate}%`
                  : '-'}
              </span>
            </li>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('ramPerPod.label')}</span>
              <span className={cx('value')}>
                {gpuNodeOptions.ram_limit
                  ? `${gpuNodeOptions.ram_limit}GB`
                  : '-'}
              </span>
            </li>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('RamUsagePerPod.label')}</span>
              <span className={cx('value')}>
                {gpuNodeOptions.ram_limit_rate
                  ? `${gpuNodeOptions.ram_limit_rate}%`
                  : '-'}
              </span>
            </li>
          </ul>
          <ul className={cx('horizon-box')}>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('limitcore.label')}</span>
              <span className={cx('value')}>
                {gpuNodeOptions.cpu_cores_lock}
              </span>
            </li>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('limitram.label')}</span>
              <span className={cx('value')}>
                {gpuNodeOptions.ram_limit_lock}
              </span>
            </li>
          </ul>
        </div>
      )}
      {cpuNodeOptions && (
        <div className={cx('block')}>
          <p className={cx('block-title')}>
            {t('cpuServerSettingsInfo.label')}
          </p>
          <ul className={cx('horizon-box')}>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('coresPerPod.label')}</span>
              <span className={cx('value')}>
                {cpuNodeOptions.cpu_cores_limit || '-'}
              </span>
            </li>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('CoreUsagePerPod.label')}</span>
              <span className={cx('value')}>
                {cpuNodeOptions.cpu_cores_limit_rate
                  ? `${cpuNodeOptions.cpu_cores_limit_rate}%`
                  : '-'}
              </span>
            </li>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('ramPerPod.label')}</span>
              <span className={cx('value')}>
                {cpuNodeOptions.ram_limit
                  ? `${cpuNodeOptions.ram_limit}GB`
                  : '-'}
              </span>
            </li>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('RamUsagePerPod.label')}</span>
              <span className={cx('value')}>
                {cpuNodeOptions.ram_limit_rate
                  ? `${cpuNodeOptions.ram_limit_rate}%`
                  : '-'}
              </span>
            </li>
          </ul>
          <ul className={cx('horizon-box')}>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('limitcore.label')}</span>
              <span className={cx('value')}>
                {cpuNodeOptions.cpu_cores_lock}
              </span>
            </li>
            <li className={cx('box')}>
              <span className={cx('label')}>{t('limitram.label')}</span>
              <span className={cx('value')}>
                {cpuNodeOptions.ram_limit_lock}
              </span>
            </li>
          </ul>
        </div>
      )}
      {gpuList && (
        <div className={cx('block')}>
          <p className={cx('block-title')}>{t('gpuInformation.label')}</p>
          <table className={cx('info-table')}>
            <thead>
              <tr>
                <th>GPU ID</th>
                <th>Model</th>
                <th>Memory</th>
                <th>CUDA Cores</th>
                <th>Computer Capability</th>
                <th>Architecture</th>
                <th>NVLink</th>
                <th>MIG mode</th>
              </tr>
            </thead>
            <tbody>
              {gpuList.map(
                (
                  {
                    num,
                    model,
                    memory,
                    cuda_cores: cudaCores,
                    computer_capability: computerCapability,
                    architecture,
                    nvlink,
                    mig_mode: migMode,
                  },
                  idx,
                ) => (
                  <tr key={idx}>
                    <td>{num}</td>
                    <td>{model}</td>
                    <td>{memory}</td>
                    <td>{cudaCores}</td>
                    <td>{computerCapability}</td>
                    <td>{architecture}</td>
                    <td>{nvlink}</td>
                    <td>{migMode || '-'}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {partitionList && (
        <div className={cx('block')}>
          <p className={cx('block-title')}>{t('partitionInformation.label')}</p>
          <table className={cx('info-table')}>
            <thead>
              <tr>
                {/* <th>Partition</th> */}
                <th>Type</th>
                <th>Mount Point</th>
                <th>Total Memory</th>
                <th>Used Memory</th>
                <th>Used Memory Rate</th>
              </tr>
            </thead>
            <tbody>
              {partitionList.map(
                (
                  {
                    // name,
                    fstype,
                    mountpoint,
                    total,
                    used,
                    percent,
                  },
                  idx,
                ) => (
                  <tr key={idx}>
                    {/* <td>{name}</td> */}
                    <td>{fstype}</td>
                    <td>{mountpoint}</td>
                    <td>{total}</td>
                    <td>{used}</td>
                    <td>{percent}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      {isMigEnabled !== -1 && (
        <div className={cx('block')}>
          <p className={cx('block-title')}>{t('migInformation.label')}</p>
          <table className={cx('info-table')}>
            <thead>
              <tr>
                <th>GPU ID : MIG ID</th>
                <th>Instance</th>
              </tr>
            </thead>
            <tbody>
              {gpuList.map(({ mig_list: migList }, i) => (
                <Fragment key={i}>
                  {migList.map((migInfo, j) => (
                    <tr key={j}>
                      <td>{`${i} : ${j}`}</td>
                      <td>{migInfo}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default withTranslation()(AdminNodeDetail);

import { useState } from 'react';
import { toUpper } from 'lodash';

import { ListProps } from '@src/pages/ExportResultsPage/ExportResultsPage';

import { Sypo } from '@src/components/atoms';
import Spinner from '@src/components/atoms/Loader/Spinner/Spinner';

import useT from '@src/hooks/Locale/useT';

import { DownloadIcon } from '@src/static/images';

import styles from './ExportResultsPageContents.module.scss';
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

type Props = {
  data: Array<ListProps>;
};

function ResultList({ data }: Props) {
  const { t } = useT();
  const [downloadStatus, setDownloadStatus] = useState<Array<boolean>>([]);
  const headerValueArr = [
    `${t(`page.exportResults.number`)}`,
    `${t(`page.exportResults.exportedDate`)}`,
    `${t(`page.exportResults.data`)}`,
    `${t(`page.exportResults.labels`)}`,
    `${t(`page.exportResults.user`)}`,
    `${t(`page.exportResults.format`)}`,
    `${t(`page.projectInfo.download`)}`,
  ];

  const onDownloadClick = async (data: ListProps, index: number) => {
    setDownloadStatus((data) =>
      data.map((data: boolean, idx: number) => (index === idx ? !data : data)),
    );
    const response = await fetch(data.url);
    const file = await response.blob();
    const downloadUrl = window.URL.createObjectURL(file);
    const anchorElement = document.createElement('a');
    document.body.appendChild(anchorElement);
    anchorElement.download = data.fileName;
    anchorElement.href = downloadUrl;
    anchorElement.click();
    document.body.removeChild(anchorElement);
    window.URL.revokeObjectURL(downloadUrl);
    setDownloadStatus((data) =>
      data.map((data: boolean, idx: number) => (index === idx ? false : data)),
    );
  };

  const handleDownloadStatus = (idx: number) => {
    if (data) {
      return data[idx].status === 1;
    }
    return false;
  };

  return (
    <div className={cx('record-list-container')}>
      <div className={cx('record-list', 'header')}>
        {headerValueArr &&
          headerValueArr.map((v) => (
            <div className={cx('record-list-item')} key={v}>
              <Sypo type='p1' weight={400} ellipsis>
                {v}
              </Sypo>
            </div>
          ))}
      </div>
      {data &&
        data.map((v: ListProps, index: number) => (
          <div className={cx('record-list')} key={v.userName + index}>
            <div className={cx('record-list-item')}>
              <Sypo type='p1' weight={400} ellipsis>
                {index + 1}
              </Sypo>
            </div>
            <div className={cx('record-list-item')}>
              <Sypo type='p1' weight={400} ellipsis>
                {v.exportedDate}
              </Sypo>
            </div>
            <div className={cx('record-list-item')}>
              <Sypo type='p1' weight={400} ellipsis>
                {v.dataCnt}
              </Sypo>
            </div>
            <div className={cx('record-list-item')}>
              <Sypo type='p1' weight={400} ellipsis>
                {v.labelCnt}
              </Sypo>
            </div>
            <div className={cx('record-list-item')}>
              <Sypo type='p1' weight={400} ellipsis>
                {v.userName}
              </Sypo>
            </div>
            <div className={cx('record-list-item')}>
              <Sypo type='p1' weight={400} ellipsis>
                {toUpper(v.format)}
              </Sypo>
            </div>
            {handleDownloadStatus(index) ? (
              <div
                className={cx('download-icon', 'record-list-item')}
                onClick={() => onDownloadClick(v, index)}
              >
                <img src={DownloadIcon} alt='' />
              </div>
            ) : (
              <div className={cx('download-icon', 'record-list-item')}>
                <Spinner width={18} height={18} />
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

export default ResultList;

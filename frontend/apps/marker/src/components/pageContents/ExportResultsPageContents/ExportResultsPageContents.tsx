/* eslint-disable camelcase */

import { ExportResultListType } from '@src/pages/ExportResultsPage/ExportResultsPage';

import { Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import ClassGraph from './ClassGraph';
import ClassList from './ClassList';
import ResultList from './ResultList';

import styles from './ExportResultsPageContents.module.scss';
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

type Props = {
  data: ExportResultListType;
};

function ExportResultsPageContents({ data }: Props) {
  const { t } = useT();
  const ContentsHeaderItem = ({
    title,
    value,
  }: {
    title: string;
    value: string | number;
  }) => {
    return (
      <div className={cx('header-item')}>
        <div className={cx('item-header')}>
          <Sypo type='p2' weight={400}>
            {title ?? ''}
          </Sypo>
        </div>
        <Sypo type='p1' weight={400}>
          {value ?? ''}
        </Sypo>
      </div>
    );
  };

  return (
    <div className={cx('contents-container')}>
      <div className={cx('contents-header')}>
        <ContentsHeaderItem
          title={t(`page.exportResults.completedData`)}
          value={(data && data.workInfo.dataCnt) ?? ''}
        />
        <ContentsHeaderItem
          title={t(`page.exportResults.createdLabels`)}
          value={(data && data.workInfo.labelCnt) ?? ''}
        />
        <ContentsHeaderItem
          title={t(`page.exportResults.linkedFolder`)}
          value={(data && data.workInfo.connectedFolder) ?? '/'}
        />
      </div>
      <div className={cx('contents-wrapper')}>
        <div className={cx('list-section')}>
          <div className={cx('total-class-box', 'box')}>
            <Sypo type='p1' weight={400}>
              {t(`page.exportResults.totalClasses`)}
            </Sypo>
            {data.workInfo && <ClassList data={data.workInfo.totalClass} />}
          </div>
          <div className={cx('export-record-box', 'box')}>
            <Sypo type='p1' weight={400}>
              {t(`page.exportResults.exportHistory`)}
            </Sypo>
            {data.exportList && <ResultList data={data.exportList} />}
          </div>
        </div>
        <div className={cx('graph-section', 'box')}>
          <Sypo type='p1' weight={400}>
            {t(`page.exportResults.classStatus`)}
          </Sypo>
          <div
            style={{
              overflow: 'scroll hidden',
              height: '100%',
              width: 'fit-contents',
            }}
          >
            <div style={{ width: '100%', height: '100%' }}>
              <ClassGraph data={data && data.workInfo.totalClass} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportResultsPageContents;

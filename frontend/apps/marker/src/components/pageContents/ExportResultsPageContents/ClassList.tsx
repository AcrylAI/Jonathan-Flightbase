import { TotalClassType } from '@src/pages/ExportResultsPage/ExportResultsPage';

import { Sypo } from '@src/components/atoms';

import styles from './ExportResultsPageContents.module.scss';
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

function ClassList({ data }: { data: Array<TotalClassType> }) {
  const NameRender = (v: TotalClassType) => {
    const keys = Object.keys(v);

    if (keys.includes('name')) {
      return v.name;
    }
    if (keys.includes('lv3')) {
      return `${v.lv1}/.../ ${v.lv3}`;
    }
    if (keys.includes('lv2')) {
      return `${v.lv1}/${v.lv2}`;
    }
    return `${v.lv1}`;
  };

  const ToolRender = (tool: number) => {
    switch (tool) {
      case 1:
        return 'Polygon';
      case 2:
        return 'B-box';
      case 3:
        return 'NER';
      default:
        return '';
    }
  };

  return (
    <div className={cx('list-item-wrapper')}>
      {data &&
        data.map((v) => (
          <div className={cx('list-item')} key={v.id}>
            <Sypo type='p1' weight={400}>
              {NameRender(v)}
            </Sypo>
            <Sypo type='p1' weight={400}>
              {ToolRender(v.tool)}
            </Sypo>
          </div>
        ))}
    </div>
  );
}

export default ClassList;

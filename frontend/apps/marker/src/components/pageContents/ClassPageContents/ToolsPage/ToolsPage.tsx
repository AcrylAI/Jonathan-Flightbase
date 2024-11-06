/* eslint-disable camelcase */
import { useState } from 'react';

import { ClassContentsClassModel } from '@src/stores/components/pageContents/ClassPageContents/ClassPageContentsAtom';

import { Sypo } from '@src/components/atoms';

import styles from './ToolsPage.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  classList: Array<ClassContentsClassModel>;
};

type SelectedIdType = {
  depth1: null | number;
  depth2: null | number;
};

function ToolsPage({ classList }: Props) {
  const [selectedId, setSelectedId] = useState<SelectedIdType>({
    depth1: null,
    depth2: null,
  });

  const depth1Class =
    classList &&
    classList.filter((data: ClassContentsClassModel) => data.parent_id === 0);

  const depth2Class = classList.filter(
    (data) => data.parent_id === selectedId.depth1,
  );

  const depth3Class = classList.filter(
    (data) => data.parent_id === selectedId.depth2,
  );

  const renderTool = (data: number) => {
    switch (data) {
      case 1:
        return 'B-box';
      case 2:
        return 'Polygon';
      case 3:
        return 'NER';
      default:
        return '';
    }
  };

  const onListItemClick = (id: number, depth: number) => {
    if (depth === 0) {
      setSelectedId({
        depth1: id,
        depth2: null,
      });
      return;
    }
    if (depth === 1) {
      setSelectedId({
        depth1: selectedId.depth1,
        depth2: id,
      });
    }
  };

  const ListItem = ({ data }: { data: ClassContentsClassModel }) => {
    return (
      <div
        className={cx(
          'list-item',
          Object.values(selectedId).includes(data.id) &&
            data.depth !== 2 &&
            'select',
          data.depth === 2 && 'last-depth',
        )}
        onClick={() => onListItemClick(data.id, data.depth)}
      >
        <div className={cx('color-name-wrapper')}>
          {data.color && data.parent_id === 0 && (
            <div
              className={cx('color-circle')}
              style={data.color ? { background: data.color } : {}}
            ></div>
          )}
          <Sypo type='h4' weight={400}>
            {data?.name}
          </Sypo>
        </div>
        {data.color && data.parent_id === 0 && (
          <Sypo type='h4' weight={400}>
            {renderTool(data?.tool) ?? ''}
          </Sypo>
        )}
      </div>
    );
  };

  return (
    <div className={cx('container')}>
      <div className={cx('list-box')}>
        {depth1Class &&
          depth1Class.map((data: ClassContentsClassModel) => (
            <ListItem data={data} key={data.name} />
          ))}
      </div>
      <div className={cx('list-box')}>
        {selectedId.depth1 &&
          depth2Class.map((data: ClassContentsClassModel) => (
            <ListItem data={data} key={data.name} />
          ))}
      </div>
      <div className={cx('list-box')}>
        {selectedId.depth2 &&
          depth3Class.map((data: ClassContentsClassModel) => (
            <ListItem data={data} key={data.name} />
          ))}
      </div>
    </div>
  );
}

export default ToolsPage;

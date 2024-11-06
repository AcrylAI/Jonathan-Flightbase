import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _, { template } from 'lodash';

import {
  ClassPageContentsAtom,
  ClassPageContentsAtomModel,
} from '@src/stores/components/pageContents/ClassPageContents/ClassPageContentsAtom';

import { ItemContainer, Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import styles from './ClassPageClassCard.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const ClassPageClassContent = () => {
  const { t } = useT();
  const TOOL_NAME = [
    `${t(`modal.newProject.boundingBox`)}`,
    `${t(`modal.newProject.polygon`)}`,
    'NER',
  ];
  const [pageState, setPageState] = useRecoilState<ClassPageContentsAtomModel>(
    ClassPageContentsAtom,
  );
  const onClickItem = (idx: number) => {
    const temp = _.cloneDeep(pageState);
    temp.selected = idx;
    setPageState(temp);
  };

  return (
    <div className={cx('class-list-container')}>
      <div className={cx('header')}>
        <div className={cx('no')}>
          <Sypo type='P2'>{t(`page.tools.number`)}</Sypo>
        </div>
        <div className={cx('color')}>
          <Sypo type='P2'>{t(`page.tools.color`)}</Sypo>
        </div>
        <div className={cx('class-name')}>
          <Sypo type='P2'>{t(`page.tools.className`)}</Sypo>
        </div>
        <div className={cx('tool')}>
          <Sypo type='P2'>{t(`page.tools.tool`)}</Sypo>
        </div>
      </div>
      <div className={cx('class-list-item-container')}>
        {pageState.classList.map((v, idx) => (
          <div
            key={`class-list-item ${idx}`}
            className={cx(
              'class-list-item',
              v.id === pageState.selected && 'active',
            )}
            onClick={() => onClickItem(v.id)}
          >
            <div className={cx('no')}>
              <Sypo type='P1' weight='medium'>
                {idx + 1}
              </Sypo>
            </div>
            <div className={cx('color')}>
              <div
                className={cx('color-chip')}
                style={{ backgroundColor: `${v.color}` }}
              ></div>
            </div>
            <div className={cx('class-name')}>
              <Sypo type='P1' weight='regular'>
                {v.name}
              </Sypo>
            </div>
            <div className={cx('tool')}>
              <Sypo type='P1' weight='regular'>
                {TOOL_NAME[v.tool - 1]}
              </Sypo>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClassPageClassCard = () => {
  const { t } = useT();
  return (
    <ItemContainer
      headerTitle={`${t(`modal.newProject.class`)}`}
      containerCustomStyle={{ height: '100%' }}
      itemContents={<ClassPageClassContent />}
    />
  );
};

export default ClassPageClassCard;

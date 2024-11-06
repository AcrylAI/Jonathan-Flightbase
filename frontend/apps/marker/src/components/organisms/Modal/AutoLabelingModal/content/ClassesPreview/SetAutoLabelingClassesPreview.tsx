import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { CloseGrayIcon } from '@src/static/images';

import { Case, Default, Switch } from '@jonathan/react-utils';

import SetAutoLabelModalAtom, {
  MatchClassModel,
  SetAutoLabelModalAtomModel,
} from '@src/stores/components/Modal/SetAutoLabelModalAtom';

import { Sypo } from '@src/components/atoms';
import SetAutolabelingListContainer from '../listContainer/SetAutolabelingListContainer';
import AutoLabelingListItem from '../listItem/AutoLabelingListItem';

import useT from '@src/hooks/Locale/useT';

import styles from './SetAutoLabelingClassesPreview.module.scss';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { toast } from '@src/components/molecules/Toast';
const cx = classNames.bind(styles);

type Props = {
  item: MatchClassModel;
  idx: number;
};
const ListItem = ({ item, idx }: Props) => {
  const [hover, setHover] = useState<boolean>(false);
  const [modalState, setModalState] =
    useRecoilState<SetAutoLabelModalAtomModel>(SetAutoLabelModalAtom);
  const { t } = useT();

  const handleHover = (type: 'enter' | 'leave') => {
    if (type === 'enter') {
      setHover(true);
    } else {
      setHover(false);
    }
  };
  const onClickClose = () => {
    const temp = _.cloneDeep(modalState);
    temp.matchClassList.splice(idx, 1);
    setModalState(temp);
  };

  return (
    <div
      className={cx('list-item-container')}
      onMouseOver={() => handleHover('enter')}
      onMouseLeave={() => handleHover('leave')}
    >
      <div className={cx('top')}>
        <div className={cx('left-side')}>
          <div className={cx('class-label')}>
            <Sypo type='P2' weight='R'>
              {t(`modal.setAutolabeling.class`)}
            </Sypo>
          </div>
          <div className={cx('class-title')}>
            <Sypo type='P1' weight='R'>
              {item.className}
            </Sypo>
          </div>
        </div>
        <div className={cx('right-side')}>
          <Switch>
            <Case condition={hover}>
              <img
                className={cx('close')}
                src={CloseGrayIcon}
                alt='close'
                onClick={onClickClose}
              />
            </Case>
            <Default>
              <div
                style={{ backgroundColor: item.color }}
                className={cx('color-chip')}
              ></div>
            </Default>
          </Switch>
        </div>
      </div>
      <div className={cx('mid')}>
        <div className={cx('model-class-label')}>
          <Sypo type='P2' weight='R'>
            {t(`modal.setAutolabeling.modelClass`)}
          </Sypo>
        </div>
        <div className={cx('model-class-wrapper')}>
          {item.modelClassName.map((v, idx) => (
            <div
              className={cx('model-class-title')}
              key={`model-class-name ${idx}`}
            >
              <div className={cx('tool-icon')}>
                <AutoLabelingListItem.Tool
                  size='md'
                  selected={false}
                  type={item.tool as 1 | 2}
                />
              </div>
              <div className={cx('name')}>
                <Sypo type='P1' weight='R'>
                  {v}
                </Sypo>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cx('bottom')}>
        <div className={cx('deploy-label')}>
          <Sypo type='P2' weight='R'>
            {t(`modal.setAutolabeling.deploymentName`)}
          </Sypo>
        </div>
        <div className={cx('deploy-title')}>
          <Sypo type='P1' weight='R'>
            {item.deployName}
          </Sypo>
        </div>
      </div>
    </div>
  );
};

const SetAutoLabelingClassesPreview = () => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<SetAutoLabelModalAtomModel>(SetAutoLabelModalAtom);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = 9999;
  };
  useEffect(() => {
    handleScroll();
  }, [modalState.matchClassList]);
  return (
    <SetAutolabelingListContainer
      title={`${t(`modal.setAutolabeling.classesPreview`)} (${
        modalState.matchClassList.length
      })`}
      scrollHidden
      nodataDesc={
        modalState.matchClassList.length === 0
          ? `${t(`modal.setAutolabeling.noMatchClass`)}`
          : ''
      }
      childrenStyle={{ padding: '0px' }}
    >
      <div className={cx('match-list-container')} ref={scrollRef}>
        {modalState.matchClassList.map((v, idx) => (
          <ListItem idx={idx} item={v} key={`classes-preview-item ${idx}`} />
        ))}
      </div>
    </SetAutolabelingListContainer>
  );
};

export default SetAutoLabelingClassesPreview;

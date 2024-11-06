import { useState } from 'react';

import { Sypo } from '@src/components/atoms';

import { MONO204, MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import { CarrotGrayIcon, CarrotGrayTenderIcon } from '@src/static/images';

import style from './ModelContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  model: Array<{
    modelName: string;
    deploy: string;
  }>;
  deleted: number;
};

function ModelContents({ model, deleted }: Props) {
  const { t } = useT();
  const [pagingIdx, setPagingIdx] = useState(0);

  const onClickLeftIcon = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    const newIdx = pagingIdx - 1;
    if (newIdx < 0) {
      setPagingIdx(model.length - 1);
    } else {
      setPagingIdx(newIdx);
    }
  };

  const onClickRightIcon = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();

    const newIdx = pagingIdx + 1;
    if (newIdx > model.length - 1) {
      setPagingIdx(0);
    } else {
      setPagingIdx(newIdx);
    }
  };

  return (
    <div className={cx('model-container')}>
      {model.length > 0 && (
        <>
          <div className={cx('model-contents')}>
            <img
              src={model.length === 1 ? CarrotGrayTenderIcon : CarrotGrayIcon}
              alt='CarrotGrayIcon'
              className={cx('arrow-icon', 'left', model.length === 1 && 'dim')}
              onClick={onClickLeftIcon}
            ></img>
            <div className={cx('model-status')}>
              <div className={cx('model')}>
                <Sypo type='P2' color={MONO204} weight='R'>
                  {model[pagingIdx].modelName}
                </Sypo>
                {deleted === 1 && (
                  <div className={cx('delete-badge')}>
                    <Sypo type='P4' color={MONO205}>
                      {t('component.badge.deleted')}
                    </Sypo>
                  </div>
                )}
              </div>
              <Sypo type='P1' color={MONO205} weight='M'>
                {model[pagingIdx].deploy}
              </Sypo>
            </div>
            <img
              src={model.length === 1 ? CarrotGrayTenderIcon : CarrotGrayIcon}
              alt='CarrotGrayIcon'
              className={cx('arrow-icon', 'right', model.length === 1 && 'dim')}
              onClick={onClickRightIcon}
            ></img>
          </div>
          <div className={cx('page-mark')}>
            {model.length > 1 &&
              model.map(({ modelName }, idx: number) => {
                return (
                  <div
                    key={`${modelName}-${idx}`}
                    className={cx('mark', idx === pagingIdx && 'selected')}
                  ></div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

export default ModelContents;

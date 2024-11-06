import { Case, Switch } from '@jonathan/react-utils';

import { Sypo } from '@src/components/atoms';
import Spinner from '@src/components/atoms/Loader/Spinner/Spinner';
import SwapLoading from '@src/components/atoms/Loader/SwapBox/SwapLoading';

import { BLUE110 } from '@src/utils/color';

import styles from './DataSetListContainer.module.scss';
import classNames from 'classnames/bind';
import useT from '@src/hooks/Locale/useT';
import { useState } from 'react';
import { useEffect } from 'react';
import { toast } from '@src/components/molecules/Toast';

const cx = classNames.bind(styles);

type DataSetListContainerProps = {
  children?: JSX.Element;
  loading: boolean;
};

const TICK = 8000;
const DataSetListContainer = ({
  children,
  loading,
}: DataSetListContainerProps) => {
  const { t } = useT();
  const [announce, setAnnounce] = useState<boolean>(false);

  const ticker = () => {
    setAnnounce(true);
  };
  useEffect(() => {
    const tick = setTimeout(ticker, TICK);

    return () => {
      clearTimeout(tick);
    };
  }, []);
  useEffect(() => {
    if (!loading) setAnnounce(false);
  }, [loading]);
  return (
    <div className={cx('list-container', loading && 'loading')}>
      <Switch>
        <Case condition={loading}>
          <div className={cx('spinner-container')}>
            <div className={cx('header')}></div>
            <div className={cx('spinner')}>
              <SwapLoading width={80} height={80} interval={800} />
            </div>
            <div className={cx('desc')}>
              <div className={cx('progress')}>
                <div className={cx('label')}>
                  <Sypo type='H4' weight='R' color={BLUE110}>
                    {announce
                      ? `${t(`toast.dataset.delayAnnounce`)}`
                      : `${t(`modal.dataset.loadDesc`)}`}
                  </Sypo>
                </div>
                <div className={cx('dot-group')}>
                  <div className={cx('dot')}></div>
                  <div className={cx('dot')}></div>
                  <div className={cx('dot')}></div>
                  <div className={cx('dot')}></div>
                </div>
              </div>
            </div>
          </div>
        </Case>
        <Case condition={!loading}>{children}</Case>
      </Switch>
    </div>
  );
};

DataSetListContainer.defaultProps = {
  children: <></>,
};

export default DataSetListContainer;

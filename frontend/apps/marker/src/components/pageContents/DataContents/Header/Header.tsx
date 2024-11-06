import { Sypo } from '@src/components/atoms';
import Tooltip from '@src/components/atoms/Tooltip/Tooltip';

import { MONO206 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import { DataInfoIcon } from '@src/static/images';

import styles from './Header.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  selectedRowCount: number;
  connected: number;
  notAssigned: number;
  working: number;
  complete: number;
  windowWidth: number;
};

const WIDTH = 875;

function Header(props: Props) {
  const {
    selectedRowCount,
    connected,
    notAssigned,
    working,
    complete,
    windowWidth,
  } = props;
  const { t } = useT();
  const makeComma = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  return (
    <div className={cx('dataConditionSection', windowWidth >= WIDTH && 'flex')}>
      <div className={cx(windowWidth < WIDTH && 'fist-div-small')}>
        <div>
          <p className={cx('title')}>{t('page.data.selected')}</p>
          <p className={cx('value')}>{makeComma(selectedRowCount)}</p>
        </div>
        <div className={cx('bar')}>
          <div>
            <div className={cx('title')}>
              {t('page.data.connected')}
              <Tooltip icon={DataInfoIcon} offsetX={-80}>
                <div className={cx('data-tooltip')}>
                  <Sypo type='p1' weight='medium' color={MONO206}>
                    {t(`component.toolTip.dataExplain`)}
                  </Sypo>
                </div>
              </Tooltip>
            </div>
            <p className={cx('value')}>{makeComma(connected)}</p>
          </div>
        </div>
        <div className={cx('bar')}>
          <div>
            <p className={cx('title')}>{t('page.data.notAssigned')}</p>
            <p className={cx('value')}>{makeComma(notAssigned)}</p>
          </div>
        </div>
      </div>
      <div className={cx(windowWidth < WIDTH && 'second-div-mini')}>
        <div className={cx(windowWidth >= WIDTH && 'bar')}>
          <div>
            <div className={cx('title')}>
              {t('page.data.workInProgress')}
              <Tooltip icon={DataInfoIcon} offsetX={-80}>
                <div className={cx('data-tooltip')}>
                  <Sypo weight='medium' color={MONO206} type='p1'>
                    {t(`component.toolTip.dataStatus`)}
                  </Sypo>
                </div>
              </Tooltip>
            </div>
            <p className={cx('value')}>{makeComma(working - complete)}</p>
          </div>
        </div>
        <div className={cx('bar')}>
          <div>
            <p className={cx('title')}>{t('page.data.completed')}</p>
            <p className={cx('value')}>{makeComma(complete)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Header;

import styles from './AssignNewWorkContainer.module.scss';
import classNames from 'classnames/bind';
import { Button } from '@jonathan/ui-react';
import { Users, PlusBtnPrimary, ShuffleIcon } from '@src/static/images';
import { Sypo } from '@src/components/atoms';
import useT from '@src/hooks/Locale/useT';
import { BLUE110, MONO202, MONO204 } from '@src/utils/color';

const cx = classNames.bind(styles);

export type AssignNewWorkContainerProps = {
  tab: number;
  title: string;
  distCnt: number;
  hasReview: boolean;
  reviewerCnt: number;
  labelerCnt: number;
  children?: JSX.Element;
  maxDistCnt: number;
  disableAdd: boolean;
  addBtnTitle: string;
  onChangeTab: (tab: number) => void;
  onClickAdd: () => void;
  onClickAutoDist: () => void;
};
type IconProps = {
  disabled: boolean;
};
const PlusIcon = ({ disabled }: IconProps) => {
  return (
    <svg
      style={{ marginRight: '8px' }}
      width='12'
      height='12'
      viewBox='0 0 12 12'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M6 0.3125C4.87512 0.3125 3.7755 0.646066 2.8402 1.27102C1.90489 1.89597 1.17591 2.78423 0.745438 3.82349C0.314964 4.86274 0.202333 6.00631 0.421786 7.10958C0.64124 8.21284 1.18292 9.22626 1.97833 10.0217C2.77374 10.8171 3.78716 11.3588 4.89043 11.5782C5.99369 11.7977 7.13726 11.685 8.17651 11.2546C9.21577 10.8241 10.104 10.0951 10.729 9.15981C11.3539 8.2245 11.6875 7.12488 11.6875 6C11.6846 4.49247 11.0845 3.04751 10.0185 1.98152C8.95249 0.915536 7.50753 0.315391 6 0.3125ZM8.1875 6.4375H6.4375V8.1875C6.4375 8.30353 6.39141 8.41481 6.30936 8.49686C6.22731 8.57891 6.11603 8.625 6 8.625C5.88397 8.625 5.77269 8.57891 5.69064 8.49686C5.6086 8.41481 5.5625 8.30353 5.5625 8.1875V6.4375H3.8125C3.69647 6.4375 3.58519 6.39141 3.50314 6.30936C3.4211 6.22731 3.375 6.11603 3.375 6C3.375 5.88397 3.4211 5.77269 3.50314 5.69064C3.58519 5.60859 3.69647 5.5625 3.8125 5.5625H5.5625V3.8125C5.5625 3.69647 5.6086 3.58519 5.69064 3.50314C5.77269 3.42109 5.88397 3.375 6 3.375C6.11603 3.375 6.22731 3.42109 6.30936 3.50314C6.39141 3.58519 6.4375 3.69647 6.4375 3.8125V5.5625H8.1875C8.30353 5.5625 8.41481 5.60859 8.49686 5.69064C8.57891 5.77269 8.625 5.88397 8.625 6C8.625 6.11603 8.57891 6.22731 8.49686 6.30936C8.41481 6.39141 8.30353 6.4375 8.1875 6.4375Z'
        fill={disabled ? MONO204 : '#2D76F8'}
      />
    </svg>
  );
};
const AssignNewWorkContainer = ({
  tab,
  title,
  distCnt,
  hasReview,
  children,
  labelerCnt,
  reviewerCnt,
  maxDistCnt,
  addBtnTitle,
  disableAdd,
  onChangeTab,
  onClickAdd,
  onClickAutoDist,
}: AssignNewWorkContainerProps) => {
  const { t } = useT();
  const handleClick = () => {
    if (!disableAdd) onClickAdd();
  };
  return (
    <div className={cx('select-table-container')}>
      <div className={cx('header')}>
        <div className={cx('left-side')}>
          <div className={cx('tab')}>
            <div
              onClick={() => onChangeTab(0)}
              className={cx('tab-item', 'labeling', tab === 0 && 'selected')}
            >
              <Sypo type='P1' weight='M'>
                {t(`component.toggleBtn.labeling`)} (
                {labelerCnt.toLocaleString('kr')})
              </Sypo>
            </div>
            {hasReview && (
              <div
                onClick={() => onChangeTab(1)}
                className={cx('tab-item', 'review', tab === 1 && 'selected')}
              >
                <Sypo type='P1' weight='M'>
                  {t(`component.toggleBtn.review`)} (
                  {reviewerCnt.toLocaleString('kr')})
                </Sypo>
              </div>
            )}
          </div>
        </div>
        <div className={cx('right-side')}>
          <div className={cx('add-btn')}>
            <Button
              onClick={handleClick}
              disabled={disableAdd}
              customStyle={{
                backgroundColor: disableAdd ? MONO202 : '#DEE9FF',
                color: disableAdd ? MONO204 : '#2D76F9',
                border: 'none',
                fontSize: '12px',
                padding: '8px 12px 8px 10px',
                fontFamily: 'MarkerFont',
                fontWeight: '500',
                height: '28px',
              }}
            >
              <PlusIcon disabled={disableAdd} />
              {addBtnTitle}
            </Button>
          </div>
        </div>
      </div>
      <div className={cx('select-table-content')}>{children}</div>
      <div className={cx('footer')}>
        <div className={cx('left-side')}>
          <div className={cx('title')}>
            <Sypo type='P1' weight='bold'>
              {t(`modal.assignNewWork.distribution`)}
            </Sypo>
          </div>
          <div className={cx('count', distCnt !== maxDistCnt && 'red')}>
            <Sypo type='P1'>
              ({distCnt.toLocaleString('kr')}/{maxDistCnt.toLocaleString('kr')})
            </Sypo>
          </div>
        </div>
        <div className={cx('right-side')}>
          <Button
            customStyle={{
              backgroundColor: '#fff',
              color: '#2D76F9',
              border: 'none',
              fontSize: '12px',
              padding: '8px 12px',
              fontFamily: 'MarkerFont',
              fontWeight: '500',
              boxShadow: '0px 3px 12px rgba(0, 0, 0, 0.06)',
              borderRadius: '4px',
            }}
            onClick={onClickAutoDist}
          >
            {t(`modal.assignNewWork.autoDistribution`)}
            <img
              style={{ width: '20px', height: '30px', marginLeft: '10px' }}
              src={ShuffleIcon}
              alt='shuffle'
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

AssignNewWorkContainer.defaultProps = {
  children: <></>,
};

export default AssignNewWorkContainer;

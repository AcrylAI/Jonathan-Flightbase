import React, { useLayoutEffect, useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

import * as UIReact from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';
import { ClickAwayListener } from '@jonathan/react-utils';

import { Mypo, Sypo } from '@src/components/atoms';

import styles from './SideView.module.scss';
import classNames from 'classnames/bind';
import useModal from '@src/hooks/Modal/useModal';
import useT from '@src/hooks/Locale/useT';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

// 임시
type GuideProps = {
  img: string;
  desc: Array<string>;
};
type SizeType = 'lg' | 'md' | 'sm';

type Props = {
  title?: string;
  size?: SizeType;
  desc?: string;
  disabled?: boolean;
  toggleIcon?: string;
  children?: JSX.Element;
  opened?: boolean;
  checked?: boolean;
  onChangeChecked?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const VIEW_WIDTH = {
  sm: 184,
  md: 320,
  lg: 500,
};
const TOGGLE_WIDTH = 24;

// const ClickAwayListener = ({ children, onClickAway }) => {
//   return <></>;
// };

const SideView = ({
  desc,
  size,
  title,
  opened,
  checked,
  disabled,
  children,
  toggleIcon,
  onChangeChecked,
}: Props) => {
  const { t } = useT();
  const [active, setActive] = useState<boolean>(false);
  const viewRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const modal = useModal();
  const onClickToggle = () => {
    setActive(!active);
  };

  const handleSize = () => {
    const viewWidth = size ? VIEW_WIDTH[`${size}`] : VIEW_WIDTH.lg;
    if (active) {
      // setting view width
      if (viewRef.current) {
        viewRef.current.style.left = `calc(100% - ${viewWidth}px)`;
      }

      // setting innerWrapper width
      if (wrapperRef.current) {
        wrapperRef.current.style.width = `${viewWidth}px`;
      }
      // setting toggle posX
      if (toggleRef.current) {
        toggleRef.current.style.left = `calc(100% - ${
          viewWidth + TOGGLE_WIDTH
        }px)`;
      }
    } else {
      // setting view width
      if (viewRef.current) {
        viewRef.current.style.left = `100%`;
      }
      // setting toggle posX
      if (toggleRef.current) {
        toggleRef.current.style.left = `calc(100% - ${TOGGLE_WIDTH}px)`;
      }
    }
  };
  const handleAway = () => {
    // 토스트 목록 가져오기 , 기존 토스트에서 지원할 수 없어서 도큐먼트에서 호출
    const toastContainer = document.getElementsByClassName(
      'Toastify__toast-container',
    );
    let hasToast = false;
    if (toastContainer.length > 0 && toastContainer[0].childElementCount > 0)
      hasToast = true;
    if (modal.modalList.length === 0 && !hasToast) setActive(false);
  };
  const handleOpened = () => {
    setActive(opened ?? false);
  };

  useLayoutEffect(() => {
    handleOpened();
  }, [opened]);

  useLayoutEffect(() => {
    handleSize();
  }, [active, disabled]);

  if (disabled) return <></>;
  return (
    <>
      <div className={cx('side-view-container', active && 'active')}>
        <div className={cx('content-container')} ref={viewRef}>
          <ClickAwayListener onClickAway={handleAway}>
            <div className={cx('inner-wrapper')} ref={wrapperRef}>
              <div className={cx('title-wrapper')}>
                {title && (
                  <div className={cx('title')}>
                    <Sypo type='H4' weight='M'>
                      {title}
                    </Sypo>
                  </div>
                )}
                <div className={cx('switch')}>
                  <div className={cx('label')}>
                    <Sypo type='P3' weight='R'>
                      {t(`component.sideView.keep`)}
                    </Sypo>
                  </div>
                  <UIReact.Switch
                    checked={checked ?? false}
                    onChange={(e) => {
                      if (onChangeChecked) {
                        onChangeChecked(e);
                      }
                    }}
                  />
                </div>
              </div>
              {desc && (
                <div className={cx('desc')}>
                  <Mypo type='P1' weight='R'>
                    {desc}
                  </Mypo>
                </div>
              )}
              <div className={cx('children-container')}>{children}</div>
              <div
                ref={toggleRef}
                onClick={onClickToggle}
                className={cx('toggle', active && 'active')}
              >
                <div className={cx('article')}>
                  <Switch>
                    <Case condition={toggleIcon}>
                      <img
                        className={cx(active && 'active')}
                        src={toggleIcon}
                        alt='gear'
                      />
                    </Case>
                    <Default>
                      <Sypo type='P1' weight='B'>
                        {active ? '>' : `<`}
                      </Sypo>
                    </Default>
                  </Switch>
                </div>
              </div>
            </div>
          </ClickAwayListener>
        </div>
      </div>
    </>
  );
};

SideView.defaultProps = {
  title: '',
  desc: '',
  size: 'lg',
  children: <></>,
  toggleIcon: '',
  disabled: false,
  opened: false,
  checked: false,
  onChangeChecked: (e: React.ChangeEvent<HTMLInputElement>) => {},
};

export default SideView;

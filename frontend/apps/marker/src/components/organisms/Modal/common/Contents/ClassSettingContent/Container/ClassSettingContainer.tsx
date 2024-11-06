import styles from './ClassSettingContainer.module.scss';
import classNames from 'classnames/bind';
import { Button } from '@jonathan/ui-react';
import PlusBtnIcon from '@src/static/images/icon/plusBtnPrimary.svg';
import { Sypo, Typo } from '@src/components/atoms';
import useT from '@src/hooks/Locale/useT';
import { RefObject, useEffect, useRef, useState } from 'react';

const cx = classNames.bind(styles);

export type ClassSettingContainerProps = {
  children?: JSX.Element;
  title: string;
  disabled?: boolean;
  subTitle?: boolean;
  className?: string;
  buttonTitle: string;
  onClick?: () => void;
};
const ClassSettingContainer = ({
  title,
  children,
  disabled,
  subTitle,
  className,
  buttonTitle,
  onClick,
}: ClassSettingContainerProps) => {
  const { t } = useT();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (onClick !== undefined) onClick();
  };

  return (
    <div className={cx('class-setting-container')}>
      <div className={cx('header')}>
        <div className={cx('left-side')}>
          <div className={cx('title')}>
            <Typo type='P1'>{title}</Typo>
          </div>
          {subTitle && (
            <div className={cx('selected')}>
              <div className={cx('label')}>
                <Typo type='P2'>{t(`modal.newProject.selectedClass`)}:</Typo>
              </div>
              <div className={cx('class-name')}>
                <Sypo type='P2' weight='bold'>
                  {className}
                </Sypo>
              </div>
            </div>
          )}
        </div>
        <div className={cx('right-side')}>
          {!disabled && (
            <Button
              customStyle={{
                color: '#2D76F8',
                fontSize: '12px',
                backgroundColor: '#DEE9FF',
                border: 'none',
                padding: '8px 12px 8px 10px',
                height: '32px',
              }}
              onClick={() => handleClick()}
            >
              <img
                style={{ width: '12px', height: '12px', marginRight: '8px' }}
                src={PlusBtnIcon}
                alt='plus-button'
              />
              <Sypo type='P2'>{buttonTitle}</Sypo>
            </Button>
          )}
        </div>
      </div>
      <div className={cx('content')} ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

ClassSettingContainer.defaultProps = {
  children: <></>,
  subTitle: false,
  disabled: false,
  className: '',
  onClick: () => {},
};

export default ClassSettingContainer;

import React from 'react';

import { Button } from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { Typo } from '@src/components/atoms';

import { MONO200, MONO204, MONO205 } from '@src/utils/color';

import styles from './ModalFooter.module.scss';
import classNames from 'classnames/bind';
import { CSSProperties } from 'styled-components';
import { Properties } from 'csstype';
const cx = classNames.bind(styles);

export type FooterBtnType = {
  desc?: string;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  customStyle?: Properties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

type ModalFooterProps = {
  isCustom?: boolean;
  children?: JSX.Element;
  leftSide?: JSX.Element;
  submitBtn?: FooterBtnType;
  cancelBtn?: FooterBtnType;
};

const ModalFooter = ({
  isCustom,
  children,
  leftSide,
  submitBtn,
  cancelBtn,
}: ModalFooterProps) => {
  // TODO CLOSE CURRENT 추가
  const onClickClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (cancelBtn && cancelBtn.onClick) {
      cancelBtn.onClick(e);
    }
  };
  return (
    <div className={cx('footer-container')}>
      <Switch>
        <Case condition={isCustom}>{children}</Case>
        <Default>
          <div className={cx('footer-default')}>
            <div className={cx('left-side')}>{leftSide}</div>
            <div className={cx('right-side')}>
              {cancelBtn && (
                <Button
                  type='primary-reverse'
                  loading={cancelBtn.loading}
                  customStyle={
                    cancelBtn.customStyle ?? {
                      border: 'none',
                      padding: '10px 16px',
                    }
                  }
                  onClick={onClickClose}
                  disabled={cancelBtn.disabled}
                >
                  <Typo type='P1' color={MONO205}>
                    {cancelBtn.title === '' ? '취소' : cancelBtn.title}
                  </Typo>
                </Button>
              )}
              {submitBtn && (
                <Button
                  customStyle={
                    submitBtn.customStyle ?? { padding: '10px 16px' }
                  }
                  onClick={submitBtn.onClick && submitBtn.onClick}
                  disabled={submitBtn.disabled}
                  loading={submitBtn.loading}
                >
                  <Typo
                    type='P1'
                    color={submitBtn.disabled ? MONO204 : MONO200}
                  >
                    {submitBtn.title === '' ? '확인' : submitBtn.title}
                  </Typo>
                </Button>
              )}
            </div>
          </div>
        </Default>
      </Switch>
    </div>
  );
};
ModalFooter.defaultProps = {
  isCustom: false,
  children: <></>,
  leftSide: <></>,
  submitBtn: {
    desc: '',
    title: '',
    loading: false,
    customStyle: { border: 'none' },
    onClick: (e: React.MouseEvent<HTMLInputElement>) => {},
  },
  cancelBtn: {
    desc: '',
    title: '',
    loading: false,
    customStyle: {},
    onClick: (e: React.MouseEvent<HTMLInputElement>) => {},
  },
};

export default ModalFooter;

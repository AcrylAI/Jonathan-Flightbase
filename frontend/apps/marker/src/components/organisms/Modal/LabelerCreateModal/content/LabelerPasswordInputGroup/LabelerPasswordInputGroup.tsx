import React from 'react';
import { useEffect } from 'react';

import { InputPassword } from '@jonathan/ui-react';

import Modal from '../../../common/Modal';

import ValidationLabel from '@src/components/organisms/ValidationLabel/ValidationLabel';

import { MONO204 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import styles from './LabelerPasswordInputGroup.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  edit?: boolean;
  password: string;
  checkPassword: string;
  setValidation: (valid: boolean) => void;
  changeHandler: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'id' | 'pass' | 'checkPass' | 'memo',
  ) => void;
};
const LabelerPasswordInputGroup = ({
  edit,
  password,
  checkPassword,
  setValidation,
  changeHandler,
}: Props) => {
  // 패스워드 특수문자 체크 정규표현식
  const { t } = useT();
  const passCheckReg = /[`~!@#$%^&*|\\'";:/?]/gi;
  const checkPass = () => {
    let result = true;
    // 길이 체크
    if (
      password.length < 8 ||
      password.length > 20 ||
      checkPassword.length === 0
    )
      result = false;

    // 정규표현식 검사
    // regexp last index 초기화 문제로 match를 이용하여 검색
    if (password.match(passCheckReg) === null) result = false;

    // confirm password 검사
    if (password !== checkPassword) result = false;
    setValidation(result);
  };

  const checkConfirmPass = () => {
    // 아직 타이핑 되지않았을때
    if (password.length === 0 || checkPassword.length === 0) return true;
    if (
      password.length > 0 &&
      checkPassword.length > 0 &&
      checkPassword === password
    )
      return true;
    return false;
  };

  useEffect(() => {
    checkPass();
  }, [password, checkPassword]);

  return (
    <div className={cx('pass-group-container')}>
      <Modal.Label
        title={
          edit
            ? `${t(`modal.editMember.newPassword`)}`
            : `${t(`modal.createMember.password`)}`
        }
        customStyle={{ marginBottom: '32px' }}
        customLabelStyle={{ fontSize: edit ? '14px' : '' }}
      >
        <>
          <InputPassword
            customStyle={{
              fontFamily: 'MarkerFont',
              fontWeight: '400',
              fontSize: '14px',
            }}
            disableLeftIcon
            placeholder={`${t(`component.inputBox.password`)}`}
            size='large'
            value={password}
            onChange={(e) => changeHandler(e, 'pass')}
          />
          <ValidationLabel
            valid={password.length >= 8 && password.length <= 20}
            desc={`${t(`modal.createMember.minCharacters`)}`}
            customLabelStyle={{ fontSize: edit ? '12px' : '' }}
          />
          <ValidationLabel
            valid={passCheckReg.exec(password) !== null}
            desc={`${t(`modal.createMember.specialCharacters`)}`}
            customLabelStyle={{ fontSize: edit ? '12px' : '' }}
          />
        </>
      </Modal.Label>
      <Modal.Label
        title={`${t(`modal.createMember.confirmPassword`)}`}
        customLabelStyle={{ fontSize: edit ? '14px' : '' }}
        customStyle={{ marginBottom: edit ? '0px' : '' }}
      >
        <>
          <InputPassword
            customStyle={{
              fontFamily: 'MarkerFont',
              fontWeight: '400',
              fontSize: '14px',
            }}
            disableLeftIcon
            placeholder={`${t(`component.inputBox.confirmPassword`)}`}
            status={!checkConfirmPass() ? 'error' : ''}
            size='large'
            value={checkPassword}
            onChange={(e) => changeHandler(e, 'checkPass')}
          />
          <div className={cx('warn-label', !checkConfirmPass() && 'display')}>
            {t(`component.inputBox.notMatchPassword`)}
          </div>
        </>
      </Modal.Label>
    </div>
  );
};
LabelerPasswordInputGroup.defaultProps = {
  edit: false,
};

export default LabelerPasswordInputGroup;

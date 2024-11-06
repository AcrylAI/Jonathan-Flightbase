import React, { useCallback, useMemo } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import { useRecoilState } from 'recoil';
import _, { debounce } from 'lodash';

import { InputText, Textarea } from '@jonathan/ui-react';

import {
  LabelerCreateModalAtom,
  LabelerCreateModalAtomModel,
} from '@src/stores/components/Modal/LabelerCreateModalAtom';

import { Sypo } from '@src/components/atoms';
import Modal from '../../common/Modal';
import usePostCheckLabelerId, {
  usePostCheckLabelerIdRequestModel,
} from '../hooks/usePostLabelerCheckId';

import { MONO204 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import LabelerPasswordInputGroup from './LabelerPasswordInputGroup/LabelerPasswordInputGroup';

import styles from './LabelerCreateContent.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const LabelerCreateContent = () => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<LabelerCreateModalAtomModel>(LabelerCreateModalAtom);
  const [idValid, setIdValid] = useState<boolean>(false);
  const [mailValid, setMailValid] = useState<boolean>(false);
  const [passValid, setPassValid] = useState<boolean>(false);

  const checkIdMutation = usePostCheckLabelerId();

  const changeHandler = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
    type: 'id' | 'pass' | 'checkPass' | 'memo' | 'email',
  ) => {
    const temp = _.cloneDeep(modalState);
    const { value } = e.target;
    switch (type) {
      /*
      case 'id':
        temp.name = value;
        break;
        */
      case 'pass':
        temp.password = value;
        break;
      case 'checkPass':
        temp.checkPassword = value;
        break;
      case 'memo':
        temp.memo = value;
        break;
      case 'email':
        temp.name = value;
        break;
      default:
    }
    setModalState(temp);
  };

  const debounceCheckId = useCallback(
    debounce(async (name: string) => {
      if (name.length > 0) {
        const data: usePostCheckLabelerIdRequestModel = {
          name,
        };
        const resp = await checkIdMutation.mutateAsync(data);
        if (resp.status === 1) {
          setIdValid(resp.result.duplication === 0);
        } else {
          setIdValid(false);
        }
      }
    }, 250),
    [],
  );

  const checkMailValid = () => {
    let result = false;
    if (modalState.name) {
      const mailRegex = new RegExp(
        // eslint-disable-next-line no-useless-escape
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
      const korRegex = new RegExp(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/);
      const mailResult = mailRegex.test(modalState.name);
      const korResult = korRegex.test(modalState.name);

      if (mailResult && !korResult) result = true;
    }
    setMailValid(result);
  };

  const isWarning = () => {
    return (!mailValid || !idValid) && modalState.name.length !== 0;
  };

  const checkValidation = () => {
    const temp = _.cloneDeep(modalState);
    if (idValid && passValid && mailValid) {
      temp.valid = true;
    } else {
      temp.valid = false;
    }
    setModalState(temp);
  };

  useEffect(() => {
    debounceCheckId(modalState.name);
    checkMailValid();
  }, [modalState.name]);

  useEffect(() => {
    checkValidation();
  }, [idValid, passValid, mailValid]);

  return (
    <div className={cx('lb-content-container')}>
      <Modal.Label title={`${t(`modal.createLabeler.email`)}`}>
        <>
          <InputText
            autoFocus
            customStyle={{
              fontFamily: 'MarkerFont',
              fontWeight: '400',
              fontSize: '14px',
            }}
            placeholder={`${t(`modal.createLabeler.mailExample`)}`}
            value={modalState.name}
            onChange={(e) => changeHandler(e, 'email')}
            size='large'
            status={isWarning() ? 'error' : ''}
          />
          <div className={cx('warn-label', isWarning() && 'display')}>
            {!mailValid
              ? `${t(`modal.createLabeler.invalidEmail`)}`
              : `${t(`modal.createLabeler.duplEmail`)}`}
          </div>
        </>
      </Modal.Label>
      <LabelerPasswordInputGroup
        password={modalState.password}
        setValidation={setPassValid}
        changeHandler={changeHandler}
        checkPassword={modalState.checkPassword}
      />
      <Modal.Label title={`${t(`modal.createMember.memo`)}`}>
        <Textarea
          value={modalState.memo}
          customStyle={{
            fontFamily: 'MarkerFont',
            fontWeight: '400',
            fontSize: '14px',
          }}
          onChange={(e) => changeHandler(e, 'memo')}
          placeholder={`${t(`component.inputBox.memo`)}`}
        />
      </Modal.Label>
    </div>
  );
};

export default LabelerCreateContent;

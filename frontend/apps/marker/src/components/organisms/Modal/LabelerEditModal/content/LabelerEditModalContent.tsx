import React from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { Button, Textarea } from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { LabelerEditModalAtom } from '@src/stores/components/Modal/LabelerEditModalAtom';

import { Sypo } from '@src/components/atoms';
import Modal from '../../common/Modal';
import LabelerPasswordInputGroup from '../../LabelerCreateModal/content/LabelerPasswordInputGroup/LabelerPasswordInputGroup';

import { BLUE101, BLUE104 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import styles from './LabelerEditModalContent.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const LabelerEditModalContent = () => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<LabelerEditModalAtom>(LabelerEditModalAtom);

  const changeHandler = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
    type: 'id' | 'pass' | 'checkPass' | 'memo',
  ) => {
    const temp = _.cloneDeep(modalState);
    const { value } = e.target;
    switch (type) {
      case 'id':
        temp.name = value;
        break;
      case 'pass':
        temp.password = value;
        break;
      case 'checkPass':
        temp.checkPassword = value;
        break;
      case 'memo':
        temp.memo = value;
        break;
      default:
    }
    setModalState(temp);
  };

  const setValidation = (valid: boolean) => {
    const temp = _.cloneDeep(modalState);
    temp.valid = valid;
    setModalState(temp);
  };

  const onClickPassToggle = () => {
    const temp = _.cloneDeep(modalState);
    temp.passToggle = true;
    setModalState(temp);
  };
  return (
    <div className={cx('lb-content-container')}>
      <Modal.Label title={`${t(`modal.createLabeler.email`)}`}>
        <div className={cx('id-container')}>
          <Sypo type='P1'>{modalState.name}</Sypo>
        </div>
      </Modal.Label>
      <Switch>
        <Case condition={modalState.passToggle}>
          <div className={cx('password-container')}>
            <LabelerPasswordInputGroup
              password={modalState.password}
              setValidation={setValidation}
              changeHandler={changeHandler}
              checkPassword={modalState.checkPassword}
              edit
            />
          </div>
        </Case>
        <Default>
          <Modal.Label title={`${t(`modal.createMember.password`)}`}>
            <Button
              customStyle={{
                backgroundColor: BLUE101,
                border: 'none',
                color: BLUE104,
                fontSize: '14px',
                fontFamily: 'MarkerFont',
                fontWeight: '500',
              }}
              onClick={onClickPassToggle}
            >
              {t(`modal.editMember.newPassword`)}
            </Button>
          </Modal.Label>
        </Default>
      </Switch>
      <Modal.Label title={`${t(`modal.createMember.memo`)}`}>
        <Textarea
          value={modalState.memo}
          onChange={(e) => changeHandler(e, 'memo')}
          placeholder={`${t(`component.inputBox.memo`)}`}
        />
      </Modal.Label>
    </div>
  );
};

export default LabelerEditModalContent;

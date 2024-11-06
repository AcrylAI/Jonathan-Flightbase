import { useRecoilState } from 'recoil';
import _ from 'lodash';

import {
  ChangePassModalAtom,
  ChangePassModalAtomType,
} from '@src/stores/components/Modal/ChangePassModalAtom';

import { Sypo } from '@src/components/atoms';
import Modal from '../../common/Modal';
import LabelerPasswordInputGroup from '../../LabelerCreateModal/content/LabelerPasswordInputGroup/LabelerPasswordInputGroup';

import { MONO205 } from '@src/utils/color';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import styles from './ChangePasswordContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const ChangePasswordContent = () => {
  const { t } = useT();
  const {
    userSession: { user },
  } = useUserSession();

  const [modalState, setModalState] =
    useRecoilState<ChangePassModalAtomType>(ChangePassModalAtom);
  const handleValidation = (valid: boolean) => {
    const temp = _.cloneDeep(modalState);
    temp.valid = valid;
    setModalState(temp);
  };
  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'id' | 'pass' | 'checkPass' | 'memo',
  ) => {
    const temp = _.cloneDeep(modalState);
    if (value === 'pass') temp.password = e.target.value;
    else temp.checkPass = e.target.value;
    setModalState(temp);
  };
  return (
    <div className={cx('change-pass-container')}>
      <Modal.Label title={`${t(`modal.newProject.id`)}`}>
        <div className={cx('id-container')}>
          <Sypo type='P1' color={MONO205} weight='R'>
            {user}
          </Sypo>
        </div>
      </Modal.Label>
      <div className={cx('pass-container')}>
        <LabelerPasswordInputGroup
          edit
          checkPassword={modalState.checkPass}
          changeHandler={changeHandler}
          setValidation={handleValidation}
          password={modalState.password}
        ></LabelerPasswordInputGroup>
      </div>
    </div>
  );
};

export default ChangePasswordContent;

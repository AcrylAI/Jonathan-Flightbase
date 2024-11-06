import { useRecoilState } from 'recoil';
import _ from 'lodash';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { Sypo } from '@src/components/atoms';

import Modal from '@src/components/organisms/Modal/common/Modal';

import useT from '@src/hooks/Locale/useT';

import styles from './SettingDefaultMobile.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const SettingMobile = () => {
  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);
  const { t } = useT();

  const onClickHandler = (value: number) => {
    // 추후 모바일 추가될시 주석해제
    /*
    const temp = _.cloneDeep(modalState);
    temp.default.mobile = value;
    setModalState(temp);
    */
  };
  return (
    <Modal.Label title={t(`modal.newProject.mobileAvailability`)}>
      <Sypo type='P1' weight='medium'>
        <div className={cx('select-box-container')}>
          <div
            className={cx(
              'left',
              'select-box',
              localStorage.getItem('language') === 'en' ? 'short' : 'long',
              modalState.default.mobile === 0 && 'active',
            )}
            onClick={() => {
              onClickHandler(0);
            }}
          >
            {t(`modal.newProject.unavailability`)}
          </div>
          <div
            className={cx(
              'right',
              'select-box',
              localStorage.getItem('language') === 'en' ? 'short' : 'long',
              modalState.default.mobile === 1 && 'active',
            )}
            onClick={() => {
              onClickHandler(1);
            }}
          >
            {t(`modal.newProject.availability`)}
          </div>
        </div>
      </Sypo>
    </Modal.Label>
  );
};
export default SettingMobile;

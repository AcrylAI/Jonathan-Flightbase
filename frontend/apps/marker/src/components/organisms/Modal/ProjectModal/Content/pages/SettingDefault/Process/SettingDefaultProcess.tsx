import styles from './SettingDefaultProcess.module.scss';
import classNames from 'classnames/bind';
import Modal from '@src/components/organisms/Modal/common/Modal';
import { Switch } from '@jonathan/ui-react';
import { useRecoilState } from 'recoil';
import {
  ProjectModalAtom,
  ProjectModalAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';
import _ from 'lodash';
import { ChangeEvent } from 'react';
import { Sypo } from '@src/components/atoms';
import { MONO205 } from '@src/utils/color';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);
const SettingDefaultProcess = () => {
  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);

  const { t } = useT();
  const onChangeSwitch = (e: ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(modalState);
    temp.default.workStep = e.target.checked;
    setModalState(temp);
  };
  return (
    <Modal.Label title={t(`modal.newProject.workflow`)}>
      <Sypo type='H4' weight='medium' color={MONO205}>
        <div className={cx('switch-container')}>
          <div className={cx('label', 'switch-box')}>
            {t(`page.projectList.labeling`)}
          </div>
          <div className={cx('decorate')}>{`>>`}</div>
          <div className={cx('check', 'switch-box')}>
            <Switch
              label={t(`page.projectList.review`)}
              labelAlign='left'
              checked={modalState.default.workStep}
              onChange={onChangeSwitch}
            />
          </div>
        </div>
      </Sypo>
    </Modal.Label>
  );
};
export default SettingDefaultProcess;

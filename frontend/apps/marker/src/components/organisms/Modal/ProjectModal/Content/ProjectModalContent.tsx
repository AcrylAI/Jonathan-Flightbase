import { useRecoilState } from 'recoil';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  ProjectModalCtlAtom,
  ProjectModalCtlAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import SettingClass from './pages/SettingClass/SettingClass';
import SettingDataSet from './pages/SettingDataSet/SettingDataSet';
import SettingDefault from './pages/SettingDefault/SettingDefault';
import SettingInvite from './pages/SettingInvite/SettingInvite';

import styles from './ProjectModalContent.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const ProjectModalContent = () => {
  const [modalCtl, setModalCtl] =
    useRecoilState<ProjectModalCtlAtomModel>(ProjectModalCtlAtom);
  return (
    <Switch>
      <Case condition={modalCtl.step === 0}>
        <SettingDefault />
      </Case>
      <Case condition={modalCtl.step === 1}>
        <SettingInvite />
      </Case>
      <Case condition={modalCtl.step === 2}>
        <SettingDataSet />
      </Case>
      <Case condition={modalCtl.step === 3}>
        <SettingClass />
      </Case>
    </Switch>
  );
};
export default ProjectModalContent;

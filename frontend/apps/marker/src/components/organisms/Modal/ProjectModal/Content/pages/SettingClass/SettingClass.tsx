import styles from './SettingClass.module.scss';
import classNames from 'classnames/bind';
import ClassSettingContent from '@src/components/organisms/Modal/common/Contents/ClassSettingContent/ClassSettingContent';
import { useRecoilState } from 'recoil';
import {
  ProjectModalAtom,
  ProjectModalAtomModel,
  ProjectModalClassItemModel,
} from '@src/stores/components/Modal/ProjectModalAtom';
import _ from 'lodash';

const cx = classNames.bind(styles);

const SettingClass = () => {
  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);

  const onChangeClassList = (list: Array<ProjectModalClassItemModel>) => {
    const temp = _.cloneDeep(modalState);
    temp.class.list = list;
    setModalState(temp);
  };

  return (
    <ClassSettingContent
      toolList={modalState.default.tools}
      classList={modalState.class.list}
      onChangeClassList={onChangeClassList}
    />
  );
};

export default SettingClass;

import { ChangeEvent, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _, { cloneDeep } from 'lodash';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import Radio from '@src/components/atoms/Input/Radio/Radio';

import Modal from '@src/components/organisms/Modal/common/Modal';

import { MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import SettingDefaultGuide from './Guide/SettingDefaultGuide';
import SettingDefaultInfo from './Info/SettingDefaultInfo';
// import SettingMobile from './Mobile/SettingDefaultMobile';
import SettingDefaultProcess from './Process/SettingDefaultProcess';
import SettingDefaultTools from './Tools/SettingDefaultTools';

import styles from './SettingDefault.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const LIMITTOOL = import.meta.env.VITE_REACT_APP_MARKER_TOOL;

const SettingDefault = () => {
  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);
  const { t } = useT();

  const onChangeDataType = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'img' | 'txt',
  ) => {
    const temp = _.cloneDeep(modalState);
    const data = type === 'img' ? 0 : 1;
    temp.default.dataType = data;
    // if (type === 'txt') {
    //   temp.default.tools = [];
    // }
    setModalState(temp);
  };

  useEffect(() => {
    if(LIMITTOOL === undefined || LIMITTOOL === 'image') {
      setModalState(prev => {
        const curr = cloneDeep(prev);
        curr.default.dataType = 0;
        return curr;
      })
    }
    else if(LIMITTOOL === 'text') {
      setModalState(prev => {
        const curr = cloneDeep(prev);
        curr.default.dataType = 1;
        return curr;
      })
    }
  }, [LIMITTOOL])

  return (
    <div className={cx('setting-default-container')}>
      <SettingDefaultInfo />
      {/* 이부분 컴포넌트로 빼기 */}
      <Modal.Label
        key='data-type-label'
        required
        title={t(`modal.newProject.dataType`)}
        customStyle={{ marginTop: '40px' }}
      >
        <div className={cx('radio-wrap')}>
          <Radio
            label={t(`modal.newProject.image`)}
            disabled={LIMITTOOL==='text'}
            onChange={(e) => onChangeDataType(e, 'img')}
            selected={(LIMITTOOL!=='text') && modalState.default.dataType === 0}
            customLabelStyle={{
              common: { color: MONO205 },
            }}
          />
          <Radio
            label={t(`modal.newProject.text`)}
            onChange={(e) => onChangeDataType(e, 'txt')}
            selected={(LIMITTOOL!=='image') && modalState.default.dataType === 1}
            disabled={LIMITTOOL==='image'}
            customLabelStyle={{
              common: { color: MONO205 },
            }}
          />
        </div>
      </Modal.Label>
      {modalState.default.dataType === 0 && <SettingDefaultTools />}
      <SettingDefaultProcess />
      {/* 모바일 허용 주석처리 */}
      {/* <SettingMobile /> */}
      <SettingDefaultGuide />
    </div>
  );
};
export default SettingDefault;

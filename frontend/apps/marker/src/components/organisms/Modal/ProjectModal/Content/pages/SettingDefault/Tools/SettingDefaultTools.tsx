import styles from './SettingDefaultTools.module.scss';
import classNames from 'classnames/bind';
import Modal from '@src/components/organisms/Modal/common/Modal';
import { useRecoilState } from 'recoil';
import {
  ProjectModalAtom,
  ProjectModalAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';
import { ChangeEvent } from 'react';
import _ from 'lodash';
import CheckBox from '@src/components/atoms/Input/CheckBox/CheckBox';
import { MONO205 } from '@src/utils/color';
import { Sypo } from '@src/components/atoms';
import useT from '@src/hooks/Locale/useT';
const cx = classNames.bind(styles);

type BadgeProps = {
  name: string;
};
const Badge = ({ name }: BadgeProps) => {
  return (
    <div className={cx('badge')}>
      <Sypo type='P2'>{name}</Sypo>
    </div>
  );
};
const SettingDefaultTools = () => {
  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);
  const { t } = useT();

  const onChangeCheckBox = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'bbox' | 'poly',
  ) => {
    const temp = _.cloneDeep(modalState);

    const value = type === 'bbox' ? 1 : 2;

    if (!Number.isNaN(value)) {
      const fIdx = temp.default.tools.findIndex((v) => v === value);

      if (fIdx === -1) temp.default.tools.push(value);
      else temp.default.tools.splice(fIdx, 1);
      temp.default.tools = temp.default.tools.sort(
        (a: number, b: number) => a - b,
      );

      setModalState(temp);
    }
  };

  return (
    <div className={cx('tool-wrapper')}>
      <Modal.Label
        key='modal-label-tools'
        title={t(`modal.newProject.annotationType`)}
        badge={
          <Badge
            name={
              modalState.default.dataType === 0
                ? `${t(`modal.newProject.image`)}`
                : `${t(`modal.newProject.text`)}`
            }
          />
        }
        required
        customStyle={{ marginBottom: '0px', paddingBottom: '8px' }}
      >
        <>
          <div className={cx('checkbox-wrapper')}>
            <CheckBox
              onChange={(e) => onChangeCheckBox(e, 'bbox')}
              checked={modalState.default.tools.includes(1)}
              label={t(`modal.newProject.boundingBox`)}
              labelStyle={{
                common: { color: MONO205 },
              }}
            />
            <CheckBox
              onChange={(e) => onChangeCheckBox(e, 'poly')}
              checked={modalState.default.tools.includes(2)}
              label={t(`modal.newProject.polygon`)}
              labelStyle={{
                common: { color: MONO205 },
              }}
            />
          </div>
        </>
      </Modal.Label>
    </div>
  );
};

export default SettingDefaultTools;

import { useState } from 'react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { Button } from '@jonathan/ui-react';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
  ProjectModalCtlAtom,
  ProjectModalCtlAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { Typo } from '@src/components/atoms';
import { ClassSettingFunctions } from '../../common/Contents/ClassSettingContent/functions/ClassSettingFunctions';

import useT from '@src/hooks/Locale/useT';

import { CheckedIcon } from '@src/static/images';

import styles from './ModalSteps.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type StepValueType = {
  done: boolean;
  active: boolean;
  title: string;
};

type ModalStepsProps = {
  onClickCreate: () => void;
  loading: boolean;
};

const ModalSteps = ({ onClickCreate, loading }: ModalStepsProps) => {
  const { t } = useT();
  const [modalCtl, setModalCtl] =
    useRecoilState<ProjectModalCtlAtomModel>(ProjectModalCtlAtom);
  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);

  const [values, setValue] = useState<Array<StepValueType>>([
    { title: `${t(`modal.newProject.setting`)}`, active: true, done: false },
    {
      title: `${t(`modal.newProject.addMembers`)}`,
      active: false,
      done: false,
    },
    {
      title: `${t(`modal.newProject.connectDataset`)}`,
      active: false,
      done: false,
    },
    {
      title: `${t(`modal.newProject.createClasses`)}`,
      active: false,
      done: false,
    },
  ]);

  const stepHandler = () => {
    const temp = [...values];

    if (modalCtl.step < 4) {
      for (let i = 0; i < 4; i++) {
        if (i <= modalCtl.step) {
          temp[i].done = true;
          temp[i].active = false;
        } else {
          temp[i].done = false;
          temp[i].active = false;
        }
      }

      temp[modalCtl.step].done = false;
      temp[modalCtl.step].active = true;
    } else if (modalCtl.step === 4) {
      temp[modalCtl.step - 1].active = false;
      temp[modalCtl.step - 1].done = true;
    }
    setValue(temp);
  };

  const handleCreate = () => {
    onClickCreate();
  };
  const checkValidation = () => {
    return (
      !ClassSettingFunctions.checkDuplicated(modalState.class.list) &&
      modalState.default.title &&
      modalState.default.tools.length > 0 &&
      modalState.default.titleValid &&
        modalState.default.dataType !== -1
    );
  };

  useEffect(() => {
    stepHandler();
  }, [modalCtl.step]);

  return (
    <div className={cx('modal-steps-container')}>
      <div className={cx('modal-step-view')}>
        <div className={cx('step-container')}>
          {values.map((value, idx) => (
            <div
              key={`step ${idx}`}
              className={cx(
                'step',
                value.active && 'active',
                value.done && 'done',
              )}
            >
              <div className={cx('title')}>
                <Typo weight='bold' type='P2'>
                  {value.title}
                </Typo>
              </div>
              <div className={cx('circle')}>
                <img className={cx('check')} src={CheckedIcon} alt='checked' />
                <div className={cx('bar-gray')}></div>
                <div className={cx('bar')}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={cx('create-btn')}>
        <Button
          disabled={!checkValidation()}
          loading={loading}
          customStyle={{ padding: '12px 24px' }}
          onClick={() => handleCreate()}
        >{`${t(`component.btn.skipAll`)} >`}</Button>
      </div>
    </div>
  );
};
export default ModalSteps;

import { ChangeEvent, useRef } from 'react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
  ProjectModalCtlAtom,
  ProjectModalCtlAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { Sypo } from '@src/components/atoms';

import { toast } from '@src/components/molecules/Toast';

import Modal from '@src/components/organisms/Modal/common/Modal';

import useT from '@src/hooks/Locale/useT';

import styles from './SettingDefaultGuide.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;
const SettingDefaultGuide = () => {
  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);
  const [modalCtl, setModalCtl] =
    useRecoilState<ProjectModalCtlAtomModel>(ProjectModalCtlAtom);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useT();

  const resetScroll = () => {
    const temp = _.cloneDeep(modalCtl);
    if (temp.scroll === 'bottom') temp.scroll = 'none';
    setModalCtl(temp);
  };

  const fileValidation = (file: File): boolean => {
    let result = false;
    const type = file.type.toLocaleLowerCase();
    if (file.size < GB && (type.includes('pdf') || type.includes('ppt')))
      result = true;

    return result;
  };

  const onClickFileUpload = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };
  const onChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const temp = _.cloneDeep(modalState);
      const ctlTemp = _.cloneDeep(modalCtl);
      for (let i = 0; i < e.target.files.length; i++) {
        if (fileValidation(e.target.files[i])) {
          temp.default.guideLine.push(e.target.files[i]);
        } else {
          toast.error(`${t(`toast.newProject.invalidGuideFormat`)}`);
        }
      }
      ctlTemp.scroll = 'bottom';
      setModalCtl(ctlTemp);
      setModalState(temp);
    }
  };
  const onClickDelete = (idx: number) => {
    const temp = _.cloneDeep(modalState);
    temp.default.guideLine.splice(idx, 1);
    setModalState(temp);
  };

  useEffect(() => {
    resetScroll();
  }, [modalCtl.scroll]);
  return (
    <div className={cx('file-container')}>
      <Modal.Label
        key='guid-line'
        desc={t(`modal.newProject.maxByte`)}
        title={t(`modal.newProject.guideline`)}
        customStyle={{ marginBottom: '8px' }}
      />
      <input
        className={cx('file-input')}
        ref={fileRef}
        type='file'
        onChange={onChangeFile}
        multiple
      />

      <Switch>
        <Case condition={modalState.default.guideLine.length > 0}>
          <>
            <div
              className={cx('upload-btn')}
              onClick={() => onClickFileUpload()}
            >
              <span className={cx('plus')}>+</span>
              <span className={cx('title')}>업로드</span>
            </div>
            <div className={cx('file-list-container')}>
              {modalState.default.guideLine &&
                modalState.default.guideLine.map((file, idx) => (
                  <div
                    className={cx('file-wrapper')}
                    key={`${file.name} ${idx}`}
                  >
                    <div className={cx('file-name')}>
                      {file.name}
                      <span className={cx('file-size')}>
                        ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                      </span>
                    </div>
                    <div
                      onClick={() => onClickDelete(idx)}
                      className={cx('icon')}
                    >
                      <div className={cx('bar', 'left')}></div>
                      <div className={cx('bar', 'right')}></div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        </Case>
        <Default>
          <div
            className={cx('upload-lane')}
            onClick={() => onClickFileUpload()}
          >
            <div className={cx('desc')}>
              <Sypo type='P1'>+ Upload guideline</Sypo>
            </div>
          </div>
        </Default>
      </Switch>
    </div>
  );
};
export default SettingDefaultGuide;

import { ChangeEvent, useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import _, { debounce } from 'lodash';

import { InputText, Textarea } from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { Sypo } from '@src/components/atoms';
import { usePostProjectTitleCheck } from '../../../../hooks/usePostProjectTitleCheck';

import Modal from '@src/components/organisms/Modal/common/Modal';

import { RED502 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import styles from './SettingDefaultInfo.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const TITLE_LENGTH_LIMIT = 50;
const DESC_LENGTH_LIMIT = 1000;
const SettingDefaultInfo = () => {
  const { t } = useT();
  const checkMutation = usePostProjectTitleCheck();
  const workspaceId = sessionStorage.getItem('workspace_id');
  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);
  const [valid, setValid] = useState<boolean>(false);
  const [dup, setDup] = useState(false);
  const [message, setMessage] = useState<boolean>(false);
  const regType1 = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  const debounceCheckProjectName = useCallback(
    debounce(async (name: string, workspaceId: number) => {
      let result = false;
      if (name) {
        const data = {
          name,
          workspaceId,
        };
        const resp = await checkMutation.mutateAsync(data);
        if (resp.status === 1) {
          if (!resp.result.check) {
            result = true;
            setDup(false);
          } else setDup(true);
        }
      }
      if (!regType1.test(name)) {
        result = false;
      }
      setValid(result);
    }, 250),
    [],
  );

  const onChangeProjectName = (e: ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(modalState);
    const { value } = e.target;
    temp.default.title = value;

    if (!regType1.test(value)) {
      setMessage(true);
      setValid(false);
    } else {
      setMessage(false);
    }
    if (value.length - 1 < TITLE_LENGTH_LIMIT) {
      setModalState(temp);
    }
  };

  const onChangeDesc = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const temp = _.cloneDeep(modalState);
    temp.default.desc = e.target.value;
    setModalState(temp);
  };
  const handleValid = () => {
    const temp = _.cloneDeep(modalState);
    temp.default.titleValid = valid;
    setModalState(temp);
  };

  useEffect(() => {
    debounceCheckProjectName(modalState.default.title, Number(workspaceId));
  }, [modalState.default.title, workspaceId]);

  useEffect(() => {
    handleValid();
  }, [valid]);
  return (
    <>
      <div className={cx('info-container')}>
        <div className={cx('input-area')}>
          <Modal.Label
            key='project-name-label'
            title={t(`modal.newProject.projectName`)}
            required
            customStyle={{ marginBottom: '0' }}
            subTitle={`${modalState.default.title.length} / ${TITLE_LENGTH_LIMIT}`}
            customSubLabelStyle={{ marginBottom: '4px' }}
          >
            <>
              <InputText
                autoFocus
                placeholder={t(`component.inputBox.projectName`)}
                value={modalState.default.title}
                onChange={onChangeProjectName}
                customStyle={{
                  height: '48px',
                  fontWeight: '500',
                  border: `${
                    (dup && modalState.default.title) || message
                      ? '1px solid #fa4e57'
                      : ''
                  }`,
                }}
              />
              <div
                className={cx(
                  'duplicated',
                  ((dup && modalState.default.title) || message) && 'visible',
                )}
              >
                <Sypo type='P2' color={RED502}>
                  <Switch>
                    <Case condition={message}>
                      {t(`modal.newProject.nameRule`)}
                    </Case>
                    <Case condition={dup}>
                      {t(`modal.projectModal.projectTitleDuplicated`)}
                    </Case>
                    <Default></Default>
                  </Switch>
                </Sypo>
              </div>
            </>
          </Modal.Label>
        </div>
      </div>
      <Modal.Label
        key='project-desc-label'
        title={t(`modal.newProject.description`)}
        subTitle={`${
          modalState.default.desc === undefined
            ? '0'
            : modalState.default.desc.length
        } / ${DESC_LENGTH_LIMIT}`}
      >
        <div className={cx('desc-area')}>
          <Textarea
            placeholder={t(`component.inputBox.description`)}
            customStyle={{
              height: '145px',
              fontWeight: '500',
            }}
            value={modalState.default.desc}
            onChange={onChangeDesc}
          />
        </div>
      </Modal.Label>
    </>
  );
};
export default SettingDefaultInfo;

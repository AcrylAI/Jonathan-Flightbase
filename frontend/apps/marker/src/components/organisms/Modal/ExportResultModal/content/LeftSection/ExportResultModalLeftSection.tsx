import React from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import _, { debounce } from 'lodash';

import { Button, InputText, Selectbox, Switch } from '@jonathan/ui-react';
import { ListType } from '@jonathan/ui-react/src/components/molecules/Selectbox/types';

import {
  exportModalAtom,
  exportModalAtomModel,
} from '@src/stores/components/Modal/ExportResultsModalAtom';

import { Mypo, Sypo } from '@src/components/atoms';
import Spinner from '@src/components/atoms/Loader/Spinner/Spinner';
import usePostExport, {
  usePostExportReqModel,
} from '../../hooks/usePostExport';
import usePostExportCheck, {
  usePostExportCheckReqModel,
} from '../../hooks/usePostExportCheck';

import { toast } from '@src/components/molecules/Toast';

import { MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import styles from './ExportResultModalLeftSection.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const EXPORT_TYPE_LIST: Array<ListType> = [
  {
    label: 'JSON',
    value: 0,
  },
  {
    label: 'CSV',
    value: 1,
  },
];
const EXT_LABEL: Array<string> = ['json', 'csv'];

// 수정이 필요할시 컴포넌트 단위로 분리 리펙토링 예정
const ExportResultModalLeftSection = () => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<exportModalAtomModel>(exportModalAtom);
  const [valid, setValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const modal = useModal();
  const fileNameMutation = usePostExportCheck();
  const exportMutation = usePostExport({
    classCount: modalState.classCount ?? null,
  });

  const checkValidation = (): boolean => {
    if (loading) return false;
    return valid || modalState.method === 0;
  };

  const debounceCheckFileName = useCallback(
    debounce(
      async (method: 0 | 1, fileName: string, dataset: string, form: 0 | 1) => {
        if (method) {
          let result = false;
          if (fileName) {
            const data: usePostExportCheckReqModel = {
              fileName: `${fileName}.${EXT_LABEL[form]}`,
              dataset,
            };
            const resp = await fileNameMutation.mutateAsync(data);
            if (resp.status === 1) {
              result = true;
            }
          }
          setValid(result);
        }
      },
      250,
    ),
    [],
  );
  const handleClose = () => {
    modal.close();
  };
  const onClickExport = async () => {
    if (modalState.projectId) {
      const { projectId, form, method, fileName, force } = modalState;
      const data: usePostExportReqModel = {
        form,
        force,
        method,
        fileName,
        projectId,
      };
      const resp = await exportMutation.mutateAsync(data);
      if (resp.status) {
        toast.api.success();
        await modalState.refetch();
        handleClose();
      } else {
        toast.api.failed();
      }
      /*
      로딩 화면 기획상 제거 화면은 남김
      setLoading(true);
      */
    }
  };

  const onChangeFileName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(modalState);
    temp.fileName = e.target.value;
    setModalState(temp);
  };

  const onChangeForm = (item: ListType) => {
    const temp = _.cloneDeep(modalState);
    temp.form = item.value as 0 | 1;
    setModalState(temp);
  };

  const onChangeSwitch = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'method' | 'overwrite',
  ) => {
    const temp = _.cloneDeep(modalState);
    switch (type) {
      case 'method':
        temp.method = e.target.checked ? 1 : 0;
        break;
      case 'overwrite':
        temp.force = e.target.checked ? 1 : 0;
        break;
      default:
    }
    setModalState(temp);
  };

  useEffect(() => {
    debounceCheckFileName(
      modalState.method,
      modalState.fileName,
      modalState.dataset,
      modalState.form,
    );
  }, [modalState.fileName, modalState.form]);

  return (
    <div className={cx('left-section-container', loading && 'load')}>
      <div className={cx('loader')}>
        <div className={cx('spinner')}>
          <Spinner width={64} height={64} />
        </div>
        <div className={cx('desc')}>
          <Sypo type='p1' weight={500}>
            We are preparing to export it...
          </Sypo>
        </div>
      </div>
      <div className={cx('top-section', loading && 'hidden')}>
        <div className={cx('type-select')}>
          <div className={cx('title')}>
            <Sypo type='H4' weight='bold'>
              {t(`modal.exportResults.export`)}
            </Sypo>
          </div>
          <div className={cx('select')}>
            <Sypo type='p1'>포맷</Sypo>
            <Selectbox
              selectedItem={EXPORT_TYPE_LIST[modalState.form]}
              customStyle={{
                globalForm: {
                  color: MONO205,
                  fontWeight: 400,
                },
              }}
              list={EXPORT_TYPE_LIST}
              onChange={onChangeForm}
            />
          </div>
          <div className={cx('select')}>
            <Sypo type='p1'>도구</Sypo>
            <Selectbox
              selectedItem={EXPORT_TYPE_LIST[modalState.form]}
              customStyle={{
                globalForm: {
                  color: MONO205,
                  fontWeight: 400,
                },
              }}
              list={[{ label: 'All', value: 0 }]}
              onChange={onChangeForm}
            />
          </div>
        </div>
        <div className={cx('folder-opt')}>
          <div className={cx('title')}>
            <Sypo type='P1'>{t(`modal.exportResults.send`)}</Sypo>
          </div>
          <div className={cx('switch')}>
            <Switch
              checked={modalState.method === 1}
              onChange={(e) => onChangeSwitch(e, 'method')}
            />
          </div>
        </div>
        <div className={cx('folder-info', modalState.method === 1 && 'active')}>
          <div className={cx('route')}>
            <div className={cx('title')}>
              <Sypo type='P1'>{t(`modal.exportResults.folderRoute`)}</Sypo>
            </div>
            <div className={cx('path')}>
              <Mypo type='P1' weight='regular'>
                {modalState.dataset}
              </Mypo>
            </div>
          </div>
          <div className={cx('name')}>
            <div className={cx('title')}>
              <Sypo type='P1'>{t(`modal.exportResults.fileName`)}</Sypo>
            </div>
            <div className={cx('input')}>
              <InputText
                value={modalState.fileName}
                onChange={onChangeFileName}
                customStyle={{ fontFamily: 'MarkerFont', fontWeight: 400 }}
                status={valid ? '' : 'error'}
              />
              <div className={cx('ext')}>
                <Sypo type='P1'>.{EXT_LABEL[modalState.form]}</Sypo>
              </div>
            </div>
            <div className={cx('error', !valid && 'visible')}>
              <Sypo type='P2' weight='regular'>
                {modalState.fileName.length === 0
                  ? `${t(`page.exportResults.noFileName`)}`
                  : `${t(`page.exportResults.emptyResults`)}`}
              </Sypo>
            </div>
          </div>
          <div className={cx('overwrite')}>
            <div className={cx('title')}>
              <Sypo type='P1' weight='regular'>
                {t(`modal.exportResults.overwrite`)}
              </Sypo>
            </div>
            <div className={cx('switch')}>
              <Switch
                checked={modalState.force === 1}
                onChange={(e) => onChangeSwitch(e, 'overwrite')}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={cx('bottom-section')}>
        <div className={cx('left-side')}></div>
        <div className={cx('right-side')}>
          <Button
            customStyle={{
              padding: '11px 18px',
              background: '#fff',
              color: MONO205,
              border: 'none',
            }}
            onClick={handleClose}
          >
            <Sypo type='P1'>{t(`component.btn.cancel`)}</Sypo>
          </Button>
          <Button
            disabled={!checkValidation()}
            customStyle={{
              padding: '11px 18px',
            }}
            onClick={onClickExport}
            loading={exportMutation.isLoading}
          >
            <Sypo type='P1'>{t(`component.btn.export`)}</Sypo>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportResultModalLeftSection;

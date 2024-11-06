import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import {
  exportModalAtom,
  exportModalAtomModel,
} from '@src/stores/components/Modal/ExportResultsModalAtom';

import ExportResultModalContent from './content/ExportResultModalContent';
import useGetExportCheck from './hooks/useGetExportCheck';

import styles from './ExportResultModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  refetch: () => void;
  projectId: number;
  classCount?: number;
};
const ExportResultModal = ({ projectId, refetch, classCount }: Props) => {
  const [modalState, setModalState] =
    useRecoilState<exportModalAtomModel>(exportModalAtom);
  const reset = useResetRecoilState(exportModalAtom);
  const { data } = useGetExportCheck({ projectId });

  const setDataPath = () => {
    if (data?.status && data?.result?.location) {
      const temp = _.cloneDeep(modalState);
      temp.dataset = data.result.location;
      temp.projectId = projectId;
      temp.refetch = refetch;
      setModalState(temp);
    }
  };
  const initialize = () => {
    const temp = _.cloneDeep(modalState);
    temp.projectId = projectId;
    temp.classCount = classCount;
    setModalState(temp);
  };

  useEffect(() => {
    setDataPath();
  }, [data]);
  useEffect(() => {
    initialize();

    return () => {
      reset();
    };
  }, []);
  return (
    <div className={cx('custom-modal-container')}>
      <ExportResultModalContent />
    </div>
  );
};
ExportResultModal.defaultProps = {
  classCount: null,
};
export default ExportResultModal;

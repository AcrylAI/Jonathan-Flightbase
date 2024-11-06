import { Button } from '@jonathan/ui-react';
import { Sypo, Typo } from '@src/components/atoms';
import Modal from '../common/Modal';
import { toast } from '@src/components/molecules/Toast';
import { MONO205, RED502, YELLOW304 } from '@src/utils/color';
import { FilterDataType } from '@src/utils/types/data';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';
import useCancelApprovalJob, {
  useCancelApprovalJobRequestModel
} from './hooks/useCancelApprovalJob';

import styles from './CancelAssignModal.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
type Props = {
  filter: Array<FilterDataType>;
  rowSelectedStatus: Set<number>;
  noSelectedRowId: Set<number>;
  selectedRowCount: number;
  rangeButton?: number;
  projectId: number;
  callAPI: () => void;
  deleteTableRowSelect: () => void;
};

const CancelAssignModal = ({
  filter,
  projectId,
  rangeButton,
  selectedRowCount,
  noSelectedRowId,
  rowSelectedStatus,
  deleteTableRowSelect,
  callAPI,
}: Props) => {
  const { t } = useT();
  const modal = useModal();
  const assignMutation = useCancelApprovalJob();

  const onClickClose = () => {
    modal.close();
  };

  const onClickSubmit = async () => {
    const cancelId: Array<number> = [];
    const notCancelId: Array<number> = [];

    rowSelectedStatus.forEach((v) => cancelId.push(v));
    noSelectedRowId.forEach((v) => notCancelId.push(v));

    const data: useCancelApprovalJobRequestModel = {
      projectId,
      cancelId,
      notCancelId,
      filter,
      flag: rangeButton ?? 1,
    };

    const resp = await assignMutation.mutateAsync(data);
    if (resp.status === 1) {
      toast.success(`${t(`toast.cancelAssignModal.cancelSuccess`)}`);
      await callAPI();
      deleteTableRowSelect();
      modal.close();
    } else {
      toast.api.failed();
    }
  };

  return (
    <Modal.Container>
      <>
        <Modal.ContentContainer confirm>
          <div className={cx('cancel-container')}>
            <div className={cx('label')}>
              <Sypo type='H2'>
                {t(`modal.cancelApproval.header`, {
                  count: selectedRowCount.toLocaleString('kr'),
                })}
              </Sypo>
            </div>
            <div className={cx('desc')}>
              <Typo type='H4' weight='medium'> </Typo>
            </div>
            <div className={cx('btn-container')}>
              <Button
                onClick={onClickClose}
                customStyle={{
                  backgroundColor: '#fff',
                  border: '#fff',
                  color: MONO205,
                }}
              >
                <Sypo type='P1'>{t(`component.btn.close`)}</Sypo>
              </Button>
              <Button
                onClick={onClickSubmit}
                customStyle={{ backgroundColor: YELLOW304, border: YELLOW304 }}
                loading={assignMutation.isLoading}
              >
                {t(`component.btn.cancelApproval`)}
              </Button>
            </div>
          </div>
        </Modal.ContentContainer>
      </>
    </Modal.Container>
  );
};
CancelAssignModal.defaultProps = {
  rangeButton: 1,
};

export default CancelAssignModal;

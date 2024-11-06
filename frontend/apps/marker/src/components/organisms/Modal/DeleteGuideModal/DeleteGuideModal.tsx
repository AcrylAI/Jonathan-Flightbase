// i18n
import { Button } from '@jonathan/ui-react';

// API
import useDeleteGuideFile from '@src/pages/ProjectInfoPage/hooks/useDeleteGuideFile';

import { Sypo } from '@src/components/atoms';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import styles from './DeleteGuideModal.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  id: number;
  name: string;
  refetch: () => void;
};

const DeleteGuideModal = ({ id, name, refetch }: Props) => {
  const { t } = useT();
  const { mutateAsync: deleteRequest } = useDeleteGuideFile();

  const modal = useModal();

  const onCancelClick = () => {
    modal.close();
  };

  const onDeleteClick = async () => {
    const res = await deleteRequest({ id });

    if (res.status === 1) {
      toast.success(t(`toast.common.deleteFileSuccess`));
      modal.close();
      refetch();
    } else {
      toast.error(t(`toast.common.deleteFileFailed`));
    }
  };

  return (
    <Modal.Container>
      <>
        <div className={cx('header-area')}>
          <Modal.Header title={t(`modal.deleteGuideline.header`)} />
        </div>

        <Modal.ContentContainer confirm>
          <div className={cx('delete-modal-contents')}>
            <p>
              <Sypo type='H4' weight={500}>
                {t(`modal.deleteGuideline.text`)} {name}
              </Sypo>
            </p>
          </div>
        </Modal.ContentContainer>
        <Modal.Footer isCustom>
          <div className={cx('button-wrapper')}>
            <Button
              onClick={onCancelClick}
              type='none-border'
              customStyle={{
                padding: '10px 16px',
                marginLeft: '16px',
                borderRadius: '2px',
              }}
            >
              <Sypo type='P1'>{t(`component.btn.cancel`)}</Sypo>
            </Button>
            <Button
              onClick={onDeleteClick}
              type='red'
              customStyle={{
                padding: '10px 16px',
                marginLeft: '16px',
                borderRadius: '2px',
                background: '#FA4E57',
                border: 'none',
              }}
            >
              <Sypo type='P1'>{t(`component.radiobtn.delete`)}</Sypo>
            </Button>
          </div>
        </Modal.Footer>
      </>
    </Modal.Container>
  );
};

export default DeleteGuideModal;

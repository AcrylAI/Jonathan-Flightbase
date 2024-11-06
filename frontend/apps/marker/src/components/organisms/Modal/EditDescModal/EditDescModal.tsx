import { ChangeEvent, useEffect, useState } from 'react';

import { Textarea } from '@jonathan/ui-react';

import usePutProjectDesc from '@src/pages/ProjectInfoPage/hooks/usePutProjectDesc';

import { Sypo } from '@src/components/atoms';
import { FooterBtnType } from '../common/Footer/ModalFooter';
import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import styles from './EditDescModal.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);
const MAX_LENGTH = 1000;

type Props = {
  projectId: number;
  refetch: () => void;
  infoDesc: string;
};

const EditDescModal = ({ projectId, refetch, infoDesc }: Props) => {
  const { t } = useT();

  const [descText, setDescText] = useState<string>('');
  const { mutateAsync: putRequest, isLoading } = usePutProjectDesc();

  const modal = useModal();

  useEffect(() => {
    if (infoDesc.length > 0) {
      setDescText(infoDesc);
    }
  }, []);

  const onDescChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    let v = value;

    if (descText.length > MAX_LENGTH - 1) {
      v = e.target.value.substring(0, MAX_LENGTH);
    }
    setDescText(v);
  };

  const cancelBtn: FooterBtnType = {
    title: 'Cancel',
    onClick: () => {
      modal.close();
    },
  };

  const submitBtn: FooterBtnType = {
    title: 'Apply',
    onClick: async () => {
      const resp = await putRequest({ projectId, description: descText });
      if (resp.status === 1) {
        toast.success(t(`toast.editDescription.editSuccess`));
        refetch();
        modal.close();
      } else {
        toast.error(t(`toast.editDescription.editFailed`));
      }
    },
    loading: isLoading,
  };

  return (
    <Modal.Container>
      <>
        <Modal.Header title={t(`modal.editDescription.header`)} />
        <Modal.ContentContainer confirm>
          <div className={cx('text-area')}>
            <p className={cx('number-of-letters')}>
              <Sypo type='P2'>
                {descText.length}/{MAX_LENGTH}
              </Sypo>
            </p>
            <div className={cx('desc-box')}>
              <Textarea
                customStyle={{ height: '145px', border: 'none' }}
                onChange={onDescChange}
                value={descText}
              />
            </div>
          </div>
        </Modal.ContentContainer>
        <Modal.Footer cancelBtn={cancelBtn} submitBtn={submitBtn} />
      </>
    </Modal.Container>
  );
};

export default EditDescModal;

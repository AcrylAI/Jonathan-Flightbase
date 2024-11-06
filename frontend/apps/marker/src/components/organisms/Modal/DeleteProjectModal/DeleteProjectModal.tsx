import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useDeleteProject from '@src/pages/ProjectsPage/hooks/useDeleteProject';

import { Mypo, Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import styles from './DeleteProjectModal.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

import { Button, InputText } from '@jonathan/ui-react';

import Modal from '../common/Modal';

import { toast } from '@src/components/molecules/Toast';

import useModal from '@src/hooks/Modal/useModal';

type Props = {
  projectId: number;
  projectName: string;
  refetch: () => void;
  setEditButtonClick?: (value: boolean) => void;
};

const DeleteProjectModal = ({
  projectId,
  projectName,
  refetch,
  setEditButtonClick,
}: Props) => {
  const { t } = useT();
  const { mutateAsync: deleteRequest, isLoading } = useDeleteProject();

  const modal = useModal();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');

  const onConfirmTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInputText(value);
  };

  const onCancelClick = () => {
    modal.close();
  };

  const onDeleteClick = async () => {
    if (projectName !== inputText) return;

    const res = await deleteRequest({ id: projectId });

    if (res.status === 1) {
      toast.success(t(`toast.projectDeleteModal.deleteSuccess`));
      modal.close();
      navigate('/admin/projects');
      refetch();
      if (setEditButtonClick) {
        setEditButtonClick(false);
      }
    } else {
      toast.error(t(`toast.common.requestFailed`));
      if (setEditButtonClick) {
        setEditButtonClick(false);
      }
    }
  };

  return (
    <Modal.Container>
      <>
        <div className={cx('header-area')}>
          <Modal.Header title={t(`modal.deleteProject.header`)} />
        </div>

        <Modal.ContentContainer confirm>
          <div className={cx('delete-modal-contents')}>
            <p>
              <Mypo type='H4' weight={500}>
                {t(`modal.deleteProject.text1`)}
                <br />
                {t(`modal.deleteProject.text2`)}
              </Mypo>
            </p>
            <p className={cx('project-name')}>
              <Sypo type='P1' weight={400}>
                {t(`modal.deleteProject.projectName`)}
              </Sypo>
              &nbsp;
              {projectName}
            </p>
            <div className={cx('text-area')}>
              <InputText
                autoFocus
                onChange={onConfirmTextChange}
                customStyle={{
                  height: '40px',
                  border: 'none',
                  overflowY: 'hidden',
                }}
                value={inputText}
              />
            </div>
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
              loading={isLoading}
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
                background: projectName !== inputText ? '#f0f0f0' : '#FA4E57',
                border: 'none',
              }}
              disabled={projectName !== inputText}
            >
              <Sypo type='P1'>{t(`component.radiobtn.delete`)}</Sypo>
            </Button>
          </div>
        </Modal.Footer>
      </>
    </Modal.Container>
  );
};

DeleteProjectModal.defaultProps = {
  setEditButtonClick: '',
};

export default DeleteProjectModal;

import { useNavigate } from 'react-router-dom';

// Component
import Modal from '@src/components/organisms/Modal/common/Modal';

// TypoGraphy
import { Sypo } from '@src/components/atoms';

// API hooks
import useLogin from '@src/pages/LoginPage/hooks/useLogin';
import useModal from '@src/hooks/Modal/useModal';

// Page URL
import { USER_URL } from '@src/utils/pageUrls';

// CSS Module
import classNames from 'classnames/bind';
import style from './ForceLoginModal.module.scss';
import { useEffect } from 'react';

const cx = classNames.bind(style);

type Props = {
  id: string;
  password: string;
};

const ForceLoginModal = ({ id, password }: Props) => {
  const navigate = useNavigate();
  const modal = useModal();

  const { login } = useLogin();

  const onForceLogin = async () => {
    if (id === '' || password === '') return;

    const isForceLoginSuccess = await login({
      name: id,
      password,
      force: 'Y',
    });

    if (isForceLoginSuccess === 1) {
      navigate(USER_URL.PROJECT_PAGE);
      modal.close();
    }
  };

  const handleCancel = () => {
    modal.close();
  };

  const handleEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onForceLogin();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEnter);

    return () => {
      document.removeEventListener('keydown', handleEnter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal.Container>
      <>
        <Modal.ContentContainer confirm>
          <div className={cx('contents-container')}>
            <Sypo type='H4' weight='medium'>
              이미 로그인된 계정입니다. 이전 로그인을 로그아웃하고 다시 로그인
              하시겠습니까?{' '}
            </Sypo>
          </div>
        </Modal.ContentContainer>
        <Modal.Footer
          cancelBtn={{ title: 'Cancel', onClick: handleCancel }}
          submitBtn={{ title: 'Submit', onClick: onForceLogin }}
        />
      </>
    </Modal.Container>
  );
};

export default ForceLoginModal;

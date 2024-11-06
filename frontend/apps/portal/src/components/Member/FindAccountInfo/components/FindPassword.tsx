import React, { useEffect, useState } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// components
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import SuccessButton from '@components/common/Button/SuccessButton';
import BaseInput from '@components/common/Input/BaseInput';
import { ModalModel } from '@src/atom/ui/Modal';

// Custom hooks
import { useFormInput } from '@src/common/CustomHooks';
import useCheckUserNameUnique from '@src/common/CustomHooks/Queries/Member/useCheckUserNameUnique';
import useFindPassSendMail from '@src/common/CustomHooks/Queries/Member/useFindPassSendEmail';
import useGetUserEmail from '@src/common/CustomHooks/Queries/Member/useGetUserEmail';
import useModal from '@src/common/CustomHooks/useModal';
import { useFormInputValidationArgs } from '@src/common/CustomHooks/useFormInput';

// Style
import classNames from 'classnames/bind';
import styles from './FindPassword.module.scss';
const cx = classNames.bind(styles);

function FindPassword() {
  const { t } = useTranslation();
  const [submitOpen, setSubmitOpen] = useState(false);
  const userNameUniqueMutation = useCheckUserNameUnique();
  const sendEmailMutation = useFindPassSendMail();
  const getUserEmailMutation = useGetUserEmail();
  const { addModal, removeCurrentModal } = useModal();

  // 아이디 검증
  const validateUserName = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setSubmitOpen(false);
    setIsValid(false);
    if (userName.val !== '') {
      if (formatValid) {
        // 아이디 존재여부 확인
        const body = { username: userName.val };
        await userNameUniqueMutation
          .onMutateAsync({ body })
          .then((res) => {
            if (res.data === 'duplicated') {
              setSubmitOpen(true);
              setIsValid(true);
              setErrMsg('');
            } else {
              setErrMsg(t('username-not-exist'));
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
          });
      } else {
        setErrMsg(t('username-not-correct'));
      }
    } else {
      setErrMsg(t('login-error-username-empty'));
    }
  };

  const userName = useFormInput('', t('username'), validateUserName);

  const handleShowModal = (email: string) => {
    const sendEmailModel: ModalModel = {
      key: 'oneBtnModal',
      props: {
        title: t('email-sent'),
        subTitle: email,
        isSuccess: true,
        texts: [t('reset-email-modal-text1'), t('reset-email-modal-text2')],
        btns: [
          {
            type: 'success',
            text: t('confirm'),
            onClick: () => {
              removeCurrentModal();
            },
          },
        ],
      },
    };

    addModal(sendEmailModel);
  };

  const handleSubmit = async (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    if (submitOpen) {
      const emailBody = {
        username: userName.val,
      };
      const emailTokenBody = {
        username: userName.val,
        token: '8nPZYAYTZAmD94owR23u',
      };
      await sendEmailMutation.onMutateAsync({ body: emailBody });
      await getUserEmailMutation
        .onMutateAsync({ body: emailTokenBody })
        .then((res) => {
          handleShowModal(res.data.email);
        });
    }
  };

  useEffect(() => {
    return () => {
      removeCurrentModal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cx('fp-wrap')}>
      <div className={cx('fp-box')}>
        <div className={cx('fp-header-box')}>
          <div className={cx('sub-title-box')}>
            <BasicSubTitle
              text={['password-forgot-subtitle1', 'password-forgot-subtitle2']}
            ></BasicSubTitle>
          </div>
        </div>

        <div className={cx('fp-body')}>
          <div className={cx('fp-input-box')}>
            <BaseInput
              {...userName}
              name='username'
              type='text'
              onKeyPressEnter={handleSubmit}
            />
          </div>

          <SuccessButton
            text={t('password-reset-email')}
            disabled={!submitOpen}
            onClick={handleSubmit}
          ></SuccessButton>
        </div>
      </div>
    </div>
  );
}

export default FindPassword;

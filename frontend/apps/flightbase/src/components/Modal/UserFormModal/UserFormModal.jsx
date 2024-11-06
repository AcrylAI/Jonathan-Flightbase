// i18n
import { withTranslation } from 'react-i18next';

// Components
import ModalFrame from '../ModalFrame';
import { InputText, InputPassword, Selectbox } from '@jonathan/ui-react';
import InputBoxWithLabel from '@src/components/molecules/InputBoxWithLabel';

// CSS module
import classNames from 'classnames/bind';
import style from './UserFormModal.module.scss';
const cx = classNames.bind(style);

const UserFormModal = ({
  validate,
  data,
  type,
  name,
  nameError,
  userGroupOptions,
  userGroup,
  passwordError,
  confirmError,
  readOnlyTxt,
  textInputHandler,
  searchSelectHandler,
  onSubmit,
  t,
}) => {
  const { submit, cancel, data: userData = {} } = data;
  const newSubmit = {
    text: submit.text,
    func: async () => {
      const res = await onSubmit(submit.func);
      return res;
    },
  };
  return (
    <ModalFrame
      submit={newSubmit}
      cancel={cancel}
      type={type}
      validate={validate}
      isResize={true}
      isMinimize={true}
      title={
        type === 'CREATE_USER'
          ? t('addUserForm.title.label')
          : `${t('editUserForm.title.label')} - ${name}`
      }
    >
      <h2 className={cx('title')}>
        {type === 'CREATE_USER'
          ? t('addUserForm.title.label')
          : `${t('editUserForm.title.label')} - ${name}`}
        {userData.locked && (
          <div className={cx('ban-text-box')}>
            <span className={cx('ban-text')}>
              <img
                src='/images/icon/ban.png'
                className={cx('ban-icon')}
                alt='blocked user'
              />
              {t('userLock.message')}
            </span>
          </div>
        )}
      </h2>
      <div className={cx('form')}>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('userID.label')}
            labelSize='large'
            errorMsg={t(nameError)}
          >
            <InputText
              size='large'
              name='name'
              value={name}
              placeholder={t('userID.placeholder')}
              onChange={textInputHandler}
              status={nameError ? 'error' : 'default'}
              isReadOnly={readOnlyTxt === 'edit'}
              onClear={() =>
                textInputHandler({ target: { value: '', name: 'name' } })
              }
              disableLeftIcon
              options={{ maxLength: 32 }}
              autoFocus
              tabIndex='1'
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <InputBoxWithLabel labelText={t('userGroup.label')} labelSize='large'>
            <Selectbox
              type='search'
              size='large'
              placeholder={t('userGroupSelect.placeholder')}
              list={userGroupOptions}
              selectedItem={userGroup}
              onChange={(selectItem) => {
                searchSelectHandler(selectItem, 'userGroup');
              }}
              customStyle={{
                fontStyle: {
                  selectbox: {
                    color: '#121619',
                    textShadow: 'None',
                  },
                },
              }}
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('password.label')}
            labelSize='large'
            errorMsg={t(passwordError)}
          >
            <InputPassword
              size='large'
              tabIndex='2'
              placeholder={t('userPassword.placeholder')}
              name='password'
              onChange={textInputHandler}
              status={passwordError ? 'error' : 'default'}
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('passwordConfirm.label')}
            labelSize='large'
            errorMsg={t(confirmError)}
          >
            <InputPassword
              size='large'
              tabIndex='3'
              placeholder={t('userPasswordConfirm.placeholder')}
              name='confirm'
              onChange={textInputHandler}
              status={confirmError ? 'error' : 'default'}
            />
          </InputBoxWithLabel>
        </div>
      </div>
    </ModalFrame>
  );
};

export default withTranslation()(UserFormModal);

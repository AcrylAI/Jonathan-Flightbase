// i18n
import { withTranslation } from 'react-i18next';

// Components
import { InputText, Textarea } from '@jonathan/ui-react';
import InputBoxWithLabel from '@src/components/molecules/InputBoxWithLabel';
import MultiSelect from '@src/components/molecules/MultiSelect';
import ModalFrame from '../ModalFrame';

// CSS Module
import style from './UserGroupFormModal.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const UserGroupFormModal = ({
  data,
  type,
  validate,
  name,
  nameError,
  description,
  userList,
  selectedList,
  inputHandler,
  multiSelectHandler,
  onSubmit,
  t,
}) => {
  const { submit, cancel } = data;
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
      title={t(
        type === 'CREATE_USER_GROUP' ? 'addGroup.label' : 'editGroup.label',
      )}
    >
      <h2 className={cx('title')}>
        {t(type === 'CREATE_USER_GROUP' ? 'addGroup.label' : 'editGroup.label')}
      </h2>
      <div className={cx('form')}>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('groupName.label')}
            labelSize='large'
            errorMsg={t(nameError)}
          >
            <InputText
              size='large'
              name='name'
              value={name}
              placeholder={t('groupName.placeholder')}
              onChange={inputHandler}
              status={nameError ? 'error' : 'default'}
              options={{ maxLength: 50 }}
              onClear={() =>
                inputHandler({ target: { value: '', name: 'name' } })
              }
              disableLeftIcon
              autoFocus
              tabIndex='1'
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('groupDescription.label')}
            optionalText={t('optional.label')}
            labelSize='large'
            optionalSize='large'
          >
            <Textarea
              size='large'
              placeholder={t('groupDescription.placeholder')}
              value={description}
              name='description'
              onChange={inputHandler}
              isShowMaxLength
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <MultiSelect
            label='users.label'
            listLabel='availableUsers.label'
            selectedLabel='chosenUsers.label'
            list={userList} // 초기 목록
            selectedList={selectedList} // 초기 선택된 목록
            onChange={multiSelectHandler} // 변경 이벤트
            // exceptItem={manager && manager.value} // 목록에서 빠질 아이템
            optional
          />
        </div>
      </div>
    </ModalFrame>
  );
};

export default withTranslation()(UserGroupFormModal);

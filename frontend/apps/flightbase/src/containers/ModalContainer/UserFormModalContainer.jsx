import { PureComponent } from 'react';
import { connect } from 'react-redux';

// Action
import { closeModal } from '@src/store/modules/modal';

// Components
import UserFormModal from '@src/components/Modal/UserFormModal';

// utils
import {
  encrypt,
  errorToastMessage,
  defaultSuccessToastMessage,
} from '@src/utils';

// network
import { callApi, STATUS_SUCCESS, STATUS_FAIL } from '@src/network';

let userNameSearchTimer;
class UserFormModalContainer extends PureComponent {
  state = {
    userId: '',
    validate: false, // Create 버튼 활성/비활성 여부 상태 값
    name: '',
    password: '',
    confirm: '',
    nameError: null,
    passwordError: null,
    confirmError: null,
    readOnlyTxt: '',
    userTypeOptions: [
      { label: 'User', value: 3 },
      { label: 'Training Manager', value: 2 },
      { label: 'Workspace Manager', value: 1 },
      { label: 'Admin', value: 0 },
    ],
    userGroupOptions: [],
    userGroup: null,
    userType: 3,
  };

  async componentDidMount() {
    const { type, data } = this.props;
    const userGroupOptions = await this.getGroupOptions();
    if (type === 'EDIT_USER') {
      const { data: userData } = data;
      const groupId = await this.getUserInfo(userData.id);
      let userGroup;
      if (groupId) {
        [userGroup] = userGroupOptions.filter(({ value }) => groupId === value);
      }
      this.setState({
        userId: userData.id,
        name: userData.name,
        nameError: '',
        readOnlyTxt: 'edit',
        userGroupOptions,
        userGroup,
        passwordError: '',
        confirmError: '',
      });
    } else {
      this.setState({
        readOnlyTxt: 'create',
        userGroupOptions,
      });
    }
  }

  /** ================================================================================
   * API START
   ================================================================================ */
  getUserInfo = async (userId) => {
    const url = `users/${userId}`;
    const response = await callApi({
      url,
      method: 'get',
    });
    const { status, result, message, error } = response;
    if (status === STATUS_SUCCESS) {
      const { group_id: groupId } = result;
      return groupId;
    }
    errorToastMessage(error, message);
    return null;
  };

  getGroupOptions = async () => {
    const url = 'options/user';
    const response = await callApi({
      url,
      method: 'get',
    });
    const { status, result, message, error } = response;
    if (status === STATUS_SUCCESS) {
      const { usergroup_list: userGroupOptions } = result;
      return [
        { label: 'None', value: null },
        ...userGroupOptions.map(({ name: label, id: value }) => ({
          label,
          value,
        })),
      ];
    }
    errorToastMessage(error, message);
    return [];
  };

  /** ================================================================================
   * API END
   ================================================================================ */

  /** ================================================================================
   * Event Handler START
   ================================================================================ */

  // 텍스트 인풋 이벤트 핸들러
  textInputHandler = async (e) => {
    const { name, value } = e.target;
    const newState = {
      [name]: value,
      [`${name}Error`]: null,
    };
    const validate = this.validate(name, value);
    if (validate) {
      newState[`${name}Error`] = validate;
    } else {
      newState[`${name}Error`] = '';
    }
    if (name === 'name') {
      // Username Search Timer 로직
      if (userNameSearchTimer) {
        clearTimeout(userNameSearchTimer);
      }
      userNameSearchTimer = setTimeout(async () => {
        const nameRegType = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        const searchState = {};

        if (nameRegType.test(value)) {
          const duplicate = await this.duplicated(value);
          if (duplicate.status === STATUS_FAIL) {
            searchState.nameError = 'userID.duplicate.message';
            this.setState(searchState);
          }
        }
      }, 250);
    }

    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  duplicated = async (value) => {
    const response = await callApi({
      url: `users/check/${value}`,
      method: 'GET',
    });
    return response;
  };

  // 유효성 검증
  validate = (name, value) => {
    const { state } = this;
    if (name === 'name') {
      const regType1 = /^[a-z0-9]+(-[a-z0-9]+)*$/;
      if (value === '') {
        return 'userID.empty.message';
      }
      if (!value.match(regType1) || value.match(regType1)[0] !== value) {
        return 'nameRule.message';
      }
      if (value.length < 3) {
        return 'userIdRule.message';
      }
    } else if (name === 'password') {
      // 숫자, 대소문자영어, 특수문자 포함 8자리 이상 20자리 이하 비밀번호 정규식 -> 영어로
      const regType2 = /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[~!@#$%^&*<>?]).{8,20}$/;
      if (!regType2.test(value)) {
        return 'passwordRule.message';
      }
      if (state.confirm !== '') {
        if (state.confirm === value) {
          this.setState({
            confirmError: '',
          });
        } else {
          return 'passwordNotMatch.message';
        }
      }
    } else if (name === 'confirm') {
      if (value !== state.password) {
        return 'passwordNotMatch.message';
      }
    }
    return null;
  };

  // submit 버튼 활성/비활성 함수
  submitBtnCheck = () => {
    // submit 버튼 활성/비활성
    const { state } = this;
    const stateKeys = Object.keys(state);
    let validateCount = 0;
    for (let i = 0; i < stateKeys.length; i += 1) {
      const key = stateKeys[i];
      if (key.indexOf('Error') !== -1) {
        if (state[key] !== '') {
          validateCount += 1;
        }
      }
    }
    const validateState = { validate: false };
    if (validateCount === 0) {
      validateState.validate = true;
    }

    this.setState(validateState);
  };

  searchSelectHandler = (selected, name) => {
    const newState = {
      [name]: selected,
    };

    this.setState(newState, () => this.submitBtnCheck());
  };

  // submit 버튼 클릭 이벤트
  onSubmit = async (callback) => {
    const { type } = this.props;
    const { userId, name, password, userType, userGroup } = this.state;

    let body = {};
    let method = '';

    if (type === 'EDIT_USER') {
      method = 'PUT';
      body = {
        select_user_id: userId,
        user_type: userType,
      };
      if (password !== '') body.new_password = encrypt(password);
    } else {
      method = 'POST';
      body = {
        new_user_name: name,
        user_type: userType,
      };
      if (password !== '') body.password = encrypt(password);
    }
    if (userGroup) body.usergroup_id = userGroup.value;

    const response = await callApi({
      url: 'users',
      method,
      body,
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      this.props.closeModal(type);
      if (callback) callback();
      if (type === 'EDIT_USER') {
        defaultSuccessToastMessage('update');
      } else {
        defaultSuccessToastMessage('create');
      }
      return true;
    }
    errorToastMessage(error, message);
    return false;
  };

  /** ================================================================================
   * Event Handler END
   ================================================================================ */

  render() {
    const { state, props, textInputHandler, searchSelectHandler, onSubmit } =
      this;
    return (
      <UserFormModal
        {...state}
        {...props}
        textInputHandler={textInputHandler}
        searchSelectHandler={searchSelectHandler}
        onSubmit={onSubmit}
      />
    );
  }
}

export default connect(null, { closeModal })(UserFormModalContainer);

import { PureComponent } from 'react';
import { connect } from 'react-redux';

// Action
import { closeModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';

// Components
import FolderFormModal from '@src/components/Modal/FolderFormModal';

// Utils
import { defaultSuccessToastMessage, errorToastMessage } from '@src/utils';

// Network
import { upload, STATUS_SUCCESS } from '@src/network';

class FolderFormModalContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      validate: false,
      datasetId: '',
      datasetName: '',
      workspaceId: '',
      orginFolderName: '',
      folderName: '',
      folderNameError: null,
      accessType: '',
      loc: '',
      onChangedFolderName: () => {},
    };
  }

  componentDidMount() {
    const { type, data: datasetData } = this.props;
    const {
      datasetId,
      datasetName,
      workspaceId,
      workspaceName,
      accessType,
      loc,
      onChangedFolderName,
    } = datasetData;
    if (type === 'CREATE_FOLDER') {
      this.setState({
        datasetId,
        datasetName,
        folderName: '',
        folderNameError: '',
        workspaceId,
        workspaceName,
        accessType,
        loc,
      });
    } else {
      const {
        data: {
          data: { name: folderName },
        },
      } = this.props;
      this.setState({
        datasetId,
        datasetName,
        orginFolderName: folderName,
        folderName,
        folderNameError: '',
        workspaceId,
        workspaceName,
        accessType,
        loc,
        onChangedFolderName,
      });
    }
  }

  /** ================================================================================
   * Event Handler START
   ================================================================================ */

  // 텍스트 인풋 이벤트 핸들러
  textInputHandler = (e) => {
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
    this.setState(newState, () => {
      this.submitBtnCheck();
    });
  };

  // 유효성 검증
  validate = (name, value) => {
    if (name === 'folderName') {
      const folderReg = /(?=.*[:?*<>#$%&()/"|\\\s])/;
      if (value === '') {
        return 'folderName.empty.message';
      }
      if (value.match(folderReg)) {
        return 'folderNameRule.message';
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

  // submit 버튼 클릭 이벤트
  onSubmit = async (callback) => {
    const { type } = this.props;
    const {
      datasetId,
      datasetName,
      workspaceId,
      loc,
      orginFolderName,
      folderName,
      accessType,
      onChangedFolderName,
    } = this.state;

    const form = new FormData();
    form.append('dataset_id', datasetId);
    form.append('path', loc);
    form.append('workspace_id', workspaceId);
    form.append('access', accessType);
    form.append('dataset_name', datasetName);
    form.append('type', 1);
    if (type === 'CREATE_FOLDER') {
      form.append('new_name', folderName);
    } else {
      form.append('original_name', orginFolderName);
      form.append('new_name', folderName);
      onChangedFolderName(loc, orginFolderName, folderName);
    }
    const response = await upload({
      url: `datasets/${datasetId}/files`,
      method: type === 'CREATE_FOLDER' ? 'post' : 'put',
      form,
    });
    const { status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      this.props.closeModal(type);
      if (type === 'CREATE_FOLDER') {
        defaultSuccessToastMessage('create');
      } else {
        defaultSuccessToastMessage('update');
      }
      if (callback) callback();
      return true;
    }
    errorToastMessage(error, message);
    return false;
  };

  /** ================================================================================
   * Event Handler END
   ================================================================================ */

  render() {
    const { state, props, textInputHandler, onSubmit } = this;
    return (
      <FolderFormModal
        {...state}
        {...props}
        textInputHandler={textInputHandler}
        onSubmit={onSubmit}
      />
    );
  }
}

export default connect(null, { closeModal, openConfirm })(
  FolderFormModalContainer,
);

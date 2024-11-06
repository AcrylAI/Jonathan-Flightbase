import { PureComponent } from 'react';
import { connect } from 'react-redux';

// Action
import { closeModal } from '@src/store/modules/modal';
import { openConfirm } from '@src/store/modules/confirm';

// Components
import FileFormModal from '@src/components/Modal/FileFormModal';
import { toast } from '@src/components/Toast';

// Utils
import { defaultSuccessToastMessage } from '@src/utils';

// Network
import { upload, STATUS_SUCCESS } from '@src/network';

class FileFormModalContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      validate: false,
      datasetId: '',
      datasetName: '',
      workspaceId: '',
      orginFileName: '',
      fileName: '',
      fileNameError: null,
      accessType: '',
      loc: '',
    };
  }

  componentDidMount() {
    const { data: datasetData } = this.props;
    const {
      datasetId,
      datasetName,
      workspaceId,
      workspaceName,
      accessType,
      loc,
    } = datasetData;
    const {
      data: {
        data: { name: fileName },
      },
    } = this.props;
    this.setState({
      datasetId,
      datasetName,
      orginFileName: fileName,
      fileName,
      fileNameError: '',
      workspaceId,
      workspaceName,
      accessType,
      loc,
    });
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
    if (name === 'fileName') {
      const fileReg = /(?=.*[:?*<>#$%&()/"|\\\s])/;
      if (value === '') {
        return 'fileName.empty.message';
      }
      if (value.match(fileReg)) {
        return 'fileNameRule.message';
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
      orginFileName,
      fileName,
      accessType,
    } = this.state;

    const form = new FormData();
    form.append('dataset_id', datasetId);
    form.append('path', loc);
    form.append('workspace_id', workspaceId);
    form.append('access', accessType);
    form.append('dataset_name', datasetName);
    form.append('original_name', orginFileName);
    form.append('new_name', fileName);
    form.append('type', 0);
    const response = await upload({
      url: `datasets/${datasetId}/files`,
      method: 'put',
      form,
    });
    const { status, message } = response;
    if (status === STATUS_SUCCESS) {
      this.props.closeModal(type);
      defaultSuccessToastMessage('update');
      if (callback) callback();
      return true;
    }
    toast.error(message);
    return false;
  };

  /** ================================================================================
   * Event Handler END
   ================================================================================ */

  render() {
    const { state, props, textInputHandler, onSubmit } = this;
    return (
      <FileFormModal
        {...state}
        {...props}
        textInputHandler={textInputHandler}
        onSubmit={onSubmit}
      />
    );
  }
}

export default connect(null, { closeModal, openConfirm })(
  FileFormModalContainer,
);

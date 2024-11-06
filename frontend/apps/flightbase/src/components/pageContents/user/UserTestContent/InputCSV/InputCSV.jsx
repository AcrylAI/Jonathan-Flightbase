// Components
import File from '../File';
import InputLabelBox from '../InputLabelBox';

// CSS module
import style from './InputCSV.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const InputCSV = ({
  idx,
  apiKey,
  description,
  fileInputHandler,
  selectedFile = [],
  selectedFileSrc = '',
}) => {
  return (
    <div className={cx('input-analysis')}>
      <InputLabelBox
        idx={idx}
        apiKey={apiKey}
        description={description}
        type={'CSV'}
      >
        <div className={cx('file-browse')} title={description}>
          <File
            name='csv'
            accept='.csv'
            onChange={(e) => fileInputHandler(e, 'CSV', idx)}
            value={selectedFileSrc}
          />
          <div className={cx('file-name')} title={selectedFile.name}>
            {selectedFile && selectedFile.name}
          </div>
        </div>
      </InputLabelBox>
    </div>
  );
};

export default InputCSV;

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// i18n
import { withTranslation } from 'react-i18next';

// Components
import { Button } from '@jonathan/ui-react';
import ExcelDownload from '@src/components/atoms/ExcelDownload';

// Utils
import { exportPdf } from '@src/utils';

// CSS module
import classNames from 'classnames/bind';
import style from './ExportButton.module.scss';
const cx = classNames.bind(style);

const ExportButton = ({
  excelDownload,
  excelDataFormat,
  excelFileName,
  pdfTargetId,
  t,
}) => {
  const button = useRef(null);
  const excelBtn = useRef(null);
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const handleClick = (e) => {
    if (
      button.current &&
      !ReactDOM.findDOMNode(button.current).contains(e.target)
    ) {
      setIsOptionOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClick, false);
    return () => {
      document.removeEventListener('click', handleClick, false);
    };
  });

  const onExport = (option) => {
    if (option === 'excel') {
      excelDownload(excelBtn.current);
    } else {
      exportPdf(pdfTargetId);
    }
  };
  return (
    <div className={cx('export')} ref={button}>
      <Button
        type='primary'
        size='medium'
        onClick={() => {
          setIsOptionOpen(!isOptionOpen);
        }}
      >
        {t('export.label')}
      </Button>
      {isOptionOpen && (
        <ul className={cx('options')}>
          <li style={{ display: 'none' }} className={cx('option_li')}>
            <ExcelDownload data={excelDataFormat} fileName={excelFileName}>
              <span ref={excelBtn}>Excel</span>
            </ExcelDownload>
          </li>
          <li className={cx('option_li')} onClick={() => onExport('excel')}>
            Excel
          </li>
          {/* <li className={cx('option_li', 'disabled')} onClick={() => onExport('pdf')}>
            PDF
          </li> */}
        </ul>
      )}
    </div>
  );
};

export default withTranslation()(ExportButton);

import { useEffect } from 'react';
import { useState } from 'react';
import { CodeBlock, dracula } from 'react-code-blocks';
import { useRecoilState } from 'recoil';

import {
  exportModalAtom,
  exportModalAtomModel,
} from '@src/stores/components/Modal/ExportResultsModalAtom';

import { Sypo } from '@src/components/atoms';
import useGetExportExample from '../../hooks/useGetExportExample';

import useT from '@src/hooks/Locale/useT';

import styles from './ExportResultModalRightSection.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const ExportResultModalRightSection = () => {
  const { t } = useT();
  const [example, setExample] = useState<string>('');
  const [modalState, setModalState] =
    useRecoilState<exportModalAtomModel>(exportModalAtom);
  const { data, isLoading } = useGetExportExample({
    projectId: modalState.projectId,
    form: modalState.form,
    classCount: modalState.classCount,
  });

  const parsingData = (data: string): string => {
    let result = '';
    switch (modalState.form) {
      case 0:
        {
          // json
          const parsed = JSON.parse(data);
          result = JSON.stringify(parsed, undefined, 2);
        }
        break;
      case 1:
        // csv
        result = data;
        break;
      default:
    }

    return result;
  };

  const handleExample = () => {
    if (data?.status && data.result) {
      const parsed = parsingData(data.result?.data ?? '');
      setExample(parsed);
    }
  };

  useEffect(() => {
    handleExample();
  }, [data]);

  return (
    <div className={cx('right-section-container')}>
      <div className={cx('title')}>
        <Sypo type='H4'>{t(`modal.exportResults.preview`)}</Sypo>
      </div>
      <CodeBlock
        theme={dracula}
        text={example}
        wrapLines
        codeBlock
        language='javascript'
        showLineNumbers={false}
        customStyle={{ height: '100%', overFlow: 'scroll', borderRadius: 0 }}
      />
    </div>
  );
};

export default ExportResultModalRightSection;

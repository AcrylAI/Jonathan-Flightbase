import { useState } from 'react';

import { useSelector } from 'react-redux';

import { Modal } from '@jonathan/ui-react';

import EditMemoModalContents from './EditRoundMemoModalContents';

function EditRoundMemoModal({ data, type }) {
  const { theme } = useSelector(({ theme }) => theme);
  const { onSubmit, memo, version } = data;

  const [value, setValue] = useState(memo);
  const [inputedLen, setInputedLen] = useState(memo.length);

  const onChange = (e) => {
    const { value } = e.target;
    if (value.length <= 100) {
      setValue(value);
      setInputedLen(value.length);
    }
  };

  const styles = {
    windowStyle: {
      display: 'flex',
      flexDirection: 'column',
      width: '420px',
    },
    contentStyle: {
      padding: '0px',
      overflow: 'hidden',
    },
  };

  return (
    <Modal
      ContentRender={EditMemoModalContents}
      contentProps={{
        version,
        memo,
        value,
        inputedLen,
        type,
        onChange,
        onSubmit,
      }}
      windowStyle={styles.windowStyle}
      contentStyle={styles.contentStyle}
      theme={theme}
      topAnimation='140px'
    />
  );
}

export default EditRoundMemoModal;

import { useState } from 'react';

import { useSelector } from 'react-redux';

import { Modal } from '@jonathan/ui-react';

import EditClientNameModalContents from './EditClientNameModalContents';

function EditClientnameModal({ data, type }) {
  const { theme } = useSelector(({ theme }) => theme);
  const { onSubmit, name } = data;

  const [value, setValue] = useState(name);
  const [inputedLen, setInputedLen] = useState(name.length);

  const onChange = (e) => {
    const { value } = e.target;

    if (value.length <= 20) {
      setValue(value);
      setInputedLen(value.length);
    }
  };

  const onClear = () => {
    setValue('');
    setInputedLen(0);
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
      ContentRender={EditClientNameModalContents}
      contentProps={{
        value,
        inputedLen,
        type,
        name,
        onSubmit,
        onChange,
        onClear,
      }}
      theme={theme}
      windowStyle={styles.windowStyle}
      contentStyle={styles.contentStyle}
      topAnimation='140px'
    />
  );
}

export default EditClientnameModal;

import { useSelector } from 'react-redux';

import { Modal } from '@jonathan/ui-react';

import DeleteClientModalContent from './DeleteClientModalContent';

function DeleteClientModal({ data, type }) {
  const { theme } = useSelector(({ theme }) => theme);
  const { name, onCancel, onDelete } = data;

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
      ContentRender={DeleteClientModalContent}
      contentProps={{
        name,
        onCancel,
        onDelete,
        type,
      }}
      windowStyle={styles.windowStyle}
      contentStyle={styles.contentStyle}
      theme={theme}
      topAnimation='140px'
    />
  );
}

export default DeleteClientModal;

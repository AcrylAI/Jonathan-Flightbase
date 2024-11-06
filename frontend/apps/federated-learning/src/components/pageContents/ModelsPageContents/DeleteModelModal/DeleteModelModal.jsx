import { useSelector } from 'react-redux';

import { Modal } from '@jonathan/ui-react';

import DeleteModelModalContent from './DeleteModelModalContent';

function DeleteModelModal({ data }) {
  const { theme } = useSelector(({ theme }) => theme);
  const { version, onCancel, onDelete } = data;

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
      ContentRender={DeleteModelModalContent}
      contentProps={{
        version,
        onCancel,
        onDelete,
      }}
      windowStyle={styles.windowStyle}
      contentStyle={styles.contentStyle}
      theme={theme}
      topAnimation='140px'
    />
  );
}

export default DeleteModelModal;

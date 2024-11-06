import { useSelector } from 'react-redux';

import { Modal } from '@jonathan/ui-react';

import DeleteRoundModalContent from './DeleteRoundModalContent';

function DeleteRoundModal({ data, type }) {
  const { theme } = useSelector(({ theme }) => theme);
  const { onCancel, onDelete } = data;

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
      ContentRender={DeleteRoundModalContent}
      contentProps={{
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

export default DeleteRoundModal;

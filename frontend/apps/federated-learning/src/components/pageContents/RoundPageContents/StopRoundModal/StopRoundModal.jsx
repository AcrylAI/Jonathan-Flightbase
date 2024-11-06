import { useSelector } from 'react-redux';

import { Modal } from '@jonathan/ui-react';

import StopRoundModalContent from './StopRoundModalContent';

function StopRoundModal({ data, type }) {
  const { theme } = useSelector(({ theme }) => theme);
  const { onCancel, onStop } = data;

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
      ContentRender={StopRoundModalContent}
      contentProps={{
        onCancel,
        onStop,
        type,
      }}
      windowStyle={styles.windowStyle}
      contentStyle={styles.contentStyle}
      theme={theme}
      topAnimation='140px'
    />
  );
}

export default StopRoundModal;
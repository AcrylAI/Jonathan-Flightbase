import { useSelector } from 'react-redux';

import { Modal } from '@jonathan/ui-react';

import JoinRequestModalHeader from './JoinRequestModalHeader';
import JoinRequestModalContents from './JoinRequestModalContents';

function JoinRequestsModal({
  type,
  isLoading,
  joinRequestsData,
  onAccept,
  onDecline,
}) {
  const { theme } = useSelector(({ theme }) => theme);

  return (
    <Modal
      theme={theme}
      HeaderRender={JoinRequestModalHeader}
      ContentRender={JoinRequestModalContents}
      headerProps={{
        type,
      }}
      contentProps={{
        isLoading,
        joinRequestsData,
        onAccept,
        onDecline,
      }}
      headerStyle={{
        padding: '0px',
      }}
      contentStyle={{
        padding: '0px',
      }}
      topAnimation='50px'
    />
  );
}

export default JoinRequestsModal;

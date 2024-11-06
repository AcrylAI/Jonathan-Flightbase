import { useState } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Custom Hooks
import useWindowDimensions from '@src/hooks/useWindowDimensions';

// Components
import ModalFrame from '@src/components/Modal/ModalFrame';
import SystemLogModal from '@src/components/Modal/SystemLogModal';
import { toast } from '@src/components/Toast';

// Network
import { network } from '@src/network';

function SystemLogModalContainer({ data: modalData }) {
  const { width } = useWindowDimensions();
  const { deploymentWorkerId, systemLogData, systemLogLoading } = modalData;
  const { t } = useTranslation();

  const [downLoading, setDownLoading] = useState(false);
  const newSubmit = {
    text: 'confirm.label',
    func: () => {
      modalData.submit.func();
    },
  };
  const systemLogDown = async (wid) => {
    setDownLoading(true);
    const response = await network.callApiWithPromise({
      url: `deployments/worker/system_log_download/${wid}`,
      method: 'GET',
    });

    const { data, status } = response;

    if (status === 200 && data !== 'Not Found Pod') {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `[LOG]-Worker${wid}.txt`;
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else {
      toast.error(t('downloadError'));
    }
    setDownLoading(false);
  };

  return (
    <>
      <ModalFrame
        submit={newSubmit}
        type={'SYSTEM_LOG'}
        validate={true}
        isResize={true}
        isMinimize={true}
        title={`${t('worker.label')} ${deploymentWorkerId} ${t(
          'systemLog.label',
        )}`}
        customStyle={{
          width: width > 1920 ? '1800px' : width > 1200 ? '1200px' : '780px',
        }}
      >
        <SystemLogModal
          workerId={deploymentWorkerId}
          head={t('systemLog.label')}
          data={systemLogData}
          systemLogLoading={systemLogLoading}
          systemLogDown={systemLogDown}
          downLoading={downLoading}
          t={t}
        />
      </ModalFrame>
    </>
  );
}

export default SystemLogModalContainer;

import { useState, useEffect, useMemo } from 'react';
import { throttle } from 'lodash';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import DockerImageLogModal from '@src/components/Modal/DockerImageLogModal/DockerImageLogModal';
import { toast } from '@src/components/Toast';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// Utils
import { errorToastMessage } from '@src/utils';

function DockerImageLog({ type, data: modalData }) {
  const { t } = useTranslation();
  const { id } = modalData;
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState(null);
  const [isCall, setIsCall] = useState(true);

  const getInstallLog = useMemo(
    () =>
      throttle(async () => {
        setIsCall(false);
        const response = await callApi({
          url: `images/install-log?image_id=${id}`,
          method: 'get',
        });

        const { status, result, error, message } = response;
        if (status === STATUS_SUCCESS) {
          if (result) {
            setLog(result.log);
            setStatus(result.status);
            if (result.status < 2) {
              setIsCall(true);
            }
          } else {
            toast.info(t('image.log.empty.message'));
          }
        } else {
          errorToastMessage(error, message);
        }
      }, 1000),
    [id, t],
  );

  useEffect(() => {
    if (isCall) {
      getInstallLog();
    }
  }, [getInstallLog, isCall]);

  return (
    <DockerImageLogModal
      type={type}
      modalData={modalData}
      log={log}
      status={status}
    />
  );
}
export default DockerImageLog;

import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import SettingWidgetContainer from '../Container/SettingWidgetContainer';

import RunAutoLabelingModal from '@src/components/organisms/Modal/AutoLabelingModal/RunAutoLabelingModal';

import { LIME603, RED502 } from '@src/utils/color';
import { ADMIN_URL } from '@src/utils/pageUrls';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import useGetAutoLabelingRunCheck from './hooks/useGetAutoLabelingRunCheck';

import styles from './SettingWidgetRunAutoLabel.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type IconProps = {
  progress: boolean;
  color?: string;
};
const MagicWandIcon = ({ progress, color }: IconProps) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cx('icon', progress && 'progress')}
    >
      <path
        d='M23.2506 14.2506C23.2506 14.4495 23.1715 14.6403 23.0309 14.781C22.8902 14.9216 22.6995 15.0006 22.5006 15.0006H21.0006V16.5006C21.0006 16.6995 20.9215 16.8903 20.7809 17.031C20.6402 17.1716 20.4495 17.2506 20.2506 17.2506C20.0516 17.2506 19.8609 17.1716 19.7202 17.031C19.5796 16.8903 19.5006 16.6995 19.5006 16.5006V15.0006H18.0006C17.8016 15.0006 17.6109 14.9216 17.4702 14.781C17.3296 14.6403 17.2506 14.4495 17.2506 14.2506C17.2506 14.0517 17.3296 13.861 17.4702 13.7203C17.6109 13.5797 17.8016 13.5006 18.0006 13.5006H19.5006V12.0006C19.5006 11.8017 19.5796 11.611 19.7202 11.4703C19.8609 11.3297 20.0516 11.2506 20.2506 11.2506C20.4495 11.2506 20.6402 11.3297 20.7809 11.4703C20.9215 11.611 21.0006 11.8017 21.0006 12.0006V13.5006H22.5006C22.6995 13.5006 22.8902 13.5797 23.0309 13.7203C23.1715 13.861 23.2506 14.0517 23.2506 14.2506ZM6.00056 6.37564H7.12556V7.50064C7.12556 7.69955 7.20458 7.89031 7.34523 8.03097C7.48588 8.17162 7.67665 8.25064 7.87556 8.25064C8.07447 8.25064 8.26524 8.17162 8.40589 8.03097C8.54654 7.89031 8.62556 7.69955 8.62556 7.50064V6.37564H9.75056C9.94947 6.37564 10.1402 6.29662 10.2809 6.15597C10.4215 6.01531 10.5006 5.82455 10.5006 5.62564C10.5006 5.42672 10.4215 5.23596 10.2809 5.09531C10.1402 4.95465 9.94947 4.87564 9.75056 4.87564H8.62556V3.75064C8.62556 3.55172 8.54654 3.36096 8.40589 3.22031C8.26524 3.07965 8.07447 3.00064 7.87556 3.00064C7.67665 3.00064 7.48588 3.07965 7.34523 3.22031C7.20458 3.36096 7.12556 3.55172 7.12556 3.75064V4.87564H6.00056C5.80165 4.87564 5.61088 4.95465 5.47023 5.09531C5.32958 5.23596 5.25056 5.42672 5.25056 5.62564C5.25056 5.82455 5.32958 6.01531 5.47023 6.15597C5.61088 6.29662 5.80165 6.37564 6.00056 6.37564ZM17.2506 18.0006H16.5006V17.2506C16.5006 17.0517 16.4215 16.861 16.2809 16.7203C16.1402 16.5797 15.9495 16.5006 15.7506 16.5006C15.5516 16.5006 15.3609 16.5797 15.2202 16.7203C15.0796 16.861 15.0006 17.0517 15.0006 17.2506V18.0006H14.2506C14.0516 18.0006 13.8609 18.0797 13.7202 18.2203C13.5796 18.361 13.5006 18.5517 13.5006 18.7506C13.5006 18.9495 13.5796 19.1403 13.7202 19.281C13.8609 19.4216 14.0516 19.5006 14.2506 19.5006H15.0006V20.2506C15.0006 20.4495 15.0796 20.6403 15.2202 20.781C15.3609 20.9216 15.5516 21.0006 15.7506 21.0006C15.9495 21.0006 16.1402 20.9216 16.2809 20.781C16.4215 20.6403 16.5006 20.4495 16.5006 20.2506V19.5006H17.2506C17.4495 19.5006 17.6402 19.4216 17.7809 19.281C17.9215 19.1403 18.0006 18.9495 18.0006 18.7506C18.0006 18.5517 17.9215 18.361 17.7809 18.2203C17.6402 18.0797 17.4495 18.0006 17.2506 18.0006ZM17.0349 11.035L7.05993 21.0006C6.92133 21.1407 6.75633 21.2518 6.57449 21.3277C6.39266 21.4035 6.19759 21.4426 6.00056 21.4426C5.80353 21.4426 5.60846 21.4035 5.42662 21.3277C5.24479 21.2518 5.07979 21.1407 4.94118 21.0006L3.00056 19.06C2.86053 18.9214 2.74938 18.7564 2.67351 18.5746C2.59765 18.3927 2.55859 18.1977 2.55859 18.0006C2.55859 17.8036 2.59765 17.6085 2.67351 17.4267C2.74938 17.2449 2.86053 17.0799 3.00056 16.9413L16.9412 3.00064C17.2236 2.72238 17.6041 2.56641 18.0006 2.56641C18.397 2.56641 18.7775 2.72238 19.0599 3.00064L21.0006 4.94126C21.1406 5.07987 21.2517 5.24486 21.3276 5.4267C21.4035 5.60854 21.4425 5.80361 21.4425 6.00064C21.4425 6.19766 21.4035 6.39273 21.3276 6.57457C21.2517 6.75641 21.1406 6.9214 21.0006 7.06001L17.0349 11.035V11.035ZM14.5599 7.50064L16.5006 9.44126L19.9412 6.00064L18.0006 4.06001L14.5599 7.50064Z'
        style={color ? { fill: color } : {}}
        fill='#C8CCD4'
      />
    </svg>
  );
};
MagicWandIcon.defaultProps = {
  color: '',
};

const SettingWidgetRunAutoLabel = () => {
  const { t } = useT();
  // status 0: 실행 가능한 상태 1 : 진행중 2: 완료 3: 실패
  const [status, setStatus] = useState<number>(2);
  // 확인 여부
  const [checked, setChecked] = useState<boolean>(false);
  const modal = useModal();
  const nav = useNavigate();

  const params = useParams();
  const { data, isRefetching, refetch } = useGetAutoLabelingRunCheck({
    projectId: Number(params.pid),
  });
  const handleStatus = () => {
    if (data?.status && data?.result) {
      if (data.result.autolabeling) {
        setStatus(1);
      } else {
        setStatus(data.result.status);
      }
      setChecked(data.result.check === 1);
    }
  };
  const getColor = () => {
    let result = '';
    if (checked) {
      switch (status) {
        case 2:
          result = LIME603;
          break;
        case 3:
          result = RED502;
          break;
        default:
      }
    }
    return result;
  };
  const getLabel = () => {
    let result = `${t(`component.settingWidget.runAutoLabel`)}`;
    switch (status) {
      case 1:
        result = `${t(`page.autolabeling.autolabelingInProgress`)}`;
        break;
      case 2:
        result = `${t(`component.settingWidget.autolabelingDone`)}`;
        break;
      case 3:
        result = `${t(`component.settingWidget.autolabelingFailed`)}`;
        break;
      default:
    }
    // 확인시는 항상 가동 가능한 상태
    if (!checked && status !== 1) {
      result = `${t(`component.settingWidget.runAutoLabel`)}`;
    }
    return result;
  };

  const onClickWidget = () => {
    if (checked) {
      const url = ADMIN_URL.AUTOLABELING_RUN_PAGE.replaceAll(
        ':pid',
        params.pid ?? '',
      );
      nav(url);
    } else {
      modal.createModal({
        title: 'run auto labeling',
        content: (
          <RunAutoLabelingModal
            refetch={() => {
              refetch();
            }}
            projectId={Number(params.pid)}
          />
        ),
      });
    }
  };
  useEffect(() => {
    handleStatus();
  }, [data, isRefetching]);
  return (
    <SettingWidgetContainer
      isLoading={status === 1}
      label={getLabel()}
      onClick={onClickWidget}
      color={getColor()}
      icon={<MagicWandIcon progress={status === 1} color={getColor()} />}
    />
  );
};

export default SettingWidgetRunAutoLabel;

import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import SettingWidgetContainer from '../Container/SettingWidgetContainer';

import ClassEditModal from '@src/components/organisms/Modal/ClassEditModal/ClassEditModal';

import { useGetProjectClasses } from '@src/components/pageContents/ClassPageContents/hooks/useGetProjectClasses';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

const LIMITTOOL = import.meta.env.VITE_REACT_APP_MARKER_TOOL;

const ClassesIcon = () => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M22.5004 11.8944L12.7036 2.0975C12.5301 1.92255 12.3161 1.7933 12.0805 1.72131C11.8449 1.64933 11.5951 1.63685 11.3536 1.685L3.78793 3.20375C3.64447 3.2324 3.51271 3.30289 3.40926 3.40633C3.30582 3.50978 3.23533 3.64154 3.20668 3.785L1.68793 11.3506C1.63978 11.5922 1.65226 11.842 1.72424 12.0775C1.79623 12.3131 1.92547 12.5272 2.10043 12.7006L11.8973 22.4975C12.0359 22.6375 12.2009 22.7487 12.3827 22.8245C12.5646 22.9004 12.7597 22.9395 12.9567 22.9395C13.1537 22.9395 13.3488 22.9004 13.5306 22.8245C13.7124 22.7487 13.8774 22.6375 14.0161 22.4975L22.5004 14.0131C22.6405 13.8745 22.7516 13.7095 22.8275 13.5277C22.9033 13.3458 22.9424 13.1508 22.9424 12.9537C22.9424 12.7567 22.9033 12.5616 22.8275 12.3798C22.7516 12.198 22.6405 12.033 22.5004 11.8944V11.8944ZM7.87543 8.9975C7.65292 8.9975 7.43542 8.93152 7.25041 8.8079C7.06541 8.68428 6.92121 8.50858 6.83606 8.30302C6.75091 8.09745 6.72864 7.87125 6.77204 7.65302C6.81545 7.43479 6.9226 7.23434 7.07993 7.077C7.23727 6.91967 7.43772 6.81252 7.65595 6.76911C7.87418 6.72571 8.10038 6.74798 8.30595 6.83313C8.51151 6.91828 8.68721 7.06248 8.81083 7.24748C8.93445 7.43249 9.00043 7.64999 9.00043 7.8725C9.00043 8.17087 8.8819 8.45701 8.67092 8.66799C8.45994 8.87897 8.1738 8.9975 7.87543 8.9975Z'
        fill='#C8CCD4'
      />
    </svg>
  );
};

const SettingWidgetClasses = () => {
  const { t } = useT();
  const modal = useModal();
  const { pid } = useParams();
  const { data: classData, refetch } = useGetProjectClasses({
    projectId: Number(pid),
  });

  const projectDashboardAtom =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  const onClickWidget = () => {
    modal.createModal({
      title: 'create classes',
      fullscreen: true,
      content: (
        <ClassEditModal
          projectId={Number(pid)}
          classList={classData?.result?.class ?? []}
          refetch={() => {
            refetch();
          }}
        />
      ),
    });
  };
  return (
    <SettingWidgetContainer
      label={`${t(`component.settingWidget.classes`)}`}
      icon={<ClassesIcon />}
      onClick={onClickWidget}
      disabled={projectDashboardAtom.projectMetaData.type === 1}
    />
  );
};

export default SettingWidgetClasses;

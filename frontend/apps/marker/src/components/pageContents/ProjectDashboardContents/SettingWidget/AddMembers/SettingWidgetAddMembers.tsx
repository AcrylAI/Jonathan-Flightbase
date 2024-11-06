import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import SettingWidgetContainer from '../Container/SettingWidgetContainer';

import AddProjectMemberModal from '@src/components/organisms/Modal/AddProjectMemberModal/AddProjectMemberModal';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import { ArrowUpRightIcon } from '@src/static/images';

const UsersIcon = () => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M11.3624 14.8026C12.3686 14.1341 13.133 13.1595 13.5422 12.0229C13.9515 10.8863 13.984 9.64808 13.6349 8.49157C13.2857 7.33507 12.5736 6.32169 11.6037 5.6014C10.6339 4.88111 9.45794 4.49219 8.24989 4.49219C7.04184 4.49219 5.86588 4.88111 4.89604 5.6014C3.92621 6.32169 3.21403 7.33507 2.86491 8.49157C2.51578 9.64808 2.54826 10.8863 2.95753 12.0229C3.36681 13.1595 4.13113 14.1341 5.13739 14.8026C3.4208 15.4338 1.93871 16.5757 0.890513 18.0745C0.808638 18.1856 0.759905 18.3177 0.74995 18.4554C0.739996 18.5931 0.769227 18.7308 0.834263 18.8526C0.89853 18.9736 0.994331 19.0749 1.11151 19.1459C1.22869 19.2169 1.36289 19.2548 1.49989 19.2557H14.9999C15.1369 19.2548 15.2711 19.2169 15.3883 19.1459C15.5054 19.0749 15.6012 18.9736 15.6655 18.8526C15.7305 18.7308 15.7598 18.5931 15.7498 18.4554C15.7399 18.3177 15.6911 18.1856 15.6093 18.0745C14.5611 16.5757 13.079 15.4338 11.3624 14.8026V14.8026Z'
        fill='#C8CCD4'
      />
      <path
        d='M23.259 18.075C22.2049 16.5781 20.7205 15.437 19.0028 14.8032C20.0122 14.1372 20.7797 13.1633 21.1912 12.0261C21.6026 10.8889 21.6359 9.64931 21.2862 8.49167C20.9365 7.33403 20.2224 6.32021 19.2502 5.60102C18.278 4.88182 17.0996 4.49568 15.8903 4.50004C15.3742 4.50277 14.8605 4.5721 14.3622 4.70629C14.2451 4.74145 14.1381 4.80401 14.0501 4.8888C13.962 4.97358 13.8955 5.07813 13.8559 5.19379C13.8182 5.30849 13.8087 5.43061 13.8283 5.54976C13.8479 5.66891 13.8959 5.78157 13.9684 5.87816C14.8163 7.01739 15.3034 8.38452 15.3669 9.80323C15.4304 11.2219 15.0674 12.6271 14.3247 13.8375C14.2294 13.9984 14.1968 14.1887 14.2332 14.372C14.2695 14.5554 14.3722 14.7189 14.5215 14.8313C14.8028 15.05 15.0747 15.275 15.3372 15.5063L15.384 15.5532C16.3847 16.4792 17.1965 17.5903 17.7747 18.825C17.834 18.9541 17.9291 19.0633 18.0488 19.1398C18.1685 19.2162 18.3076 19.2567 18.4497 19.2563H22.6403C22.7773 19.2554 22.9115 19.2174 23.0287 19.1465C23.1458 19.0755 23.2416 18.9741 23.3059 18.8532C23.3702 18.7316 23.3998 18.5948 23.3915 18.4575C23.3832 18.3203 23.3374 18.188 23.259 18.075V18.075Z'
        fill='#C8CCD4'
      />
    </svg>
  );
};

const SettingWidgetAddMembers = () => {
  const { t } = useT();
  const modal = useModal();
  const params = useParams();
  const nav = useNavigate();
  const dashboardState =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  const onClickWidget = () => {
    if (dashboardState.pageData.member.total === 1) {
      modal.createModal({
        title: 'Add project members',
        fullscreen: true,
        content: (
          <AddProjectMemberModal
            projectId={Number(params.pid)}
            refetch={() => {}}
          />
        ),
      });
    } else {
      nav(`/admin/projects/${params.pid}/project-members`);
    }
  };
  return (
    <SettingWidgetContainer
      icon={<UsersIcon />}
      label={`${t(`component.settingWidget.projectMembers`)}`}
      onClick={onClickWidget}
      moveIcon={
        dashboardState.pageData.member.total > 1 ? ArrowUpRightIcon : ''
      }
    />
  );
};

export default SettingWidgetAddMembers;

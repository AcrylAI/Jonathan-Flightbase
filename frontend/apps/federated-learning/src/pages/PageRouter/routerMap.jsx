// Components
import {
  DashboardPage,
  RoundsPage,
  ModelsPage,
  ClientsPage,
  RoundDetailPage,
  ChartTestPage,
} from '..';

// Icons
import DashboardIcon from '@src/static/images/nav/fl-nav-dashboard.svg';
import RoundsIcon from '@src/static/images/nav/fl-nav-rounds.svg';
import ModelsIcon from '@src/static/images/nav/fl-nav-models.svg';
import ClientsIcon from '@src/static/images/nav/fl-nav-clients.svg';
import DashboardIconActive from '@src/static/images/nav/fl-nav-dashboard-active.svg';
import RoundsIconActive from '@src/static/images/nav/fl-nav-rounds-active.svg';
import ModelsIconActive from '@src/static/images/nav/fl-nav-models-active.svg';
import ClientsIconActive from '@src/static/images/nav/fl-nav-clients-active.svg';

export const routerMap = [
  {
    name: 'dashboard.label',
    path: '/dashboard',
    exact: true,
    icon: DashboardIcon,
    activeIcon: DashboardIconActive,
    render: (props) => <DashboardPage {...props} />,
  },
  {
    name: 'rounds.label',
    path: '/rounds',
    exact: true,
    icon: RoundsIcon,
    activeIcon: RoundsIconActive,
    render: (props) => <RoundsPage {...props} />,
  },
  {
    name: 'RoundDetail',
    path: '/rounds/:id/rounds',
    exact: true,
    disabled: true,
    render: (props) => <RoundDetailPage {...props} />,
  },
  {
    name: 'models.label',
    path: '/models',
    exact: true,
    icon: ModelsIcon,
    activeIcon: ModelsIconActive,
    render: (props) => <ModelsPage {...props} />,
  },
  {
    name: 'clients.label',
    path: '/clients',
    exact: true,
    icon: ClientsIcon,
    activeIcon: ClientsIconActive,
    render: (props) => <ClientsPage {...props} />,
  },
  {
    name: 'Chart Test',
    path: '/charts',
    exact: true,
    disabled: true,
    render: (props) => <ChartTestPage {...props} />,
  },
];

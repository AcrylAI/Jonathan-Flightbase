import { lazy } from 'react';

const _DashboardPage = import('./DashboardPage');
export const DashboardPage = lazy(() => _DashboardPage);

const _RoundsPage = import('./RoundsPage');
export const RoundsPage = lazy(() => _RoundsPage);

const _ModelsPage = import('./ModelsPage');
export const ModelsPage = lazy(() => _ModelsPage);

const _ClientsPage = import('./ClientsPage');
export const ClientsPage = lazy(() => _ClientsPage);

const _RoundDetailPage = import('./RoundDetailPage');
export const RoundDetailPage = lazy(() => _RoundDetailPage);

const _ChartTestPage = import('./ChartTestPage');
export const ChartTestPage = lazy(() => _ChartTestPage);

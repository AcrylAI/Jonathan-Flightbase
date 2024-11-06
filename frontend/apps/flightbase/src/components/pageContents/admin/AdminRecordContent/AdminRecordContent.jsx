import { Route, Redirect } from 'react-router-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import RecordsNav from './RecordsNav';
import SummaryTab from './SummaryTab';
import WorkspacesTab from './WorkspcaesTab';
import InstanceTab from './InstanceTab';
import PageTitle from '@src/components/atoms/PageTitle';

// CSS module
import style from './AdminRecordContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const navList = [
  { label: 'summary.label', path: '/admin/records/summary' },
  { label: 'workspaces.label', path: '/admin/records/workspaces' },
  { label: 'resources.label', path: '/admin/records/instance' },
];

function AdminRecordContent() {
  const { t } = useTranslation();

  return (
    <div id='AdminRecordContent'>
      <PageTitle>{t('records.label')}</PageTitle>
      <div className={cx('content')}>
        <RecordsNav navList={navList} />
        <Route exact path='/admin/records'>
          <Redirect to='/admin/records/summary' />
        </Route>
        <Route path='/admin/records/summary'>
          <SummaryTab />
        </Route>
        <Route path='/admin/records/workspaces'>
          <WorkspacesTab />
        </Route>
        <Route path='/admin/records/instance'>
          <InstanceTab />
        </Route>
      </div>
    </div>
  );
}

export default AdminRecordContent;

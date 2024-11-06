// i18n
import { useTranslation } from 'react-i18next';

// Components
import GPUServerTab from './GPUServerTab'; // GPU Server Tab
import CPUServerTab from './CPUServerTab'; // CPU Server Tab
import Tab from '@src/components/molecules/Tab';
import PageTitle from '@src/components/atoms/PageTitle';

// CSS module
import style from './AdminNodeContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

/**
 * 노드 관리자 페이지 컨텐츠 컴포넌트
 * @param {{
 *  tab: 'GPU_SERVER_TAB' | 'CPU_SERVER_TAB',
 *  tabOptions: [
 *    { label: string, value: 'GPU_SERVER_TAB' },
 *    { label: string, value: 'CPU_SERVER_TAB' },
 *  ],
 *  tabHandler: (selectedTab : 'GPU_SERVER_TAB' | 'CPU_SERVER_TAB') => {},
 *
 * }} param
 */
function AdminNodeContent({ tab, tabOptions, tabHandler }) {
  const { t } = useTranslation();
  const renderTabContent = (targetTab) => {
    if (targetTab === 'GPU_SERVER_TAB') {
      return <GPUServerTab />;
    }
    if (targetTab === 'CPU_SERVER_TAB') {
      return <CPUServerTab />;
    }

    return <div>Not Found</div>;
  };

  return (
    <div>
      <PageTitle>{t('nodes.label')}</PageTitle>
      <div className={cx('content')}>
        <Tab
          option={tabOptions}
          select={{ value: tab }}
          tabHandler={({ value: selectedTab }) => {
            tabHandler(selectedTab);
          }}
        />
        {renderTabContent(tab)}
      </div>
    </div>
  );
}

export default AdminNodeContent;

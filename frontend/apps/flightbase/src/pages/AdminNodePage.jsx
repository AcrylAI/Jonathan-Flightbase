import { useState } from 'react';

// Components
import AdminNodeContent from '@src/components/pageContents/admin/AdminNodeContent';

// Tab Type
const GPU_SERVER_TAB = 'GPU_SERVER_TAB';
const CPU_SERVER_TAB = 'CPU_SERVER_TAB';

const tabOptions = [
  { label: 'gpuServer.label', value: GPU_SERVER_TAB },
  { label: 'cpuServer.label', value: CPU_SERVER_TAB },
];

/**
 * 노드 관리자 페이지
 *
 * @component
 * @example
 *
 * return (
 *  <AdminNodeContent />
 * );
 */
function AdminNodePage() {
  // Component State
  const [tab, setTab] = useState(GPU_SERVER_TAB);

  // Events
  /**
   * 탭 선택 함수
   * @param {'GPU_SERVER_TAB' | 'CPU_SERVER_TAB'} selectedTab 선택된 탭
   */
  const tabHandler = (selectedTab) => {
    setTab(selectedTab);
  };

  return (
    <AdminNodeContent
      tab={tab}
      tabOptions={tabOptions}
      tabHandler={tabHandler}
    />
  );
}

export default AdminNodePage;

import { useState } from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Actions
import { openModal } from '@src/store/modules/modal';

// Components
import UserCheckpointContent from '@src/components/pageContents/user/UserCheckpointContent';

// Tab Type
const REGISTERED_CKP_LIST = 'REGISTERED_CKP_LIST';
const ALL_CKP_LIST = 'ALL_CKP_LIST';

const tabOptions = [
  {
    label: 'checkpointStorage.label',
    value: REGISTERED_CKP_LIST,
  },
  { label: 'allCheckpoints.label', value: ALL_CKP_LIST },
];

/**
 * 유저 체크포인트 페이지
 * @returns {JSX.Element}
 */
function UserCheckpointPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Component State
  const [tab, setTab] = useState(ALL_CKP_LIST);

  // Events
  /**
   * 탭 선택 함수
   * @param {'REGISTERED_CKP_LIST' | 'ALL_CKP_LIST'} selectedTab 선택된 탭
   */
  const tabHandler = (selectedTab) => {
    setTab(selectedTab);
  };

  const openDNAModelModal = () => {
    dispatch(
      openModal({
        modalType: 'UPLOAD_DNA_MODEL',
        modalData: {
          submit: {
            text: t('upload.label'),
            func: () => {},
          },
          cancel: {
            text: t('cancel.label'),
          },
        },
      }),
    );
  };

  return (
    <UserCheckpointContent
      tab={tab}
      tabOptions={tabOptions}
      tabHandler={tabHandler}
      openDNAModelModal={openDNAModelModal}
    />
  );
}

export default UserCheckpointPage;

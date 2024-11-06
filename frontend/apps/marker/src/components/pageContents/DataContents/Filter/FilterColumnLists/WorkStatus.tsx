import { Selectbox, StatusCard } from '@jonathan/ui-react';

import useT from '@src/hooks/Locale/useT';

import styles from '../Filter.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  workingStatusData?: Array<number>;
  setWorkingStatusData: React.Dispatch<
    React.SetStateAction<Array<number> | undefined>
  >;
  setWorkingStatusText: React.Dispatch<React.SetStateAction<string>>;
};

type CheckListType = {
  id: number;
  label: React.ReactElement;
  name: string;
  value: number;
};

const WorkStatus = (props: Props) => {
  const { workingStatusData, setWorkingStatusData, setWorkingStatusText } =
    props;
  const { t } = useT();

  const workingStatusList = [
    {
      label: (
        <StatusCard
          text={t(`page.projectList.notAssigned`)}
          status='disconnected'
          size='small'
          customStyle={{ borderRadius: '2px' }}
        />
      ),
      name: t(`page.projectList.notAssigned`),
      value: 0,
    },
    {
      label: (
        <StatusCard
          text={t(`page.projectList.completed`)}
          status='active'
          size='small'
          customStyle={{
            borderRadius: '2px',
          }}
        />
      ),
      name: t(`page.projectList.completed`),
      value: 1,
    },
    {
      label: (
        <StatusCard
          text={t(`component.badge.labelingInProgress`)}
          status='broadcasting'
          size='small'
          customStyle={{
            borderRadius: '2px',
            backgroundColor: '#DEE9FF',
            color: '#2D76F8',
          }}
        />
      ),
      name: t(`component.badge.labelingInProgress`),
      value: 2,
    },
    {
      label: (
        <StatusCard
          text={t(`component.badge.reviewInProgress`)}
          status='pending'
          size='small'
          customStyle={{
            borderRadius: '2px',
          }}
        />
      ),
      name: t(`component.badge.reviewInProgress`),
      value: 3,
    },
    {
      label: (
        <StatusCard
          text={t(`component.badge.rejected`)}
          status='failed'
          size='small'
          customStyle={{
            borderRadius: '2px',
          }}
        />
      ),
      name: t(`component.badge.rejected`),
      value: 4,
    },
  ];

  const onChangeCheckboxHandler = (checkedList: CheckListType[]) => {
    setWorkingStatusData(checkedList.map((data: CheckListType) => data.value));
    setWorkingStatusText(
      `${checkedList[0]?.name} ${
        checkedList.length > 1
          ? `${t('page.data.more')} ${checkedList.length - 1}`
          : ``
      }`,
    );
  };

  return (
    <>
      <div className={cx('font')}>
        <p className={cx('filter-label')}>
          {t(`component.selectBox.targetColumn`)}
        </p>
        <Selectbox
          theme='jp'
          type='checkbox'
          list={workingStatusList}
          placeholder={t(`component.selectBox.selectContents`)}
          onChangeCheckbox={(e) => onChangeCheckboxHandler(e)}
          customStyle={{
            fontStyle: {
              selectbox: {
                fontSize: '13px',
              },
              list: {
                fontSize: '13px',
              },
            },
          }}
          checkedList={workingStatusData}
          checkboxMultiLang={t(`page.data.more`)}
        />
      </div>
    </>
  );
};
WorkStatus.defaultProps = { workingStatusData: undefined };
export default WorkStatus;

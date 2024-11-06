import { Mypo, Sypo } from '@src/components/atoms';

import useCasingNer from '@src/hooks/Common/useCasingNer';
import useT from '@src/hooks/Locale/useT';

import SettingWidgetAddMembers from './AddMembers/SettingWidgetAddMembers';
import SettingWidgetAssignData from './AssignData/SettingWidgetAssignData';
import SettingWidgetClasses from './CreateClasses/SettingWidgetClasses';
import SettingWidgetDataSet from './Dataset/SettingWidgetDataSet';
import SettingWidgetRunAutoLabel from './RunAutoLabel/SettingWidgetRunAutoLabel';
import SettingWidgetAutoLabeling from './SetAutoLabel/SettingWidgetAutoLabeling';

import styles from './SettingWidget.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type HeaderProps = {
  title: string;
  desc: string;
};

const Header = ({ title, desc }: HeaderProps) => {
  return (
    <div className={cx('header-container')}>
      <div className={cx('top-wrapper')}>
        <div className={cx('title')}>
          <Sypo type='P1' weight='R'>
            {title}
          </Sypo>
        </div>
      </div>
      <div className={cx('desc')}>
        <Mypo type='P2' weight='R'>
          {desc}
        </Mypo>
      </div>
    </div>
  );
};

const SettingWidget = () => {
  const { t } = useT();
  const { type } = useCasingNer();

  return (
    <div className={cx('widget-container')}>
      <Header
        title={`${t(`component.settingWidget.controller`)}`}
        desc={`${t(`component.settingWidget.controllerDesc`)}`}
      />

      <div className={cx('grid-container')}>
        <SettingWidgetDataSet />
        <SettingWidgetClasses />
        <SettingWidgetAddMembers />
        <SettingWidgetAssignData />
      </div>
      {type !== 1 && (
        <>
          <div className={cx('line')}></div>
          <Header
            title={`${t(`component.settingWidget.autolabeling`)}`}
            desc={`${t(`component.settingWidget.autolabelDesc`)}`}
          />
          <div className={cx('grid-container')}>
            <SettingWidgetAutoLabeling />
            <SettingWidgetRunAutoLabel />
          </div>
        </>
      )}
    </div>
  );
};

export default SettingWidget;

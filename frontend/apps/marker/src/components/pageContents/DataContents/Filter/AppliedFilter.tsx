import { Selectbox } from '@jonathan/ui-react';

import { Case, Switch } from '@jonathan/react-utils';

import { Sypo } from '@src/components/atoms';

import { BLUE106, MONO206 } from '@src/utils/color';
import { FilterDataType } from '@src/utils/types/data';

import useT from '@src/hooks/Locale/useT';

import { DarkClose } from '@src/static/images/index';

import styles from './AppliedFilter.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
type Props = {
  filteredData: Array<FilterDataType>;
  filterCondition: number;
  setFilterCondition: React.Dispatch<React.SetStateAction<number>>;
  onDeleteFilter: (data: FilterDataType) => void;
};
const AppliedFilter = (props: Props) => {
  const { t } = useT();
  const { filteredData, filterCondition, setFilterCondition, onDeleteFilter } =
    props;
  const filterList = [
    { label: t(`component.selecBox.and`), value: 0 },
    { label: t(`component.selectBox.or`), value: 1 },
  ];

  const fileNameCondition = (condition: number) => {
    switch (condition) {
      case 0:
        return t(`component.selectBox.contain`);
      case 1:
        return t(`component.selectBox.notContain`);
      case 2:
        return t(`component.selectBox.is`);
      case 3:
        return t(`component.selectBox.isNot`);
      case 4:
        return t(`component.selectBox.startsWith`);
      case 5:
        return t(`component.selectBox.endsWith`);
      default:
        return '';
    }
  };

  const filterStatus = (data: FilterDataType) => {
    if (data.column === 'sync') {
      if (data.condition === 0) return t(`component.selectBox.normal`);
      return t(`component.selectBox.error`);
    }
    if (data.column === 'autoLabeling') {
      if (data.condition === 0) return 'Empty';
      return t(`page.dashboardProject.completedAutolabeling`);
    }
    return data.condition;
  };

  return (
    <div className={cx('filterSection')}>
      <p className={cx('filter-title')}>{t(`page.data.appliedFilter`)}</p>
      {filteredData.map((data: FilterDataType, index: number) => {
        if (data.column === 'filename') {
          return (
            <div className={cx('filter-container')} key={data.column}>
              <div className={cx('filter-badge')}>
                <Sypo color={MONO206} type='p2'>
                  {t(`page.data.filename`)}
                </Sypo>
                <div className={cx('filter-condition')}>
                  {fileNameCondition(data.condition as number)}
                </div>
                <Sypo color={BLUE106} type='p2'>
                  {data.value}
                </Sypo>
                <img
                  className={cx('close-icon')}
                  src={DarkClose}
                  alt=''
                  onClick={() => onDeleteFilter(data)}
                />
              </div>
              {filteredData.length > 1 && index === 0 && (
                <div className={cx('selectbox-area')}>
                  <Selectbox
                    theme='jp'
                    list={filterList}
                    onChange={(e) =>
                      setFilterCondition(() => e.value as number)
                    }
                    selectedItemIdx={filterCondition}
                  />
                </div>
              )}
              {index !== 0 && index !== filteredData.length - 1 && (
                <div style={{ width: 'auto', margin: '10px 10px' }}>
                  <Sypo type='p1'>
                    {filterCondition
                      ? t(`component.selectBox.or`)
                      : t(`component.selecBox.and`)}
                  </Sypo>
                </div>
              )}
            </div>
          );
        }
        return (
          <div className={cx('filter-container')}>
            <div className={cx('filter-badge')}>
              <div className={cx('filter-column')}>
                <Switch>
                  <Case condition={data.column === 'labeler'}>
                    {t(`component.badge.labeler`)}
                  </Case>
                  <Case condition={data.column === 'reviewer'}>
                    {t(`component.selectBox.reviewer`)}
                  </Case>
                  <Case condition={data.column === 'autoLabeling'}>
                    {t(`component.selectBox.autolabeled`)}
                  </Case>
                  <Case condition={data.column === 'workingStatus'}>
                    {t(`component.selectBox.workStatus`)}
                  </Case>
                </Switch>
              </div>
              <div className={cx('filter-condition')}>
                {t(`component.selectBox.is`)}
              </div>
              <div className={cx('filter-value')}>
                {data.label ? data.label : filterStatus(data)}
              </div>
              <img
                className={cx('close-icon')}
                src={DarkClose}
                alt=''
                onClick={() => onDeleteFilter(data)}
              />
            </div>
            {filteredData.length > 1 && index === 0 && (
              <div className={cx('selectbox-area')}>
                <Selectbox
                  theme='jp'
                  list={filterList}
                  onChange={(e) => setFilterCondition(() => e.value as number)}
                  selectedItemIdx={filterCondition}
                />
              </div>
            )}
            {index !== 0 && index !== filteredData.length - 1 && (
              <div
                style={{
                  width: 'auto',
                  margin: '10px 10px',
                  cursor: 'pointer',
                }}
              >
                <Sypo type='p1'>
                  {filterCondition
                    ? t(`component.selectBox.or`)
                    : t(`component.selecBox.and`)}
                </Sypo>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default AppliedFilter;

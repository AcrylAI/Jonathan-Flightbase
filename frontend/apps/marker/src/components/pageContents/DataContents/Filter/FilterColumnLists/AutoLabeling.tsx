import { Selectbox } from '@jonathan/ui-react';

import useT from '@src/hooks/Locale/useT';

import { autoLabeling, AutoLabelingEmpty } from '@src/static/images';

import styles from '../Filter.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  setAutoLabelingData: React.Dispatch<React.SetStateAction<number | undefined>>;
  autoLabelingData?: number;
};
const AutoLabeling = (props: Props) => {
  const { t } = useT();
  const { setAutoLabelingData, autoLabelingData } = props;
  const autoLabelList = [
    {
      label: '',
      value: 0,
      iconAlign: 'left',
      icon: AutoLabelingEmpty,
      iconStyle: {
        width: '10px',
        height: '10px',
      },
    },
    {
      label: t(`page.dashboardProject.completedAutolabeling`),
      value: 1,
      iconAlign: 'left',
      icon: autoLabeling,
      iconStyle: {
        width: '10px',
        height: '10px',
      },
    },
  ];

  return (
    <>
      <div className={cx('font')}>
        <p className={cx('filter-label')}>
          {t(`component.selectBox.targetColumn`)}
        </p>
        <Selectbox
          theme='jp'
          list={autoLabelList}
          onChange={(e) => setAutoLabelingData(e.value as number)}
          placeholder={t(`component.selectBox.selectContents`)}
          selectedItemIdx={autoLabelingData}
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
        />
      </div>
    </>
  );
};

AutoLabeling.defaultProps = { autoLabelingData: undefined };
export default AutoLabeling;

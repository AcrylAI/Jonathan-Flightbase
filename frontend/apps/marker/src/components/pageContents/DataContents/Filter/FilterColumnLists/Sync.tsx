import { Selectbox } from '@jonathan/ui-react';

import useT from '@src/hooks/Locale/useT';

import { syncStatusFalse, syncStatusTrue } from '@src/static/images';

import styles from '../Filter.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  setSyncData: React.Dispatch<React.SetStateAction<number | undefined>>;
  syncData?: number;
};
const Sync = (props: Props) => {
  const { t } = useT();
  const { setSyncData, syncData } = props;

  const syncList = [
    {
      label: t(`component.selectBox.normal`),
      value: 0,
      iconAlign: 'left',
      icon: syncStatusTrue,
      iconStyle: {
        width: '10px',
        height: '10px',
      },
    },
    {
      label: t(`component.selectBox.error`),
      value: 1,
      iconAlign: 'left',
      icon: syncStatusFalse,
      iconStyle: {
        width: '10px',
        height: '10px',
      },
    },
  ];
  return (
    <>
      <div className={cx('font')}>
        <p className={cx('filter-label')}>내용</p>
        <Selectbox
          theme='jp-primary'
          list={syncList}
          onChange={(e) => setSyncData(() => e.value as number)}
          placeholder={t(`component.selectBox.selectContents`)}
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
          selectedItemIdx={syncData}
        />
      </div>
    </>
  );
};

Sync.defaultProps = {
  syncData: undefined,
};
export default Sync;

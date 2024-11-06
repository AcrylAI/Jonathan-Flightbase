import { ReactNode } from 'react';

import { Sypo } from '@src/components/atoms';

import styles from './LabelSide.module.scss';
import classNames from 'classnames/bind';

import { ScrollView } from '@tools/components/view';
import useT from "@src/hooks/Locale/useT";

const cx = classNames.bind(styles);

type Props = {
  children: ReactNode;
};

function LabelSide({ children }: Props) {
  const { t } = useT();

  return (
    <div className={cx('labelside-container')}>
      <div className={cx('labelside-header')}>
        <Sypo userSelect={false} type='p1'>
          {t(`page.annotation.labels`)}
        </Sypo>
      </div>

      <ScrollView style={{ padding: '0 12px 12px 12px' }}>
        {children}
      </ScrollView>
    </div>
  );
}

export default LabelSide;

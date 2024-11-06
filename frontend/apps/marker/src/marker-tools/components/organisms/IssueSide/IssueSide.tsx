import { ReactNode } from 'react';

import { Sypo } from '@src/components/atoms';

import styles from './IssueSide.module.scss';
import classNames from 'classnames/bind';

import { ScrollView } from '@tools/components/view';
import useT from "@src/hooks/Locale/useT";

const cx = classNames.bind(styles);

type Props = {
  children: ReactNode;
};

function IssueSide({ children }: Props) {
  const { t } = useT();

  return (
    <div className={cx('issueside-container')}>
      <div className={cx('issueside-header')}>
        <Sypo userSelect={false} type='p1'>
          {t(`component.comment.comment`)}
        </Sypo>
      </div>

      <ScrollView style={{ padding: '0 12px 12px 12px' }}>
        {children}
      </ScrollView>
    </div>
  );
}

export default IssueSide;

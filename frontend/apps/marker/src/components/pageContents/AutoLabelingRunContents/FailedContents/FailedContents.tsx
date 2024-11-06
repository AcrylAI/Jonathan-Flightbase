import { Sypo } from '@src/components/atoms';

import { RED502 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import { FailedIcon } from '@src/static/images';

import style from './FailedContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function FailedContents() {
  const { t } = useT();

  return (
    <div className={cx('container')}>
      <img src={FailedIcon} alt='warn-icon' />
      <Sypo type='P1' weight={500} color={RED502} ellipsis={false}>
        {t('page.runAutolabeling.failed')}
      </Sypo>
    </div>
  );
}

export default FailedContents;

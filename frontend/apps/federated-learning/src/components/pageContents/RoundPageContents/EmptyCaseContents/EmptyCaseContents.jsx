// i18n
import { useTranslation } from 'react-i18next';

// Image
import { Button } from '@jonathan/ui-react';
import emptyFlowImage from '@images/icon/ic-empty-flow.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './EmptyCaseContents.module.scss';
import Table from '@src/components/uiContents/Table';

const cx = classNames.bind(style);

function EmptyCaseContents({ tableColum, onOpenRoundModal }) {
  const { t } = useTranslation();
  return (
    <>
      <div className={cx('no-round-box')}>
        <img className={cx('image')} src={emptyFlowImage} alt='empty flow' />
        <p className={cx('message')}>{t('round.empty.message')}</p>
        <Button
          type='primary'
          theme='jp-dark'
          size='small'
          onClick={() => onOpenRoundModal()}
        >
          {t('round.newRound.label')}
        </Button>
      </div>
      <Table
        columns={tableColum}
        data={[]}
        emptyMessage={t('round.table.empty.message')}
      />
    </>
  );
}
export default EmptyCaseContents;

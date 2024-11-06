import { Sypo } from '@src/components/atoms';

// i18n
import useT from '@src/hooks/Locale/useT';

import styles from './MembersListBox.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  onAllClick: () => void;
  onLabelingClick: () => void;
  onReviewClick: () => void;
  selectMenu: string;
  noReviewProject: boolean;
};

const SelectMenuButton = ({
  onAllClick,
  onLabelingClick,
  onReviewClick,
  selectMenu,
  noReviewProject,
}: Props) => {
  const { t } = useT();

  return (
    <div className={cx('container-top-bar')}>
      <div
        className={cx(
          'top-bar-button',
          'all-button',
          selectMenu === 'All' && 'select-all',
        )}
        onClick={onAllClick}
      >
        <Sypo type='P1'>{t(`component.toggleBtn.all`)}</Sypo>
      </div>
      <div
        className={cx(
          'left-border',
          selectMenu === 'All' && 'select-all',
          selectMenu === 'Labeling' && 'select-labeling',
          selectMenu === 'Review' && 'select-review',
        )}
      ></div>
      <div
        className={cx(
          'top-bar-button',
          'labeling-button',
          selectMenu === 'All' && 'select-all',
          selectMenu === 'Labeling' && 'select-labeling',
          selectMenu === 'Review' && 'select-review',
          noReviewProject && 'no-review-project',
        )}
        onClick={onLabelingClick}
      >
        <Sypo type='P1'>{t(`component.toggleBtn.labeling`)}</Sypo>
      </div>
      {!noReviewProject && (
        <>
          <div
            className={cx(
              'right-border',
              selectMenu === 'All' && 'select-all',
              selectMenu === 'Labeling' && 'select-labeling',
              selectMenu === 'Review' && 'select-review',
            )}
          ></div>
          <div
            className={cx(
              'top-bar-button',
              'review-button',
              selectMenu === 'Review' && 'select-review',
            )}
            onClick={onReviewClick}
          >
            <Sypo type='P1'>{t(`component.toggleBtn.review`)}</Sypo>
          </div>
        </>
      )}
    </div>
  );
};

export default SelectMenuButton;

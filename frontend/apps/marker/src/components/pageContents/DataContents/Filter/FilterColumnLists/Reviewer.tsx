import { Selectbox } from '@jonathan/ui-react';

import { ReviewerListType } from '@src/utils/types/data';

import useT from '@src/hooks/Locale/useT';

import styles from '../Filter.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  reviewerData: Array<ReviewerListType>;
  selectedReviewer: Array<number>;
  setSelectedReviewer: React.Dispatch<React.SetStateAction<Array<number>>>;
  setSelectedReviewerText: React.Dispatch<React.SetStateAction<string>>;
};

const Reviewer = (props: Props) => {
  const { t } = useT();

  const {
    reviewerData,
    selectedReviewer,
    setSelectedReviewer,
    setSelectedReviewerText,
  } = props;
  const reviewerList = reviewerData.map(
    (data: ReviewerListType, index: number) => {
      return { label: data.name, value: index };
    },
  );

  const onChangeCheckboxHandler = (checkedList: any) => {
    setSelectedReviewer(checkedList.map((data: any) => data.value));
    if (checkedList.length > 0)
      setSelectedReviewerText(
        `${checkedList[0].label} ${
          checkedList.length > 1 ? `외 ${checkedList.length - 1}` : ``
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
          list={reviewerList}
          onChangeCheckbox={(e) => onChangeCheckboxHandler(e)}
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
          checkedList={selectedReviewer}
        />
      </div>
    </>
  );
};
export default Reviewer;

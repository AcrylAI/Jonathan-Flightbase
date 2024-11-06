import { Selectbox } from '@jonathan/ui-react';

import { LabelerListType } from '@src/utils/types/data';

import useT from '@src/hooks/Locale/useT';

import styles from '../Filter.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  labelerData: LabelerListType[];
  selectedLabeler?: Array<number>;
  setSelectedLabeler: React.Dispatch<
    React.SetStateAction<Array<number> | undefined>
  >;
  setSelectedLabelerText: React.Dispatch<React.SetStateAction<string>>;
};

const Labeler = (props: Props) => {
  const { t } = useT();
  const {
    labelerData,
    selectedLabeler,
    setSelectedLabeler,
    setSelectedLabelerText,
  } = props;

  const labelerList = labelerData.map(
    (data: LabelerListType, index: number) => {
      return { label: data.name, value: index };
    },
  );

  const onChangeCheckboxHandler = (checkedList: any) => {
    setSelectedLabeler(() => checkedList.map((data: any) => data.value));
    if (checkedList.length > 0)
      setSelectedLabelerText(
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
          list={labelerList}
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
          checkedList={selectedLabeler}
        />
      </div>
    </>
  );
};

Labeler.defaultProps = {
  selectedLabeler: undefined,
};
export default Labeler;

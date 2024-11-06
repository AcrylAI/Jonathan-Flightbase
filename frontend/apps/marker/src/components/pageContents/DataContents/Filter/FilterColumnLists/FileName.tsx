import { InputText, Selectbox } from '@jonathan/ui-react';
import { ListType } from '@jonathan/ui-react/src/components/molecules/Selectbox/types';

import useT from '@src/hooks/Locale/useT';

import styles from '../Filter.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  setFileNameConditionValue: React.Dispatch<React.SetStateAction<number>>;
  setFileNameInputValue: React.Dispatch<React.SetStateAction<string>>;
  fileNameConditionValue: number;
};
const FileName = (props: Props) => {
  const { t } = useT();
  const {
    setFileNameConditionValue,
    setFileNameInputValue,
    fileNameConditionValue,
  } = props;

  const fileNameList = [
    {
      label: t(`component.selectBox.contain`),
      value: 0,
    },
    {
      label: t(`component.selectBox.notContain`),
      value: 1,
    },
    {
      label: t(`component.selectBox.is`),
      value: 2,
    },
    {
      label: t(`component.selectBox.isNot`),
      value: 3,
    },
    {
      label: t(`component.selectBox.startsWith`),
      value: 4,
    },
    {
      label: t(`component.selectBox.endsWith`),
      value: 5,
    },
  ];

  const changeSelectbox = (item: ListType) => {
    setFileNameConditionValue(item.value as number);
  };

  const changeInputText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileNameInputValue(e.target.value);
  };

  return (
    <>
      <div className={cx('font')}>
        <p className={cx('filter-label')}>
          {t(`component.selectBox.operator`)}
        </p>
        <Selectbox
          theme='jp'
          onChange={(item) => changeSelectbox(item)}
          list={fileNameList}
          selectedItem={fileNameList[fileNameConditionValue]}
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
      <div>
        <p className={cx('filter-label')}>{t(`component.selectBox.value`)}</p>
        <InputText onChange={(e) => changeInputText(e)} />
      </div>
    </>
  );
};
export default FileName;

// i18n
import { useTranslation } from 'react-i18next';

// Style
import styles from './BasicSubTitle.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type BasicSubTitleProps = {
  text: string[];
};

const BasicSubTitle = ({ text }: BasicSubTitleProps) => {
  const { t } = useTranslation();
  return (
    <>
      {text.map((item, idx) => (
        <p key={idx} className={cx('basic-sub-title')}>
          {t(item)}
        </p>
      ))}
    </>
  );
};

export default BasicSubTitle;

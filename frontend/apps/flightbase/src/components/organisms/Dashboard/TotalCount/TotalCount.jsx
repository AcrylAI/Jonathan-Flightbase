// i18n
import { useTranslation } from 'react-i18next';

// CSS module
import style from './TotalCount.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function lowercase(string) {
  return string.toLowerCase().replace(/ /gi, '_'); // 소문자로 변경 + 공백을 언더바로 변경
}

const TotalCount = ({
  name,
  label,
  total,
  variation,
  directLink,
  customStyle,
}) => {
  const { t } = useTranslation();
  const icon = lowercase(name);
  const upAndDown = variation > 0 ? 'up' : variation < 0 ? 'down' : 'zero';
  const variationCount = Math.abs(variation);
  return (
    <div
      className={cx('content')}
      onClick={() => directLink(icon)}
      style={customStyle}
    >
      <div className={cx('title')}>
        <img
          className={cx('icon')}
          src={`/images/icon/icon-${icon}-gray.svg`}
          alt={icon}
        />
        <div className={cx('name')}>{t(label)}</div>
        <img
          className={cx('arrow')}
          src='/images/icon/ic-arrow-right-blue.svg'
          alt='->'
        />
      </div>
      <div className={cx('count')}>
        <span className={cx('total')}>{total}</span>
        <span className={cx('variation', upAndDown)}>{variationCount}</span>
      </div>
    </div>
  );
};

export default TotalCount;

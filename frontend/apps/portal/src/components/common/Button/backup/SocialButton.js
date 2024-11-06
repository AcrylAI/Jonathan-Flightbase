// Style
import styles from './SocialButton.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

function SocialButton({ type, text, onClick = () => {}, disabled = false }) {
  let icon = '';
  switch (type) {
    case 'kakao':
      icon = 'kakao';
      break;
    case 'google':
      icon = 'google';
      break;
    case 'naver':
      icon = 'naver';
      break;
    case 'facebook':
      icon = 'facebook';
      break;
    default:
      break;
  }

  return (
    <>
      <button
        className={cx('social-btn', `${icon}`)}
        onClick={onClick}
        disabled={disabled}
      >
        {text}
      </button>
    </>
  );
}

export default SocialButton;

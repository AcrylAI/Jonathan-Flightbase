// Style
import styles from './SocialButton.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

function SocialButton({ text, onClick = () => {}, disabled = false }) {
  return (
    <>
      <button
        className={cx('social-btn', `facebook`)}
        onClick={onClick}
        disabled={disabled}
      >
        {text}
      </button>
    </>
  );
}

export default SocialButton;

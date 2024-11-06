import NaverLogin from 'react-naver-login';

// Style
import styles from './SocialButton.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

function NaverLoginBtn({ text, disabled = false, onSuccess = () => {} }) {
  return (
    <NaverLogin
      clientId={`${process.env.SOCIAL_LOGIN_NAVER_CLIENT_ID}`}
      callbackUrl='http://127.0.0.1:8080/test'
      onSuccess={onSuccess}
      render={(props) => (
        <button
          className={cx('social-btn', 'naver')}
          onClick={props.onClick}
          disabled={disabled}
        >
          {text}
        </button>
      )}
    />
  );
}

export default NaverLoginBtn;

import GoogleLogin from 'react-google-login';

// Style
import styles from './SocialButton.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

function GoogleLoginBtn({
  text,
  disabled = false,
  onSuccess = () => {},
  onFailure = () => {},
}) {
  return (
    <GoogleLogin
      clientId={`${process.env.SOCIAL_LOGIN_GOOGLE_CLIENT_ID}`}
      onSuccess={onSuccess}
      onFailure={onFailure}
      render={(props) => (
        <button
          className={cx('social-btn', 'google')}
          onClick={props.onClick}
          disabled={disabled}
        >
          {text}
        </button>
      )}
      cookiePolicy={`${process.env.SOCIAL_LOGIN_GOOGLE_COOKIE_POLICY}`}
    />
  );
}

export default GoogleLoginBtn;

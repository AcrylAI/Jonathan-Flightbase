import KakaoLogin from 'react-kakao-login';

// Style
import styles from './SocialButton.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

function KaKaoLoginBtn({
  text,
  disabled = false,
  onFailure = () => {},
  onSuccess = () => {},
}) {
  return (
    <KakaoLogin
      jsKey={`${process.env.SOCIAL_LOGIN_KAKAO_CLIENT_ID}`}
      onSuccess={onSuccess}
      onFailure={onFailure}
      getProfile
      render={(props) => (
        <button
          className={cx('social-btn', 'kakao')}
          onClick={(e) => {
            e.preventDefault();
            props.onClick();
          }}
          disabled={disabled}
        >
          {text}
        </button>
      )}
    ></KakaoLogin>
  );
}

export default KaKaoLoginBtn;

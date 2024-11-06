/* eslint-disable no-param-reassign */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';

// i18n
import { useTranslation } from 'react-i18next';
import i18n from '@src/common/lang/i18n';

// Components
import BasicCheckbox from '@components/common/Checkbox/BasicCheckbox';
import BasicRadioBox from '@src/components/common/radioBox/BasicRadioBox';
import BaseInput from '@components/common/Input/BaseInput';
import SuccessButton from '@components/common/Button/SuccessButton';
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import { loadingStateAtom } from '@src/atom/ui/Loading';

// CustomHooks
import { useFormInput } from '@src/common/CustomHooks';
import { useFormInputValidationArgs } from '@src/common/CustomHooks/useFormInput';
import useCheckEmailUnique from '@src/common/CustomHooks/Queries/Member/useCheckEmailUnique';
import useCheckUserNameUnique from '@src/common/CustomHooks/Queries/Member/useCheckUserNameUnique';
import useMemberJoinRequest from '@src/common/CustomHooks/Queries/Member/useMemberJoinRequest';

// Style
import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx = classNames.bind(styles);

// Image
const checkboxIcon = '/Images/member/register/jo-login-ico-check.svg';
const externalLinkIcon = '/Images/00-ic-basic-link-external.svg';

function JoinRequest() {
  const { t } = useTranslation();
  const router = useRouter();
  const uniqueEmailMutation = useCheckEmailUnique();
  const uniqueUserNameMutation = useCheckUserNameUnique();
  const memberJoinRequestMutation = useMemberJoinRequest();
  const [, setIsLoading] = useRecoilState(loadingStateAtom);
  const [isAgree, setIsAgree] = useState<boolean>(false);
  const [route, setRoute] = useState<string>('');
  const [isRouteEtcInput, setIsRouteEtcInput] = useState<boolean>(false);
  const [routeEtcInput, setRouteEtcInput] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [isPurposeEtcInput, setIsPurposeEtcInput] = useState<boolean>(false);
  const [purposeEtcInput, setPurposeEtcInput] = useState<string>('');
  const [factor, setFactor] = useState<string>('');
  const [isFactorEtcInput, setIsFactorEtcInput] = useState<boolean>(false);
  const [factorEtcInput, setFactorEtcInput] = useState<string>('');
  const [visitRouteChecked, setVisitRouteChecked] = useState<boolean[]>(
    new Array(8).fill(false),
  );
  const [usePurposeChecked, setUsePurposeChecked] = useState<boolean[]>(
    new Array(7).fill(false),
  );
  const [choosingFactorChecked, setChoosingFactorChecked] = useState<boolean[]>(
    new Array(6).fill(false),
  );

  // 방문 경로 선택 옵션
  const visitRouteOptions = useMemo(
    () => [
      { id: 'search', label: t('visit-route-search'), value: '인터넷 검색' },
      { id: 'article', label: t('visit-route-article'), value: '기사' },
      { id: 'meeting', label: t('visit-route-meeting'), value: '미팅' },
      {
        id: 'expo',
        label: t('visit-route-expo'),
        value: '전시회/박람회',
      },
      { id: 'journal', label: t('visit-route-journal'), value: '학술지' },
      { id: 'media', label: t('visit-route-media'), value: '전문 매체' },
      { id: 'community', label: t('visit-route-community'), value: '커뮤니티' },
      { id: 'route-etc', label: t('visit-route-etc'), value: '기타' },
    ],
    [t],
  );

  // Jonathan 활용 목적 선택 옵션
  const usePurposeOptions = useMemo(
    () => [
      {
        id: 'development',
        label: t('use-purpose-development'),
        value: '인공지능 모델 개발',
      },
      {
        id: 'operation',
        label: t('use-purpose-operation'),
        value: '인공지능 모델 운영',
      },
      { id: 'test', label: t('use-purpose-test'), value: '플랫폼 테스트' },
      { id: 'gpu', label: t('use-purpose-gpu'), value: 'GPU 활용' },
      {
        id: 'labeling',
        label: t('use-purpose-data-labeling'),
        value: '데이터 라벨링',
      },
      {
        id: 'autolabel',
        label: t('use-purpose-auto-labeling'),
        value: '오토 라벨링',
      },
      {
        id: 'purpose-etc',
        label: t('use-purpose-etc'),
        value: '기타',
      },
    ],
    [t],
  );

  // 플랫폼 선택 시 중요 요인 선택 옵션
  const choosingFactorOptions = useMemo(
    () => [
      {
        id: 'feature',
        label: t('choosing-factor-feature'),
        value: '기능',
      },
      {
        id: 'price',
        label: t('choosing-factor-price'),
        value: '가격',
      },
      { id: 'design', label: t('choosing-factor-design'), value: '디자인' },
      {
        id: 'usability',
        label: t('choosing-factor-usability'),
        value: '사용 편의성',
      },
      {
        id: 'review',
        label: t('choosing-factor-review'),
        value: '후기',
      },
      {
        id: 'factor-etc',
        label: t('choosing-factor-etc'),
        value: '기타',
      },
    ],
    [t],
  );

  // 방문 경로 체크박스
  const onCheckRoute = (idx: number) => {
    const checkedList = [...visitRouteChecked];
    checkedList[idx] = !checkedList[idx];
    setVisitRouteChecked(checkedList);
    if (checkedList[7]) {
      setIsRouteEtcInput(true);
    } else {
      setIsRouteEtcInput(false);
    }
  };

  // Jonathan 활용 목적 체크박스
  const onCheckPurpose = (idx: number) => {
    const checkedList = [...usePurposeChecked];
    checkedList[idx] = !checkedList[idx];
    setUsePurposeChecked(checkedList);
    if (checkedList[6]) {
      setIsPurposeEtcInput(true);
    } else {
      setIsPurposeEtcInput(false);
    }
  };

  // 플랫폼 선택 요인 라디오박스
  const onCheckFactor = (idx: number) => {
    const checkedList = new Array(6).fill(false);
    checkedList[idx] = true;
    setChoosingFactorChecked(checkedList);
    if (checkedList[5]) {
      setIsFactorEtcInput(true);
    } else {
      setIsFactorEtcInput(false);
    }
  };

  // 기타 직접 입력
  const inputEtcHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    kind: string,
  ) => {
    const { value } = event.target;
    if (kind === 'route') {
      setRouteEtcInput(value);
    } else if (kind === 'purpose') {
      setPurposeEtcInput(value);
    } else if (kind === 'factor') {
      setFactorEtcInput(value);
    }
  };

  // 약관 동의 체크박스
  const onCheckAgree = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === 'agree') {
      setIsAgree(!isAgree);
    }
  };

  // 아이디 검증
  const validateUserName = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    if (userName.val !== '') {
      if (formatValid) {
        // 중복체크
        const body = { username: userName.val };
        const { data } = await uniqueUserNameMutation.onMutateAsync({ body });
        if (data && data === 'unique') {
          setIsValid(true);
          setErrMsg('');
        } else {
          setErrMsg(t('duplicate-username'));
        }
      } else {
        setErrMsg(t('username-not-correct'));
      }
    } else {
      setErrMsg(t('login-error-username-empty'));
    }
  };

  // 아이디
  const userName = useFormInput('', t('register-username'), validateUserName);

  // 이메일 검증
  const validationEmail = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    if (email.val) {
      if (formatValid) {
        // 중복체크
        const body = {
          email: email.val,
        };
        const { data } = await uniqueEmailMutation.onMutateAsync({ body });
        if (data && data === 'unique') {
          setIsValid(true);
          setErrMsg('');
        } else {
          setErrMsg(t('duplicate-email'));
        }
      } else {
        setErrMsg(t('login-error-email-correct'));
      }
    } else {
      setErrMsg(t('login-error-email-empty'));
    }
  };

  // 이메일
  const email = useFormInput('', t('register-email'), validationEmail);

  // 이름 검증
  const validationName = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    if (name.val !== '') {
      if (formatValid) {
        // 한글 or 영문
        setIsValid(true);
      } else {
        setErrMsg(t('name-not-correct'));
      }
    } else {
      setErrMsg(t('register-error-name-empty'));
    }
  };

  // 이름
  const name = useFormInput('', t('register-name'), validationName);

  // 소속(회사) 검증
  const validationCompany = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    if (company.val !== '') {
      if (formatValid) {
        // 한글 or 영문
        setIsValid(true);
      } else {
        setErrMsg(t('company-not-correct'));
      }
    } else {
      setErrMsg(t('register-error-company-empty'));
    }
  };

  // 소속(회사)
  const company = useFormInput('', t('register-company'), validationCompany);

  // 직책 검증
  const validationPosition = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    if (position.val !== '') {
      if (formatValid) {
        // 한글 or 영문
        setIsValid(true);
      } else {
        setErrMsg(t('position-not-correct'));
      }
    } else {
      setErrMsg(t('register-error-position-empty'));
    }
  };

  // 직책
  const position = useFormInput('', t('register-position'), validationPosition);

  const [openSubmit, setOpenSubmit] = useState(false);

  // 회원가입 버튼 클릭
  const handleSubmit = async (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsLoading(true);

    let routeVal = route;
    let purposeVal = purpose;
    let factorVal = factor;

    // 기타 입력시 내용 추가
    if (isRouteEtcInput) {
      routeVal = `${route}(${routeEtcInput})`;
    }
    if (isPurposeEtcInput) {
      purposeVal = `${purpose}(${purposeEtcInput})`;
    }
    if (isFactorEtcInput) {
      factorVal = `${factor}(${factorEtcInput})`;
    }

    const body = {
      email: email.val,
      username: userName.val,
      name: name.val,
      company: company.val,
      position: position.val,
      route: routeVal,
      purpose: purposeVal,
      factor: factorVal,
    };

    // API CALL
    await memberJoinRequestMutation
      .onMutateAsync({ body })
      .then((res) => {
        if (res.data) {
          router.push('/member/join-request-finished');
        }
      })
      .catch((err) => {
        const error = err.response?.data?.fieldErrors;
        if (error) {
          if (error['user.email']?.length > 0) {
            email.setErrMsg(t('duplicate-email'));
            email.setIsValid(false);
          }
          if (error['user.username']?.length > 0) {
            userName.setErrMsg(t('duplicate-username'));
            userName.setIsValid(false);
          }
        } else {
          // eslint-disable-next-line no-alert
          alert('network error');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 방문 경로 값 생성
  useEffect(() => {
    const routeList: string[] = [];
    visitRouteChecked.forEach((checked, idx) => {
      if (checked) {
        routeList.push(visitRouteOptions[idx].value);
      }
    });
    setRoute(routeList.join(', '));
  }, [visitRouteChecked, visitRouteOptions]);

  // 사용 목적 값 생성
  useEffect(() => {
    const purposeList: string[] = [];
    usePurposeChecked.forEach((checked, idx) => {
      if (checked) {
        purposeList.push(usePurposeOptions[idx].value);
      }
    });
    setPurpose(purposeList.join(', '));
  }, [usePurposeChecked, usePurposeOptions]);

  // 플랫폼 선택 요인 값 생성
  useEffect(() => {
    let factor: string = '';
    choosingFactorChecked.forEach((checked, idx) => {
      if (checked) {
        factor = choosingFactorOptions[idx].value;
      }
    });
    setFactor(factor);
  }, [choosingFactorChecked, choosingFactorOptions]);

  // 버튼 활성화
  useEffect(() => {
    setOpenSubmit(false);

    if (
      userName.isValid &&
      email.isValid &&
      name.isValid &&
      company.isValid &&
      position.isValid &&
      route &&
      purpose &&
      factor &&
      isAgree
    ) {
      // 기타 선택일 때 입력 필수 체크
      if (
        (isRouteEtcInput && routeEtcInput === '') ||
        (isPurposeEtcInput && purposeEtcInput === '') ||
        (isFactorEtcInput && factorEtcInput === '')
      ) {
        setOpenSubmit(false);
      } else {
        setOpenSubmit(true);
      }
    }
  }, [
    userName.isValid,
    email.isValid,
    name.isValid,
    company.isValid,
    position.isValid,
    route,
    isRouteEtcInput,
    routeEtcInput,
    purpose,
    isPurposeEtcInput,
    purposeEtcInput,
    factor,
    isFactorEtcInput,
    factorEtcInput,
    isAgree,
  ]);

  return (
    <div className={cx('joinRequest')}>
      {/* 회원가입 요청 헤더 */}
      <div className={cx('joinRequest__header')}>
        <div className={cx('joinRequest__header--main')}>
          <BasicTitle text='Request to Join'></BasicTitle>
        </div>
        <div className={cx('joinRequest__header--sub')}>
          <BasicSubTitle
            text={['register-type-subtitle1', 'register-request-subtitle']}
          ></BasicSubTitle>
        </div>
      </div>

      {/* 기본 정보 박스 */}
      <div className={cx('joinRequest__user-info-box')}>
        {/* 아이디 */}
        <div className={cx('user-info-box')}>
          <BaseInput {...userName} name='username' type='text' />
          {userName && userName.isValid && (
            <img
              className={cx('joinRequest__chkbox')}
              src={checkboxIcon}
              alt='check'
            />
          )}
        </div>
        {/* 이메일 */}
        <div className={cx('user-info-box')}>
          <BaseInput {...email} name='email' type='email' />
          {email && email.isValid && (
            <img
              className={cx('joinRequest__chkbox')}
              src={checkboxIcon}
              alt='check'
            />
          )}
        </div>
        {/* 이름 */}
        <div className={cx('user-info-box')}>
          {name.val && <label>{t('name')}</label>}
          <BaseInput {...name} name='name' type='text' />
          {name && name.isValid && (
            <img
              className={cx('joinRequest__chkbox')}
              src={checkboxIcon}
              alt='check'
            />
          )}
        </div>
        {/* 소속 */}
        <div className={cx('user-info-box')}>
          {company.val && <label>{t('company')}</label>}
          <BaseInput {...company} name='company' type='text' />
          {company && company.isValid && (
            <img
              className={cx('joinRequest__chkbox')}
              src={checkboxIcon}
              alt='check'
            />
          )}
        </div>
        {/* 직책 */}
        <div className={cx('user-info-box')}>
          {position.val && <label>{t('position')}</label>}
          <BaseInput {...position} name='position' type='text' />
          {position && position.isValid && (
            <img
              className={cx('joinRequest__chkbox')}
              src={checkboxIcon}
              alt='check'
            />
          )}
        </div>
      </div>

      {/* 방문 경로 */}
      <div className={cx('joinRequest__option-info-box')}>
        <label>
          {t('visit-route-title')}{' '}
          <span className={cx('required')}>{t('register-term-required')}</span>
        </label>
        <div className={cx('checkbox-box')}>
          {visitRouteOptions.map(({ id, label }, idx) => {
            return (
              <BasicCheckbox
                key={idx}
                id={id}
                label={label}
                checked={visitRouteChecked[idx]}
                onChange={() => onCheckRoute(idx)}
              />
            );
          })}
        </div>
        {visitRouteChecked[7] && (
          <div className={cx('etc-input-box')}>
            <input
              className={cx('etc-input')}
              type='text'
              value={routeEtcInput}
              placeholder={t('etc-input-placeholder')}
              onChange={(e) => inputEtcHandler(e, 'route')}
            />
          </div>
        )}
      </div>

      {/* Jonathan 활용 목적 */}
      <div className={cx('joinRequest__option-info-box')}>
        <label>
          {t('use-purpose-title')}{' '}
          <span className={cx('required')}>{t('register-term-required')}</span>
        </label>
        <div className={cx('checkbox-box')}>
          {usePurposeOptions.map(({ id, label }, idx) => {
            return (
              <BasicCheckbox
                key={idx}
                id={id}
                label={label}
                checked={usePurposeChecked[idx]}
                onChange={() => onCheckPurpose(idx)}
              />
            );
          })}
        </div>
        {usePurposeChecked[6] && (
          <div className={cx('etc-input-box')}>
            <input
              className={cx('etc-input')}
              type='text'
              value={purposeEtcInput}
              placeholder={t('etc-input-placeholder')}
              onChange={(e) => inputEtcHandler(e, 'purpose')}
            />
          </div>
        )}
      </div>

      {/* 플랫폼 선택 요인 */}
      <div className={cx('joinRequest__option-info-box')}>
        <label>
          {t('choosing-factor-title')}{' '}
          <span className={cx('required')}>{t('register-term-required')}</span>
        </label>
        <div className={cx('checkbox-box')}>
          {choosingFactorOptions.map(({ id, label }, idx) => {
            return (
              <BasicRadioBox
                key={idx}
                id={id}
                name='factor'
                label={label}
                checked={choosingFactorChecked[idx]}
                onChange={() => onCheckFactor(idx)}
              />
            );
          })}
        </div>
        {choosingFactorChecked[5] && (
          <div className={cx('etc-input-box')}>
            <input
              className={cx('etc-input')}
              type='text'
              value={factorEtcInput}
              placeholder={t('etc-input-placeholder')}
              onChange={(e) => inputEtcHandler(e, 'factor')}
            />
          </div>
        )}
      </div>

      {/* 약관 동의 */}
      <div className={cx('joinRequest__agree')}>
        <BasicCheckbox
          id='agree'
          label={
            i18n.language === 'ko' ? (
              <span>
                <b>통합 서비스 이용약관</b>
                <a href='/accounts/term/access' target='_blank'>
                  <img
                    src={externalLinkIcon}
                    alt='terms and condition link'
                    width='18px'
                  />
                </a>
                과 <b>개인정보 처리방침</b>
                <a href='/accounts/term/privacy' target='_blank'>
                  <img
                    src={externalLinkIcon}
                    alt='privacy policy link'
                    width='18px'
                  />
                </a>
                에 모두 동의합니다.{' '}
                <span className={cx('required')}>(필수)</span>
              </span>
            ) : (
              <span>
                I agree with the <b>Terms and Conditions</b>
                <a href='/accounts/term/access' target='_blank'>
                  <img
                    src={externalLinkIcon}
                    alt='terms and condition link'
                    width='18px'
                  />
                </a>
                and the <b>Privacy Policy.</b>
                <a href='/accounts/term/privacy' target='_blank'>
                  <img
                    src={externalLinkIcon}
                    alt='privacy policy link'
                    width='18px'
                  />
                </a>
                <span className={cx('required')}>(Required)</span>
              </span>
            )
          }
          checked={isAgree}
          onChange={onCheckAgree}
        ></BasicCheckbox>
      </div>

      {/* 회원가입 박스 */}
      <div className={cx('joinRequest__submit-box')}>
        <SuccessButton
          disabled={!openSubmit}
          text={t('request-to-join')}
          onClick={(e) => handleSubmit(e)}
        ></SuccessButton>
      </div>
    </div>
  );
}

export default JoinRequest;

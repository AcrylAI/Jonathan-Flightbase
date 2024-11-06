/* eslint-disable import/no-anonymous-default-export */
import { toast as _toast } from 'react-toastify';

import { Case, Default, Switch } from '@jonathan/react-utils';

// Icons
import close from '@src/static/images/icon/close.svg';

import './Toast.scss';

import { josa } from '@toss/hangul';

export default {
  success: (title = '', subtitle = '') => {
    _toast.success(
      <>
        <span className='Toastify__toast-body-title'>
          <div>{title}</div>
          <img src={close} alt='close' />
        </span>{' '}
        <span className='Toastify__toast-body-subtitle'>{subtitle}</span>
      </>,
    );
  },
  info: (title = '', subtitle = '') => {
    _toast.info(
      <>
        <span className='Toastify__toast-body-title'>
          <div>{title}</div>
          <img src={close} alt='close' />
        </span>{' '}
        <span className='Toastify__toast-body-subtitle'>{subtitle}</span>
      </>,
    );
  },
  error: (title = '', subtitle = '') => {
    _toast.error(
      <>
        <span className='Toastify__toast-body-title'>
          <div>{title}</div> <img src={close} alt='close' />
        </span>{' '}
        <span className='Toastify__toast-body-subtitle'>{subtitle}</span>
      </>,
    );
  },
  api: {
    badRequest: () => {
      const locale = localStorage.getItem('language') === 'en' ? 'en' : 'kr';
      _toast.error(
        <>
          <span className='Toastify__toast-body-title'>
            <Switch>
              <Case condition={locale === 'en'}>
                <div>The request is wrong.</div>
              </Case>
              <Default>
                <div>잘못된 요청입니다.</div>
              </Default>
            </Switch>
            <img src={close} alt='close' />
          </span>
        </>,
      );
    },
    failed: () => {
      const locale = localStorage.getItem('language') === 'en' ? 'en' : 'kr';
      _toast.error(
        <>
          <span className='Toastify__toast-body-title'>
            <Switch>
              <Case condition={locale === 'en'}>
                <div>The connection with server is not smooth.</div>
              </Case>
              <Default>
                <div>서버와의 연결이 원활하지 않습니다.</div>
              </Default>
            </Switch>
            <img src={close} alt='close' />
          </span>
        </>,
      );
    },
    success: () => {
      const locale = localStorage.getItem('language') === 'en' ? 'en' : 'kr';
      _toast.success(
        <>
          <span className='Toastify__toast-body-title'>
            <Switch>
              <Case condition={locale === 'en'}>
                <div>The request was successful.</div>
              </Case>
              <Default>
                <div>요청에 성공하였습니다.</div>
              </Default>
            </Switch>
            <img src={close} alt='close' />
          </span>
        </>,
      );
    },
    get: (process = '', subtitle = '') => {
      const locale = localStorage.getItem('language') === 'en' ? 'en' : 'kr';
      _toast.success(
        <>
          <span className='Toastify__toast-body-title'>
            <Switch>
              <Case condition={locale === 'en'}>
                <div>{process} loading was successfully</div>
              </Case>
              <Default>
                <div>{process} 불러오기에 성공하였습니다.</div>
              </Default>
            </Switch>
            <img src={close} alt='close' />
          </span>{' '}
          <span className='Toastify__toast-body-subtitle'>{subtitle}</span>
        </>,
      );
    },
    post: (process = '', subtitle = '') => {
      const locale = localStorage.getItem('language') === 'en' ? 'en' : 'kr';
      _toast.success(
        <>
          <span className='Toastify__toast-body-title'>
            <Switch>
              <Case condition={locale === 'en'}>
                <div>{process} has been created.</div>
              </Case>
              <Default>
                <div>{josa(process, '이/가')} 생성되었습니다.</div>
              </Default>
            </Switch>
            <img src={close} alt='close' />
          </span>{' '}
          <span className='Toastify__toast-body-subtitle'>{subtitle}</span>
        </>,
      );
    },
    put: (process = '', subtitle = '') => {
      const locale = localStorage.getItem('language') === 'en' ? 'en' : 'kr';
      _toast.success(
        <>
          <span className='Toastify__toast-body-title'>
            <Switch>
              <Case condition={locale === 'en'}>
                <div>{process} has been edited.</div>
              </Case>
              <Default>
                <div>{josa(process, '이/가')} 수정되었습니다.</div>
              </Default>
            </Switch>
            <img src={close} alt='close' />
          </span>{' '}
          <span className='Toastify__toast-body-subtitle'>{subtitle}</span>
        </>,
      );
    },
    delete: (process = '', subtitle = '') => {
      const locale = localStorage.getItem('language') === 'en' ? 'en' : 'kr';
      _toast.success(
        <>
          <span className='Toastify__toast-body-title'>
            <Switch>
              <Case condition={locale === 'en'}>
                <div>{process} has been deleted.</div>
              </Case>
              <Default>
                <div>{josa(process, '이/가')} 삭제되었습니다.</div>
              </Default>
            </Switch>
            <img src={close} alt='close' />
          </span>{' '}
          <span className='Toastify__toast-body-subtitle'>{subtitle}</span>
        </>,
      );
    },
  },
};

import Cookies from 'universal-cookie';

export const removeAccessTokens = () => {
  const cookies = new Cookies();
  cookies.remove('access_token', {
    path: '/',
    domain: process.env.NEXT_PUBLIC_ENV_COOKIE_DOMAIN,
  });
  cookies.remove('refresh_token', {
    path: '/',
    domain: process.env.NEXT_PUBLIC_ENV_COOKIE_DOMAIN,
  });
};

// 쿠키를 파싱한다.
export const parseCookie = (str: string) => {
  if (!str) return {};
  const result = str
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc: any, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
      return acc;
    }, {});
  return result;
};

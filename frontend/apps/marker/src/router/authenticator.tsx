type AuthenticatorParams = {
  auth: string;
  pageAuth: string | ReadonlyArray<string>;
  wrongAccessPage: JSX.Element;
  page: JSX.Element;
};

function authenticator({
  auth,
  pageAuth,
  page,
  wrongAccessPage,
}: AuthenticatorParams): [JSX.Element, 0 | 1] {
  if (Array.isArray(pageAuth)) {
    for (let i = 0; i < pageAuth.length; i++) {
      if (pageAuth[i] === auth) {
        return [page, 1];
      }
    }
    return [wrongAccessPage, 0];
  }

  if (pageAuth !== 'common' && auth !== pageAuth) {
    return [wrongAccessPage, 0];
  }

  return [page, 1];
}

export default authenticator;

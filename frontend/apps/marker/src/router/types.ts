type ReactRouterMapType = {
  name: string;
  auth: string | ReadonlyArray<string> | 'common';
  path: string;
  page: JSX.Element;
};

export type { ReactRouterMapType };

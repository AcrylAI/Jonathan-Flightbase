import { BrowserRouter, Route, Routes } from 'react-router-dom';

import authenticator from './authenticator';
import type { ReactRouterMapType } from './types';

type Props = {
  auth: string;
  routerMap: Array<ReactRouterMapType>;
  wrongAccessPage: JSX.Element;
  notFoundPage: JSX.Element;
  children: JSX.Element;
  addedElement?: (
    page: JSX.Element,
    pageInfo: Omit<ReactRouterMapType, 'page'>,
  ) => JSX.Element;
};

function ReactRouter({
  auth,
  routerMap,
  wrongAccessPage,
  notFoundPage,
  children,
  addedElement = (page: JSX.Element) => page,
}: Props) {
  return (
    <BrowserRouter>
      {children}
      <Routes>
        {routerMap.map(
          (
            { auth: pageAuth, path, page, name }: ReactRouterMapType,
            idx: number,
          ) => {
            const [certifiedPage, cert]: [JSX.Element, 0 | 1] = authenticator({
              auth,
              pageAuth,
              wrongAccessPage,
              page,
            });
            const pageInfo =
              cert === 0
                ? {
                    name: 'wrongAccess',
                    auth: '',
                    path: '',
                  }
                : {
                    name,
                    auth,
                    path,
                  };

            const render: JSX.Element = addedElement(certifiedPage, pageInfo);

            return (
              <Route path={path} element={render} key={`${idx}-${name}`} />
            );
          },
        )}
        <Route
          path='*'
          element={addedElement(notFoundPage, {
            name: 'notFound',
            auth: '',
            path: '',
          })}
        />
      </Routes>
    </BrowserRouter>
  );
}

ReactRouter.defaultProps = {
  addedElement: (page: JSX.Element) => page,
};

export type { Props as ReactRouterProps };
export default ReactRouter;

import { toast } from 'react-toastify';
import { useRecoilValue } from 'recoil';

import { FlexibleModal } from '@jonathan/ui-react';
import { ModalTemplateArgs } from '@jonathan/ui-react/src/components/molecules/FlexibleModal/types';

// Store
import { ModalAtom } from '@src/stores/components/Modal/ModalAtom';

import Forbidden403 from '@src/pages/ErrorPage/403/403';
import NotFound404 from '@src/pages/ErrorPage/404/404';
import Error500 from '@src/pages/ErrorPage/500/500';

import FloatingCircle from '@src/components/atoms/Float/FloatingCircle/FloatingCircle';

import { ToastContainer } from '@src/components/molecules/Toast';

// Error Page
import ErrorBoundary from '@src/components/ErrorBoundary/ErrorBoundary';
// Components
import { PageTemplate } from '@src/components/templates';

import useUserSession from '@src/hooks/auth/useUserSession';

// Router
import ReactRouter from './ReactRouter';
import { routerMap } from './routerMap';

function RootRouter() {
  const {
    userSession: { user, isAdmin },
  } = useUserSession();

  const modalList = useRecoilValue<Array<ModalTemplateArgs>>(ModalAtom);
  const lng = localStorage.getItem('language') ?? 'en';

  return (
    <ErrorBoundary fallback={<Error500 lng={lng as 'en' | 'ko'} />}>
      <>
        <ReactRouter
          auth={isAdmin ? 'admin' : 'user'}
          routerMap={routerMap}
          notFoundPage={<NotFound404 lng={lng as 'ko' | 'en'} />}
          wrongAccessPage={<Forbidden403 />}
          addedElement={(page, pageInfo) => {
            const { name, auth } = pageInfo;
            const applyTemplate = ![
              'Root',
              'JFLogin',
              'Login',
              'Annotation',
              'LabelImage',
              'ReviewImage',
              'ViewImage',
              'LabelText',
              'ReviewText',
              'ViewText',
              'TokenError',
              'Error403',
              'wrongAccess',
              'notFound',
              '',
            ].includes(name);

            if (applyTemplate) {
              return <PageTemplate>{page}</PageTemplate>;
            }

            return page;
          }}
        >
          <>
            <FlexibleModal.Render modalList={modalList} />
            <FloatingCircle />
            <ToastContainer
              position={toast.POSITION.BOTTOM_CENTER}
              autoClose={3000}
              progressStyle={{
                visibility: 'hidden',
              }}
              icon={false}
            />
          </>
        </ReactRouter>
      </>
    </ErrorBoundary>
  );
}

RootRouter.defaultProps = {
  children: <></>,
};

export default RootRouter;

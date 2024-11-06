import { createContext, useMemo, useReducer } from 'react';
import { initialPageTemplateState, pageTemplateReducer } from './def';

type Props = {
  children: React.ReactNode;
};

const PageTemplateContext = createContext({});

const PageTemplateContextProvider = ({ children }: Props) => {
  const [pageState, pageTemplateDispatch] = useReducer(
    pageTemplateReducer,
    initialPageTemplateState,
  );

  const value = useMemo(
    () => ({
      isOpen: pageState.isOpen,
      pageTemplateDispatch,
    }),
    [pageState.isOpen],
  );

  return (
    <PageTemplateContext.Provider value={value}>
      {children}
    </PageTemplateContext.Provider>
  );
};

export { PageTemplateContextProvider, PageTemplateContext };

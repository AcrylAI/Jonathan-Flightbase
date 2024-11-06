// import React, { FC, ReactElement } from 'react';
// import { queryClient } from '@src/main';
// import { render } from '@testing-library/react';
// import { QueryClientProvider } from 'react-query';
// // import { RecoilRoot } from 'recoil';
//
// const AllTheProviders: FC<{ children: React.ReactNode }> = ({
//   children,
// }: any) => {
//   return (
//     <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//   );
// };
//
// // testing-library/react 오버라이드
// const renderWithProvider = (ui: ReactElement, options?: any) =>
//   render(ui, { wrapper: AllTheProviders, ...options });
//
// export * from '@testing-library/react';
// export { renderWithProvider as render };

export default "TestUtil"
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

import { today } from '@src/utils/datetimeUtils';

import { PageTemplate as PTemplate, SideNav, Footer } from '@jonathan/ui-react';
import FooterLogo from '@src/static/images/logo/federated-learning-footer-logo.png';
import SideNavFooter from './SideNavFooter/SideNavFooter';
import SideNavHeader from './SideNavHeader/SideNavHeader';

// i18n
import { useTranslation } from 'react-i18next';

const UPDATE_DATE = import.meta.env.VITE_REACT_APP_UPDATE_DATE || today();

function PageTemplate({ children, navList }) {
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);

  return (
    <PTemplate
      theme={theme}
      sideNavRender={() => (
        <SideNav
          navList={navList}
          theme={theme}
          headerContents={[<SideNavHeader />]}
          footerRender={() => <SideNavFooter />}
          onNavigate={({ element, path, activeClassName, isActive }) => {
            return (
              <NavLink
                to={path}
                activeClassName={activeClassName}
                isActive={isActive}
              >
                {element}
              </NavLink>
            );
          }}
          t={t}
        />
      )}
      footerRender={() => (
        <Footer
          theme={theme}
          logoIcon={FooterLogo}
          copyrights={`© ${
            today().split('.')[0]
          } Acryl inc. All rights reserved.`}
          updated={UPDATE_DATE}
        />
      )}
    >
      {children}
    </PTemplate>
  );
}

export default PageTemplate;

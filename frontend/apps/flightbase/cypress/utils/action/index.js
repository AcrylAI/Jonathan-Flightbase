import { getByTestId, findDomByTestId } from '../dom';


export const login = (userId, pwd) => {
  getByTestId('user-id')
    .type(userId)
    .should('have.value', userId);

  getByTestId('user-pwd')
    .type(pwd)
    .should('have.value', pwd);

  getByTestId('login-btn')
    .click().wait(1000);

  findDomByTestId('force-login-modal', () => {
    getByTestId('confirm-modal-submit-btn').click().wait(1000);
  });
};

export const logout = () => {
  getByTestId('open-user-context-popup-btn').click();
  getByTestId('logout-btn')
    .click().wait(1000);
}
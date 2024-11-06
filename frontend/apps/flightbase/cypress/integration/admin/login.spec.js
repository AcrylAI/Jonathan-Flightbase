import { login, logout } from '../../utils/action';

beforeEach(() => {
  cy.visit('/');
})

it("유저 로그인 테스트", () => {
  const userId = 'root';
  const pwd = 'acryl1234!';
  login(userId, pwd);
  cy.location('pathname').should('equal', '/admin/dashboard');
});

it('유저 로그아웃 테스트', () => {
  logout();
  cy.location('pathname').should('equal', '/login');
});
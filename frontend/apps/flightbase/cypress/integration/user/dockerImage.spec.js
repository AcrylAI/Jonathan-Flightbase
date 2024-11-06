/* eslint-disable no-undef */
import { login } from '../../utils/action';
import { getByTestId, findDomByTestId } from '../../utils/dom';


beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  cy.visit('/');
})

const dockerName = 'e2e-docker-test';
const dockerDesc = 'test-desc';
it('도커 이미지 화면 접근', () => {
  login('robert', 'acryl1234!');
  getByTestId('user-dashboard-ws-list').children().first().click();
  getByTestId('docker-image-nav-btn').click();
  cy.location().should(($loc) => {
    const isLoc = $loc.pathname.indexOf('docker_images') !== -1;
    expect(isLoc).to.equal(true);
  })
});



it('도커 이미지 생성', () => {
  login('robert', 'acryl1234!');
  getByTestId('user-dashboard-ws-list').children().first().click();
  getByTestId('docker-image-nav-btn').click();
  getByTestId('upload-docker-image-btn').click();

  getByTestId('docker-image-name-input').type(dockerName);
  getByTestId('docker-image-desc-input').type(dockerDesc);
  getByTestId('dockerimage-uploadtype-radio').children().first().click();
  getByTestId('dockerimage-pull-input').type('ubuntu');
  getByTestId('dockerimage-upload-btn').click().wait(3000).then(() => {
    expect(cy.get('body').contains(dockerName) !== undefined).to.equal(true);
  });
});

it('도커 이미지 삭제', () => {
  // 로그인
  login('robert', 'acryl1234!');
  getByTestId('user-dashboard-ws-list').children().first().click();
  getByTestId('docker-image-nav-btn').click();

  // 생성한 도커이미지의 체크박스 체크
  cy.get('body')
    .contains(dockerName)
    .parents('.rdt_TableRow')
    .find(' .checkmark')
    .click();

  // 삭제 모달 열기
  getByTestId('open-delete-docker-modal-btn').click().wait(1000);

  // 도커 이미지 삭제 및 삭제 확인
  findDomByTestId('dockerimage-delete-modal', () => {
    cy.wait(5000);
    getByTestId('confirm-modal-submit-btn').click().wait(2000);
    cy.get('body').contains(dockerName).should('not.exist');
  }, () => {
    expect(false).to.equal(true);
  });
})
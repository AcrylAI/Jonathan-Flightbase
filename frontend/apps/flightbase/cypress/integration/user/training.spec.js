/* eslint-disable no-undef */
import { login } from '../../utils/action';
import { getByTestId, findDomByTestId } from '../../utils/dom';

beforeEach(() => {
  cy.visit('/');
  const token = sessionStorage.getItem('token');
  cy.log('token : ', token);
  if (token === null) {
    login('robert', 'acryl1234!');
  }
})

// it('트레이닝 화면 접근', () => {
//   getByTestId('user-dashboard-ws-list').children().first().click();

//   findDomByTestId('side-menu-btn', (e) => {
//     e.click();
//     getByTestId('training-nav-btn').click();
//   }, () => {
//     getByTestId('training-nav-btn').click();
//   });

//   cy.location().should(($loc) => {
//     const isLoc = $loc.pathname.indexOf('trainings') !== -1;
//     expect(isLoc).to.equal(true);
//   });

// });

const builtInTypeName = 'built-in-training';
const customTypeName = 'custom-training';
const desc = 'desc-test';

// it('트레이닝 생성', () => {
//   // 트레이닝 화면 이동
//   getByTestId('user-dashboard-ws-list').children().first().click();

//   findDomByTestId('side-menu-btn', (e) => {
//     e.click();
//     cy.on('uncaught:exception', () => {
//       // returning false here prevents Cypress from
//       // failing the test
//       return false
//     })
//     getByTestId('training-nav-btn').click();
//   }, () => {
//     getByTestId('training-nav-btn').click();
//   });

//   cy.location().should(($loc) => {
//     const isLoc = $loc.pathname.indexOf('trainings') !== -1;
//     expect(isLoc).to.equal(true);
//   });


//   // 빌트인 타입 트레이닝 생성
//   findDomByTestId('open-create-training-modal-btn', (e) => {
//     e.click();
//   }, () => {
//     expect(false).to.equal(true);
//   });

//   getByTestId('training-name-input').type(builtInTypeName);
//   getByTestId('training-desc-input').type(desc);
//   getByTestId('training-type-radio').children().eq(0).click();
//   getByTestId('model-list').children().eq(0).click();
//   getByTestId('gpu-count-input').type(1);
//   getByTestId('create-training-btn').click().wait(3000).then(() => {
//     expect(cy.get('body').contains(builtInTypeName) !== undefined).to.equal(true);
//   });

//   // 커스텀 타입 트레이닝 생성
//   findDomByTestId('open-create-training-modal-btn', (e) => {
//     e.click();
//   }, () => {
//     expect(false).to.equal(true);
//   });

//   getByTestId('training-name-input').type(customTypeName);
//   getByTestId('training-desc-input').type(desc);
//   getByTestId('training-type-radio').children().eq(0).click();
//   getByTestId('model-list').children().eq(0).click();
//   getByTestId('gpu-count-input').type(1);
//   getByTestId('create-training-btn').click().wait(3000).then(() => {
//     expect(cy.get('body').contains(customTypeName) !== undefined).to.equal(true);
//   });

// });


// it('트레이닝 삭제', () => {
//   // 트레이닝 화면 이동
//   getByTestId('user-dashboard-ws-list').children().first().click();

//   findDomByTestId('side-menu-btn', (e) => {
//     e.click();
//     cy.on('uncaught:exception', () => {
//       // returning false here prevents Cypress from
//       // failing the test
//       return false
//     })
//     getByTestId('training-nav-btn').click();
//   }, () => {
//     getByTestId('training-nav-btn').click();
//   });

//   cy.location().should(($loc) => {
//     const isLoc = $loc.pathname.indexOf('trainings') !== -1;
//     expect(isLoc).to.equal(true);
//   });

//   // 생성한 트레이닝 삭제 모달 버튼 클릭
//   cy.get('body')
//     .contains(builtInTypeName)
//     .closest('.Card_card__3DyvR')
//     .find(` [data-testid=card-menu-btn]`)
//     .click();
//   getByTestId('training-delete-btn').click();

//   // 생성한 트레이닝 삭제
//   findDomByTestId('training-delete-modal', () => {
//     getByTestId('confirm-modal-submit-btn').click().wait(2000);
//     cy.get('body').contains(builtInTypeName).should('not.exist');
//   }, () => {
//     expect(false).to.equal(true);
//   });

//   cy.get('body')
//     .contains(customTypeName)
//     .closest('.Card_card__3DyvR')
//     .find(` [data-testid=card-menu-btn]`)
//     .click();
//   getByTestId('training-delete-btn').click();

//   // 생성한 트레이닝 삭제
//   findDomByTestId('training-delete-modal', () => {
//     getByTestId('confirm-modal-submit-btn').click().wait(2000);
//     cy.get('body').contains(customTypeName).should('not.exist');
//   }, () => {
//     expect(false).to.equal(true);
//   });

// })


it('트레이닝 수정', () => {
  cy.get('body')
    .contains(customTypeName)
    .closest('.Card_card__3DyvR')
    .find(` [data-testid=card-menu-btn]`)
    .click();
  getByTestId('training-edit-btn').click();
});
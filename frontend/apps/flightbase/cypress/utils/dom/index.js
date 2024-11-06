/* eslint-disable no-undef */
export const getByTestId = (value) => cy.get(`[data-testid="${value}"]`);

export const getByClassName = (value) => cy.get(`[class*="${value}"]`);

export const getByName = (value) => cy.get(`[name="${value}"]`);

export const getByXpath = (value) => cy.xpath(value);

export const findDomByTestId = (value, successFunc, failFunc) => cy.get('body').then(($body) => {
  const target = $body.find(` [data-testid=${value}]`);
  if (target.length) {
    if (successFunc) successFunc(target);
  } else {
    if (failFunc) failFunc();
  }
});
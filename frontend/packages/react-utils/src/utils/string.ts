/**
 * 숫자에 1000단위 콤마 넣기
 */
export const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

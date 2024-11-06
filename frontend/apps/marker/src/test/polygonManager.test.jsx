// import { render, fireEvent, screen, createEvent } from './testUtils';
// import { PolygonPage } from '@src/pages';
// import { setupServer } from 'msw/node';
// import { handlers } from '@src/mocks/Handler';
// import userEvent from '@testing-library/user-event';
// import '@testing-library/jest-dom';
//
// const server = setupServer(...handlers);
//
// beforeAll(() => {
//   server.listen();
// });
// afterEach(() => server.resetHandlers());
//
// afterAll(() => server.close());
//
// const paintRender = () => {
//   const { getByText, getByTestId, findByRole, findByTestId, findAllByTestId } =
//     render(<PolygonPage />);
//
//   return {
//     paintGetByText: getByText,
//     paintGetByTestId: getByTestId,
//
//     paintFindByRole: findByRole,
//     paintFindByTestId: findByTestId,
//     paintFindAllByTestId: findAllByTestId,
//   };
// };
//
// function sleep(ms) {
//   const wakeUpTime = Date.now() + ms;
//   while (Date.now() < wakeUpTime) {}
// }
//
// describe('초기 렌더링 확인', () => {
//   test('초기 렌더링 확인', async () => {
//     const { paintGetByText, paintFindByTestId } = paintRender();
//
//     // 로딩시 '로딩중'이 뜨는지?
//     paintGetByText(/로딩중..../i); // Todo: 임시
//
//     // svg 내부에 image가 로드 되는지
//     const svgImage = await paintFindByTestId('test-svg_image');
//     expect(svgImage).toBeInTheDocument();
//
//     // 미니맵 내부의 img태그 존재와 url 확인
//     const minimapImage = await paintFindByTestId('test-minimap_img');
//     expect(minimapImage.src).toContain('http');
//     expect(minimapImage).toBeInTheDocument();
//   });
//
//   test('다각형이 수량에 맞게 그려지는지 체크', async () => {
//     paintRender();
//
//     // api mockup 핸들러에서 내려주는 개수 1 + 미니맵에서 쓰이는 polygon 개수 1
//     const polygons = document.querySelectorAll('polygon');
//     expect(polygons.length).toBe(2);
//   });
// });
//
// describe('이벤트 확인', () => {
//   test('마우스 이벤트', async () => {
//     const { paintFindAllByTestId, paintGetByTestId } = paintRender();
//
//     const alertMock = jest.spyOn(window, 'alert').mockImplementation();
//
//     // 마우스 hover시 opacity변경
//     const polygons = document.querySelectorAll('polygon');
//     const annotationPolygon = polygons[0];
//
//     expect(annotationPolygon.attributes['fill-opacity'].value).toBe('0');
//     fireEvent.mouseEnter(annotationPolygon);
//     expect(annotationPolygon.attributes['fill-opacity'].value).toBe('0.5');
//     fireEvent.mouseLeave(annotationPolygon);
//     expect(annotationPolygon.attributes['fill-opacity'].value).toBe('0');
//
//     // 다각형 클릭시 circle 보여지는지
//     userEvent.click(annotationPolygon);
//
//     const circles = await paintFindAllByTestId('moveCircle');
//     expect(circles.length).not.toBe(0);
//
//     userEvent.click(annotationPolygon);
//     const wrapperSvg = document.querySelector('.svg');
//     fireEvent.wheel(wrapperSvg, { target: { scrollY: 100 } });
//
//     expect(alertMock).toBeCalledTimes(1);
//
//     // console.log(wrapperSvg[Object.keys(wrapperSvg)[1]].transform);
//     expect(wrapperSvg).toHaveAttribute('transform');
//   });
// });

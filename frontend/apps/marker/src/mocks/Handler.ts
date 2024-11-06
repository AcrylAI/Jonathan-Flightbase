// import { rest } from 'msw';
//
// const url = '1.1.1.1:12345';
//
// const get_image_info_body = {
//   id: 114848,
//   file_name: 'chacha.jpg',
//   ori_name: 'chacha.jpg',
//   project_id: 198,
//   createdAt: '2022-07-21 17:23:51',
//   url: 'http://192.168.1.17:9887/image/1/dawson-mulmi/NaranjoBulnes_1.png',
//   createdBy: 2,
//   user_id: 63,
//   isTagged: 1,
//   comment: null,
//   patient_id: 0,
//   group_id: 41,
//   step: 1,
//   file_status: 0,
//   inspector_id: 94,
//   next_id: 6016,
//   annotations: [
//     {
//       id: 17036,
//       file_id: 114848,
//       sub_id: null,
//       user_id: 63,
//       affiliation_id: 1,
//       taggedAt: '2022-08-01 08:50:34',
//       color: null,
//       category: {
//         id: 17035,
//         annotation_id: 17036,
//         main_category_id: 496,
//         sub_category_id: 1336,
//         tag_text: null,
//         main_category: 'main cate',
//         sub_category: 'sub cate',
//       },
//       coordinate: [
//         {
//           id: 95736,
//           annotation_id: 17036,
//           x: 297,
//           y: 277,
//         },
//         {
//           id: 95737,
//           annotation_id: 17036,
//           x: 423,
//           y: 277,
//         },
//         {
//           id: 95738,
//           annotation_id: 17036,
//           x: 423,
//           y: 485,
//         },
//         {
//           id: 95739,
//           annotation_id: 17036,
//           x: 297,
//           y: 485,
//         },
//       ],
//     },
//   ],
// }
// const get_image_info = rest.get(`${url}/get_image_info`, (req: any, res, ctx) => {
//   return res(
//     ctx.status(200),
//     ctx.json(get_image_info_body),
//   );
// })
//
//
// export const handlers = [
//   get_image_info,
// ];

export default "Handler";
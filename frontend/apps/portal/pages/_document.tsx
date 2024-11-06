import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang='ko'>
        <Head />
        <title>Jonathan 통합 로그인 시스템</title>
        <meta charSet='utf-8' />
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

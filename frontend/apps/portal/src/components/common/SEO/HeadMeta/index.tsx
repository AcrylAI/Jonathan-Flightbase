/* eslint-disable react/require-default-props */
import Head from 'next/head';

export type HeadMetaProps = {
  title?: string;
  description?: string;
  url?: string;
  siteName?: string;
  locale?: string;
  image?: string;
  imageWidth?: string;
  imageHeight?: string;
};

const defaultValue: HeadMetaProps = {
  title: 'Jonathan 통합 로그인 시스템',
  description: '최고의 인공지능 구축을 위한 단 하나의 플랫폼, 조나단',
  url: 'https://portal.acryl.ai/',
  siteName: 'Jonathan 통합 로그인 시스템',
  locale: 'ko_KR',
  image: 'https://jonathan.acryl.ai/img/image-main-banner-1.6be73cb8.jpg',
  imageWidth: '1200',
  imageHeight: '630',
};

const HeadMeta = (props: HeadMetaProps) => {
  const {
    title,
    description,
    url,
    siteName,
    locale,
    image,
    imageWidth,
    imageHeight,
  } = defaultValue;
  return (
    <>
      <Head>
        <title>{props.title ?? 'Jonathan 통합 로그인 시스템'}</title>
        <meta name='description' content={props.description ?? description} />
        <meta property='og:type' content='website' />
        <meta property='og:url' content={props.url ?? url} />
        <meta property='og:title' content={props.title ?? title} />
        <meta property='og:image' content={props.image ?? image} />
        <meta
          property='og:description'
          content={props.description ?? description}
        />
        <meta property='og:site_name' content={props.siteName ?? siteName} />
        <meta property='og:locale' content={props.locale ?? locale} />
        <meta property='og:locale:alternate' content='en_US' />
        {/* <!-- 다음의 태그는 필수는 아니지만, 포함하는 것을 추천함 --> */}
        <meta
          property='og:image:width'
          content={props.imageWidth ?? imageWidth}
        />
        <meta
          property='og:image:height'
          content={props.imageHeight ?? imageHeight}
        />
      </Head>
    </>
  );
};

export default HeadMeta;

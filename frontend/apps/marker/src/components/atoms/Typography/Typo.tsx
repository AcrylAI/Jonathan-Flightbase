import { ReactNode, CSSProperties } from 'react';
import { TypoTypes, TypoWeight, TypoLine } from '@src/utils/types/components';

import classNames from 'classnames/bind';
import styles from './Typo.module.scss';
const cx = classNames.bind(styles);

type Props = {
  type?: TypoTypes;
  children: ReactNode;
  weight?: TypoWeight;
  line?: TypoLine;
  color?: string;
  ellipsis?: boolean;
  userSelect?: boolean;
  title?: string;
};

/**
 * Typography가 정의된 컴포넌트
 * @param type Typo의 타입
 * @param children Typo로 표시할 문자열 또는 블록
 * @param weight Typo의 굵기, default -> undefined
 * @param line Typo의 라인 타입, default -> Single
 * @param color Typo의 색상, default -> inherit
 * @param ellipsis Typo의 말줄임표시 여부, default -> false
 * @param userSelect userSelect none 여부, default -> false
 * @param title Typo에 마우스 오버 시 tooltip 표시 여부, default -> undefined
 * @author Dawson
 * @version 22-11-22
 */
function Typo({
  type = 'p1',
  children,
  weight = undefined,
  line = 'S',
  color = 'inherit',
  ellipsis = false,
  userSelect = false,
  title = undefined,
}: Props) {
  const style = (() => {
    const _style: CSSProperties = {
      color,
      userSelect: userSelect ? 'auto' : 'none',
    };

    if (ellipsis) {
      _style.overflow = 'hidden';
      _style.whiteSpace = 'nowrap';
      _style.textOverflow = 'ellipsis';
    }

    // eslint-disable-next-line no-extra-boolean-cast
    if (!!weight) {
      switch (weight) {
        case 'bold':
        case 'B':
        case 'b':
        case 700:
          _style.fontFamily = 'SpoqaB, sans-serif';
          break;
        case 'medium':
        case 'm':
        case 'M':
        case 500:
          _style.fontFamily = 'SpoqaM, sans-serif';
          break;
        case 'regular':
        case 'R':
        case 'r':
        case 400:
          _style.fontFamily = 'SpoqaR, sans-serif';
          break;
        case 'tiny':
        case 't':
        case 'T':
        case 200:
          _style.fontFamily = 'SpoqaT, sans-serif';
          break;
        default:
          _style.fontFamily = undefined;
          _style.fontWeight = undefined;
      }
    }

    return _style;
  })();

  return (
    <span
      className={`mk-typo ${cx('Typo', line, type)}`}
      style={style}
      title={title}
    >
      {children}
    </span>
  );
}

/**
 * line이 Single로 정의된 Typo 컴포넌트
 * @author Dawson
 * @version 22-11-22
 */
function Sypo(props: Props) {
  // eslint-disable-next-line react/no-children-prop
  return <Typo {...props} line='S' children={props.children} />;
}

/**
 * line이 Multi로 정의된 Typo 컴포넌트
 * @author Dawson
 * @version 22-11-22
 */
function Mypo(props: Props) {
  // eslint-disable-next-line react/no-children-prop
  return <Typo {...props} line='M' children={props.children} />;
}

Typo.defaultProps = {
  weight: undefined,
  line: 'S',
  color: undefined,
  ellipsis: false,
  userSelect: false,
  title: undefined,
};

Sypo.defaultProps = {
  weight: undefined,
  line: 'S',
  color: undefined,
  ellipsis: false,
  userSelect: false,
  title: undefined,
};

Mypo.defaultProps = {
  weight: undefined,
  line: 'M',
  color: undefined,
  ellipsis: false,
  userSelect: false,
  title: undefined,
};

export { Typo, Mypo, Sypo };

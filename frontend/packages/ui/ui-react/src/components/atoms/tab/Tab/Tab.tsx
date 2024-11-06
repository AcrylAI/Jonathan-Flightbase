import { useCallback, useEffect, useRef } from 'react';
import i18n from 'react-i18next';
import { Properties as CSSProperties } from 'csstype';

import { CategoryType } from './types';
import { theme } from '@src/utils';

import classNames from 'classnames/bind';
import style from './Tab.module.scss';
const cx = classNames.bind(style);

type Props = {
  category?: CategoryType[];
  selectedItem?: number;
  renderComponent?: any;
  renderComponentProps?: any;
  customStyle?: {
    tab?: CSSProperties;
    btnArea?: CSSProperties;
    selectBtnArea?: CSSProperties;
    label?: CSSProperties;
    line?: CSSProperties;
    component?: CSSProperties;
  };
  isScroll?: boolean;
  isScrollCorrection?: boolean;
  theme?: ThemeType;
  readonly onClick?: (idx: number, e?: React.MouseEvent<HTMLLIElement>) => void;
  readonly t?: i18n.TFunction<'translation'>;
};

function Tab({
  category,
  selectedItem,
  renderComponent,
  renderComponentProps,
  customStyle,
  theme,
  isScroll = true,
  isScrollCorrection = true,
  onClick,
  t,
}: Props) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: Event) => {
    if (
      componentRef.current &&
      !componentRef.current.contains(e.target as Node)
    ) {
      const component = componentRef.current;
      const { scrollHeight, scrollTop, clientHeight } =
        document.documentElement;
      if (scrollTop === 0) {
        component.scrollTo({
          top: component.scrollTop - 500,
          behavior: 'smooth',
        });
      } else if (scrollTop + clientHeight >= scrollHeight) {
        component.scrollTo({
          top: component.scrollTop + 500,
          behavior: 'smooth',
        });
      }
    }
  }, []);

  useEffect(() => {
    if (isScrollCorrection) {
      window.addEventListener('wheel', handleScroll);

      return () => {
        window.removeEventListener('wheel', handleScroll);
      };
    }
    return () => {};
  }, [handleScroll, isScrollCorrection]);

  return (
    <div className={cx('tab')} style={customStyle?.tab}>
      <div className={cx('tab-controller', theme)}>
        <ul
          className={cx('btn-area', theme)}
          style={customStyle?.selectBtnArea}
        >
          {category?.map((data, idx) => {
            return (
              <li
                key={idx}
                className={cx(idx === selectedItem && 'selected-tab', theme)}
                style={customStyle?.label}
                onClick={(e) => {
                  if (onClick) {
                    const compo = componentRef.current;
                    if (compo) {
                      compo.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                      });
                    }

                    onClick(idx, e);
                  }
                }}
              >
                {t ? t(data.label) : data.label}
              </li>
            );
          })}
        </ul>
        <div className={cx('line', theme)} style={customStyle?.line}></div>
      </div>
      <div
        className={cx('child', isScroll && 'scroll', theme)}
        style={customStyle?.component}
        ref={componentRef}
      >
        {renderComponent && renderComponent(renderComponentProps)}
      </div>
    </div>
  );
}

Tab.defaultProps = {
  category: [],
  selectedItem: undefined,
  renderComponent: undefined,
  renderComponentProps: undefined,
  customStyle: {
    tabArea: {},
    selectBtnArea: {},
    label: {},
    line: {},
    component: {},
  },
  isScroll: true,
  isScrollCorrection: true,
  theme: theme.PRIMARY_THEME,
  onClick: undefined,
  t: undefined,
};

export default Tab;

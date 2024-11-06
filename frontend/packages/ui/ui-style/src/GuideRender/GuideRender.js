import { useState, useDocument } from '@react';
import { contents, category } from './Guide';
import { htmlEntities, theme } from '@src/utils';
import './GuideRender.scss';

function GuidRender() {
  const [isCodeSelect, setIsCodeSelect] = useState({});
  const [isSelectedCategory, setIsSelectedCategory] = useState(
    category.DEFAULT,
  );
  const [t, setT] = useState(theme.PRIMARY_THEME);

  useDocument(() => {
    const selectBtn = document.getElementsByClassName('select-btn');

    const onSelectAll = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSelectedCategory(category.DEFAULT);
    };

    const themeSetting = () => {
      if (t === theme.PRIMARY_THEME) {
        setT(theme.DARK_THEME);
      } else {
        setT(theme.PRIMARY_THEME);
      }
    };

    const onSelectInputType = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSelectedCategory(category.INPUT);
    };

    const onSelectButtonType = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSelectedCategory(category.BUTTON);
    };

    selectBtn[0].addEventListener('click', onSelectAll);
    selectBtn[1].addEventListener('click', themeSetting);
    selectBtn[2].addEventListener('click', onSelectButtonType);
    selectBtn[3].addEventListener('click', onSelectInputType);

    return () => {
      selectBtn[0].removeEventListener('click', onSelectAll);
      selectBtn[1].removeEventListener('click', themeSetting);
      selectBtn[2].removeEventListener('click', onSelectButtonType);
      selectBtn[3].removeEventListener('click', onSelectInputType);
    };
  });

  return {
    tagName: 'div',
    props: {
      className: `guide ${t}`,
    },
    childNode: [
      {
        tagName: 'div',
        childNode: `
          <div class="option-box">
            <span>카테고리</span>
            <div class="option-line"></div>
            <div class="select-button">
              <button class="jp btn primary-light medium select-btn">전체 보기</button>
              <button class="jp btn primary-light medium select-btn">${
                t === theme.PRIMARY_THEME ? '다크 테마' : '일반 테마'
              }</button>
              <button class="jp btn primary-light medium select-btn">Button 타입 스타일 보기</button>
              <button class="jp btn primary-light medium select-btn">Input 타입 스타일 보기</button>
            </div>
          </div>
        `,
        props: {
          className: 'menu-bar',
        },
      },
      {
        tagName: 'div',
        props: {
          className: 'guide-box',
        },
        childNode: contents(t)
          .filter((c) => {
            if (c.tabContent === '') {
              return false;
            }
            if (isSelectedCategory === category.DEFAULT) return true;
            if (isSelectedCategory === c.category) {
              return true;
            }
            return false;
          })
          .map((opt) => {
            const { title, subject, desc, tabContent, type } = opt;
            return {
              tagName: 'div',
              props: {
                className: `box ${t}`,
              },
              childNode: [
                {
                  tagName: 'div',
                  props: {
                    className: 'info-box',
                  },
                  childNode: [
                    {
                      tagName: 'p',
                      props: {
                        className: `title ${t}`,
                        id: title,
                      },
                      childNode: subject,
                    },
                    {
                      tagName: 'div',
                      props: {
                        className: `desc ${t}`,
                      },
                      childNode: desc,
                    },
                  ],
                },
                {
                  tagName: 'div',
                  props: {
                    className: 'tab-box',
                  },
                  childNode: [
                    {
                      tagName: 'ul',
                      props: {
                        className: 'tab-controller',
                      },
                      childNode: [
                        {
                          tagName: 'li',
                          props: {
                            className: isCodeSelect[type]
                              ? `tab-btn ${t}`
                              : `tab-btn active ${t}`,
                          },
                          childNode: 'Preview',
                          event: {
                            type: 'click',
                            eventFunc: () => {
                              setIsCodeSelect({
                                ...isCodeSelect,
                                [type]: false,
                              });
                            },
                          },
                        },
                        {
                          tagName: 'li',
                          props: {
                            className: isCodeSelect[type]
                              ? `tab-btn active ${t}`
                              : `tab-btn ${t}`,
                          },
                          childNode: 'Code',
                          event: {
                            type: 'click',
                            eventFunc: () => {
                              setIsCodeSelect({
                                ...isCodeSelect,
                                [type]: true,
                              });
                            },
                          },
                        },
                      ],
                    },
                    {
                      tagName: 'div',
                      props: {
                        className: 'tab-content',
                      },
                      childNode: isCodeSelect[type]
                        ? `
                            <pre class="code ${t}">
                              <p>${
                                typeof tabContent === 'string'
                                  ? htmlEntities(tabContent)
                                  : ''
                              }</p>
                            </pre>
                          `
                        : {
                            tagName: 'div',
                            props: {
                              className: 'view',
                            },
                            childNode: tabContent,
                          },
                    },
                  ],
                },
              ],
            };
          }),
      },
    ],
  };
}

export default GuidRender;

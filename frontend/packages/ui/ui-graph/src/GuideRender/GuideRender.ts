import { useState, useDocument } from '@react';
import { category, ContentsType } from './types';
import { contents } from './Guide';

import './GuideRender.scss';

export function htmlEntities(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function GuideRender() {
  const [isCodeSelect, setIsCodeSelect] = useState({});
  const [isSelectedCategory, setIsSelectedCategory] = useState(
    category.DEFAULT,
  );

  useDocument(() => {
    // const selectBtn = document.getElementsByClassName('select-btn');
  });

  return {
    tagName: 'div',
    props: {
      className: 'guide',
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
              <button class="jp btn primary-light medium select-btn">D3 Line Chart 보기</button>
              <button class="jp btn primary-light medium select-btn">Canvas Line Chart 보기</button>
              <button class="jp btn primary-light medium select-btn">Canvas Pie Chart 보기</button>
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
        childNode: contents
          .filter((c: ContentsType) => {
            if (isSelectedCategory === category.DEFAULT) return true;
            if (isSelectedCategory === c.category) {
              return true;
            }
            return false;
          })
          .map((opt: ContentsType) => {
            const { title, subject, desc, type, code, tabContent } = opt;
            return {
              tagName: 'div',
              props: {
                className: 'box',
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
                        className: 'title',
                        id: title,
                      },
                      childNode: subject,
                    },
                    {
                      tagName: 'div',
                      props: {
                        className: 'desc',
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
                              ? 'tab-btn'
                              : 'tab-btn active',
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
                              ? 'tab-btn active'
                              : 'tab-btn',
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
                            <pre class="code">
                              <p>${code}</p>
                            </pre>
                          `
                        : tabContent,
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

export default GuideRender;

/**
 * virtual dom을 real dom으로 적용 (재귀적으로 동작)
 * @param node - 부모노드
 * @param dom - virtual dom
 */
const makeNode = (node, dom) => {
  if (!dom) {
    return;
  }
  if (!dom.tagName && !dom.node) {
    return;
  }
  const { tagName, event, props, childNode, frontStringNode, backStringNode } =
    dom;
  const element = dom.node || document.createElement(tagName);

  // Setting node property
  if (props) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(props)) {
      element[key] = value;
    }
  }

  // Setting node event
  if (event) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        const { type, eventFunc } = e;
        element.addEventListener(type, eventFunc);
      });
    } else {
      const { type, eventFunc } = event;
      element.addEventListener(type, eventFunc);
    }
  }

  // Setting string on front of node
  if (frontStringNode !== undefined) {
    node.insertAdjacentText('beforeend', frontStringNode);
  }

  if (element) {
    node.insertAdjacentElement('beforeend', element);
  }

  // Setting string on back of node
  if (backStringNode !== undefined) {
    node.insertAdjacentText('beforeend', backStringNode);
  }

  if (childNode !== undefined) {
    createDOM(element, childNode);
  }
};

/**
 * virtual dom을 real dom에 적용 (재귀적으로 동작)
 * @param node - 부모노드
 * @param dom - virtual dom
 */
export const createDOM = (node, dom) => {
  if (dom === undefined || dom === null) return;
  const n = node;
  if (typeof dom === 'string') {
    n.innerHTML = dom;
    return;
  }

  if (Array.isArray(dom)) {
    dom.forEach((d) => {
      if (typeof d === 'string') {
        // eslint-disable-next-line no-console
        console.warn('문자열 노드는 배열로 할당할 수 없습니다.');
      } else {
        makeNode(node, d);
      }
    });
    return;
  }

  makeNode(node, dom);
};

/**
 * 연속 rerendering 방지
 * @param callback - 실행 callback함수
 * @returns 다음 호출
 */
export const debounceFrame = (callback) => {
  let nextFrameCallack = 0;

  const nextExecution = () => {
    cancelAnimationFrame(nextFrameCallack);
    nextFrameCallack = requestAnimationFrame(callback);
  };

  return nextExecution;
};

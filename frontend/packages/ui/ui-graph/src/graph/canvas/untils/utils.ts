// number type 확인
function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

// value의 integer type 여부 확인
function isInteger(value: unknown): value is number {
  // number 타입 && 유한 숫자타입 && value의 소수점 버림이 value와 같을 경우 true
  // eslint-disable-next-line no-restricted-globals
  return isNumber(value) && isFinite(value) && Math.floor(value) === value;
}

// pixel 보정
export function crispPixel(pixel: number, thickness = 1) {
  const halfThickness = thickness / 2;

  // 좌표가 홀수일 경우 좌표를 반올림, 내림하여 픽셀 보정
  return thickness % 2
    ? (isInteger(pixel) ? pixel : Math.round(pixel - halfThickness)) +
        halfThickness
    : Math.round(pixel);
}

export const applyMixin = (targetClass: any, superClasses: Array<any>) => {
  superClasses.forEach((superClass: any) => {
    Object.getOwnPropertyNames(superClass.prototype).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        superClass.prototype,
        name,
      );
      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  });
};

// 부모요소 생성
export function wrap(
  node: HTMLElement | null,
  tagName: string,
): HTMLElement | null {
  if (!node) return null;
  const parent = node.parentElement;
  if (parent === null) return node;

  const findIndex = (() => {
    let idx = 0;
    function node(n: Element): number {
      if (!n.previousElementSibling) return 0;
      idx += 1;
      node(n.previousElementSibling);
      return idx;
    }
    return node;
  })();

  const sameLevels = parent.children;
  const foundIdx = findIndex(node);

  let template = ``;
  for (let i = 0; i < sameLevels.length; i++) {
    if (i === foundIdx) {
      template = `${template}<${tagName}>${node.outerHTML}</${tagName}>`;
    } else {
      if (node.id) {
        template = `<${tagName} id='${node.id}'>${node.outerHTML}</${tagName}>`;
      } else {
        template = `<${tagName}>${node.outerHTML}</${tagName}>`;
      }
    }
  }
  parent.innerHTML = template;

  return parent.children[foundIdx] as HTMLElement;
}

function objParser() {
  let result = {};

  function makeOneDepthOperator(
    obj: { [key: string]: any } | string,
    curString: string,
    splitStr: string,
  ) {
    if (typeof obj === 'string') {
      result = {
        ...result,
        [curString]: obj,
      };
      return null;
    }
    const next = Object.keys(obj);
    for (let i = 0; i < next.length; i++) {
      let cur = '';
      if (curString === '') {
        cur = `${next[i]}`;
      } else {
        cur = `${curString}${splitStr}${next[i]}`;
      }
      makeOneDepthOperator(obj[next[i]], cur, splitStr);
    }

    return result;
  }

  function makeOneDepth(
    obj: { [key: string]: any } | string,
    splitStr: string,
  ) {
    return makeOneDepthOperator(obj, '', splitStr);
  }

  return {
    makeOneDepth,
  };
}

export { objParser };

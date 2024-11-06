import { ReactType, ReactClosureOptions, ReactDOM } from './types';
import { createDOM, debounceFrame } from './utils';

const React: ReactType = (() => {
  /**
   * React 클로저 옵션
   */
  const options: ReactClosureOptions = {
    // state 배열
    states: [],
    // state 배열 index
    stateKey: 0,
    // root 노드
    root: null,
    // react 컴포넌트
    component: null,
    // useEffect unmount 함수
    componentUnmount: undefined,
    // dom api를 사용하는 공간
    injected: {
      event: [],
      unmount: [],
    },
    // redux store
    store: undefined,
    // redux state
    reduxState: undefined,
  };

  /**
   * 컴포넌트 렌더링 기능
   * requestAnimationFrame으로 렌더링 횟수 제한
   */
  const reactRenderer = debounceFrame(() => {
    const { root, component } = options;
    if (!root || !component) return;
    const vDOM: ReactDOM[] | ReactDOM | null = component();
    root.innerHTML = '';
    createDOM(root as HTMLElement, vDOM);
    options.stateKey = 0;

    options.injected.event.forEach((event) => {
      const unmount = event();
      if (unmount !== undefined) {
        options.injected.unmount.push(unmount);
      }
    });

    options.injected.event = [];
  });

  /**
   * 상태관리 시스템
   * @param initState - 제너릭 타입 상태 및 상태 업데이트 기능 제공
   * @returns [state, setState] - 상태, 상태 업데이트 함수
   */
  function useState<T = undefined>(initState: T): [T, (newVal: T) => void] {
    const { states, stateKey: key } = options;
    if (states.length === key) states.push(initState);
    const state = states[key];
    const setState = (newState: T) => {
      if (newState === state) return;
      if (JSON.stringify(newState) === JSON.stringify(state)) return;

      states[key] = newState;
      reactRenderer();
    };
    options.stateKey += 1;
    return [state, setState];
  }

  /**
   * 상태관리 시스템, 렌더링을 진행하지 않음
   * @param initState - 제너릭 타입 상태 및 상태 업데이트 기능 제공
   * @returns [state, setState] - 상태, 상태 업데이트 함수
   */
  function useStateNoRender<T = undefined>(
    initState: T,
  ): [T, (newVal: T) => void] {
    const { states, stateKey: key } = options;
    if (states.length === key) states.push(initState);
    const state = states[key];
    const setState = (newState: T) => {
      if (newState === state) return;
      if (JSON.stringify(newState) === JSON.stringify(state)) return;

      states[key] = newState;
    };
    options.stateKey += 1;
    return [state, setState];
  }

  /**
   * 컴포넌트의 생명주기를 관리
   * @param effect - mount, update, unmount 컴포넌트 생명주기 관리
   * @param depsArray - 상태 비교를 위한 deps
   */
  function useEffect(effect: () => any, depsArray?: any[]) {
    const { states, stateKey: currStateKey } = options;

    // 실제로 React는 Deps배열이 없으면 callback함수를 실행시킨다.
    const hasNoDeps = !depsArray;
    const deps = states[currStateKey];
    const hasChangedDeps: boolean = deps
      ? !depsArray?.every((el: any, i: number) => el === deps[i])
      : true;
    if (hasNoDeps || hasChangedDeps) {
      options.componentUnmount = effect();
      states[currStateKey] = depsArray;
    }
    options.stateKey++;
  }

  /**
   * 컴포넌트에서 document api를 사용하여 커스터마이징 로직 작성 지원
   * @param event
   */
  function useDocument(event: () => any) {
    options.injected.event.push(event);
  }

  /**
   * React 받아온 컴포넌트를 클로저에 저장 후 렌더링 실행
   * @param component - React 컴포넌트
   * @param rootElement - root 노드
   */
  function render(
    component: () => ReactDOM[] | (() => ReactDOM),
    rootElement: Element | null,
  ) {
    options.component = component as unknown as
      | (() => ReactDOM[])
      | (() => ReactDOM);
    options.root = rootElement;
    reactRenderer();
  }

  return {
    useState,
    useEffect,
    useDocument,
    useStateNoRender,
    render,
  };
})();

export const { useState, useEffect, useDocument, useStateNoRender } = React;
export { ReactDOM };
export default React;

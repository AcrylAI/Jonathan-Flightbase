import { createDOM, debounceFrame } from './utils';

const React = (() => {
  /**
   * React 클로저 옵션
   */
  const reactOptions = {
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
    const { root, component } = reactOptions;
    if (!root || !component) return;
    const vDOM = component();
    root.innerHTML = '';
    createDOM(root, vDOM);
    reactOptions.stateKey = 0;
    reactOptions.injected.event.forEach((event) => {
      const unmount = event();
      if (unmount !== undefined) {
        reactOptions.injected.unmount.push(unmount);
      }
    });
    reactOptions.injected.event = [];
  });

  /**
   * 상태관리 시스템
   * @param initState - 제너릭 타입 상태 및 상태 업데이트 기능 제공
   * @returns [state, setState] - 상태, 상태 업데이트 함수
   */
  function useState(initState) {
    const { states, stateKey: key } = reactOptions;
    if (states.length === key) states.push(initState);
    const state = states[key];
    const setState = (newState) => {
      if (newState === state) return;
      if (JSON.stringify(newState) === JSON.stringify(state)) return;

      states[key] = newState;
      reactRenderer();
    };
    reactOptions.stateKey += 1;
    return [state, setState];
  }

  /**
   * 상태관리 시스템, 렌더링을 진행하지 않음
   * @param initState - 제너릭 타입 상태 및 상태 업데이트 기능 제공
   * @returns [state, setState] - 상태, 상태 업데이트 함수
   */
  function useStateNoRender(initState) {
    const { states, stateKey: key } = reactOptions;
    if (states.length === key) states.push(initState);
    const state = states[key];
    const setState = (newState) => {
      if (newState === state) return;
      if (JSON.stringify(newState) === JSON.stringify(state)) return;

      states[key] = newState;
    };
    reactOptions.stateKey += 1;
    return [state, setState];
  }

  /**
   * 컴포넌트의 생명주기를 관리
   * @param effect - mount, update, unmount 컴포넌트 생명주기 관리
   * @param depsArray - 상태 비교를 위한 deps
   */
  function useEffect(effect, depsArray) {
    const { states, stateKey: currStateKey } = reactOptions;

    // 실제로 React는 Deps배열이 없으면 callback함수를 실행시킨다.
    const hasNoDeps = !depsArray;
    const deps = states[currStateKey];
    const hasChangedDeps = deps
      ? !depsArray.every((el, i) => el === deps[i])
      : true;
    if (hasNoDeps || hasChangedDeps) {
      reactOptions.componentUnmount = effect();
      states[currStateKey] = depsArray;
    }
    reactOptions.stateKey++;
  }

  /**
   * 컴포넌트에서 document api를 사용하여 커스터마이징 로직 작성 지원
   * @param event
   */
  function useDocument(event) {
    reactOptions.injected.event.push(event);
  }

  /**
   * React 받아온 컴포넌트를 클로저에 저장 후 렌더링 실행
   * @param component - React 컴포넌트
   * @param rootElement - root 노드
   */
  function render(component, rootElement) {
    reactOptions.component = component;
    reactOptions.root = rootElement;
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
export default React;

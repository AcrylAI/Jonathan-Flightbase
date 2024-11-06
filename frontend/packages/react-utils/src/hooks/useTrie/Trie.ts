// eslint-disable-next-line max-classes-per-file
import Hangul from './Hangul';

import { ITrie, TrieDataType } from './types';

type TrieObjectType = { [key: string]: TrieNode };

class TrieNode {
  public isWord: boolean;

  public info: TrieDataType[] | null;

  public next: TrieObjectType;

  constructor() {
    this.isWord = false;

    this.next = {};

    this.info = null;
  }
}

class Trie implements ITrie {
  private root: TrieNode;

  private memo: string;

  constructor() {
    this.root = new TrieNode();

    this.memo = '';
  }

  /**
   * 입력받은 문자열을 추출하여 배열로 저장
   * @param str
   */
  private extractStr = (str: string) => {
    const cur = [];
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (Hangul.isHangul(c)) {
        const extract = Hangul.make(str[i]);
        cur.push(...extract.split(''));
      } else {
        cur.push(str[i]);
      }
    }

    return cur;
  };

  /**
   * 문자열을 trie객체에 주입
   * @param inputStr 입력된 문자열
   * @param info trie의 info에 넣을 데이터
   */
  public insert = (inputStr: string, info: TrieDataType): void => {
    let curNode: TrieNode = this.root;

    for (let i = 0; i < inputStr.length; i++) {
      const c: string = inputStr[i];
      if (c !== ' ') {
        if (!curNode.next[c]) {
          curNode.next[c] = new TrieNode();
        }
        curNode = curNode.next[c];
      }
    }

    curNode.isWord = true;
    if (curNode.info === null) {
      curNode.info = [info];
    } else {
      curNode.info.push(info);
    }
  };

  /**
   * 접두어 기준 다음에 올 수 있는 모든 문자열 반환
   * @param prefix 접두어
   * @returns
   */
  public startPrefixList = (prefix: string): TrieDataType[] => {
    let curNode: TrieNode = this.root;
    const toPrefix: TrieDataType[] = [];

    const findWords = (node: TrieNode) => {
      if (node === undefined) return;
      if (node.isWord && node.info !== null) {
        toPrefix.push(...node.info);
      }
      Object.values(node.next).forEach((n: TrieNode) => {
        findWords(n);
      });
    };

    const extract = this.extractStr(prefix);

    for (let i = 0; i < extract.length; i++) {
      curNode = curNode.next[extract[i]];
      if (curNode === undefined) break;
    }

    if (curNode) {
      findWords(curNode);
    }

    return toPrefix;
  };

  /**
   * 입력된 문자열이 포함된 모든 데이터 출력
   * @param inputed
   */
  public containList = (inputed: string): TrieDataType[] => {
    if (!inputed || inputed.length === 0) return [];
    const containList: TrieDataType[] = [];
    const extractInputed = this.extractStr(inputed).join('');

    const recursion = (node: TrieNode) => {
      if (node === undefined) return;
      if (node.isWord && node.info) {
        node.info.forEach((val: TrieDataType) => {
          const extractLabel = this.extractStr(val.label).join('');
          if (extractLabel.includes(extractInputed)) {
            containList.push(val);
          }
        });
      }
      Object.values(node.next).forEach((n) => {
        recursion(n);
      });
    };

    recursion(this.root);

    return containList;
  };

  /**
   * trie 초기화
   */
  public initialize = (): void => {
    this.root = new TrieNode();
  };

  /**
   * trie memoization
   * 일치할 경우 false, 일치하지 않을 경우 true
   * @param {TrieDataType} newData
   * @returns
   */
  public isDiff = (newData: TrieDataType[]): boolean => {
    const compare = JSON.stringify(
      newData.sort((a, b) => {
        if (a.key < b.key) {
          return -1;
        }
        if (a.key > b.key) {
          return 1;
        }
        return 0;
      }),
    );

    const isChanged = !(String(this.memo).trim() === compare);

    this.memo = compare;

    return isChanged;
  };

  /**
   * 생성된 trie ds getter
   */
  get makedTrie(): TrieNode {
    return this.root;
  }
}

export default Trie;

import { useMemo, useEffect } from 'react';

import Trie from './Trie';
import Hangul from './Hangul';

import type { TrieDataType } from './types';

/**
 * trie Datastructure를 생성
 * @param dictionary trie 생성 데이터
 * @param isBuildTrie trie 생성 여부
 * @returns
 */
function useTrie(dictionary: TrieDataType[], isBuildTrie: boolean = true) {
  const trie = useMemo(() => new Trie(), []);

  useEffect(() => {
    if (isBuildTrie && trie.isDiff(dictionary)) {
      trie.initialize();
      dictionary.forEach((val: TrieDataType) => {
        const extract = Hangul.make(val.label);
        trie.insert(extract, val);
      });
    }
  }, [trie, dictionary, isBuildTrie]);

  return trie;
}

export default useTrie;

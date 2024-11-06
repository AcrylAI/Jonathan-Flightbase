// import _ from 'lodash';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useLayoutEffect,
} from 'react';
import i18n from 'react-i18next';

// Components
import SelectFormDefaultType from './SelectboxForm/SelectFormDefaultType';
import SelectFormInputType from './SelectboxForm/SelectFormInputType';
import CheckboxFormDefault from './SelectboxForm/CheckboxFormDefault';
import ListFormDefaultType from './ListForm/ListFormDefaultType';
import ListFormGroupType from './ListForm/ListFormGroupType';
import ListFormSelectBoxType from './ListForm/ListFormSelectBoxType';

// Utils
import { arrayToString, theme as tm } from '@src/utils';

// Types
import { Properties as CSSProperties } from 'csstype';
import {
  SelectboxSize,
  SelectboxStatus,
  SelectboxTypes,
  ListType,
  onChangeEventType,
  FontStyle,
} from './types';

// Hooks
import { useTrie } from '@jonathan/react-utils';

// utils
import { isSameArray } from '@src/utils/utils';

// Icons
import downIcon from '@src/static/images/icons/ic-down.svg';

import classNames from 'classnames/bind';
import style from './Selectbox.module.scss';
const cx = classNames.bind(style);

type Props = {
  status?: string;
  type?: string;
  size?: string;
  labelIcon?: string;
  list?: Array<ListType>;
  placeholder?: string;
  selectedItem?: ListType | null;
  selectedItemIdx?: number;
  isReadOnly?: boolean;
  isDisable?: boolean;
  isShowStatusCheck?: boolean;
  theme?: ThemeType;
  customStyle?: {
    globalForm?: CSSProperties;
    selectboxForm?: CSSProperties;
    listForm?: CSSProperties;
    fontStyle?: {
      selectbox?: FontStyle;
      list?: FontStyle;
    };
    placeholderStyle?: CSSProperties;
    color?: string;
  };
  fixedList?: boolean;
  initState?: boolean;
  onChange?: (item: ListType, itemIdx: number, e?: onChangeEventType) => void;
  t?: i18n.TFunction<'translation'>;
  scrollAutoFocus?: boolean;
  onChangeCheckbox?: (curMenu: any) => void;
  checkedList?: number[];
  checkboxMultiLang?: string;
  newSelectedItem?: ListType;
  newSelectedItemF?: boolean;
};

function Selectbox({
  type = SelectboxTypes.PRIMARY,
  status = SelectboxStatus.DEFAULT,
  size = SelectboxSize.MEDIUM,
  isReadOnly = false,
  isDisable = false,
  isShowStatusCheck = false,
  list = [],
  selectedItem,
  selectedItemIdx,
  theme = tm.PRIMARY_THEME,
  labelIcon = downIcon,
  placeholder = '',
  fixedList,
  customStyle,
  initState,
  onChange,
  t,
  scrollAutoFocus,
  onChangeCheckbox,
  checkedList,
  checkboxMultiLang,
  newSelectedItem,
  newSelectedItemF = false,
}: Props) {
  // References
  const selectboxRef = useRef<HTMLDivElement>(null);
  const inputSelectboxRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listDivRef = useRef<HTMLDivElement>(null);

  const isNotSelectedItem = useMemo(() => {
    if (selectedItemIdx !== undefined) return false;
    if (selectedItem !== undefined) return false;
    return true;
  }, [selectedItem, selectedItemIdx]);

  const [mount, setMount] = useState(false);
  const [selectboxList, setSelectboxList] = useState<ListType[]>(
    // _.cloneDeep(list),
    [...list],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [prevSelectedIdx, setPrevSelectedIdx] = useState(-1);
  const [checkVisible, setCheckVisible] = useState(false);

  // 이전 상태의 list와 다음 상태의 list의 비교를 위한 state
  const [prevArray, setPrevArray] = useState<ListType[]>(list);

  // input 타입 selectbox state
  // input box에 표현될 string
  const [inputedValue, setInputedValue] = useState<string>('');

  // group 타입 selectbox staate
  // group타입 selectbox일 경우 원소가 isTitle이 아닌 index 단위가 가장 작은 index (리스트 포커싱 로직 계산)
  const [groupTypeFirstIdx, setGroupTypeFirstIdx] = useState(-1);

  // group Type 선택된 list
  const [checkboxList, setCheckboxList] = useState<ListType[]>([]);

  // list의 index memoization
  const idxMemo: { [key: string]: number } = useMemo(() => {
    let dictionary = {};
    if (Array.isArray(list)) {
      list.forEach((l: ListType, idx: number) => {
        // list의 value에 대한 정보 저장
        dictionary = {
          ...dictionary,
          [String(l.value)]: idx,
        };
      });
    }

    return dictionary;
  }, [list]);

  // trie 객체
  const trie = useTrie(
    (() => {
      if (Array.isArray(list)) {
        const trieForm = list.map((data: ListType) => {
          let options = {};
          Object.keys(data).forEach((d) => {
            if (d !== 'value' && d !== 'label') {
              options = {
                ...options,
                [d]: data[d],
              };
            }
          });
          return {
            key: data.value,
            label: arrayToString(data.label, t),
            options,
          };
        });

        return trieForm;
      }
      return [];
    })(),
    type === SelectboxTypes.SEARCH,
  );

  /**
   * list toggle
   */
  const onToggle = () => {
    if (!isReadOnly && !isDisable) {
      setIsOpen((isOpen) => !isOpen);
    } else {
      setIsOpen(false);
    }
  };

  /**
   * 선택된 list의 요소와 list요소의 index, event를 외부로 전달
   * @param idx
   * @param e
   */
  const dataDelivery = (
    listItem: ListType,
    idx: number,
    e: onChangeEventType,
  ) => {
    if (onChange) onChange(listItem, idx, e);
  };

  const onInputBlur = useCallback(() => {
    if (!isDisable && list.length > 0) {
      // setSelectboxList(_.cloneDeep(list));
      setSelectboxList([...list]);
      if (newSelectedItem) return;
      if (prevSelectedIdx < 0) {
        setInputedValue('');
        setSelectedIdx(-1);
      } else {
        setInputedValue(arrayToString(list[prevSelectedIdx].label, t));
        setSelectedIdx(prevSelectedIdx);
      }
    }
  }, [isDisable, list, prevSelectedIdx, t, newSelectedItem]);

  const onSelectboxBlur = useCallback(() => {
    if (!isDisable && list.length > 0) {
      if (prevSelectedIdx >= 0) {
        setSelectedIdx(prevSelectedIdx);
      }
    }
  }, [isDisable, list.length, prevSelectedIdx]);

  /**
   * input type selectbox onChange
   * @param e
   */
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOpen) setIsOpen(true);
    const inputed = String(e.target.value);
    setInputedValue(inputed);

    if (inputed === '') {
      // setSelectboxList(_.cloneDeep(list));
      setSelectboxList([...list]);
      return;
    }

    // 입력된 문자열로 시작하는 데이터를 trie에서 찾기
    const value = trie.containList(inputed);
    const newList = value.map(
      (listData: {
        label: string;
        key: string | number;
        options?: { [key: string]: any };
        checked?: boolean;
      }) => {
        const { label, key, options } = listData;
        const nList: ListType = {
          ...options,
          label,
          value: key,
        };

        return nList;
      },
    );

    setSelectboxList(newList);
    setSelectedIdx(0);
  };

  /**
   * 리스트에서 특정 원소 선택
   * @param idx
   * @param e
   */
  const onSelect = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    for (let i = 0; i < list.length; i++) {
      if (list[i].value === selectboxList[idx].value) {
        setPrevSelectedIdx(i);
        break;
      }
    }
    setSelectedIdx(idx);
    dataDelivery(
      selectboxList[idx],
      idxMemo[String(selectboxList[idx].value)],
      e,
    );
    if (type === SelectboxTypes.SEARCH) {
      setInputedValue(arrayToString(selectboxList[idx].label, t));
    }
    setIsOpen(false);
  };

  const onSelectCheckbox = useCallback(
    (curMenu: ListType) => {
      const selectedList: ListType[] = checkboxList?.filter((data) => {
        if (data.name) return data.name === curMenu.name;
        return data.label === curMenu.label;
      });
      if (checkboxList?.indexOf(selectedList[0]) !== -1) {
        // const deepBoxList = _.cloneDeep(checkboxList);
        const deepBoxList = [...checkboxList];
        if (checkboxList)
          deepBoxList?.splice(checkboxList.indexOf(selectedList[0]), 1);
        setCheckboxList(deepBoxList);
        if (onChangeCheckbox) onChangeCheckbox(deepBoxList);
      } else {
        setCheckboxList((prev) => [...prev, curMenu]);
        if (onChangeCheckbox) onChangeCheckbox([...checkboxList, curMenu]);
      }
    },
    [checkboxList, onChangeCheckbox],
  );
  /**
   * 선택된 항목의 index 설정
   * @param idx index
   */
  const onSetSelectedIdx = useCallback(
    (idx: number) => {
      setSelectedIdx(idx);
      // setPrevSelectedIdx(idx);
      if (type === SelectboxTypes.SEARCH) {
        setInputedValue(arrayToString(selectboxList[idx].label, t));
      }
    },
    [selectboxList, t, type],
  );

  /**
   * list keyboard controll
   * @param e
   */
  const onListController = (
    e: React.KeyboardEvent<
      HTMLDivElement | HTMLInputElement | HTMLUListElement
    >,
    selectboxType: string,
  ) => {
    if (e.key === 'Escape' && isOpen === true) {
      setIsOpen(false);
      if (type === SelectboxTypes.SEARCH) onInputBlur();
      else onSelectboxBlur();
      return;
    }

    // base case => list의 길이가 0이면 종료
    if (selectboxList.length === 0) return;

    let idx = 0;
    let isSet = false;
    if (e.key === 'ArrowDown') {
      // 아래로 내리기

      setIsOpen(true);
      if (selectboxType === SelectboxTypes.GROUP) {
        if (groupTypeFirstIdx === -1) return;

        // group type 리스트에 대한 list index 설정
        let count = 0;
        idx = selectedIdx;
        while (count < selectboxList.length) {
          if (idx + 1 < selectboxList.length) {
            idx += 1;
          } else {
            idx = 0;
          }
          if (!selectboxList[idx].isTitle) {
            break;
          }
          count++;
        }
      } else {
        let count = 0;
        idx = selectedIdx;
        while (count < selectboxList.length) {
          if (idx + 1 < selectboxList.length) {
            idx += 1;
          } else {
            idx = 0;
          }
          if (!selectboxList[idx].isDisable) {
            break;
          }
          count++;
        }
      }
      onSetSelectedIdx(idx);
      e.preventDefault(); // 커서 위치이동 방지
    } else if (e.key === 'ArrowUp') {
      // 위로 올리기
      setIsOpen(true);
      if (selectboxType === SelectboxTypes.GROUP) {
        if (groupTypeFirstIdx === -1) return;
        // group type 리스트에 대한 list index 설정
        let count = 0;
        idx = selectedIdx;
        while (count < selectboxList.length) {
          if (idx - 1 > 0) {
            idx -= 1;
          } else if (idx === groupTypeFirstIdx) {
            idx = selectboxList.length - 1;
          }
          if (!selectboxList[idx].isTitle) {
            break;
          }
          count++;
        }
      } else {
        // group type 리스트에 대한 list index 설정
        let count = 0;
        let roundCnt = 0;
        idx = selectedIdx;
        while (count < selectboxList.length) {
          idx--;
          count++;
          roundCnt++;
          if (count < 0) {
            count = selectboxList.length - 1;
          }
          if (idx === -1) {
            idx = selectboxList.length - 1;
          }
          if (!selectboxList[idx].isDisable) {
            isSet = true;
            break;
          }
          if (roundCnt === selectboxList.length - 1) {
            break;
          }
        }
      }
      if (isSet) {
        onSetSelectedIdx(idx);
      }
      e.preventDefault(); // 커서 위치이동 방지
    } else if (e.key === 'Enter' && isOpen === true) {
      if (!selectboxList[selectedIdx].isDisable) {
        for (let i = 0; i < list.length; i++) {
          if (list[i].value === selectboxList[selectedIdx].value) {
            setPrevSelectedIdx(i);
            break;
          }
        }
        dataDelivery(
          selectboxList[selectedIdx],
          idxMemo[String(selectboxList[selectedIdx].value)],
          e,
        );
        if (type === SelectboxTypes.SEARCH) {
          setInputedValue(arrayToString(selectboxList[selectedIdx].label));
        }
        setIsOpen(false);
      }
    }
  };

  /**
   * 다른 영역 클릭
   */
  const onDiffAreaClick = useCallback(
    (e: MouseEvent) => {
      if (
        !selectboxRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node) &&
        !inputSelectboxRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
        if (type === SelectboxTypes.SEARCH) {
          onInputBlur();
        } else {
          onSelectboxBlur();
        }
      }
    },
    [onInputBlur, onSelectboxBlur, type],
  );

  /**
   * 컴포넌트 mount 시
   * 리스트의 선택된 요소 state에 설정
   */
  const initSelectedValueSetting = useCallback(() => {
    if (
      selectedItemIdx !== undefined &&
      selectedItemIdx >= 0 &&
      selectedItemIdx < selectboxList.length
    ) {
      // selectedItemIdx를 우선순위로 리스트 계산
      if (selectboxList[selectedItemIdx].isTitle) {
        // 선택된 index가 타이틀일 경우(그룹타입) 선택되지 않도록 수정
        onSetSelectedIdx(-1);
      } else {
        onSetSelectedIdx(selectedItemIdx);
        setPrevSelectedIdx(selectedItemIdx);
      }
    } else if (selectedItem) {
      // selectedItemIdx가 없고 selectedItem이 있을 경우 계산
      for (let i = 0; i < selectboxList.length; i++) {
        if (selectboxList[i].value === selectedItem.value) {
          if (selectboxList[i].isTitle) {
            onSetSelectedIdx(-1);
          } else {
            onSetSelectedIdx(i);
            setPrevSelectedIdx(i);
          }
          break;
        }
      }
    } else if (initState) {
      setInputedValue('');
      setPrevSelectedIdx(-1);
      setSelectedIdx(-1);
    }

    // Group 타입일 경우 리스트에서 title이 아닌 첫번째 원소의 index설정
    if (type === SelectboxTypes.GROUP) {
      for (let i = 0; i < selectboxList.length; i++) {
        if (!selectboxList[i].isTitle) {
          setGroupTypeFirstIdx(i);
          break;
        }
      }
    }

    return undefined;
  }, [
    initState,
    onSetSelectedIdx,
    selectboxList,
    selectedItem,
    selectedItemIdx,
    type,
  ]);

  const scrollObserver = (flag: boolean) => {
    if (!flag)
      listDivRef?.current?.scrollIntoView({
        block: 'end',
        inline: 'nearest',
      });
  };

  /**
   * 영역 클릭 이벤트 등록
   */
  useEffect(() => {
    if (type !== SelectboxTypes.CHECKBOX)
      document.addEventListener('click', onDiffAreaClick);
    return () => {
      document.removeEventListener('click', onDiffAreaClick);
    };
  }, [onDiffAreaClick, type]);

  /**
   * list scroll 이벤트
   */
  useEffect(() => {
    const list = listRef.current;
    if (
      isOpen &&
      list &&
      selectedIdx >= 0 &&
      list.childNodes.length > selectedIdx
    ) {
      const element = list.childNodes[selectedIdx] as HTMLLIElement;
      const scrollPos = element.offsetTop - 14;
      if (
        type === SelectboxTypes.GROUP &&
        selectedIdx === 1 &&
        selectboxList[selectedIdx - 1].isTitle
      ) {
        list.scrollTo({
          top:
            scrollPos -
            16 -
            (list.childNodes[selectedIdx - 1] as HTMLLIElement).offsetTop,
          behavior: 'smooth',
        });
        return;
      }
      list.scrollTo({ top: scrollPos, behavior: 'smooth' });
    }
  }, [isOpen, selectboxList, selectedIdx, type]);

  useEffect(() => {
    if (isShowStatusCheck) {
      if (isOpen) {
        setCheckVisible(false);
      } else {
        setCheckVisible(true);
      }
    }
  }, [isOpen, isShowStatusCheck]);

  /**
   * list 변경 관찰 -> flag 수정하여 list 업데이트
   */
  useLayoutEffect(() => {
    if (mount && !isSameArray<ListType>(prevArray, list)) {
      setPrevArray(list);
      // setSelectboxList(_.cloneDeep(list));
      setSelectboxList([...list]);
      setMount(false);
    }
  }, [list, mount, prevArray]);

  useEffect(() => {
    setSelectboxList([...list]);
    const newList = list.filter((li: ListType) =>
      checkedList?.includes(li.value as number),
    );
    setCheckboxList(newList);
  }, [checkedList, list]);

  useEffect(() => {
    if (fixedList) {
      const handleListPos = () => {
        if (!isOpen) return;

        const selectbox = selectboxRef.current;
        const list = listRef.current;
        if (selectbox && list) {
          const bBox = selectbox.getBoundingClientRect();
          list.style.width = `${bBox.width}px`;
          list.style.position = 'fixed';
          list.style.top = `${bBox.y + bBox.height + 4}px`;
          list.style.left = `${bBox.x}px`;
        }
      };

      handleListPos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectboxRef.current, listRef.current, fixedList]);

  useLayoutEffect(() => {
    if (initState) {
      setMount(false);
    }
  }, [initState]);

  /**
   * 컴포넌트가 마운트 되었을 경우 한번만 실행
   * 선택된 원소가 없거나 리스트가 업데이트 될 경우
   * 컴포넌트 업데이트가 필요하므로 mount flag 변경
   */
  useLayoutEffect(() => {
    if (!mount) {
      if (!isNotSelectedItem) {
        setMount(true);
      }
      initSelectedValueSetting();
    }
  }, [initSelectedValueSetting, isNotSelectedItem, mount]);

  useEffect(() => {
    if (newSelectedItemF) {
      if (newSelectedItem) {
        for (let i = 0; i < selectboxList.length; i++) {
          if (selectboxList[i].value === newSelectedItem.value) {
            setSelectedIdx(i);
            setInputedValue(newSelectedItem.label as string);
          }
        }
      } else {
        setSelectedIdx(-1);
        setInputedValue('');
        setPrevSelectedIdx(-1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newSelectedItem, newSelectedItemF]);

  return (
    <div className={cx('jp', 'selectbox')} style={customStyle?.globalForm}>
      {(type === SelectboxTypes.PRIMARY ||
        type === SelectboxTypes.GROUP ||
        type === SelectboxTypes.MULTI) && (
        <div
          className={cx(size, 'default-selectbox')}
          onClick={onToggle}
          style={customStyle?.selectboxForm}
        >
          {/* Select form */}
          {/* 일반타입, 그룹타입 */}
          <SelectFormDefaultType
            type={type}
            ref={selectboxRef}
            theme={theme}
            status={status}
            isOpen={isOpen}
            selectedItem={
              // selectedIdx >= 0 ? arrayToString(list[selectedIdx].label, t) : ''
              selectedIdx >= 0 ? list[selectedIdx] : null
            }
            placeholder={t ? t(placeholder || '') : placeholder}
            labelIcon={labelIcon}
            isReadonly={isReadOnly}
            isDisable={isDisable}
            fontStyle={customStyle?.fontStyle?.selectbox}
            backgroundColor={customStyle?.color}
            onListController={onListController}
            t={t}
          />
        </div>
      )}
      {/* 검색타입 */}
      {type === SelectboxTypes.SEARCH && (
        <div
          className={cx(size, 'input-selectbox')}
          onClick={onToggle}
          style={customStyle?.selectboxForm}
        >
          <SelectFormInputType
            type={type}
            ref={inputSelectboxRef}
            status={status}
            isOpen={isOpen}
            inputedValue={inputedValue}
            labelIcon={labelIcon}
            isReadonly={isReadOnly}
            isDisable={isDisable}
            checkVisible={checkVisible}
            placeholder={placeholder}
            fontStyle={customStyle?.fontStyle?.selectbox}
            onListController={onListController}
            onInputChange={onInputChange}
            t={t}
          />
        </div>
      )}

      {/* checkbox 일반타입 그룹타입 */}
      {type === SelectboxTypes.CHECKBOX && (
        <div
          className={cx(size, 'default-selectbox')}
          onClick={onToggle}
          style={customStyle?.selectboxForm}
        >
          <CheckboxFormDefault
            type={type}
            ref={selectboxRef}
            theme={theme}
            status={status}
            isOpen={isOpen}
            placeholder={t ? t(placeholder || '') : placeholder}
            labelIcon={labelIcon}
            isReadonly={isReadOnly}
            isDisable={isDisable}
            fontStyle={customStyle?.fontStyle?.selectbox}
            backgroundColor={customStyle?.color}
            onListController={onListController}
            t={t}
            label='컬럼이름'
            checkboxList={checkboxList}
            checkboxMultiLang={checkboxMultiLang}
          />
        </div>
      )}
      {/* list form components */}
      {isOpen && selectboxList.length > 0 && (
        <div className={cx(size, 'list')} style={customStyle?.listForm}>
          {/* List form */}
          {/* 일반타입, 검색타입 */}
          {(type === SelectboxTypes.PRIMARY ||
            type === SelectboxTypes.SEARCH) && (
            <div
              className={cx('list-default')}
              ref={scrollAutoFocus ? listDivRef : undefined}
            >
              <ListFormDefaultType
                ref={listRef}
                selectedIdx={selectedIdx}
                type={type}
                theme={theme}
                list={selectboxList}
                fontStyle={customStyle?.fontStyle?.list}
                onSelect={onSelect}
                onListController={onListController}
                scrollObserver={scrollObserver}
                backgroundColor={customStyle?.color}
                t={t}
              />
            </div>
          )}
          {/* 그룹타입 */}
          {type === SelectboxTypes.GROUP && (
            <div className={cx('list-group')}>
              <ListFormGroupType
                type={type}
                ref={listRef}
                list={selectboxList}
                selectedIdx={selectedIdx}
                theme={theme}
                fontStyle={customStyle?.fontStyle?.list}
                backgroundColor={customStyle?.color}
                onSelect={onSelect}
                onListController={onListController}
                t={t}
              />
            </div>
          )}
          {/* checkbox 일반타입 */}
          {type === SelectboxTypes.CHECKBOX && (
            <div className={cx('list-default')}>
              <ListFormSelectBoxType
                ref={listRef}
                list={selectboxList}
                onDiffAreaClick={onDiffAreaClick}
                onSelectCheckbox={onSelectCheckbox}
                checkedList={checkedList}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Selectbox.defaultProps = {
  type: SelectboxTypes.PRIMARY,
  status: SelectboxStatus.DEFAULT,
  size: SelectboxSize.MEDIUM,
  labelIcon: downIcon,
  list: [],
  selectedItem: undefined,
  selectedItemIdx: undefined,
  isReadOnly: false,
  isDisable: false,
  isShowStatusCheck: false,
  placeholder: '',
  customStyle: undefined,
  onChange: undefined,
  onChangeCheckbox: undefined,
  fixedList: false,
  t: undefined,
  scrollAutoFocus: undefined,
  theme: tm.PRIMARY_THEME,
  checkedList: undefined,
  checkboxMultiLang: '',
  initState: false,
  newSelectedItem: undefined,
  newSelectedItemF: false,
};

export default Selectbox;

import React, { useState, useEffect, useCallback } from 'react';
import i18n from 'react-i18next';

// CSS Module
import classNames from 'classnames/bind';
import style from '../Selectbox.module.scss';
import Checkbox from '@src/components/atoms/button/Checkbox';
import { ListType } from '../types';
const cx = classNames.bind(style);

interface Props {
  list: ListType[];
  onDiffAreaClick: (e: MouseEvent) => void;
  onSelectCheckbox: (curMenu: ListType) => void;
  checkedList?: number[];
}

const ListFormSelectBoxType = React.forwardRef<HTMLUListElement, Props>(
  ({ list, onDiffAreaClick, onSelectCheckbox, checkedList }, ref) => {
    const [checkedState, setCheckedState] = useState(
      new Array(list.length).fill(false),
    );

    const onChangeCheckBox = (curMenu: any, position: number) => {
      onSelectCheckbox(curMenu);
      const updatedCheckedState = checkedState.map((item, index) => {
        return index === position ? !item : item;
      });

      setCheckedState(updatedCheckedState);
    };

    const changeStateHandler = useCallback(() => {
      const newCheckedState = checkedState.map((state, index) => {
        if (checkedList?.includes(index)) {
          return !state;
        }
        return state;
      });
      setCheckedState(newCheckedState);
    }, [checkedList, checkedState]);

    useEffect(() => {
      document.addEventListener('click', onDiffAreaClick);
      return () => {
        document.removeEventListener('click', onDiffAreaClick);
      };
    }, [onDiffAreaClick]);

    useEffect(() => {
      if (checkedList) {
        changeStateHandler();
      }
    }, []);

    return (
      <ul ref={ref} tabIndex={-1}>
        {list.map((curMenu: any, idx: number) => {
          return (
            <div
              style={{ display: 'flex', margin: '20px 10px' }}
              key={curMenu.value}
            >
              <Checkbox
                label={curMenu.label}
                onChange={() => onChangeCheckBox(curMenu, idx)}
                checked={checkedState[idx]}
              />
            </div>
          );
        })}
      </ul>
    );
  },
);
ListFormSelectBoxType.defaultProps = {
  checkedList: undefined,
};

export default ListFormSelectBoxType;

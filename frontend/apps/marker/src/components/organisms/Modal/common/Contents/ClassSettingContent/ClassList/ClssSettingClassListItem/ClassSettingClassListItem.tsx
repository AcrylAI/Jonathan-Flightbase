import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import _ from 'lodash';

import { InputText, Selectbox } from '@jonathan/ui-react';
import { ListType } from '@jonathan/ui-react/src/components/molecules/Selectbox/types';

import { ClickAwayListener } from '@jonathan/react-utils';
import * as ReactUtils from '@jonathan/react-utils';

import { ProjectModalClassItemModel } from '@src/stores/components/Modal/ProjectModalAtom';

import { Sypo } from '@src/components/atoms';
import ClassSettingListDeletedItem from '../../ListDeletedItem/ClassSettingListDeletedItem';

import { CLASS_COLOR_SET, MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import { WarningCircleIcon } from '@src/static/images';
import DeleteIcon from '@src/static/images/icon/Delete.svg';

import styles from './ClassSettingClassListItem.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type ClassSettingClassListItemProps = {
  edit?: boolean;
  item: ProjectModalClassItemModel;
  index: number;
  selected: number;
  duplicated: boolean;
  colorIndex: number;
  selectItemList: Array<ListType>;
  setColor: (color: string, index: number) => void;
  setColorIndex: (idx: number) => void;
  onClickList: (idx: number) => void;
  onChangeItem: (idx: number, item: ProjectModalClassItemModel) => void;
  onClickDelete: (idx: number) => void;
};
const ClassSettingClassListItem = ({
  edit,
  item,
  index,
  selected,
  colorIndex,
  duplicated,
  selectItemList,
  setColor,
  setColorIndex,
  onClickList,
  onChangeItem,
  onClickDelete,
}: ClassSettingClassListItemProps) => {
  const { t } = useT();
  const [active, setActive] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const palletRef = useRef<HTMLDivElement>(null);

  const onClickArrow = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (active) {
      setColorIndex(-1);
    } else {
      setColorIndex(index);
    }
  };

  const onClickColor = (idx: number) => {
    setColor(CLASS_COLOR_SET[idx], index);
    setColorIndex(-1);
    setActive(false);
  };

  const handleClickList = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onClickList(index);
  };

  const handleDelete = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onClickDelete(index);
  };

  const onChangeClassName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(item);
    temp.name = e.target.value;
    onChangeItem(index, temp);
  };

  const onChangeTool = (selectedItem: ListType) => {
    const temp = _.cloneDeep(item);
    temp.tool = selectedItem.value as number;
    onChangeItem(index, temp);
  };

  const onClickDeleteCancel = (e: React.MouseEvent<HTMLDivElement>) => {
    const temp = _.cloneDeep(item);
    // class
    temp.deleted = 0;
    // props
    temp.props.forEach((prop, idx) => {
      temp.props[idx].deleted = 0;
      // options
      prop.options.forEach((_, oIdx) => {
        temp.props[idx].options[oIdx].deleted = 0;
      });
    });
    onChangeItem(index, temp);
  };

  const handleColorIndex = () => {
    if (colorIndex !== index) {
      setActive(false);
    } else {
      setActive(true);
    }
  };

  // 컬러 팔레트 위치 로직
  const setPalletPosition = () => {
    if (pickerRef.current && palletRef.current && active) {
      const bBox = pickerRef.current?.getBoundingClientRect();
      palletRef.current.style.top = `${bBox?.y + 30}px`;
      palletRef.current.style.left = `${bBox?.x - 8}px`;
    }
  };

  // 외부 클릭시 모달 닫기 기능
  const onClickOutSide = (e: MouseEvent | TouchEvent) => {
    if (active) {
      if (palletRef.current && palletRef.current.contains(e.target as Node)) {
        return;
      }
      setColorIndex(-1);
      setActive(false);
    }
  };

  useEffect(() => {
    setPalletPosition();
  }, [active]);

  useEffect(() => {
    handleColorIndex();
  }, [colorIndex]);

  useEffect(() => {
    document.addEventListener('touchstart', onClickOutSide);
    return () => {
      document.removeEventListener('touchstart', onClickOutSide);
    };
  }, []);

  return (
    <ReactUtils.Switch>
      <ReactUtils.Case condition={item.deleted === 1 && item.id}>
        <ClassSettingListDeletedItem
          name={item.name}
          type='class'
          onClickCancel={onClickDeleteCancel}
        />
      </ReactUtils.Case>
      <ReactUtils.Case condition={!item.deleted}>
        <div
          className={cx('list-item-container', selected === index && 'active')}
          onClick={(e: React.MouseEvent<HTMLInputElement>) =>
            handleClickList(e)
          }
        >
          <div className={cx('index')}>
            <Sypo type='P1' weight='bold'>
              {index + 1}
            </Sypo>
          </div>
          <div className={cx('color')}>
            <div className={cx('color-picker')}>
              <div
                className={cx('btn')}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                  onClickArrow(e);
                }}
              >
                <div
                  ref={pickerRef}
                  className={cx('color-chip')}
                  style={{ backgroundColor: `${item.color}` }}
                ></div>
                <div className={cx('arrow')}>
                  <div className={cx('bar-container')}>
                    <div
                      className={cx('bar', 'left', active && 'active')}
                    ></div>
                    <div
                      className={cx('bar', 'right', active && 'active')}
                    ></div>
                  </div>
                </div>
              </div>
              <ClickAwayListener onClickAway={onClickOutSide}>
                <div
                  ref={palletRef}
                  className={cx('pallet', !active && 'hidden')}
                >
                  {CLASS_COLOR_SET.map((v, idx) => (
                    <div
                      key={`color-chips ${idx}`}
                      className={cx('chip-wrapper')}
                      style={{
                        backgroundColor: `${
                          item.color === v ? '#DBDBDB' : '#fff'
                        }`,
                      }}
                    >
                      <div
                        onClick={(e) => {
                          onClickColor(idx);
                        }}
                        className={cx('chip')}
                        style={{
                          backgroundColor: `${v}`,
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
              </ClickAwayListener>
            </div>
          </div>
          <div className={cx('name')}>
            <InputText
              value={item.name}
              onChange={onChangeClassName}
              placeholder={t(`modal.inputBox.className`)}
              customStyle={{
                width: '224px',
                height: '34px',
                color: MONO205,
                fontSize: '14px',
                fontWeight: '400',
                fontFamily: 'MarkerFont',
              }}
              autoFocus
              rightIcon={duplicated ? WarningCircleIcon : ''}
              disableRightIcon={false}
              status={duplicated ? 'error' : ''}
            />
          </div>
          <div className={cx('tools')}>
            <Selectbox
              list={selectItemList}
              placeholder={t(`modal.selectBox.selectTool`)}
              onChange={(item) => {
                onChangeTool(item);
              }}
              selectedItem={
                selectItemList.length === 1
                  ? selectItemList[0]
                  : selectItemList[item.tool - 1]
              }
              customStyle={{
                globalForm: { color: MONO205, fontFamily: 'MarkerFont' },
                selectboxForm: { width: '208px' },
                fontStyle: {
                  selectbox: {
                    fontSize: '14px',
                    fontWeight: '400',
                  },
                  list: { fontSize: '14px', fontWeight: '400' },
                },
              }}
              fixedList
            />
          </div>
          <div className={cx('icon')} onClick={handleDelete}>
            <img src={DeleteIcon} alt='TrashCan' />
          </div>
        </div>
      </ReactUtils.Case>
    </ReactUtils.Switch>
  );
};

ClassSettingClassListItem.defaultProps = {
  edit: false,
};
export default ClassSettingClassListItem;

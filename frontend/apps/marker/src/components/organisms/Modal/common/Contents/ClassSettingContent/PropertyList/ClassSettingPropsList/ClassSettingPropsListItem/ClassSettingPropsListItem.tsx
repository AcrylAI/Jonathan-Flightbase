import _ from 'lodash';
import styles from './ClassSettingPropsListItem.module.scss';
import classNames from 'classnames/bind';
import { InputText, Selectbox, Switch } from '@jonathan/ui-react';
import * as ReactUtils from '@jonathan/react-utils';
import {
  ProjectModalPropModel,
  ProjectModalPropOptModel,
} from '@src/stores/components/Modal/ProjectModalAtom';
import React, { ChangeEvent } from 'react';

import DeleteIcon from '@src/static/images/icon/Delete.svg';
import MinusCircleIcon from '@src/static/images/icon/MinusCircle.svg';
import { ListType } from '@jonathan/ui-react/src/components/molecules/Selectbox/types';
import ClassSettingListDeletedItem from '../../../ListDeletedItem/ClassSettingListDeletedItem';
import { WarningCircleIcon } from '@src/static/images';
import { MONO205 } from '@src/utils/color';
import { Sypo } from '@src/components/atoms';
import useT from '@src/hooks/Locale/useT';
const cx = classNames.bind(styles);

type OptionProps = {
  idx: number;
  option: ProjectModalPropOptModel;
  duplicated: boolean;
  onChangeOption: (idx: number, item: ProjectModalPropOptModel) => void;
  onClickDelete: (idx: number) => void;
};

type ClassSettingPropsListItemProps = {
  idx: number;
  edit?: boolean;
  duplicated: boolean;
  item: ProjectModalPropModel;
  onChangeItem: (idx: number, item: ProjectModalPropModel) => void;
  onClickDelete: (idx: number) => void;
};

const Option = ({
  idx,
  option,
  duplicated,
  onChangeOption,
  onClickDelete,
}: OptionProps) => {
  const { t } = useT();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(option);
    temp.title = e.target.value;
    onChangeOption(idx, temp);
  };
  const handleDelete = () => {
    onClickDelete(idx);
  };
  const onClickDeleteCancel = () => {
    const temp = _.cloneDeep(option);
    temp.deleted = 0;
    onChangeOption(idx, temp);
  };
  return (
    <ReactUtils.Switch>
      <ReactUtils.Case condition={option.deleted === 1 && option.id}>
        <ClassSettingListDeletedItem
          name={option.title}
          onClickCancel={onClickDeleteCancel}
          type='option'
        />
      </ReactUtils.Case>
      <ReactUtils.Default>
        <div className={cx('option-container')}>
          <div className={cx('input')}>
            <InputText
              autoFocus
              value={option.title}
              onChange={handleChange}
              placeholder={`${t(`modal.newProject.option`)}`}
              customStyle={{
                fontFamily: 'MarkerFont',
                fontWeight: '400',
                color: '#747474',
                paddingLeft: '16px',
                fontSize: '14px',
              }}
              rightIcon={duplicated ? WarningCircleIcon : ''}
              status={duplicated ? 'error' : ''}
            />
          </div>
          <div className={cx('delete')} onClick={() => handleDelete()}>
            <img src={MinusCircleIcon} alt='delete' />
          </div>
        </div>
      </ReactUtils.Default>
    </ReactUtils.Switch>
  );
};

const ClassSettingPropsListItem = ({
  idx,
  item,
  edit,
  duplicated,
  onChangeItem,
  onClickDelete,
}: ClassSettingPropsListItemProps) => {
  const { t } = useT();
  const SelectOption: Array<ListType> = [
    { label: `${t(`modal.newProject.singleSelective`)}`, value: 0 },
    { label: `${t(`modal.newProject.multiSelective`)}`, value: 1 },
  ];
  const isDuplicated = (opt: ProjectModalPropOptModel): boolean => {
    const fIdx = item.options.findIndex(
      (v) => v !== opt && v.title === opt.title,
    );
    return fIdx !== -1 || opt.title.length === 0;
  };
  // onClickFunction
  const onClickAddOption = (e: React.MouseEvent<HTMLInputElement>) => {
    const newOption: ProjectModalPropOptModel = {
      title: '',
      selected: false,
    };
    if (edit) {
      newOption.id = 0;
      newOption.deleted = 0;
    }
    const temp = _.cloneDeep(item);
    temp.options = [...temp.options, newOption];
    onChangeItem(idx, temp);
  };

  // onChangFunction
  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(item);
    temp.title = e.target.value;
    onChangeItem(idx, temp);
  };
  const onChangeRequired = (e: React.ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(item);
    temp.required = e.target.checked ? 1 : 0;
    onChangeItem(idx, temp);
  };
  const onChangeSelect = (listItem: ListType) => {
    const temp = _.cloneDeep(item);
    temp.selectType = listItem.value as number;
    onChangeItem(idx, temp);
  };

  const onClickDeleteCancel = (e: React.MouseEvent<HTMLDivElement>) => {
    const temp = _.cloneDeep(item);
    // prop
    temp.deleted = 0;
    // options
    temp.options.forEach((_, oIdx) => {
      temp.options[oIdx].deleted = 0;
    });
    onChangeItem(idx, temp);
  };

  // handleFunction
  const handleDelete = (e: React.MouseEvent<HTMLInputElement>) => {
    onClickDelete(idx);
  };
  const handleChangeOption = (
    optionIdx: number,
    option: ProjectModalPropOptModel,
  ) => {
    const temp = _.cloneDeep(item);
    temp.options[optionIdx] = option;
    onChangeItem(idx, temp);
  };
  const handleDeleteOption = (optionIdx: number) => {
    const temp = _.cloneDeep(item);
    if (edit && temp.options[optionIdx].id) {
      temp.options[optionIdx].deleted = 1;
    } else {
      temp.options.splice(optionIdx, 1);
    }
    onChangeItem(idx, temp);
  };

  return (
    <ReactUtils.Switch>
      <ReactUtils.Case condition={item.deleted === 1 && item.id}>
        <ClassSettingListDeletedItem
          name={item.title}
          type='prop'
          onClickCancel={onClickDeleteCancel}
        />
      </ReactUtils.Case>
      <ReactUtils.Default>
        <div className={cx('props-list-item-container')}>
          <div className={cx('main-content')}>
            <div className={cx('index')}>
              <Sypo type='P1' weight='bold'>
                {idx + 1}
              </Sypo>
            </div>
            <div className={cx('prop-name')}>
              <InputText
                value={item.title}
                onChange={onChangeName}
                placeholder='Property Name'
                autoFocus
                customStyle={{
                  width: '200px',
                  height: '34px',
                  fontWeight: '400',
                  fontFamily: 'MarkerFont',
                  fontSize: '14px',
                  color: '#747474',
                }}
                rightIcon={duplicated ? WarningCircleIcon : ''}
                status={duplicated ? 'error' : ''}
              />
            </div>
            <div className={cx('select')}>
              <Selectbox
                placeholder='Single Selective'
                list={SelectOption}
                onChange={(item) => onChangeSelect(item)}
                selectedItemIdx={item.selectType}
                customStyle={{
                  selectboxForm: {
                    fontWeight: '400',
                    width: '200px',
                  },
                  globalForm: {
                    fontFamily: 'MarkerFont',
                    fontWeight: '400',
                    color: MONO205,
                  },
                }}
              />
            </div>
            <div className={cx('required')}>
              <div className={cx('label')}>
                <Sypo type='P2' weight='regular'>
                  {t(`component.switch.required`)}
                </Sypo>
              </div>
              <div className={cx('switch')}>
                <Switch
                  checked={item.required === 1}
                  onChange={onChangeRequired}
                />
              </div>
            </div>
            <div className={cx('icon')} onClick={handleDelete}>
              <img src={DeleteIcon} alt='deleteIcon' />
            </div>
          </div>
          <div className={cx('options')}>
            {item.options.map((v, idx) => (
              <React.Fragment key={`${v} ${idx}`}>
                <Option
                  idx={idx}
                  option={v}
                  duplicated={isDuplicated(v)}
                  onChangeOption={handleChangeOption}
                  onClickDelete={handleDeleteOption}
                />
              </React.Fragment>
            ))}
          </div>
          <div className={cx('add-option')} onClick={onClickAddOption}>
            <span className={cx('plus')}>
              <Sypo type='P2'>+</Sypo>
            </span>
            <span className={cx('label')}>
              <Sypo type='P2'>{t(`component.btn.addOption`)}</Sypo>
            </span>
          </div>
        </div>
      </ReactUtils.Default>
    </ReactUtils.Switch>
  );
};
ClassSettingPropsListItem.defaultProps = {
  edit: false,
};

export default ClassSettingPropsListItem;

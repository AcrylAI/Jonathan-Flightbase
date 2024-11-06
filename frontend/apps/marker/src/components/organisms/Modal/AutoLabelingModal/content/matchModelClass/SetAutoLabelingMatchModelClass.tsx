import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { Case, Default, Switch } from '@jonathan/react-utils';

import SetAutoLabelModalAtom, {
  MatchClassModel,
  RegisteredClassModel,
  SetAutoLabelModalAtomModel,
} from '@src/stores/components/Modal/SetAutoLabelModalAtom';

import { Sypo } from '@src/components/atoms';
import SetAutolabelingListContainer from '../listContainer/SetAutolabelingListContainer';
import AutoLabelingListItem from '../listItem/AutoLabelingListItem';

import { BLUE104, BLUE110, CLASS_COLOR_SET } from '@src/utils/color';

import styles from './SetAutoLabelingMatchModelClass.module.scss';
import classNames from 'classnames/bind';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type Props = {
  name: string;
  color: string;
  selected: boolean;
  create?: boolean;
  tool: 1 | 2; // 1 bBox 2 polygon
};
const ListItem = ({ name, color, tool, selected, create }: Props) => {
  const { t } = useT();
  return (
    <div className={cx('list-item-container')}>
      <div className={cx('left-side')}>
        <AutoLabelingListItem.ColorChip color={color} />
        <AutoLabelingListItem.Tool size='sm' selected={selected} type={tool} />
        <div className={cx('title')}>
          {create && (
            <span style={{ marginRight: '8px' }}>
              <Sypo type='P1' weight='R' color={BLUE104}>
                {t(`modal.setAutolabeling.createClass`)}
              </Sypo>
            </span>
          )}
          <Sypo
            type='P1'
            weight='R'
            color={selected || create ? BLUE104 : BLUE110}
          >
            {create ? `"${name}"` : name}
          </Sypo>
        </div>
        <div className={cx('right-side')}></div>
      </div>
    </div>
  );
};
ListItem.defaultProps = {
  create: false,
};

const SetAutoLabelingMatchModelClass = () => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<SetAutoLabelModalAtomModel>(SetAutoLabelModalAtom);
  const [filteredList, setFilteredList] = useState<Array<RegisteredClassModel>>(
    [],
  );
  const [checkedList, setCheckedList] = useState<Array<string>>([]);
  const [createdName, setCreatedName] = useState<string>('');
  const checkSelected = (name: string, tool: number) => {
    return (
      modalState.selectedModel !== 0 &&
      name === modalState.selectedMatchClass &&
      tool === getCurTool()
    );
  };
  const matchValidation = () => {
    const { selectedModel, selectedModelClass, selectedMatchClass } =
      modalState;
    if (selectedModel && selectedModelClass.length > 0 && selectedMatchClass)
      return true;
    return false;
  };
  const getCurTool = () => {
    const { selectedModel } = modalState;
    const fIdx = modalState.autolabelingList.findIndex(
      (v) => v.id === selectedModel,
    );
    if (fIdx !== -1) return modalState.autolabelingList[fIdx].type;
    return 1;
  };
  const getClassColor = (): { color: string; empty: boolean } => {
    // TODO
    let color: string = '#fff';
    let empty: boolean = true;
    if (modalState.selectedModel) {
      const usedColorSet: Array<string> = [];
      modalState.registeredClass.forEach((v) => usedColorSet.push(v.color));
      const unusedColorSet = CLASS_COLOR_SET.filter((v) => {
        if (usedColorSet.includes(v)) return false;
        return true;
      });
      if (unusedColorSet.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        color = unusedColorSet[0];
        empty = false;
      } else {
        color = CLASS_COLOR_SET[modalState.colorCounter];
        empty = true;
      }
    }
    return { color, empty };
  };

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(modalState);
    temp.matchClassSearch = e.target.value;
    setModalState(temp);
  };
  const onClickList = (name: string) => {
    const temp = _.cloneDeep(modalState);
    temp.selectedMatchClass = name;
    setModalState(temp);
  };
  const handleCreate = (name: string) => {
    const modelIdx = modalState.autolabelingList.findIndex(
      (v) => v.id === modalState.selectedModel,
    );

    const colorData = getClassColor();
    if (modelIdx > -1) {
      const classData: RegisteredClassModel = {
        id: 0,
        name,
        color: colorData.color,
        tool: getCurTool(),
      };
      const temp = _.cloneDeep(modalState);
      temp.selectedMatchClass = name;
      temp.registeredClass.push(classData);
      // 컬러 카운트 변경
      if (colorData.empty) {
        if (temp.colorCounter > 0) {
          temp.colorCounter -= 1;
        } else {
          temp.colorCounter = CLASS_COLOR_SET.length - 1;
        }
      }

      setModalState(temp);
    }
  };
  const onClickMatch = () => {
    const { selectedModel, selectedMatchClass, selectedModelClass } =
      modalState;

    const modelIdx = modalState.autolabelingList.findIndex(
      (v) => v.id === selectedModel,
    );
    const classIdx = modalState.registeredClass.findIndex(
      (v) => v.name === selectedMatchClass && v.tool === getCurTool(),
    );

    if (modelIdx !== -1 && classIdx !== -1) {
      const dupIdx = modalState.matchClassList.findIndex(
        (v) =>
          v.className === modalState.registeredClass[classIdx].name &&
          v.tool === modalState.registeredClass[classIdx].tool,
      );
      const temp = _.cloneDeep(modalState);
      if (dupIdx === -1) {
        // 새로 생성
        const model = modalState.autolabelingList[modelIdx];
        const projectClass = modalState.registeredClass[classIdx];
        const deployName = model.deploymentName;
        const matchClass: MatchClassModel = {
          tool: model.type,
          modelName: model.modelName,
          modelId: model.id,
          color: projectClass.color,
          classId: projectClass.id,
          className: projectClass.name,
          modelClassName: selectedModelClass,
          deployName,
        };
        temp.matchClassList.unshift(matchClass);
      } else {
        selectedModelClass.forEach((v) => {
          temp.matchClassList[dupIdx].modelClassName.push(v);
        });
      }

      // 초기화
      temp.selectedModelClass = [];
      temp.selectedMatchClass = '';
      temp.modelClassSearch = '';
      setModalState(temp);
    }
  };
  const createPostFix = (name: string, list: Array<RegisteredClassModel>) => {
    // 아스키 코드로 처리
    let result = 65; // capital A
    let PostFix = 'A';
    list.forEach((v) => {
      if (
        v.name === `${name}-${String.fromCharCode(result)}` ||
        v.name ===
          `${name}-${String.fromCharCode(result)}${String.fromCharCode(result)}`
      )
        result += 1;
    });
    if (result > 90) {
      // Over Z
      PostFix = `${String.fromCharCode(result - 26)}${String.fromCharCode(
        result - 26,
      )}`;
    } else {
      PostFix = String.fromCharCode(result);
    }
    return PostFix;
  };

  const setNewClassName = (list: Array<RegisteredClassModel>) => {
    // set created Class Name
    if (modalState.matchClassList) {
      const dupIdx = list.findIndex(
        (v) => v.name === modalState.matchClassSearch,
      );
      if (dupIdx > -1) {
        const postFix = createPostFix(list[dupIdx].name, list);
        setCreatedName(`${list[dupIdx].name}-${postFix}`);
      } else {
        setCreatedName(modalState.matchClassSearch);
      }
    }
  };

  const handleFilter = () => {
    let list = _.cloneDeep(modalState.registeredClass);

    // tool filter
    const modelIdx = modalState.autolabelingList.findIndex(
      (v) => v.id === modalState.selectedModel,
    );
    if (modelIdx > -1) {
      list = modalState.registeredClass.filter(
        (v) => v.tool === modalState.autolabelingList[modelIdx].type,
      );
    }

    // search filter
    if (modalState.matchClassSearch) {
      // filter
      list = list.filter((v) => v.name.includes(modalState.matchClassSearch));
      setNewClassName(list);
    }

    // sort
    list.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    setFilteredList(list);
  };
  const handleCheckedFilter = () => {
    const registeredList: Array<string> = [];
    modalState.registeredClass.forEach((v) => {
      if (v.tool === getCurTool()) {
        registeredList.push(v.name);
      }
    });

    const filteredCheckedList: Array<string> = [];
    modalState.selectedModelClass.forEach((v) => {
      if (!registeredList.includes(v)) filteredCheckedList.push(v);
    });

    const searchFilteredList = filteredCheckedList.filter(
      (v) => v !== modalState.matchClassSearch,
    );

    setCheckedList(searchFilteredList);
  };

  useEffect(() => {
    handleFilter();
  }, [
    modalState.modelClassList,
    modalState.matchClassSearch,
    modalState.registeredClass,
  ]);
  useEffect(() => {
    handleCheckedFilter();
    // test
    getClassColor();
  }, [modalState.selectedModelClass, modalState.matchClassSearch]);

  return (
    <SetAutolabelingListContainer
      title={`${t(`modal.setAutolabeling.registeredClasses`)}`}
      search
      disabledSearchIcon
      searchDisabled={modalState.selectedModel === 0}
      searchValue={modalState.matchClassSearch}
      onChangeSearch={onChangeSearch}
      nodataDesc={
        !modalState.isLoading &&
        checkedList.length === 0 &&
        modalState.registeredClass.length === 0 &&
        !modalState.matchClassSearch
          ? `${t(`modal.setAutolabeling.noRegisteredClasses`)}`
          : ''
      }
      onClickButton={onClickMatch}
      buttonDisabled={!matchValidation()}
      placeholder={`${t(`modal.setAutolabeling.searchCreateClass`)}`}
      buttonTitle={`${t(`modal.setAutolabeling.matchBtn`)}`}
    >
      <Switch>
        {/* no data */}
        <Case
          condition={
            filteredList.length === 0 &&
            checkedList.length === 0 &&
            !modalState.matchClassSearch
          }
        ></Case>
        {/* create */}
        <Default>
          {filteredList.map((v, idx) => (
            <AutoLabelingListItem.Container
              key={`match-list-item ${idx}`}
              onClick={() => onClickList(v.name)}
              selected={checkSelected(v.name, v.tool)}
              customStyle={
                !modalState.selectedModel ? { cursor: 'default' } : {}
              }
              leftSide={
                <ListItem
                  selected={checkSelected(v.name, v.tool)}
                  name={v.name}
                  tool={v.tool as 1 | 2}
                  color={v.color}
                />
              }
            />
          ))}
          {/* 검색 시 클래스 생성 */}
          {modalState.matchClassSearch !== '' &&
            modalState.selectedModel > 0 && (
              <AutoLabelingListItem.Container
                onClick={() => handleCreate(createdName)}
                create
                selected
                leftSide={
                  <ListItem
                    selected
                    name={createdName}
                    tool={getCurTool()}
                    color={getClassColor().color}
                    create
                  />
                }
              />
            )}
          {/* 체크시 클래스 생성 */}
          {checkedList.map((v, idx) => (
            <AutoLabelingListItem.Container
              key={`check-created-list ${idx}`}
              onClick={() => handleCreate(v)}
              create
              selected
              leftSide={
                <ListItem
                  selected
                  name={v}
                  tool={getCurTool()}
                  color={getClassColor().color}
                  create
                />
              }
            />
          ))}
        </Default>
      </Switch>
    </SetAutolabelingListContainer>
  );
};

export default SetAutoLabelingMatchModelClass;

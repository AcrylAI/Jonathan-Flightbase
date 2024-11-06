import {
  ProjectModalPropModel,
  ProjectModalClassItemModel,
  ProjectModalPropOptModel,
} from '@src/stores/components/Modal/ProjectModalAtom';
import {
  ClassContentsPropModel,
  ClassContentsClassModel,
} from '@src/stores/components/pageContents/ClassPageContents/ClassPageContentsAtom';
import {
  CreateNewProjectClassModel,
  CreateNewProjectClassPropsModel,
  CreateNewProjectClassPropsOptModel,
} from './../../../../ProjectModal/hooks/useCreateNewProject';
const bindRespOptionData = (
  propData: ProjectModalPropModel,
): Array<CreateNewProjectClassPropsOptModel> => {
  const options: Array<CreateNewProjectClassPropsOptModel> = [];

  propData.options.forEach((v) => {
    const option: CreateNewProjectClassPropsOptModel = {
      id: v.id,
      deleted: v.deleted,
      name: v.title,
    };
    options.push(option);
  });

  return options;
};

const bindRespPropData = (
  classData: ProjectModalClassItemModel,
): Array<CreateNewProjectClassPropsModel> => {
  const props: Array<CreateNewProjectClassPropsModel> = [];
  classData.props.forEach((v) => {
    const options = bindRespOptionData(v);
    const prop: CreateNewProjectClassPropsModel = {
      id: v.id,
      deleted: v.deleted,
      name: v.title,
      type: v.selectType,
      required: v.required,
      options,
    };
    props.push(prop);
  });

  return props;
};

const bindRespClassData = (
  classes: Array<ProjectModalClassItemModel>,
): Array<CreateNewProjectClassModel> => {
  const classList: Array<CreateNewProjectClassModel> = [];
  classes.forEach((v) => {
    const property = bindRespPropData(v);
    const classData: CreateNewProjectClassModel = {
      id: v.id,
      deleted: v.deleted,
      name: v.name,
      color: v.color,
      tool: v.tool,
      property,
    };
    classList.push(classData);
  });
  return classList;
};

// 221028 - demian
// 당시에 API 가 나오기 전에 미리 자료형을 정하고 작업을 시작하였기에 bind 로직이 필요함
// 추후에 시간이 될때 리팩토링 예정 ( 프로젝트 생성 모달까지 2개 진행하여야함 )
const bindReqOptionData = (
  prop: ClassContentsPropModel,
): Array<ProjectModalPropOptModel> => {
  const result: Array<ProjectModalPropOptModel> = [];
  prop.options.forEach((v) => {
    const option: ProjectModalPropOptModel = {
      id: v.id,
      deleted: 0,
      selected: false,
      title: v.name,
    };
    result.push(option);
  });
  return result;
};

const bindReqPropData = (
  classItem: ClassContentsClassModel,
): Array<ProjectModalPropModel> => {
  const result: Array<ProjectModalPropModel> = [];
  classItem.property.forEach((v) => {
    const prop: ProjectModalPropModel = {
      id: v.id,
      title: v.name,
      deleted: 0,
      selectType: v.type,
      required: v.required,
      options: bindReqOptionData(v),
    };

    result.push(prop);
  });
  return result;
};

const bindReqClassData = (
  classDataList: Array<ClassContentsClassModel>,
): Array<ProjectModalClassItemModel> => {
  const result: Array<ProjectModalClassItemModel> = [];
  classDataList.forEach((v) => {
    const classData: ProjectModalClassItemModel = {
      id: v.id,
      deleted: 0,
      color: v.color,
      name: v.name,
      tool: v.tool,
      props: bindReqPropData(v),
    };

    result.push(classData);
  });

  return result;
};

const checkDuplicated = (
  classDataList: Array<ProjectModalClassItemModel>,
): boolean => {
  // 3 depth -> 3단 반복문
  // forEach는 try catch로 에러처리
  // 언젠가 보기 좋게 리펙토리 예정
  try {
    classDataList.forEach((c) => {
      // 서로의 객체가 같지 않은 것중에 이름이 같고 툴이 같은것
      const cIdx = classDataList.findIndex(
        (v) => v !== c && v.name.trim() === c.name.trim() && v.tool === c.tool,
      );
      if (cIdx !== -1) throw new Error('duplicated');
      // 이름이 비어있는 것
      if (c.name.length === 0 && !c.deleted) throw new Error('no title');

      c.props.forEach((p) => {
        const pIdx = c.props.findIndex(
          (v) => v !== p && v.title.trim() === p.title.trim(),
        );
        if (pIdx !== -1) throw new Error('duplicated');
        if (p.title.length === 0 && !p.deleted) throw new Error('no title');
        p.options.forEach((o) => {
          const oIdx = p.options.findIndex(
            (v) => v !== o && v.title.trim() === o.title.trim(),
          );
          if (oIdx !== -1) throw new Error('duplicated');
          if (o.title.length === 0 && !o.deleted) throw new Error('no title');
        });
      });
    });
  } catch (error) {
    return true;
  }

  return false;
};

export const ClassSettingFunctions = {
  checkDuplicated,
  bindRespClassData,
  bindReqClassData,
};

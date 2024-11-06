import styles from './ClassSettingPropertyList.module.scss';
import classNames from 'classnames/bind';
import ClassSettingContainer, {
  ClassSettingContainerProps,
} from '../Container/ClassSettingContainer';
import { ProjectModalPropModel } from '@src/stores/components/Modal/ProjectModalAtom';
import { Switch, Case, Default } from '@jonathan/react-utils';
import ClassSettingPropsList from './ClassSettingPropsList/ClassSettingPropsList';
import _ from 'lodash';
import ClassSettingNodata from '../Nodata/ClassSettingNodata';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type ClassSettingPropertyListProps = {
  list: Array<ProjectModalPropModel>;
  edit?: boolean;
  disabled?: boolean;
  className: string;
  onClickAdd: () => void;
  onChangeList: (list: Array<ProjectModalPropModel>) => void;
};
const ClassSettingPropertyList = ({
  list,
  edit,
  disabled,
  className,
  onClickAdd,
  onChangeList,
}: ClassSettingPropertyListProps) => {
  const { t } = useT();
  const ClassContainerData: ClassSettingContainerProps = {
    title: `${t(`modal.newProject.property`)}`,
    buttonTitle: `${t(`component.btn.addProperty`)}`,
    onClick: () => {},
    disabled: false,
  };
  const handleChangeList = (props: Array<ProjectModalPropModel>) => {
    onChangeList(props);
  };

  return (
    <ClassSettingContainer
      {...ClassContainerData}
      onClick={onClickAdd}
      subTitle
      className={className}
      disabled={disabled}
    >
      <Switch>
        <Case condition={list.length > 0}>
          <ClassSettingPropsList
            list={list}
            edit={edit}
            onChangePropsList={handleChangeList}
          />
        </Case>
        <Default>
          <ClassSettingNodata
            desc={`${t(`modal.editClasses.emptyProperties`)}`}
          />
        </Default>
      </Switch>
    </ClassSettingContainer>
  );
};

ClassSettingPropertyList.defaultProps = {
  edit: false,
  disabled: false,
};

export default ClassSettingPropertyList;

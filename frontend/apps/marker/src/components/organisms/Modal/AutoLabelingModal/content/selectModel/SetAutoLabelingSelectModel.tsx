import { useRecoilState } from 'recoil';
import _ from 'lodash';

import SetAutoLabelModalAtom, {
  SetAutoLabelModalAtomModel,
} from '@src/stores/components/Modal/SetAutoLabelModalAtom';

import { Sypo } from '@src/components/atoms';
import usePostAutoLabelModelClass from '../../hooks/usePostAutoLabelModelClass';
import SetAutolabelingListContainer from '../listContainer/SetAutolabelingListContainer';
import AutoLabelingListItem from '../listItem/AutoLabelingListItem';

import { BLUE104, BLUE110, MONO205 } from '@src/utils/color';

import styles from './SetAutoLabelingSelectModel.module.scss';
import classNames from 'classnames/bind';
import { useEffect } from 'react';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type LabelProps = {
  model: string;
  deploy: string;
  selected: boolean;
};
const Label = ({ model, deploy, selected }: LabelProps) => {
  return (
    <div className={cx('label-container')}>
      <Sypo type='P2' color={selected ? BLUE104 : MONO205} weight='R'>
        <div className={cx('model')}>{model}</div>
      </Sypo>
      <Sypo type='P1' weight='R' color={selected ? BLUE104 : BLUE110}>
        <div className={cx('deploy')}>{deploy}</div>
      </Sypo>
    </div>
  );
};

const SetAutoLabelingSelectModel = () => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<SetAutoLabelModalAtomModel>(SetAutoLabelModalAtom);
  const classMutation = usePostAutoLabelModelClass();
  const onClickList = async (id: number) => {
    if (!classMutation.isLoading) {
      const temp = _.cloneDeep(modalState);
      temp.selectedModel = id;
      setModalState(temp);
    }
  };
  const checkSelected = (id: number): boolean => {
    return id === modalState.selectedModel;
  };
  const handleSetModelClasses = async () => {
    if (modalState.selectedModel) {
      const temp = _.cloneDeep(modalState);

      // get classList in model
      const resp = await classMutation.mutateAsync({
        modelId: modalState.selectedModel,
      });
      if (resp.status) {
        temp.modelClassList = resp.result.modelClassList;
        temp.selectedModelClass = [];
        temp.selectedMatchClass = '';
        temp.matchClassSearch = '';
        temp.modelClassSearch = '';
      }
      setModalState(temp);
    }
  };
  useEffect(() => {
    handleSetModelClasses();
  }, [modalState.selectedModel]);
  return (
    <SetAutolabelingListContainer
      loading={modalState.isLoading}
      title={`${t(`modal.setAutolabeling.selectModel`)}`}
      nodataDesc={
        !modalState.isLoading && modalState.autolabelingList.length === 0
          ? `${t(`modal.setAutolabeling.noModel`)}`
          : ''
      }
      skeletonCount={10}
    >
      <>
        {modalState.autolabelingList.map((v, idx) => (
          <AutoLabelingListItem.Container
            key={`select-model-list-item ${idx}`}
            disabled={!v.active}
            isLoading={classMutation.isLoading}
            selected={checkSelected(v.id)}
            onClick={() => onClickList(v.id)}
            leftSide={
              <Label
                selected={checkSelected(v.id)}
                model={v.modelName}
                deploy={v.deploymentName}
              />
            }
            rightSide={
              <AutoLabelingListItem.Tool
                selected={checkSelected(v.id)}
                type={v.type}
              />
            }
          />
        ))}
      </>
    </SetAutolabelingListContainer>
  );
};

export default SetAutoLabelingSelectModel;

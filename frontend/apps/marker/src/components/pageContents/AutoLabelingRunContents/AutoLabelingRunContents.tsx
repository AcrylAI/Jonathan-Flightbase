import { useRecoilValue } from 'recoil';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { AutoLabelingRunPageAtom } from '@src/stores/components/pageContents/AutoLabelingRunPageAtom';

import type { AutoLabelingRunResModel } from '@src/pages/AutoLabelingRunPage/hooks/useFetchAutolabelingList';

import { Sypo } from '@src/components/atoms';

import { PageHeader } from '@src/components/molecules';

import useT from '@src/hooks/Locale/useT';

import AppendCard from './AppendCard/AppendCard';
import ClosedContents from './ClosedContents/ClosedContents';
import EmptyCase from './EmptyCase/EmptyCase';
import FailedContents from './FailedContents/FailedContents';
import ModelContents from './ModelContents/ModelContents';
import ProgressContents from './ProgressContents/ProgressContents';
import AppendCardSkeleton from './Skeleton/AppendCardSkeleton/AppendCardSkeleton';
import ListSkeleton from './Skeleton/ListSkeleton/ListSkeleton';

import style from './AutoLabelingRunContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  isProjectOwner: boolean;
  isAutoLabeling: boolean;
  windowSize: {
    width: number;
  };
  onClickRunAutoLabeling: () => void;
  onClickStopAutolabeling: (rowData: AutoLabelingRunResModel) => void;
  handleGraphAppend: (id: number) => void;
};

function AutoLabelingRunContents({
  isProjectOwner,
  isAutoLabeling,
  windowSize,
  onClickRunAutoLabeling,
  onClickStopAutolabeling,
  handleGraphAppend,
}: Props) {
  const { t } = useT();
  const autoLabelingRunPageAtom =
    useRecoilValue<AutoLabelingRunPageAtom.AutoLabelingRunPageAtomModel>(
      AutoLabelingRunPageAtom.autoLabelingRunPageAtom,
    );

  return (
    <div className={cx('autolabeler-container')}>
      <PageHeader
        rightSection='button'
        color='blue'
        buttonText={t(`component.btn.runAutolabeling`)}
        onClickAction={onClickRunAutoLabeling}
        projectTitle
        projectTitleValue={autoLabelingRunPageAtom.projectMetaData.name}
        pageTitle={t('page.runAutolabeling.autoLabelingRunHeader')}
        btnLoading={isAutoLabeling}
        leftSection='spinner'
        loading={autoLabelingRunPageAtom.loading.list}
        btnDisabled={
          !isProjectOwner ||
          autoLabelingRunPageAtom.projectMetaData.autoSetting === 0
        }
      />
      <Switch>
        <Case
          condition={
            // list가 로딩일때,
            // classList fetch가 로딩이 아닐때,
            // classList가 있을때
            autoLabelingRunPageAtom.isClassList &&
            !autoLabelingRunPageAtom.loading.classList &&
            autoLabelingRunPageAtom.loading.list
          }
        >
          <ListSkeleton />
        </Case>
        <Case
          condition={
            !autoLabelingRunPageAtom.loading.list &&
            autoLabelingRunPageAtom.autoLabelingRunList.length > 0
          }
        >
          <div className={cx('contents')}>
            {autoLabelingRunPageAtom.autoLabelingRunList.map(
              (autoLabeling: AutoLabelingRunResModel, index: number) => {
                const { id, model, status, count } = autoLabeling;
                const modelId = String(id);

                return (
                  <div className={cx('list-container')} key={`${id}-${index}`}>
                    <div className={cx('list')} key={`${modelId}-${index}`}>
                      {status === 3 && <div className={cx('red-mark')}></div>}
                      <div className={cx('item-container')}>
                        <div className={cx('count')}>
                          {windowSize.width >= 932 ? (
                            <Sypo type='H2' weight={700}>
                              {count}
                            </Sypo>
                          ) : (
                            <Sypo type='H4' weight={700}>
                              {count}
                            </Sypo>
                          )}
                        </div>
                        <div className={cx('subjects')}>
                          <ModelContents model={model} deleted={0} />
                        </div>
                        <Switch>
                          <Case condition={status === 0}>
                            <></>
                          </Case>
                          <Case condition={status === 1}>
                            <div className={cx('information', 'progress')}>
                              <ProgressContents
                                index={index}
                                isProjectOwner={isProjectOwner}
                                onClickStopAutolabeling={() => {
                                  onClickStopAutolabeling(autoLabeling);
                                }}
                              />
                            </div>
                          </Case>
                          <Case condition={status === 2}>
                            <div className={cx('information', 'closed')}>
                              <ClosedContents
                                index={index}
                                handleGraphAppend={handleGraphAppend}
                              />
                            </div>
                          </Case>
                          <Case condition={status === 3}>
                            <div className={cx('information')}>
                              <FailedContents />
                            </div>
                          </Case>
                          <Default>
                            <></>
                          </Default>
                        </Switch>
                      </div>
                    </div>
                    <Switch>
                      <Case
                        condition={
                          status === 2 &&
                          autoLabelingRunPageAtom.loading.graph.has(id)
                        }
                      >
                        <AppendCardSkeleton windowSize={windowSize} />
                      </Case>
                      <Case
                        condition={
                          status === 2 &&
                          autoLabelingRunPageAtom.listAppendIdx.has(id)
                        }
                      >
                        <AppendCard
                          index={index}
                          modelId={modelId}
                          windowSize={windowSize}
                        />
                      </Case>
                      <Default>
                        <></>
                      </Default>
                    </Switch>
                  </div>
                );
              },
            )}
          </div>
        </Case>
        <Case
          condition={
            !autoLabelingRunPageAtom.loading.list &&
            autoLabelingRunPageAtom.autoLabelingRunList.length === 0
          }
        >
          <EmptyCase />
        </Case>
        <Default>
          <></>
        </Default>
      </Switch>
    </div>
  );
}

export default AutoLabelingRunContents;

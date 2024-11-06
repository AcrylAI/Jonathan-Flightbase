import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  ProjectMembersContentsAtom,
  ProjectMembersContentsAtomModel,
} from '@src/stores/components/pageContents/ProjectMembersContentsAtom/ProjectMembersContentsAtom';

import { CardBox, Sypo } from '@src/components/atoms';
import ToggleButton from '@src/components/atoms/ToggleButton';

import MultiBarLineChart from '@src/components/pageContents/ProjectMembersContents/MultiBarLineChart';

// i18n
import useT from '@src/hooks/Locale/useT';

import { DataResultTypes } from './MemberProgressBox';

import {
  ApprovedBadge,
  LabelingProgress,
  LabelingReject,
  LabelingRejected,
  NeedBadge,
  PendingBadge,
  RejectedBadge,
  ReviewProgress,
} from '@src/static/images';

import styles from './MemberProgressBox.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

// export type LabelingDataTypes = {
//   finish: number;
//   labelingDenominator: number;
//   labelingNumerator: number;
//   reject: number;
//   rejectDenominator: number;
//   rejectNumerator: number;
//   wait: number;
//   work: number;
// };

// export type ReviewDataTypes = {
//   checkDenominator: number;
//   checkNumerator: number;
//   finish: number;
//   reject: number;
//   rejectDenominator: number;
//   rejectNumerator: number;
//   work: number;
// };

type Props = {
  data: DataResultTypes;
  noReviewProject: boolean;
  reviewBlindState: boolean;
  labelingBlindState: boolean;
};

const MemberProgressBoxContents = ({
  data,
  noReviewProject,
  reviewBlindState,
  labelingBlindState,
}: Props) => {
  const { t } = useT();
  const labelingData = data.labeling;
  const reviewData = data.review;

  const [pageState, setPageState] =
    useRecoilState<ProjectMembersContentsAtomModel>(ProjectMembersContentsAtom);

  const calcProgress = (denominator: number, numerator: number) => {
    let progress: number = 0;

    if (denominator !== undefined && numerator !== undefined) {
      const a: number = numerator;
      const b: number = denominator;
      if (b === 0) return 0;

      progress = Math.round((a / b) * 100);
      if (progress > 100) return 100;
      return progress;
    }

    return 0;
  };

  const onClickGraphDate = (date: 'daily' | 'monthly') => {
    if (pageState.membersGraph.date === date) return;

    const newState = _.cloneDeep(pageState);
    newState.membersGraph.date = date;
    setPageState(newState);
  };

  return (
    <div className={cx('container')}>
      <Switch>
        <Case condition={noReviewProject}>
          <div className={cx('only-labeling-section')}>
            <p className={cx('section-title')}>
              <Sypo type='P1' weight={400}>
                {t(`component.badge.labeling`)}
              </Sypo>
            </p>
            <div className={cx('labeling-contents-section')}>
              <div className={cx('stick-graph-section')}>
                <CardBox
                  height='100%'
                  border='0.5px solid #DEE9FF;'
                  borderRadius={4}
                  flexDirection='row'
                  justifyContent='space-around'
                  boxShadow='0px 3px 12px rgba(45, 118, 248, 0.06)'
                  cursor='default'
                >
                  <div className={cx('inner-section', 'only-labeling')}>
                    <div className={cx('section-title-wrapper')}>
                      <img src={LabelingProgress} alt='' />
                      <p>
                        <Sypo type='P1' weight={400}>
                          {t(`page.dashboardMyWork.labelingProgress`)}
                        </Sypo>
                      </p>
                    </div>
                    <div className={cx('stick-graph-wrapper')}>
                      <p className={cx('graph-text')}>
                        <Sypo type='P2' weight={400}>
                          {calcProgress(
                            labelingData?.labelingDenominator,
                            labelingData?.labelingNumerator,
                          )}
                          %
                        </Sypo>
                      </p>
                      <div className={cx('graph-total')}>
                        <div
                          className={cx('graph-inner', 'color-blue')}
                          style={{
                            width: `${calcProgress(
                              labelingData?.labelingDenominator,
                              labelingData?.labelingNumerator,
                            )}%`,
                            transition: 'width 0.4s linear',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardBox>
              </div>
              <CardBox
                height='100%'
                border='0.5px solid #DEE9FF;'
                borderRadius={4}
                flexDirection='row'
                justifyContent='space-around'
                boxShadow='0px 3px 12px rgba(45, 118, 248, 0.06)'
                cursor='default'
              >
                <div className={cx('only-labeling-card-contents')}>
                  <div className={cx('labeling-to-do')}>
                    <img src={NeedBadge} alt='' />
                    <div className={cx('data-wrapper')}>
                      <p className={cx('data-title')}>
                        <Sypo type='P1' weight={400}>
                          {t(`page.projectMembers.assignedLabeling`)}
                        </Sypo>
                      </p>
                      <p className={cx('data-value')}>
                        <Sypo type='H4' weight={500}>
                          {labelingData?.work.toLocaleString() ?? 0}
                        </Sypo>
                      </p>
                    </div>
                  </div>
                  <div className={cx('labeling-completed')}>
                    <img src={ApprovedBadge} alt='' />
                    <div className={cx('data-wrapper')}>
                      <p className={cx('data-title')}>
                        <Sypo type='P1' weight={400}>
                          {t(`page.dashboardMyWork.completedLabeling`)}
                        </Sypo>
                      </p>
                      <p className={cx('data-value')}>
                        <Sypo type='H4' weight={500}>
                          {labelingData?.finish.toLocaleString() ?? 0}
                        </Sypo>
                      </p>
                    </div>
                  </div>
                </div>
              </CardBox>
            </div>
          </div>
        </Case>
        <Default>
          <div className={cx('labeling-review-wrapper')}>
            <div className={cx('section')}>
              <p className={cx('section-title')}>
                <Sypo type='P1' weight={400}>
                  {t(`component.badge.labeling`)}
                </Sypo>
              </p>
              <div className={cx('contents-section')}>
                <div className={cx('stick-graph-section')}>
                  <CardBox
                    height='120px'
                    border='0.5px solid #DEE9FF;'
                    borderRadius={4}
                    flexDirection='row'
                    justifyContent='space-around'
                    padding='20px 20px 24px 20px'
                    boxShadow='0px 3px 12px rgba(45, 118, 248, 0.06)'
                    cursor='default'
                  >
                    <div className={cx('inner-section', 'left-section')}>
                      <div className={cx('section-title-wrapper')}>
                        <img src={LabelingProgress} alt='' />
                        <p>
                          <Sypo type='P1' weight={400}>
                            {t(`page.dashboardMyWork.labelingProgress`)}
                          </Sypo>
                        </p>
                      </div>
                      <div className={cx('stick-graph-wrapper')}>
                        <p className={cx('graph-text')}>
                          <Sypo type='P2' weight={400}>
                            {calcProgress(
                              labelingData?.labelingDenominator,
                              labelingData?.labelingNumerator,
                            )}
                            %
                          </Sypo>
                        </p>
                        <div className={cx('graph-total')}>
                          <div
                            className={cx('graph-inner', 'color-blue')}
                            style={{
                              width: `${calcProgress(
                                labelingData?.labelingDenominator,
                                labelingData?.labelingNumerator,
                              )}%`,
                              transition: 'width 0.4s linear',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className={cx('inner-section')}>
                      <div className={cx('section-title-wrapper')}>
                        <img src={LabelingRejected} alt='' />
                        <p>
                          <Sypo type='P1' weight={400}>
                            {t(`page.dashboardMyWork.rejectedLabeling`)}
                          </Sypo>
                        </p>
                      </div>
                      <div className={cx('stick-graph-wrapper')}>
                        <p className={cx('graph-text')}>
                          <Sypo type='P2' weight={400}>
                            {calcProgress(
                              labelingData?.rejectDenominator,
                              labelingData?.rejectNumerator,
                            )}
                            %
                          </Sypo>
                        </p>
                        <div className={cx('graph-total')}>
                          <div
                            className={cx('graph-inner', 'color-red')}
                            style={{
                              width: `${calcProgress(
                                labelingData?.rejectDenominator,
                                labelingData?.rejectNumerator,
                              )}%`,
                              transition: 'width 0.4s linear',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardBox>
                </div>
                <CardBox
                  border='0.5px solid #DEE9FF;'
                  borderRadius={4}
                  flexDirection='row'
                  justifyContent='space-around'
                  boxShadow='0px 3px 12px rgba(45, 118, 248, 0.06)'
                  cursor='default'
                >
                  <div className={cx('labeling-card-contents')}>
                    <div className={cx('item-to-do')}>
                      <img src={NeedBadge} alt='' />
                      <div className={cx('data-wrapper')}>
                        <p className={cx('data-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.projectMembers.assignedLabeling`)}
                          </Sypo>
                        </p>
                        <p className={cx('data-value')}>
                          <Sypo type='H4' weight={500}>
                            {labelingData?.work.toLocaleString() ?? 0}
                          </Sypo>
                        </p>
                      </div>
                    </div>
                    <div className={cx('item-pending')}>
                      <img src={PendingBadge} alt='' />
                      <div className={cx('data-wrapper')}>
                        <p className={cx('data-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.dashboardMyWork.pendingReview`)}
                          </Sypo>
                        </p>
                        <p className={cx('data-value')}>
                          <Sypo type='H4' weight={500}>
                            {labelingData?.wait.toLocaleString() ?? 0}
                          </Sypo>
                        </p>
                      </div>
                    </div>
                    <div className={cx('item-rejected')}>
                      <img src={RejectedBadge} alt='' />
                      <div className={cx('data-wrapper')}>
                        <p className={cx('data-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.dashboardMyWork.rejected`)}
                          </Sypo>
                        </p>
                        <p className={cx('data-value')}>
                          <Sypo type='H4' weight={500}>
                            {labelingData?.reject.toLocaleString() ?? 0}
                          </Sypo>
                        </p>
                      </div>
                    </div>
                    <div className={cx('item-completed')}>
                      <img src={ApprovedBadge} alt='' />
                      <div className={cx('data-wrapper')}>
                        <p className={cx('data-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.dashboardMyWork.completedLabeling`)}
                          </Sypo>
                        </p>
                        <p className={cx('data-value')}>
                          <Sypo type='H4' weight={500}>
                            {labelingData?.finish.toLocaleString() ?? 0}
                          </Sypo>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBox>
                {labelingBlindState && (
                  <>
                    <div className={cx('blind-background')}></div>
                    <div className={cx('blind-text')}>
                      <Sypo type='P1'>
                        <p>{t(`page.dashboardMyWork.noLabeling`)}</p>
                      </Sypo>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className={cx('section')}>
              <p className={cx('section-title')}>
                <Sypo type='P1' weight={400}>
                  {t(`component.badge.review`)}
                </Sypo>
              </p>
              <div className={cx('contents-section')}>
                <div className={cx('stick-graph-section')}>
                  <CardBox
                    height='120px'
                    border='0.5px solid #DEE9FF;'
                    borderRadius={4}
                    flexDirection='row'
                    justifyContent='space-around'
                    padding='20px 20px 24px 20px'
                    boxShadow='0px 3px 12px rgba(45, 118, 248, 0.06)'
                    cursor='default'
                  >
                    <div className={cx('inner-section', 'left-section')}>
                      <div className={cx('section-title-wrapper')}>
                        <img src={ReviewProgress} alt='' />
                        <p>
                          <Sypo type='P1' weight={400}>
                            {t(`page.dashboardMyWork.reviewProgress`)}
                          </Sypo>
                        </p>
                      </div>
                      <div className={cx('stick-graph-wrapper')}>
                        <p className={cx('graph-text')}>
                          <Sypo type='P2' weight={400}>
                            {calcProgress(
                              reviewData?.checkDenominator,
                              reviewData?.checkNumerator,
                            )}
                            %
                          </Sypo>
                        </p>
                        <div className={cx('graph-total')}>
                          <div
                            className={cx('graph-inner', 'color-orange')}
                            style={{
                              width: `${calcProgress(
                                reviewData?.checkDenominator,
                                reviewData?.checkNumerator,
                              )}%`,
                              transition: 'width 0.4s linear',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className={cx('inner-section')}>
                      <div className={cx('section-title-wrapper')}>
                        <img src={LabelingReject} alt='' />
                        <p>
                          <Sypo type='P1' weight={400}>
                            {t(`page.dashboardMyWork.rejectLabeling`)}
                          </Sypo>
                        </p>
                      </div>
                      <div className={cx('stick-graph-wrapper')}>
                        <p className={cx('graph-text')}>
                          <Sypo type='P2' weight={400}>
                            {calcProgress(
                              reviewData?.rejectDenominator,
                              reviewData?.rejectNumerator,
                            )}
                            %
                          </Sypo>
                        </p>
                        <div className={cx('graph-total')}>
                          <div
                            className={cx('graph-inner', 'color-green')}
                            style={{
                              width: `${calcProgress(
                                reviewData?.rejectDenominator,
                                reviewData?.rejectNumerator,
                              )}%`,
                              transition: 'width 0.4s linear',
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardBox>
                </div>
                <CardBox
                  border='0.5px solid #DEE9FF;'
                  borderRadius={4}
                  flexDirection='row'
                  justifyContent='space-around'
                  boxShadow='0px 3px 12px rgba(45, 118, 248, 0.06)'
                  cursor='default'
                >
                  <div className={cx('review-card-contents')}>
                    <div className={cx('review-card-contents-grid')}>
                      <div className={cx('item-to-do')}>
                        <img src={NeedBadge} alt='' />
                        <div className={cx('data-wrapper')}>
                          <p className={cx('data-title')}>
                            <Sypo type='P1' weight={400}>
                              {t(`page.projectMembers.assignedReview`)}
                            </Sypo>
                          </p>
                          <p className={cx('data-value')}>
                            <Sypo type='H4' weight={500}>
                              {reviewData?.work.toLocaleString() ?? 0}
                            </Sypo>
                          </p>
                        </div>
                      </div>
                      <div className={cx('item-pending')}>
                        <img src={PendingBadge} alt='' />
                        <div className={cx('data-wrapper')}>
                          <p className={cx('data-title')}>
                            <Sypo type='P1' weight={400}>
                              {t(`page.projectMembers.pendingRelabeling`)}
                            </Sypo>
                          </p>
                          <p className={cx('data-value')}>
                            <Sypo type='H4' weight={500}>
                              {reviewData?.reject.toLocaleString() ?? 0}
                            </Sypo>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className={cx('item-completed')}>
                      <img src={ApprovedBadge} alt='' />
                      <div className={cx('data-wrapper')}>
                        <p className={cx('data-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.projectMembers.completedReview`)}
                          </Sypo>
                        </p>
                        <p className={cx('data-value')}>
                          <Sypo type='H4' weight={500}>
                            {reviewData?.finish.toLocaleString() ?? 0}
                          </Sypo>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBox>
                {reviewBlindState && (
                  <>
                    <div className={cx('blind-background')}></div>
                    <div className={cx('blind-text')}>
                      <Sypo type='P1'>
                        <p>{t(`page.dashboardMyWork.noReview`)}</p>
                      </Sypo>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Default>
      </Switch>
      <div className={cx('chart-area')}>
        <ToggleButton
          select={pageState.membersGraph.date === 'daily' ? 'left' : 'right'}
          buttonStyle='blue-white'
          left={{
            label: t(`component.toggleBtn.daily`),
          }}
          right={{
            label: t(`component.toggleBtn.monthly`),
          }}
          customStyle={{
            position: 'absolute',
            top: '46px',
            zIndex: '100',
            left: '16px',
          }}
          onClickLeft={() => onClickGraphDate('daily')}
          onClickRight={() => onClickGraphDate('monthly')}
        />
        <MultiBarLineChart
          tagId='member-bar-line'
          data={{
            ...pageState.membersGraph.graphData,
            bar1: {
              ...pageState.membersGraph.graphData.bar1,
              name: t(`page.projectMembers.submittedLabeling`),
            },
            bar2: {
              ...pageState.membersGraph.graphData.bar2,
              name: t(`page.projectMembers.approvedReview`),
            },
            line: {
              ...pageState.membersGraph.graphData.line,
              name: t(`page.projectMembers.issued`),
            },
          }}
        />
      </div>
    </div>
  );
};

export default MemberProgressBoxContents;

import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { Case, Switch } from '@jonathan/react-utils';

import { MyWorkDashboardPageAtom } from '@src/stores/components/pageContents/MyWorkDashboardPageAtom';

import { Card, Sypo } from '@src/components/atoms';
import StatusCard from '../StatusCard';

import useTransfer from '@src/hooks/Common/useTransfer';
import useT from '@src/hooks/Locale/useT';

import {
  approvedIcon,
  needLabelingIcon,
  pandingReviewIcon,
  rejectedIcon,
} from '@src/static/images';

import style from './LabelingStatusCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type CardProps = 'labeling' | 'review';

function LabelingStatusCard() {
  const { t } = useT();
  const { moveToLabeling, moveToReview } = useTransfer();
  const params = useParams();

  const myWorkDashboardAtom =
    useRecoilValue<MyWorkDashboardPageAtom.ProjectDashboardPageAtomModel>(
      MyWorkDashboardPageAtom.projectDashboardPageAtom,
    );

  const noReviewProject = myWorkDashboardAtom.projectMetaData.workflow === 0;
  const notAssignedReview =
    myWorkDashboardAtom.pageData.reviewInfo.review.count === 0;
  const notAssignedLabeling = () => {
    const labelingData = myWorkDashboardAtom.pageData.labelingInfo;
    const value =
      labelingData.complete.count +
      labelingData.labeling.count +
      labelingData.reject.count +
      labelingData.review.count;
    let notAssignedLabeling = true;

    if (value > 0) {
      notAssignedLabeling = false;
    }
    return notAssignedLabeling;
  };

  const onClickCard = async (type: CardProps) => {
    if (!Number.isNaN(Number(params.pid))) {
      // routing
      switch (type) {
        case 'labeling':
          await moveToLabeling(Number(params.pid), myWorkDashboardAtom.projectMetaData.type);
          break;

        case 'review':
          await moveToReview(Number(params.pid), myWorkDashboardAtom.projectMetaData.type);
          break;
        default:
      }
    }
  };

  return (
    <div className={cx('first')}>
      <Card
        customStyle={{
          width: '100%',
          padding: '24px 32px',
        }}
      >
        <div className={cx('status-card')}>
          <div className={cx('labeling-status')}>
            <div
              className={cx(
                'review-status',
                notAssignedLabeling() && 'blind-contents',
              )}
            >
              <div className={cx('desc')}>
                <Sypo type='P1'>
                  {t('page.dashboardMyWork.labelingStatus')}
                </Sypo>
              </div>
              <div className={cx('card')}>
                <StatusCard
                  onClickCard={() => onClickCard('labeling')}
                  icon={needLabelingIcon}
                  isEnter
                  desc={t('page.dashboardMyWork.labelingToDo')}
                  data1={`${myWorkDashboardAtom.pageData.labelingInfo.labeling.count.toLocaleString(
                    'kr',
                  )}`}
                  data2={
                    myWorkDashboardAtom.pageData.labelingInfo.labeling.new > 0
                      ? `+${myWorkDashboardAtom.pageData.labelingInfo.labeling.new}`
                      : ''
                  }
                />
                <Switch>
                  <Case condition={!noReviewProject}>
                    <StatusCard
                      icon={pandingReviewIcon}
                      isEnter={false}
                      desc={t('page.dashboardMyWork.pendingReview')}
                      data1={`${myWorkDashboardAtom.pageData.labelingInfo.review.count.toLocaleString(
                        'kr',
                      )}`}
                      data2={
                        myWorkDashboardAtom.pageData.labelingInfo.review.new > 0
                          ? `+${myWorkDashboardAtom.pageData.labelingInfo.review.new}`
                          : ''
                      }
                    />
                    <StatusCard
                      isEnter={false}
                      icon={rejectedIcon}
                      desc={t('page.dashboardMyWork.rejected')}
                      data1={`${myWorkDashboardAtom.pageData.labelingInfo.reject.count.toLocaleString(
                        'kr',
                      )}`}
                      data2={
                        myWorkDashboardAtom.pageData.labelingInfo.reject.new > 0
                          ? `+${myWorkDashboardAtom.pageData.labelingInfo.reject.new}`
                          : ''
                      }
                    />
                  </Case>
                </Switch>
                <StatusCard
                  icon={approvedIcon}
                  isEnter={false}
                  desc={t('page.dashboardMyWork.completedLabeling')}
                  data1={`${myWorkDashboardAtom.pageData.labelingInfo.complete.count.toLocaleString(
                    'kr',
                  )}`}
                  data2={
                    myWorkDashboardAtom.pageData.labelingInfo.complete.count > 0
                      ? `+${myWorkDashboardAtom.pageData.labelingInfo.complete.count}`
                      : ''
                  }
                />
              </div>
              {notAssignedLabeling() && (
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
          <div
            className={cx(
              'review-status',
              (noReviewProject || notAssignedReview) && 'blind-contents',
            )}
          >
            <div className={cx('desc')}>
              <Sypo type='P1'>{t('page.dashboardMyWork.reviewStatus')}</Sypo>
            </div>
            <div className={cx('card')}>
              <StatusCard
                onClickCard={() => onClickCard('review')}
                icon={needLabelingIcon}
                isEnter
                desc={t('page.dashboardMyWork.reviewToDo')}
                data1={`${myWorkDashboardAtom.pageData.reviewInfo.review.count.toLocaleString(
                  'kr',
                )}`}
                data2={
                  myWorkDashboardAtom.pageData.reviewInfo.review.new > 0
                    ? `+${myWorkDashboardAtom.pageData.reviewInfo.review.new}`
                    : ''
                }
              />
              <StatusCard
                icon={pandingReviewIcon}
                isEnter={false}
                desc={t('page.dashboardMyWork.pendingRelabeling')}
                data1={`${myWorkDashboardAtom.pageData.reviewInfo.relabeling.count.toLocaleString(
                  'kr',
                )}`}
                data2={
                  myWorkDashboardAtom.pageData.reviewInfo.relabeling.new > 0
                    ? `+${myWorkDashboardAtom.pageData.reviewInfo.relabeling.new}`
                    : ''
                }
              />
              <StatusCard
                icon={approvedIcon}
                isEnter={false}
                desc={t('page.dashboardMyWork.completedReview')}
                data1={`${myWorkDashboardAtom.pageData.reviewInfo.complete.count.toLocaleString(
                  'kr',
                )}`}
                data2={
                  myWorkDashboardAtom.pageData.reviewInfo.complete.new > 0
                    ? `+${myWorkDashboardAtom.pageData.reviewInfo.complete.new}`
                    : ''
                }
              />
            </div>
            {(noReviewProject || notAssignedReview) && (
              <>
                <div className={cx('blind-background')}></div>
                <div className={cx('blind-text')}>
                  <Sypo type='P1'>
                    {noReviewProject ? (
                      <p>{t(`page.dashboardMyWork.noReviewSystem`)}</p>
                    ) : (
                      <p>{t(`page.dashboardMyWork.noReview`)}</p>
                    )}
                  </Sypo>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LabelingStatusCard;

import { useRecoilValue } from 'recoil';

import { MyWorkDashboardPageAtom } from '@src/stores/components/pageContents/MyWorkDashboardPageAtom';

import { Card, Sypo } from '@src/components/atoms';

import { BLUE110, MONO207 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import {
  approveRatioIcon,
  labelingAccuracyIcon,
  labelingProgressIcon,
  reviewProgressIcon,
} from '@src/static/images';

import style from './LabelingProgressCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function LabelingProgressCard() {
  const { t } = useT();

  const myWorkDashboardAtom =
    useRecoilValue<MyWorkDashboardPageAtom.ProjectDashboardPageAtomModel>(
      MyWorkDashboardPageAtom.projectDashboardPageAtom,
    );

  const noReviewProject = myWorkDashboardAtom.projectMetaData.workflow === 0;

  const notAssignedReview = () => {
    const reviewData = myWorkDashboardAtom.pageData.reviewInfo;
    const value =
      reviewData.complete.count +
      reviewData.relabeling.count +
      reviewData.review.count;
    let notAssignedReview = true;

    if (value > 0) {
      notAssignedReview = false;
    }
    return notAssignedReview;
  };

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

  return (
    <div className={cx('card-area')}>
      <div className={cx(notAssignedLabeling() && 'blind-contents')}>
        <Card
          customStyle={{
            width: '100%',
            height: '144px',
            padding: '24px 32px',
          }}
        >
          <div className={cx('contents')}>
            <div className={cx('content')}>
              <div className={cx('desc')}>
                <img src={labelingProgressIcon} alt='' />
                <Sypo type='H4' weight='M' color={BLUE110}>
                  {t('page.dashboardMyWork.labelingProgress')}
                </Sypo>
              </div>
              <div className={cx('progress')}>
                <div className={cx('data-label')}>
                  <Sypo type='P2' color={MONO207}>
                    {Math.floor(
                      myWorkDashboardAtom.pageData.labelingRatio.labeling,
                    )}
                    %
                  </Sypo>
                </div>
                <div className={cx('bar')}>
                  <div
                    className={cx('labeling')}
                    style={{
                      width:
                        myWorkDashboardAtom.pageData.labelingRatio.labeling >
                        100
                          ? '100%'
                          : `${Math.floor(
                              myWorkDashboardAtom.pageData.labelingRatio
                                .labeling,
                            )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className={cx('content')}>
              <div className={cx('desc')}>
                <img src={labelingAccuracyIcon} alt='' />
                <Sypo type='H4' weight='M' color={BLUE110}>
                  {t('page.dashboardMyWork.rejectedLabeling')}
                </Sypo>
              </div>
              <div className={cx('progress')}>
                <div className={cx('data-label')}>
                  <Sypo type='P2' color={MONO207}>
                    {Math.floor(
                      myWorkDashboardAtom.pageData.labelingRatio.reject,
                    )}
                    %
                  </Sypo>
                </div>
                <div className={cx('bar')}>
                  <div
                    className={cx('labeling-reject')}
                    style={{
                      width:
                        myWorkDashboardAtom.pageData.labelingRatio.reject > 100
                          ? '100%'
                          : `${Math.floor(
                              myWorkDashboardAtom.pageData.labelingRatio.reject,
                            )}%`,
                    }}
                  ></div>
                </div>
              </div>
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
        </Card>
      </div>
      <div
        className={cx(
          (noReviewProject || notAssignedReview()) && 'blind-contents',
        )}
      >
        <Card
          customStyle={{
            width: '100%',
            height: '144px',
            padding: '24px 32px',
          }}
        >
          <div className={cx('contents')}>
            <div className={cx('content')}>
              <div className={cx('desc')}>
                <img src={reviewProgressIcon} alt='Review progressIcon' />
                <Sypo type='H4' weight='M' color={BLUE110}>
                  {t('page.dashboardMyWork.reviewProgress')}
                </Sypo>
              </div>
              <div className={cx('progress')}>
                <div className={cx('data-label')}>
                  <Sypo type='P2' color={MONO207}>
                    {Math.floor(
                      myWorkDashboardAtom.pageData.reviewRatio.review,
                    )}
                    %
                  </Sypo>
                </div>
                <div className={cx('bar')}>
                  <div
                    className={cx('review')}
                    style={{
                      width:
                        myWorkDashboardAtom.pageData.reviewRatio.review > 100
                          ? '100%'
                          : `${Math.floor(
                              myWorkDashboardAtom.pageData.reviewRatio.review,
                            )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className={cx('content')}>
              <div className={cx('desc')}>
                <div className={cx('img')}>
                  <img src={approveRatioIcon} alt='Approve ratioIcon' />
                </div>
                <Sypo type='H4' weight='M' color={BLUE110}>
                  {t('page.dashboardMyWork.rejectLabeling')}
                </Sypo>
              </div>
              <div className={cx('progress')}>
                <div className={cx('data-label')}>
                  <Sypo type='P2' color={MONO207}>
                    {Math.floor(
                      myWorkDashboardAtom.pageData.reviewRatio.reject,
                    )}
                    %
                  </Sypo>
                </div>
                <div className={cx('bar')} style={{}}>
                  <div
                    className={cx('review-reject')}
                    style={{
                      width:
                        myWorkDashboardAtom.pageData.reviewRatio.reject > 100
                          ? '100%'
                          : `${Math.floor(
                              myWorkDashboardAtom.pageData.reviewRatio.reject,
                            )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            {(noReviewProject || notAssignedReview()) && (
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
        </Card>
      </div>
    </div>
  );
}

export default LabelingProgressCard;

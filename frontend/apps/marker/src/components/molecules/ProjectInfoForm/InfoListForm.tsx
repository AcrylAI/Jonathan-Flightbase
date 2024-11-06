import { useState } from 'react';

import { Sypo } from '@src/components/atoms';

import { InfoDataTypes } from '@src/components/pageContents/ProjectInfoContents/ProjectInfoContents';

// i18n
import useT from '@src/hooks/Locale/useT';

import { InfoIcon } from '@src/static/images';

import styles from './ProjectInfoForm.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  InfoData: InfoDataTypes;
};

const InfoListForm = ({ InfoData }: Props) => {
  const { t } = useT();

  const toolValue = () => {
    let tools = '';

    if (InfoData.tools) {
      if (InfoData.tools.length < 2) {
        // eslint-disable-next-line no-unused-expressions
        InfoData.tools[0] === 'Polygon'
          ? (tools = 'Polygon')
          : (tools = 'Bounding-box');
      } else {
        tools = 'Bounding-box, Polygon';
      }
    } else tools = '';

    return tools;
  };

  // const mobileValue = () => {
  //   let mobileAvailability = '';

  //   if(InfoData.mobile) {
  //     if(InfoData.mobile === 0) {
  //       mobileAvailability = {t(`modal.newProject.unavailability`)}
  //     } else mobileAvailability = {t(`modal.newProject.availability`)}
  //   }
  // };

  const [openDataTypeTip, setOpenDataTypeTip] = useState<boolean>(false);

  const onDataTypeMouseOver = () => {
    setOpenDataTypeTip(!openDataTypeTip);
  };

  const onDataTypeMouseOut = () => {
    setOpenDataTypeTip(!openDataTypeTip);
  };

  return (
    <>
      <div className={cx('information-item-wrapper')}>
        <p className={cx('item-title')}>
          <Sypo type='P1' weight={400}>
            {t(`page.projectInfo.projectName`)}
          </Sypo>
        </p>
        <p className={cx('item-data')}>
          <Sypo type='P1' weight={400}>
            {InfoData.title}
          </Sypo>
        </p>
      </div>
      <div className={cx('information-item-wrapper')}>
        <p className={cx('item-title')}>
          <Sypo type='P1' weight={400}>
            {t(`page.projectInfo.description`)}
          </Sypo>
        </p>
        <p className={cx('item-data')}>
          <Sypo type='P1' weight={400}>
            {InfoData.description === '' ? '-' : InfoData.description}
          </Sypo>
        </p>
      </div>
      <div className={cx('information-item-wrapper')}>
        <p className={cx('item-title')}>
          <Sypo type='P1' weight={400}>
            {t(`page.projectInfo.dataType`)}
          </Sypo>
        </p>
        <p className={cx('item-data')}>
          <Sypo type='P1' weight={400}>
            {InfoData.type}
          </Sypo>
          <img
            src={InfoIcon}
            alt=''
            onMouseOver={onDataTypeMouseOver}
            onMouseOut={onDataTypeMouseOut}
          />
        </p>
        <div className={cx('data-type-tip', openDataTypeTip && 'active')}>
          <p className={cx('data-type-desc')}>
            <Sypo type='P1' weight={400}>
              JPG, PNG, SVG
            </Sypo>
          </p>
        </div>
      </div>
      <div className={cx('information-item-wrapper')}>
        <p className={cx('item-title')}>
          <Sypo type='P1' weight={400}>
            {t(`page.projectInfo.annotationTool`)}
          </Sypo>
        </p>
        <p className={cx('item-data')}>
          <Sypo type='P1' weight={400}>
            {toolValue()}
          </Sypo>
        </p>
      </div>
      <div className={cx('information-item-wrapper')}>
        <p className={cx('item-title')}>
          <Sypo type='P1' weight={400}>
            {t(`page.projectInfo.createdDate`)}
          </Sypo>
        </p>
        <p className={cx('item-data')}>
          <Sypo type='P1' weight={400}>
            {InfoData.createdDate}
          </Sypo>
        </p>
      </div>
      <div className={cx('information-item-wrapper')}>
        <p className={cx('item-title')}>
          <Sypo type='P1' weight={400}>
            {t(`page.projectInfo.mobileAvailability`)}
          </Sypo>
        </p>
        <p className={cx('item-data')}>
          <Sypo type='P1' weight={400}>
            {InfoData.mobile === 0
              ? t(`modal.newProject.unavailability`)
              : t(`modal.newProject.availability`)}
          </Sypo>
        </p>
      </div>
      <div className={cx('information-item-wrapper')}>
        <p className={cx('item-title')}>
          <Sypo type='P1' weight={400}>
            {t(`page.projectInfo.workflow`)}
          </Sypo>
        </p>
        <p className={cx('item-data')}>
          <Sypo type='P1' weight={400}>
            {InfoData.workflow === 0
              ? t(`modal.assignNewWork.labeling`)
              : `${t(`modal.assignNewWork.labeling`)} > ${t(
                  `modal.assignNewWork.review`,
                )}`}
          </Sypo>
        </p>
      </div>
      <div className={cx('information-item-wrapper')}>
        <p className={cx('item-title')}>
          <Sypo type='P1' weight={400}>
            {t(`page.projectInfo.projectOwner`)}
          </Sypo>
        </p>
        <p className={cx('item-data')}>
          <Sypo type='P1' weight={400}>
            {InfoData.owner}
          </Sypo>
        </p>
      </div>
    </>
  );
};

export default InfoListForm;

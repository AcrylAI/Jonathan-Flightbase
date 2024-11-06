import { Sypo } from '@src/components/atoms';
import { BBoxIcon, PolygonIcon } from '@src/components/atoms/Icon';

import { BLUE110 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import styles from './AutoLabelingSetContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type ClassDataTypes = {
  color: string;
  deploy: string;
  model: string;
  modelClassName: Array<string>;
  name: string;
  tool: number;
};

type Props = {
  dataList: Array<ClassDataTypes>;
};

const AutoLabelingSetContents = ({ dataList }: Props) => {
  const { t } = useT();

  return (
    <div className={cx('class-list-container')}>
      <div className={cx('list-title-section')}>
        <Sypo type='P1' weight={400}>
          <p className={cx('list-title')}>{t(`page.autolabeling.className`)}</p>
        </Sypo>
        <Sypo type='P1' weight={400}>
          <p className={cx('list-title')}>
            {t(`page.autolabeling.modelClassName`)}
          </p>
        </Sypo>
        <Sypo type='P1' weight={400}>
          <p className={cx('list-title')}>
            {t(`page.autolabeling.deploymentName`)}
          </p>
        </Sypo>
        <Sypo type='P1' weight={400}>
          <p className={cx('list-title')}>{t(`page.autolabeling.modelName`)}</p>
        </Sypo>
        <Sypo type='P1' weight={400}>
          <p className={cx('list-title')}>{t(`page.autolabeling.color`)}</p>
        </Sypo>
      </div>
      {dataList.map((data: ClassDataTypes, idx) => (
        <div className={cx('list-box')} key={`list-${idx}`}>
          <div className={cx('list-item')}>
            <div
              className={cx('content-icon-wrapper')}
              key={`class-name-${idx}`}
            >
              <div className={cx('annotation-icon')}>
                {data.tool === 1 ? (
                  <BBoxIcon size='small' color={BLUE110} />
                ) : (
                  <PolygonIcon size='small' color={BLUE110} />
                )}
              </div>
              <Sypo type='P1' weight={400}>
                <p className={cx('list-content')}>{data.name}</p>
              </Sypo>
            </div>
          </div>
          <div className={cx('list-item')}>
            <div className={cx('model-class-name-list')}>
              {data.modelClassName.map((modelClass, idx) => (
                <div
                  className={cx('content-icon-wrapper')}
                  key={`model-class-name-${idx}`}
                >
                  <div className={cx('annotation-icon')}>
                    {data.tool === 1 ? (
                      <BBoxIcon size='small' color={BLUE110} />
                    ) : (
                      <PolygonIcon size='small' color={BLUE110} />
                    )}
                  </div>

                  <Sypo type='P1' weight={400}>
                    <p
                      className={cx('list-content')}
                      key={`model-class-name-${idx}`}
                    >
                      {modelClass}
                    </p>
                  </Sypo>
                </div>
              ))}
            </div>
          </div>
          <div className={cx('list-item')}>
            <Sypo type='P1' weight={400}>
              <p className={cx('list-content')} key={`deployment-name-${idx}`}>
                {data.deploy}
              </p>
            </Sypo>
          </div>
          <div className={cx('list-item')}>
            <Sypo type='P1' weight={400}>
              <p className={cx('list-content')} key={`model-name-${idx}`}>
                {data.model}
              </p>
            </Sypo>
          </div>
          <div className={cx('list-item')}>
            <div
              className={cx('color-box')}
              key={`${idx}-color`}
              style={{ background: `${data.color}` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AutoLabelingSetContents;

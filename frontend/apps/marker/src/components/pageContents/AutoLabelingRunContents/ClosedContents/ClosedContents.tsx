import { useRecoilValue } from 'recoil';

import { AutoLabelingRunPageAtom } from '@src/stores/components/pageContents/AutoLabelingRunPageAtom';

import { Sypo } from '@src/components/atoms';

import { MONO204, MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import { CaretUpGray } from '@src/static/images';

import style from './ClosedContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  index: number;
  handleGraphAppend: (id: number) => void;
};

function ClosedContents({ index, handleGraphAppend }: Props) {
  const { t } = useT();
  const autoLabelingRunPageAtom =
    useRecoilValue<AutoLabelingRunPageAtom.AutoLabelingRunPageAtomModel>(
      AutoLabelingRunPageAtom.autoLabelingRunPageAtom,
    );

  return (
    <div className={cx('container')}>
      <div className={cx('columns', 'data-count')}>
        <Sypo type='P2' color={MONO204} weight='R'>
          {t('page.runAutolabeling.dataCount')}
        </Sypo>
        <Sypo type='P1' color={MONO205} weight='M'>
          {autoLabelingRunPageAtom.autoLabelingRunList[index].dataCnt}
        </Sypo>
      </div>
      <div className={cx('columns', 'contents')}>
        <Sypo type='P2' color={MONO204} weight='R'>
          {t('page.runAutolabeling.started')}
        </Sypo>
        <Sypo type='P1' color={MONO205} weight='M'>
          {autoLabelingRunPageAtom.autoLabelingRunList[index].started}
        </Sypo>
      </div>
      <div className={cx('columns', 'contents')}>
        <Sypo type='P2' color={MONO204} weight='R'>
          {t('page.runAutolabeling.finished')}
        </Sypo>
        <Sypo type='P1' color={MONO205} weight='M'>
          {autoLabelingRunPageAtom.autoLabelingRunList[index].finished}
        </Sypo>
      </div>
      <div
        className={cx(
          'columns',
          'toggle',
          autoLabelingRunPageAtom.listAppendIdx.has(
            autoLabelingRunPageAtom.autoLabelingRunList[index].id,
          ) && 'active',
        )}
      >
        <img
          src={CaretUpGray}
          alt='append'
          onClick={() =>
            handleGraphAppend(
              autoLabelingRunPageAtom.autoLabelingRunList[index].id,
            )
          }
        />
      </div>
    </div>
  );
}

export default ClosedContents;

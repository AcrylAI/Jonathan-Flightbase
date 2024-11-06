import styles from './ClassPagePropCard.module.scss';
import classNames from 'classnames/bind';
import { ItemContainer, Sypo } from '@src/components/atoms';
import { useRecoilState } from 'recoil';
import {
  ClassPageContentsAtom,
  ClassPageContentsAtomModel,
} from '@src/stores/components/pageContents/ClassPageContents/ClassPageContentsAtom';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

const ClassPagePropContent = () => {
  const { t } = useT();
  const [pageState, setPageState] = useRecoilState<ClassPageContentsAtomModel>(
    ClassPageContentsAtom,
  );
  const index = pageState.classList.findIndex(
    (v) => v.id === pageState.selected,
  );

  return (
    <div className={cx('page-prop-content-container')}>
      <div className={cx('class-name')}>
        <div className={cx('holder')}>
          <Sypo type='P1'>{t(`modal.newProject.selectedClass`)}:</Sypo>
        </div>
        {pageState.selected !== 0 && index !== -1 && (
          <div className={cx('name')}>
            <Sypo type='P1'>{pageState.classList[index].name ?? ''}</Sypo>
          </div>
        )}
      </div>
      <div className={cx('content-container')}>
        {index !== -1 &&
          pageState.selected !== 0 &&
          pageState.classList[index].property.map((v, idx) => (
            <div
              key={`content-container-list-item ${idx}`}
              className={cx('list-item-container')}
            >
              <div className={cx('title')}>
                <div className={cx('idx')}>
                  <div className={cx('number')}>
                    <Sypo type='P4' weight='bold'>
                      {idx + 1}
                    </Sypo>
                  </div>
                </div>
                <div className={cx('name')}>
                  <Sypo type='H4' weight='medium'>
                    {v.name}
                  </Sypo>
                </div>
                {v.required === 1 && <div className={cx('required')}>*</div>}
                {v.type === 1 && (
                  <div className={cx('multi')}>
                    <Sypo type='H4' weight='medium'>
                      - {t(`modal.newProject.multiSelective`)}
                    </Sypo>
                  </div>
                )}
              </div>
              <div className={cx('opt-container', v.type === 1 && 'multi')}>
                {v.options.map((ov, oIdx) => (
                  <div
                    key={`opt-item ${oIdx}`}
                    className={cx('option-item-container')}
                  >
                    <div className={cx('box', v.type === 0 && 'circle')}></div>
                    <div className={cx('name')}>
                      <Sypo ellipsis type='P1' weight='regular'>
                        {ov.name}
                      </Sypo>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const ClassPagePropCard = () => {
  const { t } = useT();
  return (
    <ItemContainer
      containerCustomStyle={{ height: '100%' }}
      headerTitle={`${t(`modal.newProject.property`)}`}
      itemContents={<ClassPagePropContent />}
    />
  );
};

export default ClassPagePropCard;

import { useParams } from 'react-router-dom';

import { Mypo, Sypo } from '@src/components/atoms';

import { EmptyContents } from '@src/components/molecules';

import useGetIsProjectOwner from '@src/hooks/Common/useGetIsProjectOwner/useGetIsProjectOwner';
import useT from '@src/hooks/Locale/useT';

import { TagIcon } from '@src/static/images';

import styles from './ClassPageNodata.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  openModal: () => void;
};
const ClassPageNodata = ({ openModal }: Props) => {
  const params = useParams();
  const isOwner = useGetIsProjectOwner({ projectId: Number(params.pid) });
  const { t } = useT();
  return (
    <div className={cx('nodata-container')}>
      <EmptyContents
        icon={{ topIcon: TagIcon }}
        customStyle={{
          marginTop: '210px',
          justifyContent: 'flex-start',
        }}
        contents={[
          <Mypo type='H4' weight='medium'>
            <div className={cx('sub-content')}>
              <div className={cx('desc')}>
                <div>{t(`page.tools.emptyClasses`)}</div>
                {isOwner && (
                  <div>
                    <Mypo type='H4' weight='R'>
                      {t(`page.tools.pressBtn`)}
                    </Mypo>
                  </div>
                )}
              </div>
              {isOwner && (
                <div className={cx('btn')} onClick={openModal}>
                  {t(`component.btn.create`)}
                </div>
              )}
            </div>
          </Mypo>,
        ]}
      />
    </div>
  );
};

export default ClassPageNodata;

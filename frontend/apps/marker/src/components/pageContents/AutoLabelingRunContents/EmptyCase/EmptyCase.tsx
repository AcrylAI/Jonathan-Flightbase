import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import useGetClassList from '@src/pages/AutoLabelingSetPage/hooks/useGetClassList';

import { Sypo } from '@src/components/atoms';

import { EmptyContents } from '@src/components/molecules';

import { MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import { FadersIcon, RocketIcon, SpinnerIcon } from '@src/static/images';

function EmptyCase() {
  const { t } = useT();
  const { pid: projectId } = useParams();
  const isData = useRef<boolean>(false);

  const { data, isFetching } = useGetClassList({
    projectId: Number(projectId),
  });
  useEffect(() => {
    if (Array.isArray(data?.result) && (data?.result as any).length > 0) {
      isData.current = true;
    }
  }, [data?.result]);

  return (
    <EmptyContents
      customStyle={{}}
      icon={{
        topIcon: (() => {
          if (isFetching) {
            return SpinnerIcon;
          }
          if (isData.current) {
            return RocketIcon;
          }
          return FadersIcon;
        })(),
        topIconStyle: {
          width: '48px',
          height: '48px',
        },
      }}
      contents={[
        <Sypo type='H4' color={MONO205} weight={500}>
          {isData.current
            ? t(`page.runAutolabeling.preparedAutoLabeling`)
            : t(`page.autolabeling.noAutoLabeling`)}
        </Sypo>,
        <Sypo type='H4' color={MONO205} weight='R'>
          {isData.current
            ? t(`page.runAutolabeling.pleaseClickAutoLabelingBtn`)
            : t(`page.autolabeling.pleaseGoToSetAutoLabeling`)}
        </Sypo>,
      ]}
    />
  );
}

export default EmptyCase;

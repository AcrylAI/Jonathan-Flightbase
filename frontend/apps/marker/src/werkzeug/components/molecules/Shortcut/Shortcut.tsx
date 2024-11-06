import { useRecoilValue } from "recoil";
import { jobInfoAtom } from "@src/werkzeug/stores/fetchStore";
import { BLUE110 } from "@src/utils/color";
import useT from "@src/hooks/Locale/useT";
import { Sypo } from "@src/components/atoms";
import useLoading from "@src/werkzeug/hooks/common/useLoading";
import { FoldView, Plaque, TextSkeleton } from "@src/werkzeug/components/atoms";
import Icon from "@src/werkzeug/assets";

import classNames from "classnames/bind";
import styles from "./Shortcut.module.scss";

const cx = classNames.bind(styles);
const { Key } = Icon;

function Shortcut() {
  const { t } = useT();

  const { isPaintLoading } = useLoading();
  const jobInfo = useRecoilValue(jobInfoAtom);

  const keyList = [
    { act: t(`component.shortcut.selecttool`), key: [<Key type='q' size='mx' />] },
    { act: t(`component.shortcut.handtool`), key: [<Key type='w' size='mx' />] },
    { act: t(`component.shortcut.zoomtool`), key: [<Key type='e' size='mx' />] },
    {
      act: (jobInfo?.fileStatus === 3) ? t(`component.shortcut.addissue`) : t(`component.shortcut.segment`),
      key: [<Key type='r' size='mx' />]
    },
    // { act: t(`component.shortcut.polygon`), key: [<Key type='r' size='mx' />] },
    // { act: t(`component.shortcut.addissue`), key: [<Key type='r' size='mx' />] },
    { act: t(`component.shortcut.zoomin`), key: [<Key type='+' size='mx' />] },
    { act: t(`component.shortcut.zoomout`), key: [<Key type='-' size='mx' />] },
    { act: t(`component.zoomshortcut.zoomtofit`), key: [<Key type='cmd' size='mx' />, <Key type='0' size='mx' />] },
    { act: t(`component.zoomshortcut.zoomto100`), key: [<Key type='cmd' size='mx' />, <Key type='1' size='mx' />] },
    { act: t(`component.shortcut.delete`), key: [<Key type='back' size='mx' />] },
  ]

  if(!isPaintLoading) {
    return (
      <div className={ cx("Shortcut") }>
        <FoldView
          head={<Sypo type='h4' weight={500}>{t(`page.annotation.shortcut`)}</Sypo>}
          body={
            <div className={ cx("keylist") }>
              {
                keyList.map(v => (
                  <div className={ cx('keyitem') } key={v.act}>
                    <Sypo type='p1' color={BLUE110} weight={400}>{ v.act }</Sypo>
                    <div className={ cx("plaques") }>
                      {
                        v.key.map((w, i) => (
                          <Plaque key={`${v.act}_${i}`} color='#C8CCD4'>{w}</Plaque>
                        ))
                      }
                    </div>
                  </div>
                ))
              }
            </div>
          }
        />
      </div>
    )
  }
  else {
    return (
      <div className={ cx("Shortcut") }>
        <FoldView
          head={<TextSkeleton width={'100px'} />}
          body={ null }
        />
      </div>
    )
  }

  // return (
  //   <div className={ cx("Shortcut") }>
  //     <FoldView
  //       head={<Sypo type='h4' weight={500}>Shortcut</Sypo>}
  //       body={
  //         <div className={ cx("keylist") }>
  //           {
  //             keyList.map(v => (
  //               <div className={ cx('keyitem') } key={v.act}>
  //                 <Sypo type='p1' color={BLUE110} weight={400}>{ v.act }</Sypo>
  //                 <Plaque color='#C8CCD4'>
  //                   { v.key }
  //                 </Plaque>
  //               </div>
  //             ))
  //           }
  //         </div>
  //       }
  //     />
  //   </div>
  // )
}

export default Shortcut;
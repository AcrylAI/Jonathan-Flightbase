import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { cloneDeep } from "lodash";
import useT from "@src/hooks/Locale/useT";
import { Sypo } from "@src/components/atoms";
import Icon from "@src/werkzeug/assets";
import { ScrollView, ListSkeleton } from "@src/werkzeug/components/atoms";
import { LabelList } from "@src/werkzeug/components/molecules";
import useLoading from "@src/werkzeug/hooks/common/useLoading";
import { scrollSmooth } from "@src/werkzeug/lib/Util";
import { labelListAtom, selectedAnnotationAtom } from "@src/werkzeug/stores/paintStore";

import classNames from "classnames/bind";
import styles from "./Labels.module.scss";

const cx = classNames.bind(styles);
const { EyeIcon } = Icon;

function Labels() {
  const { t } = useT();

  const [labelList, setLabelList] = useRecoilState(labelListAtom);
  const selectedAnno = useRecoilValue(selectedAnnotationAtom);
  const [show, setShow] = useState(true);
  const { isPaintLoading } = useLoading();

  const parentRef = useRef<HTMLDivElement>(null);
  const parentHeight = (() => {
    if(!parentRef || !parentRef.current) return 0;

    const height = parentRef.current.offsetHeight;
    const offset = (48 + 56 + 8 + 8);

    return (height - offset > 0) ? (height - offset):0;
  })();

  const onClickShow = () => {
    setShow(!show);

    const _labelList = cloneDeep(labelList);
    for (let i = 0; i < _labelList.length; i++) {
      _labelList[i].visibility = !show;
    }

    setLabelList(_labelList);
  }

  useEffect(() => {
    if(!selectedAnno) {
      scrollSmooth('_mk_label-list');
    }
    else {
      scrollSmooth(`label_${selectedAnno.id}`);
    }
  }, [selectedAnno])

  if(!isPaintLoading) {
    return (
      <div className={ cx("Labels") } ref={parentRef}>
        <div className={ cx("header") }>
          <Sypo type="h4" weight={500}>{t(`page.annotation.labels`)}</Sypo>
          <div className={ cx("show") } onClick={onClickShow}>
            {
              show ? <EyeIcon />:<EyeIcon alt />
            }
          </div>
        </div>
        <ScrollView padding="0 12px 16px">
          <LabelList />
          {
            (!!selectedAnno)
              ? <div className={ cx("padding") }
                     style={{ height: parentHeight }} />
              : null
          }
        </ScrollView>
      </div>
    )
  }
  else {
    return <ListSkeleton />
  }
}

export default Labels;
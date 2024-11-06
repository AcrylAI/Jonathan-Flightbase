import { useRecoilValue } from "recoil";
import useT from "@src/hooks/Locale/useT";
import { Sypo } from "@src/components/atoms";
import { jobInfoAtom } from "@src/werkzeug/stores/fetchStore";
import { ScrollView } from "@src/werkzeug/components/atoms";
import { ClassList } from "@src/werkzeug/components/molecules";

import classNames from "classnames/bind";
import styles from "./Classes.module.scss";

const cx = classNames.bind(styles);

function Classes() {
  const { t } = useT();

  const jobInfo = useRecoilValue(jobInfoAtom);

  return (
    <div className={ cx("Classes") }>
      {
        (!!jobInfo) &&
        <>
          <div className={ cx("header") }>
            <Sypo type="h4" weight={500}>{t(`page.annotation.classes`)}</Sypo>
          </div>
          <ScrollView padding="0 12px 16px">
            <ClassList />
          </ScrollView>
        </>
      }
    </div>
  )
}

export default Classes;
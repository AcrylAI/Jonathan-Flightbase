import { CSSProperties } from "react";
import { useRecoilValue } from "recoil";
import useT from "@src/hooks/Locale/useT";
import { Sypo } from "@src/components/atoms";
import Icon from "@src/werkzeug/assets";
import { MARKER_PAINT_CONTAINER_ID, MARKER_PAINT_PROPERTIES_ID } from "@src/werkzeug/defs/constance";
import { Button, FloatView, ScrollView } from "@src/werkzeug/components/atoms";
import useFileStatus from "@src/werkzeug/hooks/common/useFileStatus";
import { jobInfoAtom } from "@src/werkzeug/stores/fetchStore";
import useProperties from "./useProperties";
import Attribute from "./Attribute";

import classNames from "classnames/bind";
import styles from "./Properties.module.scss";

const cx = classNames.bind(styles);

const { CloseIcon } = Icon;
const { Contain } = Button;

function Properties() {
  const { t } = useT();

  const jobInfo = useRecoilValue(jobInfoAtom);

  const { canIUse } = useFileStatus();

  const {
    show,
    isDone,
    properties,
    selectProperty,
    setSelectProperty,
    onClickClose,
    onClickDone,
    anchorId,
    opacity
  } = useProperties();

  const style = (() => {
    const output:CSSProperties = {
      opacity: undefined,
      visibility: undefined,
    };

    if(opacity !== -1) {
      output.opacity = opacity;
      output.visibility = (opacity === 0) ? 'hidden':undefined;
    }

    return output;
  })();

  return (
    <FloatView id={MARKER_PAINT_PROPERTIES_ID} animation show={show}
               parentId={MARKER_PAINT_CONTAINER_ID}
               anchorId={anchorId}
               marginTop={5}
               marginEnd={16}
               style={style} >
      <div className={ cx("Properties") }>
        <header className={ cx("header") }>
          <Sypo type='h4' weight={500}>{t(`component.properties.properties`)}</Sypo>
          <div className={ cx("exit") } onClick={onClickClose}>
            <CloseIcon />
          </div>
        </header>

        {
          properties.length > 0 &&
	        <ScrollView>
		        <div className={ cx("props-container") }>
                  {
                    properties.map((v, i) => (
                      <Attribute property={v}
                                 index={i+1}
                                 state={selectProperty.find(x => x.id === v.id)}
                                 setState={setSelectProperty}
                                 key={i} />
                    ))
                  }
		        </div>
	        </ScrollView>
        }

        <footer className={ cx("confirm") }>
          {
            (!!jobInfo && canIUse) &&
	          <Contain onClick={onClickDone} padding={"8px 16px"} disable={!isDone}>
		          <Sypo type='p2' weight={500}>{t(`component.properties.done`)}</Sypo>
	          </Contain>
          }
        </footer>
      </div>
    </FloatView>
  )
}

export default Properties;
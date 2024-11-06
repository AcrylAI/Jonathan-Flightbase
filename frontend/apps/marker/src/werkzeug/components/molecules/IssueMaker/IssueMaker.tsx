import { MONO204, RED502 } from "@src/utils/color";
import useT from "@src/hooks/Locale/useT";
import { Sypo } from "@src/components/atoms";
import {
  MARKER_PAINT_CONTAINER_ID,
  MARKER_PAINT_ISSUEMAKER_ID,
  MARKER_PAINT_ISSUEMAKER_TEXTAREA_ID
} from "@src/werkzeug/defs/constance";
import Icon from "@src/werkzeug/assets";
import { FloatView, Toggler } from "@src/werkzeug/components/atoms";
import useIssueMaker from "./useIssueMaker";

import classNames from "classnames/bind";
import styles from "./IssueMaker.module.scss";

const cx = classNames.bind(styles);

const { MakeIssueIcon, CloseIcon } = Icon;

function IssueMaker() {
  const { t } = useT();

  const {
    show,
    alert,
    comment,
    textareaRef,
    onClickClose,
    onClickResolve,
    onClickCreate,
    onChangeTextarea,
    onChangeToggler,
    onFocusTextarea,
    onBlurTextarea,
    selectedIssue,
    anchorId
  } = useIssueMaker();

  return (
    <FloatView id={MARKER_PAINT_ISSUEMAKER_ID} animation show={show}
               parentId={MARKER_PAINT_CONTAINER_ID}
               anchorId={anchorId}
               marginTop={0}
               marginEnd={-36}>
      <div className={ cx("IssueMaker") }>
        <header className={ cx("exit") }
                onClick={onClickClose}>
          <CloseIcon />
        </header>

        <div className={ cx("inputs") }>
          <textarea id={ MARKER_PAINT_ISSUEMAKER_TEXTAREA_ID }
                    className={cx("comment")}
                    ref={textareaRef}
                    placeholder={"Please insert comment here"}
                    value={comment}
                    onChange={onChangeTextarea}
                    onFocus={onFocusTextarea}
                    onBlur={onBlurTextarea}
          />
        </div>

        <footer className={ cx("actions") }>
          <Toggler onChange={onChangeToggler}
                   colorSet='red'
                   defaultValue={alert}
                   label={
                           <Sypo type={'p2'} weight={400} color={alert ? RED502:MONO204}>{t(`component.Issue.alert`)}</Sypo>
                         }
          />

          <div className={ cx("actions-box") }>
            {
              (!!selectedIssue && selectedIssue.id > 0) &&
	            <div className={ cx("resolve-button") }
	                 onClick={onClickResolve}>
		            <Sypo type={'p2'}>{t(`component.Issue.resolve`)}</Sypo>
	            </div>
            }
            <div className={ cx("setup-button", (comment.length===0) && 'deactive') }
                 onClick={onClickCreate}>
              <MakeIssueIcon />
            </div>
          </div>
        </footer>
      </div>
    </FloatView>
  )
}

export default IssueMaker;
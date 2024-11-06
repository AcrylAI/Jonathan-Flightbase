import classNames from "classnames/bind";
import styles from './LabelImagePage.module.scss';

import { ImageLabelTemplate } from "@tools/components/templates";

const cx = classNames.bind(styles);

// /common/labling/image/:jid
function LabelImagePage() {
  return (
    <div className={ cx("LabelImagePage") }>
      <ImageLabelTemplate />
    </div>
  )
}

export default LabelImagePage;

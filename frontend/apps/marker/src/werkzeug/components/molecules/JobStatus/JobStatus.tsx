import { useRecoilValue } from "recoil";
import { Sypo } from "@src/components/atoms";
import Icon from "@src/werkzeug/assets";
import { jobInfoAtom } from "@src/werkzeug/stores/fetchStore";
import useLoading from "@src/werkzeug/hooks/common/useLoading";
import { FileSkeleton, FileState } from "@src/werkzeug/components/atoms"
import classNames from "classnames/bind";
import styles from "./JobStatus.module.scss";

const cx = classNames.bind(styles);
const { FileIcon, ProjectIcon } = Icon;

function JobStatus() {
  const jobInfo = useRecoilValue(jobInfoAtom);
  const { isPaintLoading } = useLoading();

  if(!isPaintLoading) {
    return (
      <div className={ cx("JobStatus") }>
        {
          jobInfo !== undefined &&
		    <>
			    <div className={ cx("file") }>
				    <div className={ cx("box") } title={jobInfo.fileName}>
					    <FileIcon />
					    <Sypo type={"p2"} weight={400} ellipsis>{jobInfo.fileName}</Sypo>
				    </div>
            <FileState type={jobInfo?.fileStatus} />
			    </div>
			    <div className={ cx("project") }>
				    <div className={ cx("box") } title={String(jobInfo.projectName)}>
					    <ProjectIcon />
					    <Sypo type={"p2"} weight={400} ellipsis>{jobInfo.projectName}</Sypo>
				    </div>
			    </div>
		    </>
        }
      </div>
    )
  }
  else {
    return (
      <div className={ cx("JobStatus") }>
        <FileSkeleton />
      </div>
    )
  }
}

export default JobStatus;
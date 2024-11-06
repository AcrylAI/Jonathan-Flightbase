import { useEffect } from "react";
import * as d3 from "d3";
import classNames from "classnames/bind";
import styles from "./Page.module.scss";
import { wait } from "@src/werkzeug/lib/Util";

const cx = classNames.bind(styles);

/**
 * Typo 관련 테스트를 위한 페이지 입니다 삭제 예정
 * @author Dawson
 */
function TestPage() {
  const testFunction = async () => {
    const svg = d3.select('svg#testsvg');
    await wait(1000);
    svg.attr('transform', 'translate(10, 40)');
    await wait(1000);
    svg.attr('transform', 'translate(60, 120)');

    const g = d3.select('g#testg');
    await wait(1000);
    g.attr('transform', 'translate(10, 40)');
    await wait(1000);
    g.attr('transform', 'translate(60, 120)');
  }

  useEffect(() => {
    testFunction().then();
  }, [])

  return (
    <div className={ cx("Page") }>
      <svg id="testsvg">
        <g id="testg">
          <rect x={0} y={0} width={10} height={30} fill={'black'} />
        </g>
      </svg>
    </div>
  )
}

export default TestPage;
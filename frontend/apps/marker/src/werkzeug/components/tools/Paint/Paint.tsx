import "./Paint.scss";
import { MARKER_PAINT_CANVAS_ID, MARKER_PAINT_CONTAINER_ID } from "@src/werkzeug/defs/constance";
import usePaint from "./usePaint";

function Paint() {
  usePaint()

  return (
    <div className="_mk_draw_paint" id={MARKER_PAINT_CONTAINER_ID}>
      <svg id={MARKER_PAINT_CANVAS_ID} />
    </div>
  )
}

export default Paint;
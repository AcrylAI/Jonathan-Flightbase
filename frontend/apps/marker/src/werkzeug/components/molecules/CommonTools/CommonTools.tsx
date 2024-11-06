import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import useT from "@src/hooks/Locale/useT";
import { isFocus } from "@src/werkzeug/lib/Util";
import icon from "@src/werkzeug/assets";
import { Button } from "@src/werkzeug/components/atoms";
import { Tools } from "@src/werkzeug/defs/annotation";
import { selectedToolAtom } from "@src/werkzeug/stores/contextStore";
import ZoomBox from "../ZoomBox";

import classNames from "classnames/bind";
import styles from "./CommonTools.module.scss";

const cx = classNames.bind(styles);

const {
  ToolSelectIcon:SelectIcon, ToolHandIcon:HandIcon,
} = icon;

function CommonTools() {
  const { t } = useT();

  const [selectedTool, setSelectedTool] = useRecoilState(selectedToolAtom);

  const [showShortcut, setShowShortcut] = useState(false);
  const [prevTool, setPrevTool] = useState<Tools|-1>(-1);

  const onClickSelectionTool = () => {
    if(selectedTool !== 0) {
      setSelectedTool(0);
    }
    else {
      setSelectedTool(-1);
    }
  }

  const onClickHandTool = () => {
    if(selectedTool !== 1) {
      setSelectedTool(1);
    }
    else {
      setSelectedTool(-1);
    }
  }

  const onClickZoom = () => {
    if(selectedTool !== 2) {
      setSelectedTool(2);
    }
    else {
      setSelectedTool(-1);
    }

    setShowShortcut(!showShortcut);
  }

  useEffect(() => {
    const handler = (e:KeyboardEvent) => {
      if(isFocus()) return;

      const { key } = e;

      switch (key) {
        case 's': case 'q': case 'ㄴ': case 'ㅂ': onClickSelectionTool(); break;
        case 'w': case 'h': case 'ㅈ': case 'ㅗ': onClickHandTool(); break;
        case 'z': case 'e': case 'ㅋ': case 'ㄷ': onClickZoom(); break;
      }
    }

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    }
  }, [onClickSelectionTool, onClickHandTool, onClickZoom])

  useEffect(() => {
    if(selectedTool === 1) return;

    const handler = (e:KeyboardEvent) => {
      if(isFocus()) return;

      const { key } = e;

      if(key === ' ') {
        setPrevTool(selectedTool);
        setSelectedTool(1);
      }
    }

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    }
  }, [selectedTool])

  useEffect(() => {
    if(prevTool === -1) return ;

    const handler = (e:KeyboardEvent) => {
      if(isFocus()) return;

      const { key } = e;

      if(key === ' ') {
        setSelectedTool(prevTool);
        setPrevTool(-1);
      }
    }

    document.addEventListener('keyup', handler);
    return () => {
      document.removeEventListener('keyup', handler);
    }
  }, [prevTool])

  // useEffect(() => {
  //   if(selectedTool === 1) return;
  //
  //   const handler = (e:MouseEvent) => {
  //     if(e.button === 1) {
  //       setPrevTool(selectedTool);
  //       setSelectedTool(1);
  //     }
  //   }
  //
  //   document.addEventListener('mousedown', handler);
  //   return () => {
  //     document.removeEventListener('mousedown', handler);
  //   }
  // }, [selectedTool])

  // useEffect(() => {
  //   if(prevTool === -1) return ;
  //
  //   const handler = (e:MouseEvent) => {
  //     if(e.button === 1) {
  //       setSelectedTool(prevTool);
  //       setPrevTool(-1);
  //     }
  //   }
  //
  //   document.addEventListener('mouseup', handler);
  //   return () => {
  //     document.removeEventListener('mouseup', handler);
  //   }
  // }, [prevTool])

  return (
    <div className={ cx("CommonTools") }>
      <Button.Select onClick={onClickSelectionTool}
                     title={t(`component.tool.selection`)}
                     active={selectedTool==0}>
        <SelectIcon />
      </Button.Select>
      <Button.Select onClick={onClickHandTool}
                     title={t(`component.tool.hand`)}
                     active={selectedTool==1}>
        <HandIcon />
      </Button.Select>

      <ZoomBox />
    </div>
  )
}

export default CommonTools;
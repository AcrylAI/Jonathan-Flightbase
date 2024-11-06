import { useEffect, useState, MouseEvent } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { jobInfoAtom, onDataLoadAtom } from "@src/werkzeug/stores/fetchStore";
import { scaleAtom } from "@src/werkzeug/stores/paintStore";
import { Size } from "@src/werkzeug/defs/draw";
import {
  INT_SCALE_KEY,
  MARKER_PAINT_CONTAINER_ID,
  MAX_SCALE,
  MIN_SCALE
} from "@src/werkzeug/defs/constance";
import { isFocus } from "@src/werkzeug/lib/Util";

function useZoom() {
  const jobInfo = useRecoilValue(jobInfoAtom);
  const setDataLoad = useSetRecoilState(onDataLoadAtom);

  const [scale, setScale] = useRecoilState(scaleAtom);

  const [imgSize, setImgSize] = useState<Size|undefined>(undefined);

  const onClickZoomIn = (e?:MouseEvent, zoom=INT_SCALE_KEY) => {
    if(scale >= MAX_SCALE) return;

    if(!!e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const _scale = Math.floor(scale * 100 / 25) * zoom;
    setScale(_scale + zoom);
  }

  const onCLickZoomOut = (e?:MouseEvent, zoom=INT_SCALE_KEY) => {
    if(scale <= MIN_SCALE) return;

    if(!!e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const _scale = Math.floor(scale * 100 / 25) * zoom;
    setScale(
      ((_scale - zoom) > 0)
        ? (_scale - zoom)
        : (_scale)
    );
  }

  const onClickZoom50 = (e?:MouseEvent) => {
    if(!!e) e.stopPropagation();
    setScale(0.5);
  }

  const onClickZoom100 = (e?:MouseEvent) => {
    if(!!e) e.stopPropagation();
    setScale(1);
  }

  const onClickZoom200 = (e?:MouseEvent) => {
    if(!!e) e.stopPropagation();
    setScale(2);
  }

  const onClickZoomFit = (e?:MouseEvent) => {
    if(!!e) {
      e.stopPropagation();
    }
    if(!imgSize) return;

    const contentRef = document.getElementById(MARKER_PAINT_CONTAINER_ID);
    const { width:divWidth, height:divHeight } = contentRef?.getBoundingClientRect() || { width:0, height: 0 };

    const widthFitScale = divWidth / imgSize.width;
    const heightFitScale = divHeight / imgSize.height;

    const fitScale = (widthFitScale < heightFitScale) ? widthFitScale : heightFitScale;

    setScale(fitScale);
  }

  const getImageSize = (imgSrc:string):Promise<Size> => {
    return new Promise<Size>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'annonymous';

      img.src = imgSrc;

      img.onload = () => {
        const { width, height } = img;
        resolve({ width, height });
        setDataLoad(1);
      }

      img.onerror = (err) => {
        reject(err);
        setDataLoad(-1);
      }
    })
  }

  useEffect(() => {
    if(!jobInfo) return;

    getImageSize(jobInfo.url)
      .then((res) => {
        setImgSize(res);
      })
      .catch(() => {
        setImgSize(undefined);
      })
  }, [jobInfo]);

  useEffect(() => {
    if(scale === 0) {
      onClickZoomFit();
    }
  }, [scale, onClickZoomFit])

  /** 이미지가 로딩된 초기에 이미지를 fit하게 하는 메소드 */
  useEffect(() => {
    if(scale < 0 && !!jobInfo) {
      const img = new Image();
      img.crossOrigin = 'annonymous';
      img.src = jobInfo.url;
      img.onload = () => {
        const { width, height } = img;

        const contentRef = document.getElementById(MARKER_PAINT_CONTAINER_ID);
        const { width:divWidth, height:divHeight } = contentRef?.getBoundingClientRect() || { width:0, height: 0 };

        const widthFitScale = divWidth / width;
        const heightFitScale = divHeight / height;

        const fitScale = (widthFitScale < heightFitScale) ? widthFitScale : heightFitScale;

        setScale(fitScale);
      }
    }
  }, [scale, jobInfo])

  useEffect(() => {
    const handler = (e:KeyboardEvent) => {
      if(isFocus()) return;

      const { key, ctrlKey, metaKey } = e;

      if(ctrlKey || metaKey) {
        switch (key) {
          case '1':
            e.preventDefault();
            onClickZoom100();
            break;
          case '0':
            e.preventDefault();
            onClickZoomFit();
            break;
        }
      }
      else {
        switch (key) {
          case '+': case '=':
            // e.preventDefault();
            onClickZoomIn();
            break;
          case '-': case '_':
            // e.preventDefault();
            onCLickZoomOut();
            break;
        }
      }
    }

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    }
  }, [
    onClickZoomIn,
    onCLickZoomOut,
    onClickZoom100,
    onClickZoomFit
  ]);

  return {
    onClickZoomIn,
    onCLickZoomOut,
    onClickZoom50,
    onClickZoom100,
    onClickZoom200,
    onClickZoomFit
  }
}

export default useZoom;
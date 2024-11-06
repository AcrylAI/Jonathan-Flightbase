import { TextAnnotationType } from "@tools/types/annotation";
import { ColorPickSet } from "@tools/types/components";

export type TextRenderType = {
  color: ColorPickSet;
  border: ColorPickSet;
  level: number;
  isComment?: boolean;
  isClose?: boolean;
  isLast?: boolean;
  direction?: 'left' | 'center' | 'right';
} & Pick<TextAnnotationType, 'id' | 'start' | 'end' | 'className'>;

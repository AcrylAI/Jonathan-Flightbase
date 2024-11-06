import {
  BboxIcon as BboxClassIcon,
  NerIcon as NerClassIcon,
  PolyIcon as PolyClassIcon,
} from './ClassIcon';
import { CareRightIcon, EyeCloseIcon, EyeIcon } from './CommonIcon';
import {
  BboxIcon as BboxToolIcon,
  HandIcon,
  HR,
  IssueIcon,
  PolygonIcon as PolygonToolIcon,
  SelectIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './ToolIcon';

const ToolIcon = {
  SelectIcon,
  BboxIcon: BboxToolIcon,
  HandIcon,
  ZoomInIcon,
  ZoomOutIcon,
  PolygonIcon: PolygonToolIcon,
  HR,
  IssueIcon,
};

const CommonIcon = {
  EyeIcon,
  EyeCloseIcon,
  CareRightIcon,
};

const ClassIcon = {
  BboxIcon: BboxClassIcon,
  PolygonIcon: PolyClassIcon,
  NerIcon: NerClassIcon,
};

export { ToolIcon, ClassIcon, CommonIcon };

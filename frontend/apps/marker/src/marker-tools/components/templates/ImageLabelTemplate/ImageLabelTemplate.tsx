import { useState } from 'react';

import { ToolIcon } from '@tools/assets';
import { ToolButton } from '@tools/components/molecules';
import {
  Header,
  IssueSide,
  LabelSide,
  Template,
  ToolSide,
} from '@tools/components/organisms';
import { ToolboxType } from '@tools/types/label';
import {
  TOOLBOX_BBOX_TOOL,
  TOOLBOX_HAND_TOOL,
  TOOLBOX_ISSUE_TOOL,
  TOOLBOX_POLYGON_TOOL,
  TOOLBOX_SELECTION_TOOL,
  TOOLBOX_ZOOM_IN_TOOL,
  TOOLBOX_ZOOM_OUT_TOOL,
} from '@tools/types/literal';
import useT from "@src/hooks/Locale/useT";

type Props = {
  detail: any;
};

function ImageLabelTemplate({ detail }: Props) {
  const { t } = useT();

  const [toolboxType, setToolboxType] = useState<ToolboxType>(
    TOOLBOX_SELECTION_TOOL,
  );

  const onClickToolButton = (tools: ToolboxType) => {
    setToolboxType(tools);
  };

  if (detail) {
    return (
      <Template.Container>
        <Header detail={detail} />

        <Template.Main>
          <ToolSide>
            <ToolButton
              disabled={false}
              selected={toolboxType === TOOLBOX_SELECTION_TOOL}
              title={ t(`component.shortcut.selecttool`) }
              shortcut='V'
              onClick={() => onClickToolButton(TOOLBOX_SELECTION_TOOL)}
            >
              <ToolIcon.SelectIcon
                select={toolboxType === TOOLBOX_SELECTION_TOOL}
              />
            </ToolButton>
            <ToolButton
              disabled={false}
              selected={toolboxType === TOOLBOX_HAND_TOOL}
              title={t(`component.shortcut.handtool`)}
              shortcut='H'
              onClick={() => onClickToolButton(TOOLBOX_HAND_TOOL)}
            >
              <ToolIcon.HandIcon select={toolboxType === TOOLBOX_HAND_TOOL} />
            </ToolButton>
            <ToolButton
              disabled={false}
              selected={toolboxType === TOOLBOX_ZOOM_IN_TOOL}
              title={t(`component.shortcut.zoomin`)}
              shortcut='+'
              onClick={() => onClickToolButton(TOOLBOX_ZOOM_IN_TOOL)}
            >
              <ToolIcon.ZoomInIcon
                select={toolboxType === TOOLBOX_ZOOM_IN_TOOL}
              />
            </ToolButton>
            <ToolButton
              disabled={false}
              selected={toolboxType === TOOLBOX_ZOOM_OUT_TOOL}
              title={t(`component.shortcut.zoomout`)}
              shortcut='-'
              onClick={() => onClickToolButton(TOOLBOX_ZOOM_OUT_TOOL)}
            >
              <ToolIcon.ZoomOutIcon
                select={toolboxType === TOOLBOX_ZOOM_OUT_TOOL}
              />
            </ToolButton>
            <ToolIcon.HR />
            <ToolButton
              disabled={false}
              selected={toolboxType === TOOLBOX_BBOX_TOOL}
              title={t(`component.tool.bbox`)}
              shortcut='B'
              onClick={() => onClickToolButton(TOOLBOX_BBOX_TOOL)}
            >
              <ToolIcon.BboxIcon select={toolboxType === TOOLBOX_BBOX_TOOL} />
            </ToolButton>
            <ToolButton
              disabled={false}
              selected={toolboxType === TOOLBOX_POLYGON_TOOL}
              title={t(`component.tool.polygon`)}
              shortcut='P'
              onClick={() => onClickToolButton(TOOLBOX_POLYGON_TOOL)}
            >
              <ToolIcon.PolygonIcon
                select={toolboxType === TOOLBOX_POLYGON_TOOL}
              />
            </ToolButton>
            <ToolIcon.HR />
            <ToolButton
              disabled={false}
              selected={toolboxType === TOOLBOX_ISSUE_TOOL}
              title={t(`component.tool.issuetool`)}
              shortcut='C'
              onClick={() => onClickToolButton(TOOLBOX_ISSUE_TOOL)}
            >
              <ToolIcon.IssueIcon select={toolboxType === TOOLBOX_ISSUE_TOOL} />
            </ToolButton>
          </ToolSide>

          <Template.Contents></Template.Contents>

          <Template.Aside>
            <LabelSide>null</LabelSide>
            <IssueSide>null</IssueSide>
          </Template.Aside>
        </Template.Main>
      </Template.Container>
    );
  }

  return <Template.Container></Template.Container>;
}

export default ImageLabelTemplate;

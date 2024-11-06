import { useRecoilState } from 'recoil';

import { ToolIcon } from '@tools/assets';
import { ToolButton } from '@tools/components/molecules';
import {
  Header,
  IssueSide,
  LabelSide,
  Template,
  ToolSide,
} from '@tools/components/organisms';
import { ScrollView } from '@tools/components/view';
import {
  ClassDepth,
  IssueList,
  LabelList,
  Space,
} from '@tools/package/NER/component';
import { selectedToolAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { ClassesResultType, JobDetailResultType } from '@tools/types/fetch';
import { ToolboxType } from '@tools/types/label';
import {
  TOOLBOX_ISSUE_TOOL,
  TOOLBOX_SELECTION_TOOL,
} from '@tools/types/literal';
import useT from "@src/hooks/Locale/useT";

type Props = {
  detail: JobDetailResultType<TextAnnotationType>;
  classes: Array<ClassesResultType>;
};

function TextInspectionTemplate({ detail, classes }: Props) {
  const { t } = useT();

  const [selectedTool, setSelectedTool] = useRecoilState(selectedToolAtom);

  const onClickToolButton = (tools: ToolboxType) => {
    setSelectedTool(tools);
  };

  return (
    <Template.Container>
      <Header detail={detail} />

      <Template.Main>
        <ToolSide>
          <ToolButton
            selected={selectedTool === TOOLBOX_SELECTION_TOOL}
            title={t(`component.shortcut.selecttool`)}
            shortcut='V'
            onClick={() => onClickToolButton(TOOLBOX_SELECTION_TOOL)}
          >
            <ToolIcon.SelectIcon
              select={selectedTool === TOOLBOX_SELECTION_TOOL}
            />
          </ToolButton>
          <ToolButton
            selected={selectedTool === TOOLBOX_ISSUE_TOOL}
            title={t(`component.tool.issuetool`)}
            shortcut='C'
            onClick={() => onClickToolButton(TOOLBOX_ISSUE_TOOL)}
          >
            <ToolIcon.IssueIcon select={selectedTool === TOOLBOX_ISSUE_TOOL} />
          </ToolButton>
        </ToolSide>

        <Template.Contents>
          {
            classes.length > 0 && <ClassDepth list={classes} />
          }
          <ScrollView style={{ padding: 40 }}>
            <Space detail={detail} />
          </ScrollView>
        </Template.Contents>

        <Template.Aside>
          <LabelSide>
            <LabelList classes={classes} detail={detail} />
          </LabelSide>
          <IssueSide>
            <IssueList detail={detail} />
          </IssueSide>
        </Template.Aside>
      </Template.Main>
    </Template.Container>
  );
}

export default TextInspectionTemplate;

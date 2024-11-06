import {
  Header,
  IssueSide,
  LabelSide,
  Template,
  ToolSide,
} from '@tools/components/organisms';
import { ScrollView } from '@tools/components/view';
import { Space } from '@tools/package/NER/component';
import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';

const emptyDetail: JobDetailResultType<TextAnnotationType> = {
  fileStatus: 0,
  labelerName: '',
  reviewerName: '',
  issue: [],
  nextId: 0,
  text: '',
  url: '',
  annotations: [],
  currentCnt: 0,
  allWork: 0,
  prevId: 0,
  fileName: '',
  createdAt: '',
  doneWork: 0,
  labelerId: 0,
  labelFlag: 0,
  projectId: 0,
  projectName: '',
  rejectCnt: 0,
  reviewerId: 0,
};

type Props = {
  view?: boolean;
};

function EmptyTemplate({ view = false }: Props) {
  return (
    <Template.Container>
      <Header detail={emptyDetail} />

      <Template.Main>
        {!view && <ToolSide></ToolSide>}

        <Template.Contents>
          <ScrollView style={{ padding: 40 }}>
            <Space detail={emptyDetail} />
          </ScrollView>
        </Template.Contents>

        <Template.Aside>
          <LabelSide>
            <div />
          </LabelSide>
          <IssueSide>
            <div />
          </IssueSide>
        </Template.Aside>
      </Template.Main>
    </Template.Container>
  );
}

export default EmptyTemplate;

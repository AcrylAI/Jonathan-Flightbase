import {
  Header,
  IssueSide,
  LabelSide,
  Template,
} from '@tools/components/organisms';
import { ScrollView } from '@tools/components/view';
import { IssueList, LabelList, Space } from '@tools/package/NER/component';
import { TextAnnotationType } from '@tools/types/annotation';
import { ClassesResultType, JobDetailResultType } from '@tools/types/fetch';
import useT from "@src/hooks/Locale/useT";

type Props = {
  detail: JobDetailResultType<TextAnnotationType>;
  classes: Array<ClassesResultType>;
};

function TextViewTemplate({ detail, classes }: Props) {
  return (
    <Template.Container>
      <Header detail={detail} />

      <Template.Main>
        <Template.Contents>
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

export default TextViewTemplate;

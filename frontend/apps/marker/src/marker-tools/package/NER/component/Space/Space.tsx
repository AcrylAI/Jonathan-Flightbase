import CommentContainer from '../CommentField/CommentContainer';

import { useNerLabeling } from '@tools/package/NER/hooks';

import './ner.scss';

import { useEventDisable } from '@tools/hooks/utils';
import { DeleteContainer } from '@tools/package/NER/component/DeleteContainer';
import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';
import {
  INSPECTION_FILESTATE,
  REJECTION_FILESTATE,
  WORKING_FILESTATE,
} from '@tools/types/literal';

const CANVASID = 'ner-main-space';
const PARAGRAPHID = 'ner-paragraph-space';

type Props = {
  detail: JobDetailResultType<TextAnnotationType>;
};

function Space({ detail }: Props) {
  useNerLabeling(detail, CANVASID, PARAGRAPHID);
  const { /*allowByManager,*/ allowByFileStatus } = useEventDisable(detail);

  return (
    <>
      <main id={CANVASID} className='ner-space'>
        <p id={PARAGRAPHID} className='ner-paragraph' />
      </main>
      {/*{allowByManager(detail.fileStatus) && <DeleteContainer />}*/}
      {allowByFileStatus(INSPECTION_FILESTATE) && <CommentContainer />}
    </>
  );
}

export type { Props as NERSpaceProps };

export default Space;

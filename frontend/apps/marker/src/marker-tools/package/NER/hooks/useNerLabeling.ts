import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { cloneDeep, debounce, isEqual } from 'lodash';

import { useEventDisable } from '@tools/hooks/utils';
import { NamedEntityRecognition } from '@tools/package/NER/lib';
import {
  issueListAtom,
  labelListAtom,
  selectedClassAtom,
  selectedToolAtom,
} from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';
import {
  TOOLBOX_ISSUE_TOOL,
  TOOLBOX_SELECTION_TOOL,
} from '@tools/types/literal';

type VoidFunction = () => void;

function useNerLabeling(
  detail: JobDetailResultType<TextAnnotationType>,
  canvasId: string,
  paragraphId: string,
) {
  const [ner, setNer] = useState<NamedEntityRecognition | null>(null);

  const [labels, setLabels] =
    useRecoilState<Array<TextAnnotationType>>(labelListAtom);
  const [issues, setIssues] =
    useRecoilState<Array<TextAnnotationType>>(issueListAtom);
  const currentClass = useRecoilValue(selectedClassAtom);
  const selectedTool = useRecoilValue(selectedToolAtom);

  const { allowByManager } = useEventDisable(detail);

  const onClick = useCallback(
    debounce(() => {
      if (selectedTool === TOOLBOX_SELECTION_TOOL) {
        if (
          ner &&
          ner.text.length > 0 &&
          !(ner.text.length === 1 && ner.text === ' ') &&
          currentClass
        ) {
          ner.push(currentClass);
          ner.render();
          setLabels(cloneDeep(ner.Labels));
        }
      } else if (selectedTool === TOOLBOX_ISSUE_TOOL) {
        if (
          ner &&
          ner.text.length > 0 &&
          !(ner.text.length === 1 && ner.text === ' ')
        ) {
          ner.issueing();
          ner.render();
          setIssues(cloneDeep(ner.Issues));
        }
      }
    }, 200) as VoidFunction,
    [ner, currentClass, selectedTool],
  );

  useEffect(() => {
    const annotations = detail.annotations;
    const issues = detail.issue;

    const _library = new NamedEntityRecognition(
      canvasId,
      paragraphId,
      detail.text ?? '',
      annotations,
      issues,
    );
    setNer(cloneDeep(_library));
    setLabels(annotations);
    setIssues(issues);
  }, [detail]);

  useEffect(() => {
    if (ner) {
      ner.render();
    }
  }, [ner]);

  useEffect(() => {
    if (ner) {
      if (!isEqual(ner.Labels, labels)) {
        ner.Labels = cloneDeep(labels);
        ner.render();
      }
    }
  }, [ner, labels]);

  useEffect(() => {
    if (ner) {
      if (!isEqual(ner.Issues, issues)) {
        ner.Issues = cloneDeep(issues);
        ner.render();
      }
    }
  }, [ner, issues]);

  useEffect(() => {
    if (!allowByManager(detail.fileStatus))
      return;

    document.getElementById(canvasId)?.addEventListener('click', onClick);
    return () => {
      document.getElementById(canvasId)?.removeEventListener('click', onClick);
    };
  }, [onClick, canvasId, detail]);
}

export default useNerLabeling;

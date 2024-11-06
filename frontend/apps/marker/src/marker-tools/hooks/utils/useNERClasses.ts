import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { selectedClassAtom } from '@tools/store/classesStore';
import { ClassesResultType } from '@tools/types/fetch';

function useNERClasses(classes: Array<ClassesResultType>) {
  const [selectedId, setSelectedId] = useState<Array<number>>([0, 0, 0]);
  const [currentClass, setCurrentClass] = useRecoilState(selectedClassAtom);

  const primaryClass = classes.filter((v) => v.depth === 0);
  const secondaryClass = classes.filter(
    (v) => v.depth === 1 && v.parent_id === selectedId[0],
  );
  const tertiaryClass = classes.filter(
    (v) => v.depth === 2 && v.parent_id === selectedId[1],
  );

  const onClickClass = (depth: number, classId: number) => {
    setSelectedId((prev) => {
      let curr = [...prev];
      const target = curr[depth] === classId ? 0 : classId;

      switch (depth) {
        case 0:
          curr = [target, 0, 0];
          break;
        case 1:
          curr = [curr[0], target, 0];
          break;
        case 2:
          curr = [curr[0], curr[1], target];
          break;
        default:
          break;
      }
      return curr;
    });

    if (depth === 2) {
      if (classId === currentClass?.id) {
        setCurrentClass(null);
      } else {
        const find = classes.find((v) => v.id === classId);
        if (find) {
          setCurrentClass(find);
        }
      }
    }
  };

  useEffect(() => {
    if (selectedId[2] === 0) {
      setCurrentClass(null);
    }
  }, [selectedId[2]]);

  return {
    selectedId,
    currentClass,
    primaryClass,
    secondaryClass,
    tertiaryClass,
    onClickClass,
  };
}

export default useNERClasses;

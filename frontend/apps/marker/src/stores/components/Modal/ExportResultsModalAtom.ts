import { atom } from 'recoil';
export interface exportModalAtomModel {
  projectId: number;
  form: 0 | 1; // 0 JSON 1 CSV
  method: 0 | 1; // 0 send folder 1 immediately
  fileName: string;
  force: 0 | 1; // 0 | undefined no 1 overwrite
  dataset: string;
  classCount?: number | null;
  refetch: () => void;
}

export const exportModalAtom = atom<exportModalAtomModel>({
  key: '@src/components/organisms/Modal/ExportResultsModalAtom',
  default: {
    projectId: 0,
    form: 0,
    method: 0,
    fileName: '',
    force: 0,
    dataset: '',
    classCount: null,
    refetch: () => {},
  },
});

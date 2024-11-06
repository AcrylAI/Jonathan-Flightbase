import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';

type userModel = {
  id: number;
};
type requestModel = {
  projectId: number;
  users: Array<userModel>;
};

const usePostAddProjectMember = () => {
  return useMutation(
    [
      '@/components/organisms/Modal/AddProjectMemberModal/usePostAddProjectMemberList',
    ],
    fetcher.mut<requestModel>({
      url: '/user/project_user_add_list',
      method: METHOD.POST,
    }),
  );
};
export type { requestModel as usePostAddProjectMemberRequestModel };
export default usePostAddProjectMember;

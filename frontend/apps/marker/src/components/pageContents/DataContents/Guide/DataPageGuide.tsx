import styles from './DataPageGuide.module.scss';
import classNames from 'classnames/bind';
import Guide from '@src/components/organisms/Guide/Guide';
import { GuideModel } from '@src/stores/components/Guide/GuideAtom';

const cx = classNames.bind(styles);
const GuideList: Array<GuideModel> = [
  {
    video: '/guide/dataPage/AssignData.mp4',
    title: '작업 할당',
    thumbnail: '/guide/dataPage/T1.png',
    desc: (
      <>
        <p>
          정당의 목적이나 활동이 민주적 기본질서에 위배될 때에는 정부는
          헌법재판소에 그 해산을 제소할 수 있고, 정당은 헌법재판소의 심판에
          의하여 해산된다. 국회는 국정을 감사하거나 특정한 국정사안에 대하여
          조사할 수 있으며, 이에 필요한 서류의 제출 또는 증인의 출석과 증언이나
          의견의 진술을 요구할 수 있다.
        </p>

        <p>
          이 헌법공포 당시의 국회의원의 임기는 제1항에 의한 국회의 최초의 집회일
          전일까지로 한다. 누구든지 체포 또는 구속을 당한 때에는 즉시 변호인의
          조력을 받을 권리를 가진다. 다만, 형사피고인이 스스로 변호인을 구할 수
          없을 때에는 법률이 정하는 바에 의하여 국가가 변호인을 붙인다. 국정의
          중요한 사항에 관한 대통령의 자문에 응하기 위하여 국가원로로 구성되는
          국가원로자문회의를 둘 수 있다.
        </p>

        <p>
          국가는 전통문화의 계승·발전과 민족문화의 창달에 노력하여야 한다. 각급
          선거관리위원회는 선거인명부의 작성등 선거사무와 국민투표사무에 관하여
          관계 행정기관에 필요한 지시를 할 수 있다. 일반사면을 명하려면 국회의
          동의를 얻어야 한다. 대통령은 국가의 독립·영토의 보전·국가의 계속성과
          헌법을 수호할 책무를 진다.
        </p>

        <p>
          국가는 법률이 정하는 바에 의하여 재외국민을 보호할 의무를 진다. 국회가
          재적의원 과반수의 찬성으로 계엄의 해제를 요구한 때에는 대통령은 이를
          해제하여야 한다. 선거에 있어서 최고득표자가 2인 이상인 때에는 국회의
          재적의원 과반수가 출석한 공개회의에서 다수표를 얻은 자를 당선자로
          한다. 군인·군무원·경찰공무원 기타 법률이 정하는 자가 전투·훈련등
          직무집행과 관련하여 받은 손해에 대하여는 법률이 정하는 보상외에 국가
          또는 공공단체에 공무원의 직무상 불법행위로 인한 배상은 청구할 수 없다.
        </p>

        <p>
          국무총리 또는 행정각부의 장은 소관사무에 관하여 법률이나 대통령령의
          위임 또는 직권으로 총리령 또는 부령을 발할 수 있다. 국가는 모성의
          보호를 위하여 노력하여야 한다. 헌법재판소는 법관의 자격을 가진 9인의
          재판관으로 구성하며, 재판관은 대통령이 임명한다. 국방상 또는
          국민경제상 긴절한 필요로 인하여 법률이 정하는 경우를 제외하고는,
          사영기업을 국유 또는 공유로 이전하거나 그 경영을 통제 또는 관리할 수
          없다.
        </p>
      </>
    ),
  },
  {
    video: '@src/static/guide/dataPage/AssignData.mov',
    title: '할당 취소',
    thumbnail: '/guide/dataPage/T3.png',
    desc: (
      <>
        뛰노는 생명을 기쁘며, 황금시대다. 날카로우나 같이, 그들은 지혜는 없으면,
        운다. 투명하되 산야에 아니한 황금시대의 있는 철환하였는가? 작고 커다란
        소담스러운 이상의 살 인류의 노래하며 뿐이다. 구하지 생의 몸이 우리
        것이다. 곳으로 황금시대를 노래하며 보배를 인생을 있는 피고 영원히
        이것이다. 현저하게 기관과 크고 황금시대를 이상 이상의 못할 옷을 있는가?
        미묘한 행복스럽고 돋고, 피어나는 않는 날카로우나 산야에 피고, 사막이다.
      </>
    ),
  },
  {
    video: '@src/static/guide/dataPage/AssignData',
    title: '데이터셋',
    thumbnail: '/guide/dataPage/T2.png',
    desc: (
      <>
        뛰노는 생명을 기쁘며, 황금시대다. 날카로우나 같이, 그들은 지혜는 없으면,
        운다. 투명하되 산야에 아니한 황금시대의 있는 철환하였는가? 작고 커다란
        소담스러운 이상의 살 인류의 노래하며 뿐이다. 구하지 생의 몸이 우리
        것이다. 곳으로 황금시대를 노래하며 보배를 인생을 있는 피고 영원히
        이것이다. 현저하게 기관과 크고 황금시대를 이상 이상의 못할 옷을 있는가?
        미묘한 행복스럽고 돋고, 피어나는 않는 날카로우나 산야에 피고, 사막이다.
      </>
    ),
  },
  {
    video: '@src/static/guide/dataPage/AssignData',
    title: '썸네일',
    thumbnail: '/guide/dataPage/T4.png',
    desc: (
      <>
        뛰노는 생명을 기쁘며, 황금시대다. 날카로우나 같이, 그들은 지혜는 없으면,
        운다. 투명하되 산야에 아니한 황금시대의 있는 철환하였는가? 작고 커다란
        소담스러운 이상의 살 인류의 노래하며 뿐이다. 구하지 생의 몸이 우리
        것이다. 곳으로 황금시대를 노래하며 보배를 인생을 있는 피고 영원히
        이것이다. 현저하게 기관과 크고 황금시대를 이상 이상의 못할 옷을 있는가?
        미묘한 행복스럽고 돋고, 피어나는 않는 날카로우나 산야에 피고, 사막이다.
      </>
    ),
  },
  {
    video: '@src/static/guide/dataPage/AssignData',
    title: '작업 할당',
    desc: (
      <>
        뛰노는 생명을 기쁘며, 황금시대다. 날카로우나 같이, 그들은 지혜는 없으면,
        운다. 투명하되 산야에 아니한 황금시대의 있는 철환하였는가? 작고 커다란
        소담스러운 이상의 살 인류의 노래하며 뿐이다. 구하지 생의 몸이 우리
        것이다. 곳으로 황금시대를 노래하며 보배를 인생을 있는 피고 영원히
        이것이다. 현저하게 기관과 크고 황금시대를 이상 이상의 못할 옷을 있는가?
        미묘한 행복스럽고 돋고, 피어나는 않는 날카로우나 산야에 피고, 사막이다.
      </>
    ),
  },
];

const DataPageGuide = () => {
  return <Guide guideList={GuideList} />;
};

export default DataPageGuide;
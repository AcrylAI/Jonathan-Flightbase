# Jonathan Platform Front Repository

모노레포 기법(yarn workspace, lerna)으로 구성된 Jonathan Platform의 프론트 소스입니다.

## 구성

### 디렉토리 구조

플랫폼의 서비스(제품) 관련 패키지는 apps 폴더에서 관리하며 개발 툴 관련 패키지는 packages에서 관리하게 구분하였습니다.

```
repo /
├─ apps/
│  ├─ marker
│  ├─ portal
│  ├─ flightbase
│  ├─ federated-learning
│  ├─ portal
│
├─ packages/
│  ├─ ui/
│     ├─  ui-graph/
│     ├─  ui-react/
│     ├─  ui-style/
│  ├─ react-utils/
│
│  ├─ utils/
│
├─ .gitignore
├─ lerna.json
├─ package.json
├─ README.md
├─ node_modules/
├─ yarn.lock
```

### packages

- @jonathan/ui-style : Jonathan Platform UI의 스타일 패키지입니다. rollup으로 구성되어 있으며 Jonathan Platform의 다른 패키지 또는 어플리케이션에서 사용할 수 있도록 css 및 가이드 페이지를 제공합니다.
- @jonathan/ui-graph : Jonathan Platform의 차트 패키지 입니다. rollup으로 구성되어 있으며 Jonathan Platform의 다른 패키지 또는 어플리케이션에서 사용할 수 있도록 가이드 페이지를 제공합니다.
- @jonathan/ui-react : Jonathan Platform의 리액트 기반의 UI Kit 패키지 입니다. rollup, storybook으로 구성되어 있습니다.
- @jonathan/react-utils : Jonathan Platform의 공통 리액트 hooks 패키지 입니다. rollup으로 구성되어 있습니다.

### applications

- @jonathan/marker : 마커 프로젝트 패키지 입니다.
- @jonathan/portal : 통합로그인 프로젝트 패키지 입니다.
- @jonathan/flightbase : Flightbase 프로젝트 패키지 입니다.
- @jonathan/federated-learning : 연합학습 프로젝트 패키지 입니다.

<br/><br/>

## 메시지

### merge request 메시지

- merge request 시 title에 작성될 내용
- 작성 방법

```
양식 템플릿
[Merge] YYMMDD branch to branch

예시 : 22년 3월 31일 feature 브랜치에서 develop 브랜치로 merge request 요청
[Merge] 220331 feature to develop
```

### 커밋 메시지

- 작성 방법

```
[프로젝트 이름][액션] 내용
```

- 프로젝트 이름

```
workspace : 플랫폼 워크스페이스
flightbase : 플라이트베이스
federated-learning : 연합학습
portal : 포탈 (통합 로그인)
ui-react : 스토리북
ui-graph : 그래프 라이브러리
ui-style : style 라이브러리
react-utils : 공통 react 컴포넌트, hooks 라이브러리
```

- 액션 / 내용
- **한 커밋 안에 복수개의 유형이 들어가지 않도록 나눠서 커밋하는 것을 권장**

```
기능 : 기능 추가, 삭제, 변경(제품 코드 수정)
버그 : 버그 수정(제품 코드 수정)
리팩토링 : 코드 리팩토링(제품 코드 수정)
형식 : 코드 형식, 정렬, 주석 등의 변경(제품 코드 수정 없음, 동작에 영향을 주는 변경이 없을 때)
테스트 : 테스트 코드 추가, 삭제, 변경(코드 수정 없음)
문서 : 코드 외 문서 추가, 삭제, 변경
기타 : 위에 해당하지 않는 모든 변경 사항
```

## 개발 환경 준비

<br/>

### node module 설치

```
yarn install
```

yarn 명령어를 통해 모든 패키지의 node_module 설치 합니다.

**yarn install 실행 시
00h00m00s 0/0: : ERROR: [Errno 21] Is a directory: 'install' 에러 발생하면**

---

sudo apt remove cmdtest<br/>
sudo apt remove yarn<br/>
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -<br/>
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list<br/>
sudo apt-get update<br/>
sudo apt-get install yarn -y<br/>

---

하면 해결됩니다.

nodejs를 그냥 설치하면 8버전이 설치되는데 에러나면 14.17.6로 업데이트 후 yarn install

<br/><br/>

### workspace에 플러그인 설치/삭제

<br/>

- workspace root폴더 아래 플러그인/라이브러리 설치, 삭제

```
yarn (add | remove) (-D) [플러그인 이름] --ignore-workspace-root-check
```

위 명령어를 실행하거나 root package.json에 직접 플러그인을 작성하여 yarn install 명령어를 실행하여 설치할 수 있습니다.

- workspace 패키지/앱 아래 플러그인 설치, 삭제

```
yarn workspace [패키지 이름/앱 이름] (add | remove) (-D) [플러그인 이름]
```

### packages 폴더에 있는 모든 패키지 빌드

<br/>

```
yarn build-pack:all
```

위의 명령어는 packages 폴더 내에 존재하는 모든 패키지들을 빌드하는 명령 입니다. packages 폴더안의 패키지들은 다른 패키지들의 의존성이 될 수 있기 때문에 먼저 빌드를 해줍니다.

> 모노레포 안의 서로 의존성을 가지는 로컬 패키지들은 각각의 node_modules에 심볼릭 링크로 연결됩니다.

<br/><br/>

### 패키지들의 개발 서버 열기

<br/>

#### @jonathan/ui-style 패키지 개발 서버 열기

<br/>

```
yarn start:ui-style
```

or

```
yarn workspace @jonathan/ui-style start
```

<br/><br/>

#### @jonathan/ui-graph 패키지 개발 서버 열기

<br/>

```
yarn start:ui-graph
```

or

```
yarn workspace @jonathan/ui-graph start
```

<br/><br/>

#### @jonathan/ui-react 패키지 개발 서버 열기

<br/>

```
yarn start:ui-react
```

or

```
yarn workspace @jonathan/ui-react storybook
```

<br/><br/>

#### @jonathan/flightbase 열기

<br/>

```
yarn start:fb-dev (현재 가능한 config option: real, dev, yb, la, ed, jk, kl)
```

or

```
yarn workspace @jonathan/flightbase start:dev
```

<br/><br/>

## 배포

<br/>

### 도커에 배포하기

install 폴더안에 jf_installer_front.py 파일 실행

ex)

```
python jf_installer_front.py --master_ip 192.168.1.13 --api_port 56789 --flag MASTER
```

#### jf_installer_front.py 실행 파라미터

<br/>

##### --master_ip

마스터 IP (프론트 IP 주소 및 api 서버 IP의 default 값)

##### --api_url

api 요청 서버 IP (별도 지정 필요할 경우)

##### --api_port

프론트와 연결할 api 서버 IP

##### --front_port

배포할 프론트 웹서버 포트 (default: 80)

##### --protocol_config

프론트 배포를 http로 할지 https 'http' | 'https'(default: https)

##### --front_build_config

flightbase app-config 설정 'kisti' | 'etri' | 'cbtp'

##### --ui_guide

ui 가이드 설치 여부 'true' | 'false' (default 값 'false')

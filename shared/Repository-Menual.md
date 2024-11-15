# 신규 개발자 가이드

## 1. 시작하기 전에

### 1.1 필수 설치 항목
- Git
- Node.js (v16 이상)
- Yarn (v1.22 이상)

### 1.2 초기 설정

1. 저장소 클론
   git clone [저장소_URL]

2. 의존성 설치
   yarn install

3. 초기 설정 검증
   yarn type-check
   yarn lint
   yarn format:check

## 2. 개발 시작하기

### 2.1 새로운 작업 시작

1. develop 브랜치 최신화
   git checkout develop
   git pull origin develop

2. 새 작업 브랜치 생성
   git checkout -b feature/[작업명]
   예: git checkout -b feature/login-page

### 2.2 작업 유형별 브랜치 명명 규칙
- 새 기능: feature/기능명
- 버그 수정: bugfix/버그명
- 릴리스: release/v숫자
- 긴급 수정: hotfix/수정명

### 2.3 커밋 메시지 규칙
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 코드
- chore: 기타 변경사항

## 3. 개발 워크플로우

### 3.1 작업 시작 전 준비사항
1. 이슈 생성
   - 작업 내용 상세 기술
   - 관련 기능 명세 첨부
   - 담당자 지정
   - 라벨 추가 (feature, bug, enhancement 등)

2. 브랜치 생성 전 확인사항
   - develop 브랜치가 최신 상태인지 확인
   - 관련 이슈 번호 확인
   - 작업 범위 명확히 파악

### 3.2 코드 작성 및 커밋
1. 코드 작성 규칙
   - TypeScript strict 모드 준수
   - 컴포넌트별 단위 테스트 필수
   - 스타일 가이드 준수 (Prettier 설정 기준)
   - 접근성 가이드라인 준수

2. 커밋 전 검증
   - ESLint 검사 실행
   - Prettier 포맷팅 검사
   - TypeScript 타입 검사
   - 테스트 코드 실행
   - 커밋 메시지 컨벤션 확인

### 3.3 푸시 및 PR 프로세스
1. 푸시 전 준비
   - 작업 브랜치 최신화 (develop 브랜치 rebase)
   - 충돌 해결
   - 불필요한 파일 제거 (.DS_Store, node_modules 등)

2. PR 생성 시 필수 정보
   - 제목 형식: [작업유형] #이슈번호 작업내용
   - 예시: [Feature] #123 로그인 페이지 구현

3. PR 본문 작성
   - 구현 내용 상세 설명
   - 테스트 결과 스크린샷
   - 관련 이슈 연결
   - 리뷰어 체크리스트 포함

4. 자동화된 검증 절차
   - GitHub Actions 품질 검사
   - 브랜치 보호 규칙 검증
   - 코드 커버리지 검사
   - 성능 테스트 (필요시)

### 3.4 코드 리뷰 프로세스
1. 리뷰어 지정
   - 최소 1명의 필수 리뷰어
   - 관련 도메인 전문가 포함
   - CODEOWNERS 규칙 준수

2. 리뷰 응답 시간
   - 최대 24시간 이내 첫 리뷰
   - 긴급 수정건은 4시간 이내

3. 리뷰 피드백 반영
   - 피드백 사항 즉시 반영
   - 변경사항 추가 시 리뷰어에게 알림
   - 토론이 필요한 사항은 PR 코멘트로 논의

### 3.5 병합 및 배포 프로세스
1. 병합 전 필수 조건
   - 모든 자동화 검사 통과
   - 필수 리뷰어 승인 완료
   - 충돌 해결 완료
   - 테스트 커버리지 기준 충족

2. 병합 후 절차
   - 작업 브랜치 삭제
   - 관련 이슈 종료
   - 배포 파이프라인 모니터링
   - QA 팀 테스트 요청

3. 배포 모니터링
   - 에러 로그 확인
   - 성능 메트릭 모니터링
   - 사용자 피드백 수집

### 3.6 문제 발생 시 대응
1. 배포 후 버그 발견
   - hotfix 브랜치 생성
   - 긴급 PR 생성
   - 팀 리드에게 즉시 보고

2. 성능 이슈 발생
   - 프로파일링 진행
   - 원인 분석 문서화
   - 최적화 계획 수립

## 4. 품질 관리

### 4.1 코드 작성 전 확인사항
- [ ] develop 브랜치에서 새 브랜치 생성
- [ ] 브랜치 명명 규칙 준수
- [ ] 작업 범위 확인

### 4.2 커밋 전 체크리스트
- [ ] 코드 포맷팅 검사: yarn format:check
- [ ] 린트 검사: yarn lint
- [ ] 타입 체크: yarn type-check
- [ ] 테스트 코드 작성

### 4.3 PR 생성 체크리스트
- [ ] PR 제목 형식: [작업유형] 작업 내용 요약
- [ ] 변경사항 상세 설명
- [ ] 테스트 결과 포함
- [ ] 관련 이슈 연결
- [ ] UI 변경시 스크린샷 첨부

## 5. 주의사항

### 5.1 수정 금지 파일
- .github/
- shared/
- .eslintrc.json
- .prettierrc
- tsconfig.json

### 5.2 브랜치 보호 규칙
- main 브랜치 직접 푸시 금지
- PR 없이 브랜치 병합 불가
- 리뷰어 승인 필수
- 모든 테스트 통과 필수

## 6. 문제 해결 가이드

### 6.1 충돌 해결
1. 변경사항 임시 저장
   git stash

2. 최신 코드 가져오기
   git pull origin develop

3. 변경사항 복원
   git stash pop

4. 충돌 해결 후 커밋
   git add .
   git commit -m "merge: 충돌 해결"

### 6.2 빌드 실패 시
1. 캐시 삭제
   yarn clean

2. node_modules 재설치
   rm -rf node_modules
   yarn install

3. 타입 체크
   yarn type-check

## 7. 유용한 명령어 모음

### 7.1 자주 사용하는 Git 명령어
- 브랜치 상태 확인: git status
- 변경사항 확인: git diff
- 브랜치 전환: git checkout [브랜치명]
- 변경사항 임시 저장: git stash / git stash pop
- 브랜치 삭제: git branch -d [브랜치명]

### 7.2 자주 사용하는 Yarn 명령어
- 의존성 설치: yarn install
- 개발 서버 실행: yarn dev
- 테스트 실행: yarn test
- 린트 검사: yarn lint
- 타입 체크: yarn type-check

---

## 문의사항
- 기술 문의: [기술 리드 연락처]
- 프로세스 문의: [프로젝트 매니저 연락처]

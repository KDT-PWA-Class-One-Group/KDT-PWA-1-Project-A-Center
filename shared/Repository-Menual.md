# 팀 저장소 개발자 가이드

## 목차
1. [브랜치 전략](#1-브랜치-전략)
2. [Pull Request 가이드라인](#2-pull-request-가이드라인)
3. [공유 설정 관리](#3-공유-설정-관리)
4. [품질 관리](#4-품질-관리)
5. [문제 해결 가이드](#5-문제-해결-가이드)
6. [제한사항 및 이유](#6-제한사항-및-이유)

## 1. 브랜치 전략

### 브랜치 구조
main ───────────────────────────────
  │           │         │
develop ──────┘         │
  │                     │
feature/*               │
  │                     │
release/* ──────────────┘
  │
hotfix/* ────────────────────────────

### 브랜치 설명
- main: 제품 릴리스를 위한 안정적인 코드가 있는 기본 브랜치
- develop: 개발 중인 코드가 통합되는 브랜치
- feature/*: 새로운 기능 개발을 위한 브랜치
- bugfix/*: 버그 수정을 위한 브랜치
- release/*: 릴리스 준비를 위한 브랜치
- hotfix/*: 긴급한 프로덕션 버그 수정을 위한 브랜치

### 브랜치 작업 흐름

1. 기능 개발
   - develop 브랜치에서 feature 브랜치 생성
   - 기능 개발 완료 후 develop으로 병합
   - 예시: git checkout -b feature/user-auth develop

2. 버그 수정
   - develop 브랜치에서 bugfix 브랜치 생성
   - 수정 완료 후 develop으로 병합
   - 예시: git checkout -b bugfix/login-error develop

3. 릴리스 준비
   - develop에서 release 브랜치 생성
   - QA 및 버그 수정 후 main과 develop으로 병합
   - 예시: git checkout -b release/v1.0.0 develop

4. 긴급 수정
   - main에서 hotfix 브랜치 생성
   - 수정 후 main과 develop에 병합
   - 예시: git checkout -b hotfix/security-patch main

### 브랜치 명명 규칙 예시

좋은 예시:
- feature/user-authentication
- feature/shopping-cart
- bugfix/login-validation
- release/v1.0.0
- hotfix/security-fix

나쁜 예시:
- feature/fix-bug (hotfix 사용해야 함)
- feature (구체적이지 않음)
- hotfix/new-feature (feature 브랜치 사용해야 함)

## 2. Pull Request 가이드라인

### PR 생성 시 필수 작성 항목

제목 형식:
[브랜치타입] 작업 내용 요약
예시: [Feature] 사용자 인증 기능 구현

본문 필수 항목:
1. 변경 사항
   - 구체적인 변경 내용 나열
   - 영향받는 기능 명시

2. 테스트 결과
   - 실행한 테스트 종류
   - 테스트 결과 및 커버리지

3. 관련 이슈
   - 연결된 이슈 번호 (#123)

4. 스크린샷
   - UI 변경시 필수
   - 변경 전/후 비교

### PR 리뷰 가이드

좋은 리뷰 코멘트:
- "이 부분의 에러 처리를 추가하면 좋을 것 같습니다"
- "성능 개선을 위해 이런 방식은 어떨까요?"

지양할 리뷰 코멘트:
- "이상해요"
- "다시 작성해주세요"

## 3. 공유 설정 관리

### 수정 금지 파일
📁 .github/
📁 shared/
📄 .eslintrc.json
📄 .prettierrc
📄 tsconfig.json

### 동기화 후 필수 작업
1. 의존성 설치
   yarn install

2. 타입 체크
   yarn type-check

3. 린트 검사
   yarn lint

4. 포맷 검사
   yarn format:check

## 4. 품질 관리

### 코드 스타일 규칙
1. 세미콜론 사용
2. 작은따옴표 사용
3. 들여쓰기 2칸
4. 최대 줄 길이 100자
5. 화살표 함수 괄호 규칙 준수

### TypeScript 규칙
1. strict 모드 활성화
2. 명시적 타입 선언
3. any 타입 사용 제한
4. 미사용 변수 제거

## 5. 문제 해결 가이드

### 동기화 충돌 발생 시
1. 현재 변경사항 저장
   git stash

2. 최신 코드 가져오기
   git pull origin develop

3. 변경사항 복원 및 충돌 해결
   git stash pop

### 빌드 실패 시
1. 캐시 삭제
   yarn clean

2. node_modules 삭제 및 재설치
   rm -rf node_modules
   yarn install

3. 타입 체크
   yarn type-check

## 6. 제한사항 및 이유

### 브랜치 보호 규칙
1. main 브랜치 직접 푸시 금지
   - 이유: 안정적인 프로덕션 코드 유지
   - 해결: PR을 통한 코드 리뷰 후 병합

2. 강제 푸시(force push) 제한
   - 이유: 히스토리 보존 및 협업 안정성
   - 예외: hotfix 브랜치에서만 제한적 허용

### 코드 품질 규칙
1. any 타입 사용 제한
   - 이유: 타입 안정성 보장
   - 대안: 구체적인 타입 정의 사용

2. 미사용 변수 금지
   - 이유: 코드 명확성 및 유지보수성
   - 예외: 언더스코어(_) 접두사 사용 시 허용

### 자동화된 제한
1. PR 없이 브랜치 병합 불가
   - 이유: 코드 리뷰 보장
   - 해결: GitHub UI를 통한 PR 생성

2. 테스트 실패 시 병합 불가
   - 이유: 코드 품질 보장
   - 해결: 모든 테스트 통과 필요

### 공유 설정 수정 제한
1. 공유 설정 파일 직접 수정 금지
   - 이유: 팀 간 일관성 유지
   - 해결: 중앙 저장소를 통한 변경 요청

## 7. 유용한 명령어 모음

### 일상적인 개발 워크플로우
1. 새 기능 브랜치 생성
   git checkout develop
   git pull origin develop
   git checkout -b feature/새기능명

2. 작업 및 커밋
   git add .
   git commit -m "feat: 새로운 기능 추가"

3. 원격 저장소에 푸시
   git push origin feature/새기능명

### 긴급 버그 수정
1. hotfix 브랜치 생성
   git checkout main
   git pull origin main
   git checkout -b hotfix/버그수정명

2. 수정 및 커밋
   git add .
   git commit -m "fix: 긴급 버그 수정"

3. 원격 저장소에 푸시
   git push origin hotfix/버그수정명

---

# 만약 코드를 작성한다면 다음 순서를 따름

```bash
# 1-1. develop 브랜치 최신화
git checkout develop
git pull origin develop

# 1-2. 새로운 feature 브랜치 생성
git checkout -b feature/button-component
```

2. 코드 작성 및 품질 검사

```bash
# 2-1. 의존성 설치
yarn install

# 2-2. 코드 작성 후 품질 검사
yarn type-check  # 타입스크립트 검사
yarn lint       # 린트 검사
yarn format:check  # 포맷 검사
```

3. 커밋 준비

```bash
# 3-1. 변경사항 확인
git status
git diff

# 3-2. 스테이징
git add .  # 또는 특정 파일만: git add src/components/Button
```

4. 커밋 메시지 작성

```bash
git commit -m "feat: Button 컴포넌트 구현

- 기본 버튼 컴포넌트 구현
- 크기 variants 추가 (sm, md, lg)
- 색상 테마 지원
- 테스트 코드 추가

관련 이슈: #123"
```

5. 원격 저장소 푸시

```bash
git push origin feature/button-component
```

6. Pull Request 생성
1. GitHub 저장소 페이지에서 'Pull Request' 버튼 클릭
2. PR 템플릿에 따라 내용 작성:
   ```markdown
   ### 변경 사항
   - Button 컴포넌트 구현
   - 테스트 코드 추가

   ### 테스트 결과
   - 단위 테스트 완료
   - 린트 검사 통과

   ### 관련 이슈
   - Closes #123

   ### 리뷰어 체크리스트
   - [x] CODEOWNERS 규칙에 따른 리뷰어 자동 지정 확인
   - [x] 코드 품질 검사 통과
   - [x] 테스트 코드 작성
   ```

7. 리뷰 프로세스
1. 지정된 리뷰어의 승인 대기
2. 리뷰어의 피드백이 있는 경우:
   ```bash
   # 7-1. 수정사항 반영
   git add .
   git commit -m "refactor: 리뷰 피드백 반영"
   git push origin feature/button-component
   ```

8. CI/CD 확인
1. GitHub Actions 탭에서 다음 항목 확인:
   - 품질 검사 통과 여부
   - 브랜치 네이밍 규칙 준수 여부
   - 테스트 통과 여부

9. 병합 완료 후

```bash
# 9-1. develop 브랜치로 전환
git checkout develop

# 9-2. 최신 코드 가져오기
git pull origin develop

# 9-3. 작업 브랜치 삭제
git branch -d feature/button-component
```

### 주의사항
- 공유 설정 파일(shared/ 디렉토리)은 수정하지 않습니다.
- 커밋 메시지는 컨벤션을 준수합니다.
- PR 생성 전 모든 테스트가 통과되었는지 확인합니다.
- 리뷰어의 승인 없이는 병합하지 않습니다.

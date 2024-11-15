#!/bin/bash

# GitHub CLI 인증 확인
if ! gh auth status &>/dev/null; then
  echo "🔒 GitHub CLI 인증이 필요합니다. 'gh auth login' 명령어로 로그인해주세요."
  exit 1
fi

# 현재 디렉토리에서 저장소 이름 가져오기
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(echo $REPO_URL | sed 's/.*github.com[:/]\(.*\).git/\1/')

echo "🔧 저장소 $REPO_NAME 에 대한 브랜치 보호 규칙을 설정합니다..."

# main 브랜치 보호 규칙 설정
echo "🛡️ Main 브랜치 보호 규칙 설정 중..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO_NAME}/branches/main/protection" \
  -f required_status_checks='{"strict":true,"checks":[{"context":"quality-check"},{"context":"sync-typescript"}]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -f required_linear_history=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false || {
    echo "❌ Main 브랜치 보호 규칙 설정 실패"
    exit 1
  }

# develop 브랜치 보호 규칙 설정
echo "🛡️ Develop 브랜치 보호 규칙 설정 중..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO_NAME}/branches/develop/protection" \
  -f required_status_checks='{"strict":true,"checks":[{"context":"quality-check"}]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"required_approving_review_count":1}' \
  -f required_linear_history=true \
  -f allow_force_pushes=true \
  -f allow_deletions=false || {
    echo "❌ Develop 브랜치 보호 규칙 설정 실패"
    exit 1
  }

# GitHub Actions 워크플로우 설정 확인
echo "🔍 GitHub Actions 워크플로우 파일 확인 중..."

WORKFLOW_DIR=".github/workflows"
REQUIRED_WORKFLOWS=("quality-check.yml" "sync-integration.yml" "gitflow.yml")

for workflow in "${REQUIRED_WORKFLOWS[@]}"; do
  if [ ! -f "$WORKFLOW_DIR/$workflow" ]; then
    echo "⚠️ 경고: $workflow 파일이 없습니다. 생성합니다..."
    case $workflow in
      "quality-check.yml")
        cat > "$WORKFLOW_DIR/$workflow" << 'EOF'
name: Quality Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: |
          cd shared
          yarn install

      - name: Lint check
        run: yarn lint

      - name: Type check
        run: yarn type-check
EOF
        ;;

      "gitflow.yml")
        cat > "$WORKFLOW_DIR/$workflow" << 'EOF'
name: GitFlow Workflow

on:
  push:
    branches:
      - main
      - develop
      - 'feature/**'
      - 'release/**'
      - 'hotfix/**'
  pull_request:
    branches: [ main, develop ]

jobs:
  branch-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check branch naming convention
        run: |
          BRANCH_NAME=${GITHUB_REF#refs/heads/}
          if [[ $BRANCH_NAME =~ ^(feature|release|hotfix)/ ]]; then
            echo "Branch naming follows GitFlow convention"
          elif [[ $BRANCH_NAME == "main" || $BRANCH_NAME == "develop" ]]; then
            echo "Main or develop branch detected"
          else
            echo "Branch name does not follow GitFlow convention"
            exit 1
          fi
EOF
        ;;
    esac
  fi
done

echo "✅ 설정이 완료되었습니다!"
echo "
🔍 다음 단계를 확인해주세요:
1. develop 브랜치가 없다면 생성: git checkout -b develop main
2. GitHub Actions 탭에서 워크플로우 실행 상태 확인
3. Repository Settings > Actions > General에서 Actions 권한 확인
4. develop 브랜치로 feature 브랜치 생성 테스트: git checkout -b feature/test-workflow
"

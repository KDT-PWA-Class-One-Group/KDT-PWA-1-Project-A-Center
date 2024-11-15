import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import * as fs from 'fs';

async function backup(tempDir: string): Promise<void> {
  const backupDir = `${tempDir}_backup_${Date.now()}`;
  await exec.exec('cp', ['-r', tempDir, backupDir]);
  core.info(`백업 생성됨: ${backupDir}`);
}

async function compareChanges(sourceDir: string, tempDir: string): Promise<string[]> {
  const changes: string[] = [];
  await exec.exec('git', ['diff', '--name-status'], {
    cwd: tempDir,
    listeners: {
      stdout: (data: Buffer) => {
        changes.push(...data.toString().split('\n').filter(Boolean));
      },
    },
  });
  return changes;
}

async function syncFiles(sourceDir: string, tempDir: string): Promise<void> {
  const configurationSets = {
    node: [
      '.nvmrc',
      '.node-version',
      'package.json',
      'yarn.lock',
      'package-lock.json',
      '.npmrc',
      '.yarnrc',
      '.pnpmrc'
    ],
    python: [
      '.python-version',
      'requirements.txt',
      'poetry.lock',
      'pyproject.toml',
      'Pipfile',
      'Pipfile.lock'
    ],
    typescript: [
      'tsconfig.json',
      'tsconfig.*.json'
    ],
    linters: [
      '.eslintrc.js',
      '.eslintrc.json',
      '.eslintrc.yml',
      '.prettierrc',
      '.prettierrc.js',
      '.prettierrc.json',
      '.stylelintrc'
    ],
    bundlers: [
      'vite.config.ts',
      'vite.config.js',
      'webpack.config.js',
      'next.config.js',
      'next.config.mjs',
      'rollup.config.js'
    ],
    testing: [
      'jest.config.js',
      'jest.config.ts',
      'vitest.config.ts',
      'cypress.config.ts'
    ],
    docker: [
      'Dockerfile',
      'docker-compose.yml',
      'docker-compose.*.yml'
    ],
    shared: [
      'shared/**/*'
    ],
    github: [
      '.github/workflows/**/*',
      '.github/ISSUE_TEMPLATE/**/*',
      '.github/PULL_REQUEST_TEMPLATE.md'
    ]
  };

  // 버전 검증 함수
  async function validateVersions(): Promise<void> {
    const versions: Record<string, string> = {};

    // Node.js 버전 확인
    if (fs.existsSync('.nvmrc')) {
      versions.node = fs.readFileSync('.nvmrc', 'utf8').trim();
    }

    // Python 버전 확인
    if (fs.existsSync('.python-version')) {
      versions.python = fs.readFileSync('.python-version', 'utf8').trim();
    }

    // Package.json 엔진 버전 확인
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (pkg.engines) {
        versions.engines = JSON.stringify(pkg.engines);
      }
    }

    core.info('검증된 버전 정보:');
    Object.entries(versions).forEach(([key, value]) => {
      core.info(`${key}: ${value}`);
    });
  }

  // 각 설정 세트별 동기화 수행
  for (const [setName, patterns] of Object.entries(configurationSets)) {
    core.info(`${setName} 설정 동기화 시작...`);

    for (const pattern of patterns) {
      const sourcePath = path.join(sourceDir, pattern);
      const targetPath = path.join(tempDir, pattern);

      if (fs.existsSync(sourcePath)) {
        core.info(`${pattern} 파일 동기화 중...`);
        await exec.exec('cp', ['-r', sourcePath, targetPath]);
        core.info(`${pattern} 동기화 완료`);
      } else {
        core.debug(`${pattern} 파일이 존재하지 않음`);
      }
    }
  }

  // 의존성 설치 및 검증
  async function validateDependencies(): Promise<void> {
    if (fs.existsSync(path.join(tempDir, 'package.json'))) {
      core.info('Node.js 의존성 검증 중...');
      await exec.exec('yarn', ['install', '--frozen-lockfile']);
      await exec.exec('yarn', ['check-all']);
    }

    if (fs.existsSync(path.join(tempDir, 'requirements.txt'))) {
      core.info('Python 의존성 검증 중...');
      await exec.exec('pip', ['install', '-r', 'requirements.txt']);
    }
  }

  // 버전 및 의존성 검증 실행
  await validateVersions();
  await validateDependencies();
}

async function run(): Promise<void> {
  const startTime = Date.now();
  let backupCreated = false;

  try {
    const targetRepo = core.getInput('target-repo', { required: true });
    const sourceDir = core.getInput('source-dir', { required: true });
    const token = core.getInput('pat-token', { required: true });

    const repoUrl = `https://x-access-token:${token}@github.com/KDT-PWA-Class-One-Group/${targetRepo}.git`;
    const tempDir = path.join(process.env.GITHUB_WORKSPACE || '', 'temp', targetRepo);

    core.info(`동기화 시작: ${sourceDir} -> ${targetRepo}`);
    core.info(`시작 시간: ${new Date(startTime).toISOString()}`);

    // 대상 저장소 클론
    await exec.exec('git', ['clone', repoUrl, tempDir]);

    // 백업 생성
    await backup(tempDir);
    backupCreated = true;

    // 변경사항 미리보기
    const beforeChanges = await compareChanges(sourceDir, tempDir);
    core.info('예상되는 변경사항:');
    beforeChanges.forEach(change => core.info(`  ${change}`));

    // 파일 동기화 함수 호출
    await syncFiles(sourceDir, tempDir);

    // Git 설정
    process.chdir(tempDir);
    await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
    await exec.exec('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']);

    // yarn.lock 파일이 있는지 확인하고 설치 실행
    if (fs.existsSync(path.join(tempDir, 'yarn.lock'))) {
      await exec.exec('yarn', ['install', '--frozen-lockfile'], { cwd: tempDir });
    }

    // 변경사항 커밋 및 푸시
    await exec.exec('git', ['add', '.']);
    const changes = await compareChanges(sourceDir, tempDir);
    if (changes.length > 0) {
      const commitMessage = [
        'chore: sync shared configurations [skip ci]',
        '',
        '변경된 파일:',
        ...changes.map(c => `- ${c}`),
        '',
        '패키지 변경사항이 있는 경우 yarn install을 실행해주세요.'
      ].join('\n');

      await exec.exec('git', ['commit', '-m', commitMessage]);
      await exec.exec('git', ['push']);

      // 동기화 로그 생성
      const logDir = path.join(process.env.GITHUB_WORKSPACE || '', 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, `sync-${targetRepo}-${Date.now()}.log`);
      const logContent = [
        `동기화 시간: ${new Date().toISOString()}`,
        `대상 저장소: ${targetRepo}`,
        `소스 디렉토리: ${sourceDir}`,
        '변경사항:',
        ...changes,
        '',
        `소요 시간: ${(Date.now() - startTime) / 1000}초`
      ].join('\n');

      fs.writeFileSync(logFile, logContent);
      core.info('동기화가 성공적으로 완료되었습니다.');
    } else {
      core.info('변경사항이 없습니다.');
    }

  } catch (error) {
    // 에러 발생 시 롤백
    if (backupCreated) {
      try {
        const tempDir = path.join(process.env.GITHUB_WORKSPACE || '', 'temp', core.getInput('target-repo'));
        const backupDir = `${tempDir}_backup_${startTime}`;
        await exec.exec('rm', ['-rf', tempDir]);
        await exec.exec('mv', [backupDir, tempDir]);
        core.info('백업에서 성공적으로 복구되었습니다.');
      } catch (rollbackError) {
        core.error('롤백 중 오류 발생');
        core.error(rollbackError instanceof Error ? rollbackError.message : '알 수 없는 오류');
      }
    }

    if (error instanceof Error) {
      core.setFailed(`동기화 실패: ${error.message}`);
    } else {
      core.setFailed('예기치 않은 오류가 발생했습니다.');
    }
  } finally {
    const endTime = Date.now();
    core.info(`총 소요 시간: ${(endTime - startTime) / 1000}초`);
  }
}

run();

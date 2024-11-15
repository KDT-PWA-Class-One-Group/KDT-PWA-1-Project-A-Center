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

    // 공유 파일 복사
    await exec.exec('cp', ['-r', `${sourceDir}/.`, tempDir]);

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

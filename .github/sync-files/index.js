const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');

async function run() {
  try {
    const targetRepo = core.getInput('target-repo', { required: true });
    const sourceDir = core.getInput('source-dir', { required: true });
    const token = core.getInput('pat-token', { required: true });

    const repoUrl = `https://x-access-token:${token}@github.com/KDT-PWA-Class-One-Group/${targetRepo}.git`;
    const tempDir = path.join(process.env.GITHUB_WORKSPACE, 'temp', targetRepo);

    // Clone target repository
    await exec.exec('git', ['clone', repoUrl, tempDir]);

    // Copy shared files
    await exec.exec('cp', ['-r', `${sourceDir}/.`, tempDir]);

    // Configure git
    process.chdir(tempDir);
    await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
    await exec.exec('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']);

    // Commit and push changes
    await exec.exec('git', ['add', '.']);
    try {
      await exec.exec('git', ['commit', '-m', 'chore: sync shared configurations [skip ci]']);
      await exec.exec('git', ['push']);
    } catch (error) {
      core.info('No changes to commit');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

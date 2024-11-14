const fs = require('fs');
const path = require('path');

// Center의 package.json 읽기
console.log('Reading Center package.json...');
const centerPackageJson = JSON.parse(
  fs.readFileSync('package.json', 'utf8')
);

console.log('Center dependencies:', centerPackageJson.devDependencies);

// 자식 프로젝트들의 경로
const projects = ['Project-A-Left', 'Project-A-Right'];

projects.forEach(projectDir => {
  const packageJsonPath = path.join(projectDir, 'package.json');
  console.log(`Processing ${packageJsonPath}...`);

  try {
    // 자식 프로젝트의 package.json 읽기
    const projectPackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8')
    );

    // dependencies와 devDependencies 업데이트
    if (centerPackageJson.dependencies) {
      projectPackageJson.dependencies = {
        ...(projectPackageJson.dependencies || {}),
        ...centerPackageJson.dependencies
      };
    }

    if (centerPackageJson.devDependencies) {
      projectPackageJson.devDependencies = {
        ...(projectPackageJson.devDependencies || {}),
        ...centerPackageJson.devDependencies
      };
    }

    // 업데이트된 package.json 저장
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(projectPackageJson, null, 2) + '\n'
    );

    console.log(`Successfully updated ${projectDir} dependencies`);
    console.log('Updated dependencies:', projectPackageJson.devDependencies);
  } catch (error) {
    console.error(`Error processing ${projectDir}:`, error);
    process.exit(1);
  }
});

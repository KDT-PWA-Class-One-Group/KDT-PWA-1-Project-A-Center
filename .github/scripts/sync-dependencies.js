const fs = require('fs');
const path = require('path');

// Center의 package.json 읽기
const centerPackageJson = JSON.parse(
  fs.readFileSync('package.json', 'utf8')
);

// 동기화할 프로젝트 목록
const projects = ['Project-A-Left', 'Project-A-Right'];

projects.forEach(projectName => {
  const projectPackageJsonPath = path.join(projectName, 'package.json');

  // 자식 프로젝트의 package.json 읽기
  const projectPackageJson = JSON.parse(
    fs.readFileSync(projectPackageJsonPath, 'utf8')
  );

  // dependencies 동기화
  projectPackageJson.dependencies = {
    ...projectPackageJson.dependencies,
    ...centerPackageJson.dependencies
  };

  // devDependencies 동기화
  projectPackageJson.devDependencies = {
    ...projectPackageJson.devDependencies,
    ...centerPackageJson.devDependencies
  };

  // 업데이트된 package.json 저장
  fs.writeFileSync(
    projectPackageJsonPath,
    JSON.stringify(projectPackageJson, null, 2) + '\n'
  );
});

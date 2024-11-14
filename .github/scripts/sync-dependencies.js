const fs = require('fs');
const path = require('path');

// Center의 package.json 읽기
const centerPackageJson = JSON.parse(
  fs.readFileSync('package.json', 'utf8')
);

// 자식 프로젝트들의 경로와 정보
const projects = [
  {
    dir: 'Project-A-Left',
    name: 'KDT-PWA-1-Project-A-Team-Left'
  },
  {
    dir: 'Project-A-Right',
    name: 'KDT-PWA-1-Project-A-Team-Right'
  }
];

projects.forEach(project => {
  const packageJsonPath = path.join(project.dir, 'package.json');
  console.log(`Processing ${packageJsonPath}...`);

  try {
    // 자식 프로젝트의 package.json 읽기
    const projectPackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8')
    );

    // 기존 정보 유지하면서 dependencies와 devDependencies 업데이트
    const updatedPackageJson = {
      ...projectPackageJson,
      dependencies: {
        ...(projectPackageJson.dependencies || {}),
        ...(centerPackageJson.dependencies || {})
      },
      devDependencies: {
        ...(projectPackageJson.devDependencies || {}),
        ...(centerPackageJson.devDependencies || {})
      }
    };

    // 업데이트된 package.json 저장
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(updatedPackageJson, null, 2) + '\n'
    );

    console.log(`Successfully updated ${project.name} dependencies`);
  } catch (error) {
    console.error(`Error processing ${project.name}:`, error);
    process.exit(1);
  }
});

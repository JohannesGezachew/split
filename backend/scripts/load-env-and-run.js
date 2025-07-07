const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to copy directory recursively
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Execute Prisma generate command
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Prisma generate failed:', error.message);
  process.exit(1);
}

// Copy generated Prisma client to dist
try {
  const srcGenerated = path.resolve(__dirname, '../src/generated');
  const distGenerated = path.resolve(__dirname, '../dist/generated');
  if (fs.existsSync(srcGenerated)) {
    copyDirSync(srcGenerated, distGenerated);
    console.log('Successfully copied src/generated to dist/generated');
  } else {
    console.warn('src/generated directory not found, skipping copy.');
  }
} catch (error) {
  console.error('Failed to copy generated files:', error.message);
  process.exit(1);
}

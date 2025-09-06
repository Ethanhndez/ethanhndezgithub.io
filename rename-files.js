// rename-files.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'images');

// Define categories and prefixes
const categories = {
  street: 'strt01',
  architecture: 'arch01',
  landscape: 'lanscp01',
  home: 'home01'
};

function renameFilesInFolder(folderPath, prefix) {
  if (!fs.existsSync(folderPath)) return;
  const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  files.forEach((file, index) => {
    const ext = path.extname(file).toLowerCase();
    const newName = `${prefix}-${String(index + 1).padStart(2, '0')}${ext}`;
    const oldPath = path.join(folderPath, file);
    const newPath = path.join(folderPath, newName);

    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${file} -> ${newName}`);
  });
}

// Rename inside subfolders
for (const [folder, prefix] of Object.entries(categories)) {
  const targetFolder = folder === 'home' ? ROOT : path.join(ROOT, folder);
  renameFilesInFolder(targetFolder, prefix);
}

console.log('✅ Renaming complete!');

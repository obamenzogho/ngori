import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = 'c:/Users/ashton/Desktop/Ngori';

async function walk(dir) {
    let files = await fs.promises.readdir(dir);
    files = await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);
        if (stats.isDirectory()) {
            if (file === 'node_modules' || file === '.next' || file === '.git' || file === '.vercel') return [];
            return walk(filePath);
        } else if (file.match(/\.(tsx|ts|json|css|mjs|js)$/)) {
            return filePath;
        }
        return [];
    }));
    return files.flat();
}

async function removeBOM() {
    const folders = [
        path.join(rootDir, 'app'),
        path.join(rootDir, 'lib'),
        path.join(rootDir, 'components'),
        rootDir
    ];

    let allFiles = [];
    for (const folder of folders) {
        if (fs.existsSync(folder)) {
            const stats = await fs.promises.stat(folder);
            if (stats.isDirectory()) {
                const files = await walk(folder);
                allFiles = allFiles.concat(files);
            } else {
                allFiles.push(folder);
            }
        }
    }

    allFiles = [...new Set(allFiles)];
    console.log(`Processing ${allFiles.length} files to remove BOM...`);

    for (const file of allFiles) {
        if (fs.lstatSync(file).isDirectory()) continue;

        const buf = await fs.promises.readFile(file);

        // Check for BOM (0xEF, 0xBB, 0xBF)
        if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
            const newBuf = buf.slice(3);
            await fs.promises.writeFile(file, newBuf);
            console.log(`[REMOVED] BOM from ${path.relative(rootDir, file)}`);
        }
    }

    console.log('Done.');
}

removeBOM().catch(console.error);

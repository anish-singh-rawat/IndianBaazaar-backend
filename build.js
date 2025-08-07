import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function* getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        yield* getFiles(res);
      }
    } else if (entry.name.endsWith('.ts')) {
      yield res;
    }
  }
}

async function fixImports() {
  for await (const filePath of getFiles(__dirname)) {
    try {
      let content = await readFile(filePath, 'utf8');
      
      // Replace .ts extensions in imports with .js
      content = content.replace(
        /from\s+['"]([^'"]+)\.ts['"]/g,
        'from "$1.js"'
      );
      
      await writeFile(filePath, content);
      console.log(`Fixed imports in ${filePath}`);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
}

fixImports().catch(console.error);

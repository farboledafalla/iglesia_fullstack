#!/usr/bin/env node
// scan_alumnos_usages.js
// Escanea backend/src/controllers buscando referencias a alumnos.nombre, alumnos.email, alumnos.pais_id, y ocurrencias de FROM/JOIN alumnos.
// Genera backend/migrations/alumnos_usages_report.json

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src', 'controllers');
const outPath = path.resolve(__dirname, 'alumnos_usages_report.json');

const patterns = [
  { key: 'alumnos.nombre', re: /\balumnos\.nombre\b/i },
  { key: 'alumnos.email', re: /\balumnos\.email\b/i },
  { key: 'alumnos.pais_id', re: /\balumnos\.pais_id\b/i },
  { key: 'FROM_alumnos', re: /\bFROM\s+alumnos\b/i },
  { key: 'JOIN_alumnos', re: /\bJOIN\s+alumnos\b/i },
  { key: 'SELECT_from_alumnos', re: /SELECT[\s\S]*?FROM\s+alumnos/i }
];

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(res));
    } else if (/\.js$|\.ts$/.test(entry.name)) {
      files.push(res);
    }
  }
  return files;
}

(async () => {
  const report = {
    scannedAt: new Date().toISOString(),
    root,
    matches: []
  };

  try {
    const files = await walk(root);

    for (const file of files) {
      const content = await fs.promises.readFile(file, 'utf8');
      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matched = [];
        for (const p of patterns) {
          if (p.re.test(line)) matched.push(p.key);
        }
        if (matched.length > 0) {
          report.matches.push({
            file: path.relative(path.resolve(__dirname, '..'), file),
            lineNumber: i + 1,
            line: line.trim(),
            matched
          });
        }
      }

      // Also test multi-line patterns (e.g., SELECT ... FROM alumnos spanning multiple lines)
      for (const p of patterns) {
        if (/SELECT_from_alumnos/i.test(p.key)) {
          if (p.re.test(content)) {
            report.matches.push({
              file: path.relative(path.resolve(__dirname, '..'), file),
              lineNumber: null,
              line: '<multi-line match>',
              matched: [p.key]
            });
          }
        }
      }
    }

    await fs.promises.writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('Reporte generado en:', outPath);
    console.log('Encontradas', report.matches.length, 'coincidencias.');
  } catch (err) {
    console.error('Error durante el escaneo:', err);
    process.exit(2);
  }
})();

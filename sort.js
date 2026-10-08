const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf-8');
const match = content.match(/const plants=\[([\s\S]*?)\];/);
const plantsText = match[1];

// Split entries by matching {id:...}
const entries = [];
let depth = 0, current = '';
for (const ch of plantsText) {
  current += ch;
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0 && current.trim()) {
      entries.push(current.trim().replace(/,$/, ''));
      current = '';
    }
  }
}

const getId = e => {
  const m = e.match(/\{id:(\d+)/);
  return m ? parseInt(m[1]) : 9999;
};

entries.sort((a, b) => getId(a) - getId(b));

const newContent = content.replace(
  /const plants=\[[\s\S]*?\];/,
  'const plants=[\n' + entries.join(',\n') + '\n];'
);

fs.writeFileSync('index.html', newContent, 'utf-8');
console.log('Sorted', entries.length, 'plants');
console.log('First 5:', entries.slice(0, 5).map(getId));
console.log('Last 5:', entries.slice(-5).map(getId));

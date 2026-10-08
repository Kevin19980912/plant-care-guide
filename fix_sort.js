const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf-8');

const match = content.match(/const plants=\[([\s\S]*?)\];/);
if (!match) { console.log('ERROR: no plants array'); process.exit(1); }

let plantsText = match[1];

// Extract entries by brace depth, skipping strings
const entries = [];
let depth = 0;
let current = '';
let inStr = false;
let strCh = '';
let esc = false;

for (let i = 0; i < plantsText.length; i++) {
  const ch = plantsText[i];
  if (esc) { current += ch; esc = false; continue; }
  if (ch === '\\') { current += ch; esc = true; continue; }
  if (!inStr && (ch === '"' || ch === "'" || ch === '`')) {
    inStr = true; strCh = ch; current += ch; continue;
  }
  if (inStr && ch === strCh) { inStr = false; strCh = ''; current += ch; continue; }
  if (!inStr) {
    if (ch === '{') {
      if (depth === 0) current = '';  // reset buffer at start of new entry
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        current += ch;
        const entry = current.trim();
        if (entry) entries.push(entry);
        current = '';
        continue;
      }
    }
  }
  current += ch;
}

console.log('Found', entries.length, 'entries');

// Validate
let allValid = true;
entries.forEach((e, i) => {
  if (!e.match(/^\{id:\d+/)) {
    console.log('Invalid entry', i, ':', e.substring(0, 60));
    allValid = false;
  }
});
if (!allValid) { console.log('ERROR: invalid entries'); process.exit(1); }

// Sort by ID
const getId = e => parseInt(e.match(/\{id:(\d+)/)[1]);
entries.sort((a, b) => getId(a) - getId(b));

// Rebuild: each entry ends with comma except the last
const rebuilt = entries.map((e, i) => i < entries.length - 1 ? e + ',' : e).join('\n');

const newContent = content.replace(
  /const plants=\[[\s\S]*?\];/,
  'const plants=[\n' + rebuilt + '\n];'
);

fs.writeFileSync('index.html', newContent, 'utf-8');

// Verify
const v = fs.readFileSync('index.html', 'utf-8');
const vm = v.match(/const plants=\[([\s\S]*?)\];/);
try {
  const plants = new Function('return [' + vm[1] + ']')();
  console.log('SUCCESS:', plants.length, 'plants');
  console.log('IDs:', plants.map(p => p.id).join(', '));
} catch (e) {
  console.log('VERIFY ERROR:', e.message);
  process.exit(1);
}

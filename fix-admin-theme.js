const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app', 'admin', '(dashboard)');

const replacements = [
  { from: /\bbg-white\b/g, to: 'bg-[#111111]' },
  { from: /\bbg-neutral-50\b/g, to: 'bg-[#0a0a0a]' },
  { from: /\btext-neutral-900\b/g, to: 'text-[#f5d79e]' },
  { from: /\btext-neutral-800\b/g, to: 'text-[#f5d79e]' },
  { from: /\btext-neutral-700\b/g, to: 'text-[#f3e8c7]' },
  { from: /\btext-neutral-600\b/g, to: 'text-[#f3e8c7]/70' },
  { from: /\btext-neutral-500\b/g, to: 'text-[#d5b16a]/70' },
  { from: /\btext-neutral-400\b/g, to: 'text-[#d5b16a]/40' },
  { from: /\bborder-neutral-300\b/g, to: 'border-[#d5b16a]/30' },
  { from: /\bborder-neutral-200\b/g, to: 'border-[#d5b16a]/20' },
  { from: /\bborder-neutral-100\b/g, to: 'border-[#d5b16a]/10' },
  { from: /\bbg-neutral-100\b/g, to: 'bg-[#d5b16a]/10' },
  { from: /\bbg-neutral-200\b/g, to: 'bg-[#d5b16a]/20' },
  { from: /\btext-blue-600\b/g, to: 'text-[#d5b16a]' },
  { from: /\btext-blue-500\b/g, to: 'text-[#d5b16a]' },
  { from: /\bbg-blue-50\b/g, to: 'bg-[#d5b16a]/10' },
  { from: /\bbg-blue-600\b/g, to: 'bg-[#d5b16a] text-black' },
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const rule of replacements) {
        content = content.replace(rule.from, rule.to);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDir(dir);
console.log('Done!');

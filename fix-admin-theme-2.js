const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'app', 'admin', '(dashboard)');

const replacements = [
  { from: /\bbg-\[#e60000\]\b/g, to: 'bg-gradient-to-r from-[#b38a46] to-[#d5b16a] text-black' },
  { from: /\btext-\[#e60000\]\b/g, to: 'text-[#d5b16a]' },
  { from: /\bborder-\[#e60000\]/g, to: 'border-[#d5b16a]' },
  { from: /\bring-\[#e60000\]/g, to: 'ring-[#d5b16a]' },
  { from: /\bbg-amber-50\b/g, to: 'bg-[#d5b16a]/10 border border-[#d5b16a]/20' },
  { from: /\bbg-linear-to-br from-\[#fff8f5\] to-\[#fdf6e8\]/g, to: 'bg-gradient-to-br from-[#111111] to-[#0a0a0a]' },
  { from: /w-full rounded-xl border px-3 py-2 text-sm/g, to: 'w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none' },
  { from: /text-red-600/g, to: 'text-rose-500' },
  { from: /text-amber-950/g, to: 'text-[#d5b16a]' },
  { from: /text-amber-900/g, to: 'text-[#d5b16a]' },
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
console.log('Done Phase 2!');

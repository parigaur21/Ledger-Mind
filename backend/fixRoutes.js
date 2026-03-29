const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'routes');
const files = fs.readdirSync(dir);
files.forEach(f => {
  if(!f.endsWith('.js')) return;
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  content = content.replace(/const auth = require\('\.\.\/middleware\/auth'\);/g, 'const { requireAuth } = require(\'../middleware/auth\');');
  content = content.replace(/const authMiddleware = require\('\.\.\/middleware\/auth'\);/g, 'const { requireAuth } = require(\'../middleware/auth\');');
  content = content.replace(/router\.(get|post|put|delete)\('([^']+)', auth, /g, 'router.$1(\'$2\', requireAuth, ');
  content = content.replace(/router\.(get|post|put|delete)\('([^']+)', authMiddleware, /g, 'router.$1(\'$2\', requireAuth, ');
  fs.writeFileSync(fp, content);
  console.log(`Updated ${f}`);
});
console.log('Script done');

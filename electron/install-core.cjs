'use strict';
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const PLUGIN_NAMES = new Map([
  ['bg-studio','BG-STUDIO-SOUZ.dll'],
  ['screen-capture','Souz-Screen-Capture.dll'],
  ['grid-roll','Souz-Grid-Roll.dll'],
  ['hunter','Souz-Hunter.dll'],
]);
function resolvePluginPath(targetRoot, productId) {
  const name = PLUGIN_NAMES.get(productId);
  if (!name) throw new Error('Produto FFGL desconhecido.');
  return path.join(targetRoot, name);
}
function validateDllName(source) {
  if (typeof source !== 'string' || path.extname(source).toLowerCase() !== '.dll') throw new Error('Selecione um arquivo .dll válido.');
  const stat = fs.statSync(source);
  if (!stat.isFile() || stat.size < 64) throw new Error('Arquivo DLL vazio ou inválido.');
  // Minimal PE signature verification, not a substitute for publisher signature checks.
  const fd = fs.openSync(source, 'r');
  try {
    const h = Buffer.alloc(64);
    fs.readSync(fd, h, 0, 64, 0);
    if (h.toString('ascii',0,2) !== 'MZ') throw new Error('O arquivo não parece uma DLL Windows (PE).');
    const peOffset = h.readUInt32LE(0x3c);
    if (peOffset > stat.size - 4) throw new Error('Cabeçalho PE inválido.');
    const sig = Buffer.alloc(4);
    fs.readSync(fd, sig, 0, 4, peOffset);
    if (sig.toString('hex') !== '50450000') throw new Error('Assinatura PE inválida.');
  } finally { fs.closeSync(fd); }
  return true;
}
function installLocalDll({source, targetRoot, productId}) {
  validateDllName(source);
  const destination = resolvePluginPath(targetRoot, productId);
  fs.mkdirSync(targetRoot,{recursive:true});
  const tmp = destination+'.pending';
  fs.copyFileSync(source,tmp);
  const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
  const copiedHash = crypto.createHash('sha256').update(fs.readFileSync(tmp)).digest('hex');
  if (sourceHash !== copiedHash) { fs.rmSync(tmp,{force:true}); throw new Error('Falha na verificação da cópia.'); }
  if (fs.existsSync(destination)) fs.copyFileSync(destination, destination+'.backup');
  try { fs.renameSync(tmp,destination); } catch(e) { fs.rmSync(tmp,{force:true}); throw new Error('Não foi possível instalar: feche o Resolume e tente novamente.'); }
  return { destination, sha256:copiedHash };
}
module.exports = {PLUGIN_NAMES,resolvePluginPath,validateDllName,installLocalDll};

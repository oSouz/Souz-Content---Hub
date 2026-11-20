'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {mkdtempSync,writeFileSync,readFileSync,existsSync,rmSync}=require('node:fs');
const {tmpdir}=require('node:os');
const path=require('node:path');
const {resolvePluginPath,validateDllName,installLocalDll}=require('../electron/install-core.cjs');
function fakePe(){const b=Buffer.alloc(128);b.write('MZ');b.writeUInt32LE(64,0x3c);b.write('PE\0\0',64,'binary');return b;}
test('plugin path uses allowlisted filename',()=>{assert.equal(path.basename(resolvePluginPath('C:\\Souz','bg-studio')),'BG-STUDIO-SOUZ.dll');assert.throws(()=>resolvePluginPath('/tmp','../../evil'));});
test('rejects non DLL files',()=>{const tmp=mkdtempSync(path.join(tmpdir(),'souz-test-'));try{const p=path.join(tmp,'fake.dll');writeFileSync(p,Buffer.alloc(128));assert.throws(()=>validateDllName(p));}finally{rmSync(tmp,{recursive:true,force:true});}});
test('local DLL copy keeps correct bytes and creates backup',()=>{const tmp=mkdtempSync(path.join(tmpdir(),'souz-test-'));try{const src=path.join(tmp,'input.dll');const target=path.join(tmp,'effects');writeFileSync(src,fakePe());const a=installLocalDll({source:src,targetRoot:target,productId:'bg-studio'});assert.ok(existsSync(a.destination));assert.deepEqual(readFileSync(a.destination),fakePe());installLocalDll({source:src,targetRoot:target,productId:'bg-studio'});assert.ok(existsSync(a.destination+'.backup'));}finally{rmSync(tmp,{recursive:true,force:true});}});

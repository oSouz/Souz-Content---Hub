'use strict';
const {app,BrowserWindow,ipcMain,dialog,shell} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const {installLocalDll,resolvePluginPath,PLUGIN_NAMES}=require('./install-core.cjs');
const {createUpdateService}=require('./updates.cjs');
const IS_DEV=Boolean(process.env.SOUZ_DEV_URL);
const updatesEnabled=process.platform==='win32' && app.isPackaged && !IS_DEV;
const updates=createUpdateService({
  enabled:updatesEnabled,
  updater:updatesEnabled ? require('electron-updater').autoUpdater : null
});
function settingsFile(){return path.join(app.getPath('userData'),'settings.json');}
function defaultRoot(){return path.join(app.getPath('documents'),'Souz Content','Effects Souz Content');}
function getSettings(){
  try {const data=JSON.parse(fs.readFileSync(settingsFile(),'utf8'));return {effectsFolder:typeof data.effectsFolder==='string'?data.effectsFolder:defaultRoot()};}
  catch{return {effectsFolder:defaultRoot()};}
}
function setSettings(settings){fs.mkdirSync(app.getPath('userData'),{recursive:true});fs.writeFileSync(settingsFile(),JSON.stringify(settings,null,2));}
function createWindow(){
  const win=new BrowserWindow({width:1250,height:820,minWidth:940,minHeight:640,backgroundColor:'#0c0e13',title:'Souz Content Hub',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  if(IS_DEV) win.loadURL(process.env.SOUZ_DEV_URL);
  else win.loadFile(path.join(__dirname,'..','dist','index.html'));
}
app.whenReady().then(()=>{
  ipcMain.handle('hub:updateState',()=>updates.getState());
  ipcMain.handle('hub:environment',()=>({platform:process.platform,appVersion:app.getVersion(),effectsFolder:getSettings().effectsFolder,documentsFolder:app.getPath('documents')}));
  ipcMain.handle('hub:selectEffectsFolder',async()=>{
    const r=await dialog.showOpenDialog({title:'Escolher pasta de plugins Souz Content',properties:['openDirectory','createDirectory']});
    if(r.canceled||!r.filePaths[0])return null;
    const settings={effectsFolder:r.filePaths[0]};setSettings(settings);return settings.effectsFolder;
  });
  ipcMain.handle('hub:showFolder',async()=>{
    const folder=getSettings().effectsFolder;fs.mkdirSync(folder,{recursive:true});return shell.openPath(folder);
  });
  ipcMain.handle('hub:products',()=>{
    const root=getSettings().effectsFolder;
    return [...PLUGIN_NAMES.keys()].map(id=>({id,installed:fs.existsSync(resolvePluginPath(root,id)),file:resolvePluginPath(root,id)}));
  });
  ipcMain.handle('hub:installLocal',async(_event,productId)=>{
    if(!PLUGIN_NAMES.has(productId))throw new Error('Identificador de produto inválido.');
    const picked=await dialog.showOpenDialog({title:'Selecione a DLL compilada e autorizada',properties:['openFile'],filters:[{name:'Plugin FFGL',extensions:['dll']}]});
    if(picked.canceled||!picked.filePaths[0])return null;
    return installLocalDll({source:picked.filePaths[0],targetRoot:getSettings().effectsFolder,productId});
  });
  createWindow();
  updates.start();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});

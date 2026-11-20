'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('souzHub',{
  environment:()=>ipcRenderer.invoke('hub:environment'),
  updateState:()=>ipcRenderer.invoke('hub:updateState'),
  products:()=>ipcRenderer.invoke('hub:products'),
  selectEffectsFolder:()=>ipcRenderer.invoke('hub:selectEffectsFolder'),
  showFolder:()=>ipcRenderer.invoke('hub:showFolder'),
  installLocal:(productId)=>ipcRenderer.invoke('hub:installLocal',productId),
});

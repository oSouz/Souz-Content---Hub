export type PlatformInfo={platform:string;appVersion:string;effectsFolder:string;documentsFolder:string};
export type LocalProduct={id:string;installed:boolean;file:string};
export type UpdateState =
  | {status:'disabled'|'idle'|'checking'|'current'|'error'}
  | {status:'downloading'; version:string; percent:number}
  | {status:'ready'; version:string};

export interface SouzHubAPI{
  updateState():Promise<UpdateState>;
  environment():Promise<PlatformInfo>;
  products():Promise<LocalProduct[]>;
  selectEffectsFolder():Promise<string|null>;
  showFolder():Promise<string>;
  installLocal(productId:string):Promise<{destination:string;sha256:string}|null>;
}
declare global {interface Window{souzHub?:SouzHubAPI}}
export type Product={id:string;name:string;category:'Plugin FFGL'|'Aplicativo';description:string;initials:string;accent:string;availability:'integration'|'planned';};
export const catalog:Product[]=[
  {id:'bg-studio',name:'BG Studio',category:'Plugin FFGL',description:'Backgrounds generativos para Resolume.',initials:'BG',accent:'#ff813b',availability:'integration'},
  {id:'screen-capture',name:'Screen Capture',category:'Plugin FFGL',description:'Captura de telas e janelas.',initials:'SC',accent:'#55afea',availability:'integration'},
  {id:'grid-roll',name:'Grid Roll',category:'Plugin FFGL',description:'Efeitos de grade e rolagem.',initials:'GR',accent:'#ad86fa',availability:'integration'},
  {id:'hunter',name:'Hunter',category:'Plugin FFGL',description:'Ferramentas orientadas ao layout do LED.',initials:'HU',accent:'#5dceaa',availability:'integration'},
  {id:'lyra',name:'Lyra',category:'Aplicativo',description:'Operação manual de letras de músicas.',initials:'LY',accent:'#ff9a59',availability:'planned'},
  {id:'lyricx',name:'LyricX',category:'Aplicativo',description:'Apresentações e operação de slides.',initials:'LX',accent:'#92a3fc',availability:'planned'},
 ];

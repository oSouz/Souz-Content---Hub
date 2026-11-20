import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Blocks,LayoutGrid,Package,RefreshCw,ShieldCheck,Settings2,Search,FolderOpen,ExternalLink,Monitor,ShoppingBag,ArrowRight,LockKeyhole,Info,Check,AlertCircle,ChevronRight,Sparkles,Power} from 'lucide-react';
import {catalog, type Product,type LocalProduct,type PlatformInfo,type UpdateState} from './types';
import './styles.css';

type Tab='home'|'library'|'store'|'licenses'|'updates'|'settings';
const navigation:{id:Tab;label:string;icon:React.ComponentType<{size?:number}>}[]=[
 {id:'home',label:'Início',icon:LayoutGrid},{id:'library',label:'Biblioteca',icon:Package},{id:'store',label:'Loja',icon:ShoppingBag},
 {id:'licenses',label:'Licenças',icon:ShieldCheck},{id:'updates',label:'Atualizações',icon:RefreshCw},{id:'settings',label:'Configurações',icon:Settings2}];
const updateMessages = {
 disabled: 'Abra a versão instalada do Hub no Windows para receber atualizações.',
 idle: 'Aguardando a primeira verificação.',
 checking: 'Buscando versões novas…',
 current: 'Você está na versão mais recente.',
 error: 'O canal de atualizações está indisponível. O Hub tentará novamente automaticamente.',
};

function Updates({version}:{version?:string}){
 const api=window.souzHub;
 const [update,setUpdate]=useState<UpdateState>({status:api?'idle':'disabled'});
 useEffect(()=>{
  if(!api)return;
  const getUpdateState=api.updateState;
  let active=true;
  async function refreshUpdate(){
   try{
    const next=await getUpdateState();
    if(active)setUpdate(next);
   }catch{
    if(active)setUpdate({status:'error'});
   }
  }
  void refreshUpdate();
  const timer=window.setInterval(refreshUpdate,1500);
  return ()=>{active=false;window.clearInterval(timer);};
 },[api]);
 let message:string;
 if(update.status==='downloading'){
  message=`Baixando a versão ${update.version} em segundo plano (${update.percent}%).`;
 }else if(update.status==='ready'){
  message=`A versão ${update.version} será instalada quando você fechar o Hub.`;
 }else{
  message=updateMessages[update.status];
 }
 return <>
  <div className="page-heading"><h1>Atualizações</h1><p>Novas versões do Hub são baixadas automaticamente e instaladas ao fechar o aplicativo.</p></div>
  <div className="feature-card"><RefreshCw size={36}/><h2>Atualizações automáticas</h2>
   {version&&<div className="pill">Versão instalada {version}</div>}
   <p role="status" aria-live={update.status==='downloading'?'off':'polite'}>{message}</p>
  </div>
 </>;
}

function App(){
 const [tab,setTab]=useState<Tab>('home');const [env,setEnv]=useState<PlatformInfo|null>(null);const [local,setLocal]=useState<LocalProduct[]>([]);
 const [busy,setBusy]=useState('');const [toast,setToast]=useState('');const [query,setQuery]=useState('');const [filter,setFilter]=useState<'all'|'Plugin FFGL'|'Aplicativo'>('all');
 const desktop=Boolean(window.souzHub);
 async function refresh(){if(!window.souzHub)return;try{const [e,p]=await Promise.all([window.souzHub.environment(),window.souzHub.products()]);setEnv(e);setLocal(p);}catch(e){setToast(String(e));}}
 useEffect(()=>{void refresh();},[]);
 function stateOf(p:Product){return local.find(x=>x.id===p.id)?.installed||false;}
 async function install(p:Product){if(!window.souzHub)return setToast('Para instalar DLLs, abra o Hub pelo Electron.');if(p.category!=='Plugin FFGL')return setToast('Instaladores de aplicativos serão integrados em outra entrega.');setBusy(p.id);try{const result=await window.souzHub.installLocal(p.id);if(result){setToast(`${p.name} instalado. Reinicie o Resolume após configurar a pasta FFGL.`);await refresh();}}catch(e){setToast(e instanceof Error?e.message:String(e));}finally{setBusy('');}}
 async function chooseFolder(){if(!window.souzHub)return;const selected=await window.souzHub.selectEffectsFolder();if(selected){setToast('Pasta de plugins alterada. Configure-a nas preferências do Resolume.');await refresh();}}
 const filtered=catalog.filter(p=>(filter==='all'||p.category===filter)&&`${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()));
 const cards=(items:Product[])=><div className="product-grid">{items.map(p=><article className="product" key={p.id}>
   <div className="product-art" style={{'--accent':p.accent} as React.CSSProperties}><span>{p.initials}</span><div className="art-glow"/></div>
   <div className="product-info"><span className="eyebrow">{p.category}</span><h3>{p.name}</h3><p>{p.description}</p>
     <div className="product-bottom"><span className={'status '+(stateOf(p)?'installed':'')}>{stateOf(p)?<><Check size={13}/> Instalado</>:p.category==='Aplicativo'?'Integração futura':'Disponível para integrar'}</span>
     <button className="small-button" onClick={()=>void install(p)} disabled={busy===p.id||p.category==='Aplicativo'}>{busy===p.id?'Instalando...':stateOf(p)?'Substituir DLL':p.category==='Aplicativo'?'Em breve':'Instalar DLL'} <ArrowRight size={13}/></button></div>
   </div></article>)}</div>;
 return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-symbol"><Blocks size={23}/></div><div><strong>SOUZ CONTENT</strong><small>HUB / ECOSYSTEM</small></div></div>
 <div className="side-section">PLATAFORMA</div><nav>{navigation.map(n=><button key={n.id} onClick={()=>{setTab(n.id);setQuery('');setFilter('all');}} className={'nav-item '+(tab===n.id?'active':'')}><n.icon size={18}/>{n.label}{n.id==='licenses'&&<span className="soon-dot"/>}</button>)}</nav>
 <div className="sidebar-bottom"><div className="account-icon"><LockKeyhole size={20}/></div><div><strong>Souz ID</strong><small>Login na Entrega 02</small></div><ChevronRight size={16}/></div></aside>
 <main className="main"><header className="top"><div className="breadcrumb">SOUZ CONTENT <ChevronRight size={14}/> <strong>{navigation.find(n=>n.id===tab)?.label}</strong></div><div className="top-right"><span className="dev-label"><span className="live-dot"/> V0.1 • FUNDAÇÃO</span><div className="profile">S</div></div></header>
 <div className="scroll"><div className="content">
 {tab==='home'&&<><section className="hero"><div className="hero-copy"><div className="overline"><Sparkles size={15}/> SEU ECOSSISTEMA AUDIOVISUAL</div><h1>Todas as suas ferramentas.<br/><em>Um só lugar.</em></h1><p>Organize seus plugins, aplicativos e futuras licenças na plataforma Souz Content.</p><div className="hero-actions"><button className="primary" onClick={()=>setTab('library')}>Explorar biblioteca <ArrowRight size={17}/></button><button className="ghost" onClick={()=>setTab('settings')}>Configurar ambiente <Settings2 size={16}/></button></div></div><div className="hero-visual"><div className="orb orb-one"/><div className="orb orb-two"/><div className="hero-emblem"><Blocks size={77}/></div></div></section>
 <div className="metrics"><div><span>PRODUTOS NO CATÁLOGO</span><strong>{catalog.length.toString().padStart(2,'0')}</strong></div><div><span>PLUGINS LOCAIS</span><strong>{local.filter(x=>x.installed).length.toString().padStart(2,'0')}</strong></div><div><span>SOFTWARES</span><strong>02</strong></div><div><span>LICENCIAMENTO</span><strong className="text-pending">PLANEJADO</strong></div></div>
 <div className="section-head"><div><span className="eyebrow">SOUZ ECOSYSTEM</span><h2>Produtos em destaque</h2></div><button className="text-link" onClick={()=>setTab('library')}>Ver biblioteca <ArrowRight size={15}/></button></div>{cards(catalog.filter(p=>['bg-studio','lyra','lyricx'].includes(p.id)))}
 <div className="notice"><Info size={19}/><div><strong>Fundação pronta para evolução</strong><p>Esta versão instala DLLs locais de forma assistida. Souz ID e compras fazem parte de entregas futuras.</p></div></div></>}
 {tab==='library'&&<><div className="page-heading"><span className="eyebrow">SEUS PRODUTOS</span><h1>Biblioteca</h1><p>Um catálogo único para plugins FFGL e aplicativos da Souz Content.</p></div><div className="toolbar"><div className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar produto..."/></div><div className="filters">{([['all','Todos'],['Plugin FFGL','Plugins'],['Aplicativo','Aplicativos']] as const).map(([id,label])=><button key={id} className={filter===id?'selected':''} onClick={()=>setFilter(id)}>{label}</button>)}</div></div>{cards(filtered)}{filtered.length===0&&<p className="empty">Nenhum produto encontrado.</p>}</>}
 {tab==='store'&&<><div className="page-heading"><span className="eyebrow">SOUZ STORE</span><h1>Uma loja dentro do Hub.</h1><p>Catálogo comercial, pagamentos Pix/cartão e assinaturas serão conectados ao backend de licenças.</p></div><div className="feature-card"><ShoppingBag size={36}/><h2>Loja em preparação</h2><p>Não há pagamentos habilitados nesta versão. Nenhum botão simula compra ou aprovação.</p><div className="pill">Previsto: Entrega 06</div></div></>}
 {tab==='licenses'&&<><div className="page-heading"><span className="eyebrow">SOUZ LICENSE</span><h1>Licenças e dispositivos</h1><p>Uma conta, direitos por produto e limites de computadores por licença.</p></div><div className="feature-card"><ShieldCheck size={38}/><h2>Souz ID e License Server</h2><p>A ativação real requer autenticação, verificação no servidor e tokens assinados. Nenhuma licença está sendo validada por esta versão.</p><div className="pill">Previsto: Entregas 02 e 03</div></div></>}
 {tab==='updates'&&<Updates version={env?.appVersion}/>}
 {tab==='settings'&&<><div className="page-heading"><span className="eyebrow">AMBIENTE LOCAL</span><h1>Configurações</h1><p>Controle onde seus plugins da Souz Content ficam instalados.</p></div><div className="settings-card"><div className="settings-title"><FolderOpen size={21}/><div><h2>Effects Souz Content</h2><p>Diretório gerenciado para suas DLLs FFGL.</p></div></div><div className="path"><code>{env?.effectsFolder||'Disponível no aplicativo desktop'}</code></div><div className="actions"><button className="primary" onClick={()=>void chooseFolder()} disabled={!desktop}>Alterar pasta</button><button className="ghost outline" onClick={()=>void window.souzHub?.showFolder()} disabled={!desktop}><ExternalLink size={15}/> Abrir pasta</button></div><div className="hint"><AlertCircle size={18}/><span>No Resolume Arena, acesse Preferences → Video e adicione a pasta acima aos diretórios FFGL. Reinicie o Resolume para carregar plugins novos.</span></div></div><div className="settings-card"><div className="settings-title"><Monitor size={21}/><div><h2>Diagnóstico</h2><p>Informações do ambiente atual</p></div></div><div className="diagnostic"><span>Plataforma</span><b>{env?.platform||'Navegador (prévia)'}</b><span>Versão do Hub</span><b>{env?.appVersion||'0.1.1'}</b><span>Instalação local</span><b>{desktop?'Disponível':'Requer Electron'}</b></div></div></>}
 </div></div><footer><div><Power size={13}/> SOUZ CONTENT HUB</div><span>Fundação {env?.appVersion||'0.1.1'} • Produto em desenvolvimento</span></footer></main>
 {toast&&<div className="toast"><Info size={17}/><span>{toast}</span><button onClick={()=>setToast('')}>×</button></div>}</div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

import { useEffect, useMemo, useState } from 'react';
import {
  Bell, Building2, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  Clock3, FileCheck2, FileText, FolderOpen, LayoutDashboard, Menu, MoreHorizontal,
  Plus, Search, Send, Settings, ShieldCheck, Upload, Users, X, XCircle,
} from 'lucide-react';
import { clients, initialRequests, templates } from './data';
import { createClientRemote, createRequestRemote, loadLocalState, loadRemoteState, reviewItemRemote, saveLocalState } from './persistence';
import type { Client, DocumentRequest, ItemStatus, RequestItem, Template } from './types';

type Page = 'dashboard' | 'clients' | 'requests' | 'templates' | 'settings';
const nav: Array<[Page, string, typeof LayoutDashboard]> = [
  ['dashboard', 'Dashboard', LayoutDashboard], ['clients', 'Clients', Users],
  ['requests', 'Requests', FolderOpen], ['templates', 'Templates', FileText],
  ['settings', 'Settings', Settings],
];

const statusClass = (status: string) => `badge badge-${status.toLowerCase().replaceAll(' ', '-')}`;
const requiredDone = (r: DocumentRequest) => r.items.filter(i => i.required && i.status === 'Approved').length;
const requiredTotal = (r: DocumentRequest) => r.items.filter(i => i.required).length;

export function App() {
  const initial = useMemo(() => loadLocalState({ clients, requests: initialRequests, templates }), []);
  const [page, setPage] = useState<Page>('dashboard');
  const [clientList, setClientList] = useState(initial.clients);
  const [requests, setRequests] = useState(initial.requests);
  const [templateList, setTemplateList] = useState(initial.templates);
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [portalRequest, setPortalRequest] = useState<DocumentRequest | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [syncState, setSyncState] = useState<'saved'|'saving'|'offline'>('saved');

  useEffect(() => {
    loadRemoteState().then(remote => {
      if (remote) { setClientList(remote.clients); setRequests(remote.requests); setTemplateList(remote.templates); saveLocalState(remote); setSyncState('saved'); }
    }).catch(() => setSyncState('offline'));
  }, []);

  useEffect(() => {
    const state = { clients: clientList, requests, templates: templateList };
    saveLocalState(state);
  }, [clientList, requests, templateList]);

  const updateItem = (requestId: string, itemId: string, status: ItemStatus, note?: string) => {
    reviewItemRemote(itemId,status,note).then(()=>setSyncState('saved')).catch(()=>setSyncState('offline'));
    setRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      items: r.items.map(i => i.id === itemId ? { ...i, status, reviewNote: note } : i),
      status: r.items.filter(i => i.required).every(i => i.id === itemId ? status === 'Approved' : i.status === 'Approved') ? 'Completed' : r.status,
      updatedAt: 'Just now',
    } : r));
    setSelectedRequest(prev => prev?.id === requestId ? {
      ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, status, reviewNote: note } : i),
    } : prev);
  };

  const createRequest = (clientId: string, templateId: string, dueDate: string) => {
    const client = clientList.find(c => c.id === clientId)!;
    const template = templateList.find(t => t.id === templateId)!;
    const request: DocumentRequest = {
      id: `r${Date.now()}`, clientId, clientName: client.businessName, period: 'November 2026',
      dueDate, status: 'In progress', assignee: 'You', updatedAt: 'Just now',
      items: template.items.map((i, index) => ({ id: `new-${index}`, ...i, status: 'Missing' })),
    };
    setRequests(prev => [request, ...prev]);
    setSyncState('saving');
    createRequestRemote({clientId,templateId,dueDate,period:'November 2026'}).then(saved=>{setRequests(prev=>prev.map(r=>r.id===request.id?saved:r));setSelectedRequest(saved);setSyncState('saved')}).catch(()=>setSyncState('offline'));
    setNewOpen(false); setPage('requests'); setSelectedRequest(request);
  };

  const addClient = (input: Pick<Client, 'businessName'|'contactName'|'email'>) => {
    const draft={ id: crypto.randomUUID(), ...input, requestCount: 0, progress: 0, status: 'On track' as const };
    setClientList(prev => [draft, ...prev]); setSyncState('saving');
    createClientRemote(input).then(saved=>{setClientList(prev=>prev.map(c=>c.id===draft.id?saved:c));setSyncState('saved')}).catch(()=>setSyncState('offline'));
  };

  if (portalRequest) return <ClientPortal request={portalRequest} onBack={() => setPortalRequest(null)} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Check size={19} strokeWidth={3}/></span><span>ClearChase</span></div>
        <div className="workspace"><span className="avatar avatar-sm">OC</span><div><strong>Oak & Co.</strong><small>{syncState === 'offline' ? 'Saved on this device' : syncState === 'saving' ? 'Saving…' : 'Catalyst sandbox'}</small></div><ChevronDown size={16}/></div>
        <nav aria-label="Primary navigation">
          {nav.map(([id,label,Icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => {setPage(id);setSelectedRequest(null);setMobileNav(false)}}><Icon size={19}/><span>{label}</span>{id === 'requests' && <em>3</em>}</button>)}
        </nav>
        <div className="sidebar-bottom"><button><CircleHelp size={19}/>Help & support</button><div className="user"><span className="avatar">KK</span><div><strong>Krishna Kumar</strong><small>Owner</small></div><MoreHorizontal size={18}/></div></div>
      </aside>
      <main>
        <header className="topbar"><button className="icon-btn mobile-only" onClick={() => setMobileNav(!mobileNav)} aria-label="Menu"><Menu/></button><div className="top-actions"><button className="icon-btn" aria-label="Notifications"><Bell size={20}/><i/></button><span className="sandbox-pill"><ShieldCheck size={15}/>Sandbox mode</span></div></header>
        <div className="content">
          {selectedRequest ? <RequestDetail request={requests.find(r => r.id === selectedRequest.id) ?? selectedRequest} onBack={() => setSelectedRequest(null)} updateItem={updateItem} openPortal={setPortalRequest}/> :
          page === 'dashboard' ? <Dashboard requests={requests} openRequest={setSelectedRequest} onNew={() => setNewOpen(true)} /> :
          page === 'clients' ? <ClientsPage clients={clientList} onAdd={addClient} /> : page === 'requests' ? <RequestsPage requests={requests} openRequest={setSelectedRequest} onNew={() => setNewOpen(true)} /> :
          page === 'templates' ? <TemplatesPage templates={templateList} onUse={() => setNewOpen(true)} /> : <SettingsPage />}
        </div>
      </main>
      {newOpen && <NewRequestModal clients={clientList} templates={templateList} onClose={() => setNewOpen(false)} onCreate={createRequest}/>} 
    </div>
  );
}

function PageTitle({eyebrow, title, sub, action}: {eyebrow?:string; title:string; sub:string; action?:React.ReactNode}) {
  return <div className="page-title"><div>{eyebrow && <small>{eyebrow}</small>}<h1>{title}</h1><p>{sub}</p></div>{action}</div>;
}

function Dashboard({requests, openRequest, onNew}: {requests:DocumentRequest[];openRequest:(r:DocumentRequest)=>void;onNew:()=>void}) {
  const review = requests.filter(r => r.items.some(i => i.status === 'Uploaded')).length;
  const overdue = requests.filter(r => r.status === 'Overdue').length;
  return <>
    <PageTitle eyebrow="SATURDAY, OCTOBER 31" title="Good evening, Krishna" sub="Here’s what needs your attention across your client requests." action={<button className="primary" onClick={onNew}><Plus size={18}/>New document request</button>}/>
    <section className="stats-grid">
      <Stat icon={FolderOpen} label="Outstanding requests" value={String(requests.filter(r=>r.status!=='Completed').length)} note="Across 3 clients" tone="blue"/>
      <Stat icon={Clock3} label="Overdue" value={String(overdue)} note="Needs a follow-up" tone="orange"/>
      <Stat icon={FileCheck2} label="Ready for review" value={String(review)} note="3 files uploaded" tone="green"/>
      <Stat icon={CheckCircle2} label="Completed this month" value="12" note="Up 20% from September" tone="purple"/>
    </section>
    <div className="dashboard-grid">
      <section className="panel activity-panel"><div className="panel-head"><div><h2>Needs your attention</h2><p>Requests with reviews or overdue items.</p></div><button className="text-btn">View all <ChevronRight size={16}/></button></div>
        <div className="request-list">{requests.filter(r=>r.status==='Needs review'||r.status==='Overdue').map(r=><RequestRow key={r.id} request={r} onClick={()=>openRequest(r)}/>)}</div>
      </section>
      <section className="panel progress-panel"><div className="panel-head"><div><h2>Request progress</h2><p>Current month at a glance.</p></div></div>
        <div className="ring" style={{'--progress':'68%'} as React.CSSProperties}><div><strong>68%</strong><span>collected</span></div></div>
        <div className="legend"><span><i className="dot green"/>Approved <b>17</b></span><span><i className="dot blue"/>Awaiting review <b>4</b></span><span><i className="dot gray"/>Still needed <b>7</b></span></div>
      </section>
    </div>
    <section className="panel recent"><div className="panel-head"><div><h2>Recent requests</h2><p>Latest activity from your clients.</p></div><button className="text-btn">View all <ChevronRight size={16}/></button></div><div className="table-wrap"><table><thead><tr><th>Client</th><th>Period</th><th>Progress</th><th>Status</th><th>Due date</th><th/></tr></thead><tbody>{requests.slice(0,4).map(r=><tr key={r.id} onClick={()=>openRequest(r)}><td><span className="avatar avatar-client">{r.clientName.slice(0,2).toUpperCase()}</span><strong>{r.clientName}</strong></td><td>{r.period}</td><td><MiniProgress done={requiredDone(r)} total={requiredTotal(r)}/></td><td><span className={statusClass(r.status)}>{r.status}</span></td><td>{formatDate(r.dueDate)}</td><td><ChevronRight size={17}/></td></tr>)}</tbody></table></div></section>
  </>;
}

function Stat({icon:Icon,label,value,note,tone}:{icon:typeof FolderOpen;label:string;value:string;note:string;tone:string}) { return <div className="stat"><span className={`stat-icon ${tone}`}><Icon size={21}/></span><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div> }
function MiniProgress({done,total}:{done:number;total:number}) { const p=total?done/total*100:0; return <div className="mini-progress"><div><i style={{width:`${p}%`}}/></div><span>{done} of {total}</span></div> }
function RequestRow({request,onClick}:{request:DocumentRequest;onClick:()=>void}) { return <button className="request-row" onClick={onClick}><span className={`row-icon ${request.status==='Overdue'?'warn':''}`}>{request.status==='Overdue'?<Clock3/>:<FileCheck2/>}</span><div><strong>{request.clientName}</strong><p>{request.status==='Overdue' ? `${requiredTotal(request)-requiredDone(request)} documents still needed` : `${request.items.filter(i=>i.status==='Uploaded').length} uploads ready to review`}</p></div><span className={statusClass(request.status)}>{request.status}</span><ChevronRight size={18}/></button> }

function RequestsPage({requests,openRequest,onNew}:{requests:DocumentRequest[];openRequest:(r:DocumentRequest)=>void;onNew:()=>void}) { const [query,setQuery]=useState(''); const filtered=requests.filter(r=>r.clientName.toLowerCase().includes(query.toLowerCase())); return <><PageTitle title="Document requests" sub="Track every request, upload, and review in one place." action={<button className="primary" onClick={onNew}><Plus size={18}/>New request</button>}/><div className="toolbar"><label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search clients or periods"/></label><button className="secondary">All statuses <ChevronDown size={16}/></button></div><section className="panel"><div className="table-wrap"><table><thead><tr><th>Client</th><th>Period</th><th>Progress</th><th>Status</th><th>Last activity</th><th>Due</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id} onClick={()=>openRequest(r)}><td><span className="avatar avatar-client">{r.clientName.slice(0,2).toUpperCase()}</span><strong>{r.clientName}</strong></td><td>{r.period}</td><td><MiniProgress done={requiredDone(r)} total={requiredTotal(r)}/></td><td><span className={statusClass(r.status)}>{r.status}</span></td><td>{r.updatedAt}</td><td>{formatDate(r.dueDate)}</td></tr>)}</tbody></table></div></section></> }

function ClientsPage({clients,onAdd}:{clients:Client[];onAdd:(c:Pick<Client,'businessName'|'contactName'|'email'>)=>void}) { const [query,setQuery]=useState(''); const [open,setOpen]=useState(false); return <><PageTitle title="Clients" sub="People and businesses you collect documents from." action={<button className="primary" onClick={()=>setOpen(true)}><Plus size={18}/>Add client</button>}/><div className="toolbar"><label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search clients"/></label></div><div className="client-grid">{clients.filter(c=>c.businessName.toLowerCase().includes(query.toLowerCase())).map(c=><article className="client-card" key={c.id}><div className="client-card-top"><span className="avatar avatar-lg">{c.businessName.slice(0,2).toUpperCase()}</span><button className="icon-btn"><MoreHorizontal/></button></div><h3>{c.businessName}</h3><p>{c.contactName} · {c.email}</p><div className="client-meta"><span>{c.requestCount} requests</span><span className={statusClass(c.status)}>{c.status}</span></div><MiniProgress done={Math.round(c.progress/20)} total={5}/></article>)}</div>{open&&<AddClientModal onClose={()=>setOpen(false)} onSubmit={value=>{onAdd(value);setOpen(false)}}/>}</> }

function TemplatesPage({templates,onUse}:{templates:Template[];onUse:()=>void}) { return <><PageTitle title="Templates" sub="Reusable checklists that make monthly collection effortless." action={<button className="primary"><Plus size={18}/>New template</button>}/><div className="template-grid">{templates.map((t,index)=><article className="template-card" key={t.id}><div className={`template-icon t${index}`}><FileText/></div><span className="template-category">{t.category}</span><h3>{t.name}</h3><p>{t.items.length} checklist items · Used {t.usage} times</p><ul>{t.items.slice(0,4).map(i=><li key={i.label}><Check size={15}/>{i.label}{!i.required&&<small>Optional</small>}</li>)}</ul><div className="card-actions"><button className="secondary">Edit</button><button className="primary soft" onClick={onUse}>Use template</button></div></article>)}</div></> }

function SettingsPage() { return <><PageTitle title="Workspace settings" sub="Manage your firm identity, reminders, and security."/><div className="settings-layout"><aside className="settings-nav"><button className="active">Workspace profile</button><button>Reminder policy</button><button>Team & roles</button><button>Billing</button><button>Security & privacy</button></aside><section className="panel settings-card"><h2>Workspace profile</h2><p>This identity appears on client request pages and emails.</p><div className="logo-upload"><span className="avatar avatar-xl">OC</span><button className="secondary">Upload logo</button></div><label>Company display name<input defaultValue="Oak & Co. Bookkeeping"/></label><div className="form-grid"><label>Timezone<select defaultValue="America/New_York"><option>America/New_York</option><option>Asia/Kolkata</option></select></label><label>Locale<select><option>English (United States)</option></select></label></div><div className="divider"/><h3>Privacy mode</h3><label className="toggle-row"><div><strong>Minimize details in client emails</strong><p>Show item counts without attachment filenames or sensitive details.</p></div><input type="checkbox" defaultChecked/></label><button className="primary">Save changes</button></section></div></> }

function RequestDetail({request,onBack,updateItem,openPortal}:{request:DocumentRequest;onBack:()=>void;updateItem:(r:string,i:string,s:ItemStatus,n?:string)=>void;openPortal:(r:DocumentRequest)=>void}) {
  const [rejecting,setRejecting]=useState<RequestItem|null>(null); const pct=Math.round(requiredDone(request)/Math.max(1,requiredTotal(request))*100);
  return <><button className="back-btn" onClick={onBack}>← Back to requests</button><div className="detail-head"><div><div className="detail-title-line"><h1>{request.clientName}</h1><span className={statusClass(request.status)}>{request.status}</span></div><p>{request.period} document request · Due {formatDate(request.dueDate)}</p></div><div className="detail-actions"><button className="secondary" onClick={()=>openPortal(request)}>Preview client portal</button><button className="primary"><Send size={17}/>Send reminder</button></div></div><section className="detail-summary"><div><small>COLLECTION PROGRESS</small><div className="big-progress"><div><i style={{width:`${pct}%`}}/></div><strong>{pct}%</strong></div><p>{requiredDone(request)} approved of {requiredTotal(request)} required items</p></div><div><small>ASSIGNEE</small><p><span className="avatar avatar-sm">KK</span><strong>{request.assignee}</strong></p></div><div><small>LAST ACTIVITY</small><p><strong>{request.updatedAt}</strong></p></div></section><div className="detail-grid"><section className="panel checklist"><div className="panel-head"><div><h2>Requested documents</h2><p>Review each upload before the request can be completed.</p></div></div>{request.items.map(item=><div className="item-row" key={item.id}><span className={`item-status-icon ${item.status.toLowerCase().replace(' ','-')}`}>{item.status==='Approved'?<Check/>:item.status==='Missing'?<Upload/>:item.status==='Needs replacement'?<X/>:<FileText/>}</span><div className="item-main"><div><strong>{item.label}</strong>{!item.required&&<small>Optional</small>}</div>{item.fileName?<p>{item.fileName} · PDF · Uploaded 12 min ago</p>:item.reviewNote?<p className="danger-text">{item.reviewNote}</p>:<p>No file received yet</p>}</div><span className={statusClass(item.status)}>{item.status}</span>{item.status==='Uploaded'&&<div className="review-buttons"><button className="approve" onClick={()=>updateItem(request.id,item.id,'Approved')}><Check size={16}/>Approve</button><button className="reject" onClick={()=>setRejecting(item)}><X size={16}/>Replace</button></div>}</div>)}</section><aside className="panel timeline"><h2>Activity</h2><div className="timeline-item"><i/><div><strong>New uploads received</strong><p>Maya uploaded 2 documents</p><small>12 minutes ago</small></div></div><div className="timeline-item"><i/><div><strong>Reminder delivered</strong><p>Sent to maya@elmstreet.example</p><small>Yesterday at 9:02 AM</small></div></div><div className="timeline-item"><i/><div><strong>Request opened</strong><p>Maya verified access by email code</p><small>Oct 27 at 4:18 PM</small></div></div><div className="timeline-item"><i/><div><strong>Request sent</strong><p>Secure invitation created</p><small>Oct 27 at 4:15 PM</small></div></div></aside></div>{rejecting&&<RejectModal item={rejecting} onClose={()=>setRejecting(null)} onSubmit={note=>{updateItem(request.id,rejecting.id,'Needs replacement',note);setRejecting(null)}}/>}</>;
}

function ClientPortal({request,onBack}:{request:DocumentRequest;onBack:()=>void}) { const [items,setItems]=useState(request.items); const remaining=items.filter(i=>i.required&&i.status!=='Approved'&&i.status!=='Uploaded').length; const upload=(id:string)=>setItems(prev=>prev.map(i=>i.id===id?{...i,status:'Uploaded',fileName:'uploaded-document.pdf'}:i)); return <div className="portal"><header><div className="portal-brand"><span className="brand-mark"><Check size={18}/></span><div><strong>Oak & Co. Bookkeeping</strong><small>Secure document request</small></div></div><button className="secondary" onClick={onBack}>Exit preview</button></header><main><div className="portal-hero"><span className="secure"><ShieldCheck size={16}/>Secure request</span><h1>{request.period} bookkeeping documents</h1><p>Hi Maya, Oak & Co. needs a few documents to complete your monthly bookkeeping.</p><div className="portal-due"><Clock3 size={18}/><span>Due {formatDate(request.dueDate)}</span></div></div><section className="portal-progress"><div><strong>{remaining === 0 ? 'Everything received' : `${remaining} of ${requiredTotal(request)} documents still needed`}</strong><span>Your bookkeeper will review each upload.</span></div><div className="portal-bar"><i style={{width:`${(requiredTotal(request)-remaining)/requiredTotal(request)*100}%`}}/></div></section><section className="portal-list">{items.map((item,index)=><article key={item.id} className={item.status==='Approved'||item.status==='Uploaded'?'done':''}><div className="portal-number">{item.status==='Approved'||item.status==='Uploaded'?<Check/>:index+1}</div><div className="portal-item-main"><div><h3>{item.label}</h3>{!item.required&&<span>Optional</span>}</div><p>{item.status==='Needs replacement'?item.reviewNote:'PDF, JPG or PNG · Maximum 20 MB'}</p>{item.fileName&&<div className="file-chip"><FileText/><span>{item.fileName}<small>{item.status==='Approved'?'Approved':'Received — awaiting review'}</small></span><CheckCircle2/></div>}</div>{!item.fileName&&<label className="upload-btn"><Upload size={17}/>Upload file<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={()=>upload(item.id)}/></label>}</article>)}</section><div className="privacy-note"><ShieldCheck/><div><strong>Your documents are private</strong><p>Files are encrypted and shared only with Oak & Co. Bookkeeping. This preview uses sandbox data and does not upload files to a server.</p></div></div></main><footer>Powered by ClearChase · <button>Privacy</button> · <button>Get help</button></footer></div> }

function NewRequestModal({clients,templates,onClose,onCreate}:{clients:Client[];templates:Template[];onClose:()=>void;onCreate:(c:string,t:string,d:string)=>void}) { const [client,setClient]=useState(clients[0]?.id ?? ''); const [template,setTemplate]=useState(templates[0]?.id ?? ''); const [due,setDue]=useState('2026-11-10'); return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal"><div className="modal-head"><div><h2>New document request</h2><p>Create a secure checklist for your client.</p></div><button className="icon-btn" onClick={onClose}><X/></button></div><label>Client<select value={client} onChange={e=>setClient(e.target.value)}>{clients.map(c=><option key={c.id} value={c.id}>{c.businessName}</option>)}</select></label><label>Template<select value={template} onChange={e=>setTemplate(e.target.value)}>{templates.map(t=><option key={t.id} value={t.id}>{t.name} ({t.items.length} items)</option>)}</select></label><div className="form-grid"><label>Period<input value="November 2026" readOnly/></label><label>Due date<input type="date" value={due} onChange={e=>setDue(e.target.value)}/></label></div><label className="toggle-row compact"><div><strong>Send immediately</strong><p>Creates the secure request. Email delivery is enabled after Mail is configured.</p></div><input type="checkbox" disabled/></label><div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!client||!template} onClick={()=>onCreate(client,template,due)}>Create request</button></div></div></div> }
function AddClientModal({onClose,onSubmit}:{onClose:()=>void;onSubmit:(c:Pick<Client,'businessName'|'contactName'|'email'>)=>void}) { const [businessName,setBusinessName]=useState(''); const [contactName,setContactName]=useState(''); const [email,setEmail]=useState(''); const valid=businessName.trim()&&contactName.trim()&&/^[^@]+@[^@]+\.[^@]+$/.test(email); return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal modal-sm"><div className="modal-head"><div><h2>Add client</h2><p>Create a client record for document collection.</p></div><button className="icon-btn" onClick={onClose}><X/></button></div><label>Business name<input value={businessName} onChange={e=>setBusinessName(e.target.value)} autoFocus/></label><label>Contact name<input value={contactName} onChange={e=>setContactName(e.target.value)}/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!valid} onClick={()=>onSubmit({businessName:businessName.trim(),contactName:contactName.trim(),email:email.trim()})}>Add client</button></div></div></div> }
function RejectModal({item,onClose,onSubmit}:{item:RequestItem;onClose:()=>void;onSubmit:(n:string)=>void}) { const [note,setNote]=useState('Please upload the complete statement for the requested period.'); return <div className="modal-backdrop"><div className="modal modal-sm"><div className="modal-head"><div><h2>Request a replacement</h2><p>{item.label}</p></div><button className="icon-btn" onClick={onClose}><X/></button></div><label>Message to client<textarea value={note} onChange={e=>setNote(e.target.value)} rows={4}/></label><div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary danger" onClick={()=>onSubmit(note)}>Request replacement</button></div></div></div> }
const formatDate=(value:string)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`));

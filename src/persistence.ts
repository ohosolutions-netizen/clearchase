import type { Client, DocumentRequest, ItemStatus, Template } from './types';
export interface AppState { clients: Client[]; requests: DocumentRequest[]; templates: Template[] }
const STORAGE_KEY='clearchase.app-state.v2',API_BASE=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
export function loadLocalState(fallback:AppState):AppState{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?{...fallback,...JSON.parse(raw)}:fallback}catch{return fallback}}
export function saveLocalState(state:AppState){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
async function request<T>(path:string,init?:RequestInit):Promise<T>{const response=await fetch(`${API_BASE}${path}`,init);if(!response.ok)throw new Error(`API ${response.status}`);return (await response.json()).data}
const write=(path:string,data:unknown)=>request<any>(path,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(data)});
export const loadRemoteState=()=>API_BASE?request<AppState>('/bootstrap'):Promise.resolve(null);
export const createClientRemote=(client:Pick<Client,'businessName'|'contactName'|'email'>)=>write('/clients',client) as Promise<Client>;
export const createRequestRemote=(input:{clientId:string;templateId:string;dueDate:string;period:string})=>write('/requests',input) as Promise<DocumentRequest>;
export const reviewItemRemote=(id:string,status:ItemStatus,note?:string)=>write(`/request-items/${id}/review`,{status,note});

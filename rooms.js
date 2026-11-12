/* KEEM Guesthouse public room catalogue.
   Uses Supabase when supabase-config.js is configured; otherwise shows clearly labelled sample rooms. */
const sampleRooms = [
 {id:'sample-standard',name:'Standard Room',category:'COMFORT & VALUE',description:'A welcoming room for guests who want a simple, relaxing place to unwind.',price_eur:25,price_ghs:325,max_guests:2,bed_type:'Confirm with owner',bed_count:1,bathroom_type:'Confirm with owner',bathroom_features:[],amenities:[],features:['Example listing','Private room details to be confirmed'],photos:[],available:true},
 {id:'sample-deluxe',name:'Deluxe Room',category:'EXTRA COMFORT',description:'A more spacious stay for visitors looking for extra room to settle in.',price_eur:35,price_ghs:455,max_guests:2,bed_type:'Confirm with owner',bed_count:1,bathroom_type:'Confirm with owner',bathroom_features:[],amenities:[],features:['Example listing','Facilities to be confirmed'],photos:[],available:true},
 {id:'sample-family',name:'Family Room',category:'FOR FAMILIES',description:'An option intended for families or guests travelling together.',price_eur:50,price_ghs:650,max_guests:4,bed_type:'Confirm with owner',bed_count:2,bathroom_type:'Confirm with owner',bathroom_features:[],amenities:[],features:['Example listing','Facilities to be confirmed'],photos:[],available:true}
];
const grid=document.getElementById('roomsGrid'), count=document.getElementById('roomCount');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=v=>Array.isArray(v)?v:[];
function render(rooms, demo=false){
 if(!grid)return;
 count.textContent=`${rooms.length} ${rooms.length===1?'room':'rooms'} ${demo?'· sample listings':'available to view'}`;
 if(!rooms.length){grid.innerHTML='<p class="rooms-loading">No rooms are currently listed. Please contact the guesthouse for assistance.</p>';return;}
 grid.innerHTML=rooms.map(r=>{
  const photos=list(r.photos), features=[`${r.max_guests||'Ask'} guests`,r.bed_type?`${r.bed_count||1} · ${r.bed_type}`:null,r.bathroom_type||null,...list(r.bathroom_features),...list(r.amenities),...list(r.features)].filter(Boolean);
  const photo=photos[0];
  const de=document.documentElement.lang==='de';
  return `<article class="room-card" data-room-card="${esc(r.id)}"><div class="room-photo">${photo?`<img src="${esc(photo)}" alt="${esc(r.name)} at KEEM Guesthouse">`:'<div class="room-photo-placeholder"><b>'+esc(r.name)+'</b><span>ROOM PHOTO TO BE ADDED</span></div>'}<span class="room-photo-count">${photos.length||0} photos</span></div>${photos.length>1?`<div class="room-thumbs">${photos.slice(0,5).map((url,i)=>`<button type="button" class="room-thumb ${i===0?'active':''}" data-photo="${esc(url)}" aria-label="View photo ${i+1}"><img src="${esc(url)}" alt=""></button>`).join('')}</div>`:''}<div class="room-card-body"><span class="room-tag">${esc(r.category||'ROOM')}</span><h3>${esc(r.name)}</h3><p class="room-description">${esc(r.description||'Contact us for room details.')}</p><h4 class="room-subheading">${de?'Zimmerdetails':'Room details'}</h4><div class="room-details"><span>👥 ${esc(r.max_guests||'Confirm')} ${de?'Gäste':'guests'}</span><span>🛏 ${esc(r.bed_count||'Confirm')} · ${esc(r.bed_type|| (de?'Bett auf Anfrage':'Bed details on request'))}</span><span>🚿 ${esc(r.bathroom_type|| (de?'Bad auf Anfrage':'Bathroom details on request'))}</span></div>${list(r.bathroom_features).length?`<p class="room-detail-line"><b>${de?'Badezimmer:':'Bathroom:'}</b> ${list(r.bathroom_features).map(esc).join(' · ')}</p>`:''}${list(r.amenities).length?`<p class="room-detail-line"><b>${de?'Ausstattung:':'Facilities:'}</b> ${list(r.amenities).map(esc).join(' · ')}</p>`:''}${list(r.features).length?`<div class="room-features">${list(r.features).map(x=>`<span class="room-feature">${esc(x)}</span>`).join('')}</div>`:''}<div class="room-price"><div><strong>€${Number(r.price_eur||0).toLocaleString('en')}</strong><small>${de?'pro Zimmer / Nacht':'per room / night'}</small></div><div class="cedi-price">GH₵${Number(r.price_ghs||0).toLocaleString('en-GH')}<small>${de?'pro Zimmer / Nacht':'per room / night'}</small></div></div>${demo?`<p class="room-price-note">${de?'Beispielpreis – bitte bestätigen Sie den endgültigen Preis direkt beim Eigentümer.':'Example price only — final rates must be confirmed by the owner.'}</p>`:''}<button class="button button-dark room-enquire" type="button" data-select-room="${esc(r.id)}">${de?'Dieses Zimmer auswählen':'Select this room'} <span>↗</span></button></div></article>`;
 }).join('');
 grid.querySelectorAll('.room-photo img').forEach(img=>img.addEventListener('click',()=>{const dlg=document.getElementById('photoDialog');if(dlg){document.getElementById('dialogImage').src=img.src;document.getElementById('dialogCaption').textContent=img.alt;dlg.showModal();}}));
 grid.querySelectorAll('.room-thumb').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.room-card'),img=card.querySelector('.room-photo img');img.src=b.dataset.photo;card.querySelectorAll('.room-thumb').forEach(x=>x.classList.toggle('active',x===b));}));
 grid.querySelectorAll('[data-select-room]').forEach(b=>b.addEventListener('click',()=>{const room=rooms.find(r=>String(r.id)===b.dataset.selectRoom);window.dispatchEvent(new CustomEvent('keem-select-room',{detail:{roomId:room?.id||'',roomName:room?.name||''}}));location.hash='#booking';}));
}
let publicClient=null;
let supabaseConfigured=false;
let refreshInProgress=false;
async function refreshPublicRooms(){
 if(!publicClient||refreshInProgress)return;
 refreshInProgress=true;
 try{
  const {data,error}=await publicClient.from('rooms').select('*').eq('available',true).order('created_at',{ascending:false});
  if(error)throw error;
  render(data||[]);
 }catch(error){
  console.error('KEEM Guesthouse room catalogue:',error);
  if(grid){grid.innerHTML='<p class="rooms-loading">Room information could not be loaded right now. Please contact the guesthouse directly.</p>';count.textContent='Room information unavailable';}
 }finally{refreshInProgress=false;}
}
async function init(){
 try{
  const cfg=await import('./supabase-config.js');
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY||cfg.SUPABASE_URL.includes('YOUR_'))throw Error('Supabase not configured');
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  publicClient=createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  supabaseConfigured=true;
  await refreshPublicRooms();
 }catch(error){
  console.error('KEEM Guesthouse Supabase setup:',error);
  if(supabaseConfigured){if(grid){grid.innerHTML='<p class="rooms-loading">Room information could not be loaded right now. Please contact the guesthouse directly.</p>';count.textContent='Room information unavailable';}}
  else render(sampleRooms,true);
 }
}
document.getElementById('dialogClose')?.addEventListener('click',()=>document.getElementById('photoDialog')?.close());
document.getElementById('photoDialog')?.addEventListener('click',e=>{if(e.target.id==='photoDialog')e.target.close();});
window.addEventListener('keem-language-change',()=>{if(publicClient)refreshPublicRooms();else init();});
window.addEventListener('focus',()=>{if(publicClient)refreshPublicRooms();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&publicClient)refreshPublicRooms();});
init();
// Refresh periodically so changes made from the owner dashboard appear on visitors' pages.
window.setInterval(()=>{if(publicClient)refreshPublicRooms();},60000);

const OCMS = (() => {
const cfg=window.OCMS_CONFIG||{};
const q=id=>document.getElementById(id), num=v=>parseFloat(v)||0;
let sb=null,user=null,mapped=[],components=[],savedLocal=[];
let state={id:null,buyer:'',styleRef:'',season:'',style:'Basic T-Shirt',gsm:180,wastage:10,status:'PRIMARY',primary:0,revised:0,cad:null,approvalLog:[],detectedStyle:null};

const styleRules={
'Basic T-Shirt':{keywords:['t-shirt','t shirt','crew neck','short sleeve'],note:'Primary uses approved OCMS T-shirt quick formula. Neck rib is separate.',missing:[['ribWidth','Neck/rib cut width','cm','High'],['ribGsm','Neck/rib GSM','GSM','Medium'],['stretch','Rib stretch ratio','%','Medium']]},
'Basic Polo':{keywords:['polo','collar','placket'],note:'Body quick estimate plus separate collar/placket/cuffs.',missing:[['collarL','Collar cut length','cm','High'],['collarW','Collar cut width','cm','High'],['collarGsm','Collar GSM','GSM','High']]},
'Pullover Hoodie':{keywords:['pullover hoodie','hoodie','kangaroo pocket'],note:'Body quick estimate plus explicit hood/rib/pocket components.',missing:[['hoodL','Hood cut length','cm','High'],['hoodW','Hood cut width','cm','High'],['ribGsm','Rib GSM','GSM','High'],['pocketL','Pocket length','cm','Medium'],['pocketW','Pocket width','cm','Medium']]},
'Zipper Hoodie':{keywords:['zipper hoodie','zip hoodie','full zip','zip front'],note:'Body quick estimate plus hood/rib/pocket/zip-facing components.',missing:[['hoodL','Hood cut length','cm','High'],['hoodW','Hood cut width','cm','High'],['zipFacingW','Zipper facing width','cm','Medium']]},
'Vest':{keywords:['vest','tank top','sleeveless'],note:'Main body plus separate neck and armhole binding.',missing:[['neckCirc','Neck circumference','cm','High'],['armCirc','Armhole circumference','cm','High'],['bindingW','Binding cut width','cm','High']]},
'Ladies Leggings':{keywords:['leggings','legging'],note:'Primary is a controlled proxy. Revised needs leg geometry and waistband.',missing:[['thigh','Thigh circumference','cm','High'],['knee','Knee circumference','cm','High'],['waistbandH','Waistband finished height','cm','High']]},
'Joggers':{keywords:['jogger','joggers','sweatpant'],note:'Primary proxy; taper, waistband and cuffs need confirmation.',missing:[['thigh','Thigh circumference','cm','High'],['knee','Knee circumference','cm','High'],['waistbandH','Waistband finished height','cm','High'],['cuffH','Cuff finished height','cm','High']]},
'Knit Dress':{keywords:['knit dress','dress','gathered dress'],note:'Fullness / pleat geometry must be explicit.',missing:[['hemSweep','Hem sweep','cm','High'],['fullness','Fullness factor','x','High']]},
'Knit Blazer':{keywords:['knit blazer','blazer'],note:'Complex style: facing, lapel, lining, vents and pockets require component/CAD validation.',missing:[['facingL','Facing length','cm','High'],['liningGsm','Lining GSM','GSM','High']]},
'Woven Shirt':{keywords:['woven shirt','button down','formal shirt'],note:'Woven revised result is marker based.',missing:[['markerLength','Marker length','m','Critical'],['markerGarments','Garments in marker','pcs','Critical'],['usableWidth','Usable width','inch','Critical']]},
'Woven Trouser':{keywords:['woven trouser','trouser','cargo pant','chino','formal pant'],note:'Woven revised result is marker based.',missing:[['markerLength','Marker length','m','Critical'],['markerGarments','Garments in marker','pcs','Critical'],['usableWidth','Usable width','inch','Critical']]}
};
const pomMaster=[
{pom:'BL',name:'Body Length',syn:['body length','back length h.s.p','back length hsp','hsp length'],unit:'cm'},
{pom:'HC',name:'Half Chest',syn:['1/2 chest','½ chest','half chest','chest width','1/2 chest width'],unit:'cm'},
{pom:'SH',name:'Across Shoulder',syn:['across shoulder','shoulder width'],unit:'cm'},
{pom:'CBSL',name:'CB Sleeve',syn:['sleeve length c.b','sleeve length cb','sleeve from c.b','center back sleeve'],unit:'cm'},
{pom:'WAIST',name:'Half Waist',syn:['1/2 waist','½ waist','half waist','waist width'],unit:'cm'},
{pom:'HIP',name:'Half Hip',syn:['1/2 hip','½ hip','half hip','hip width'],unit:'cm'},
{pom:'INSEAM',name:'Inseam',syn:['inseam','inside leg'],unit:'cm'},
{pom:'OUTSEAM',name:'Outseam',syn:['outseam','outside leg','total length'],unit:'cm'},
{pom:'FRISE',name:'Front Rise',syn:['front rise'],unit:'cm'},
{pom:'BRISE',name:'Back Rise',syn:['back rise'],unit:'cm'}
];
const demoSizes=[['XS',68,45,39,40,1],['S',70,48,40.5,42,2],['M',72,51,42,44,3],['L',74,54,43.5,46,3],['XL',76,57,45,48,2],['XXL',78,60,46.5,50,1],['3XL',80,63,48,52,1]]
.map(x=>({size:x[0],bl:x[1],hc:x[2],cb:x[3],sh:x[4],ratio:x[5]}));
let sizes=JSON.parse(JSON.stringify(demoSizes));
const templates={
'Basic T-Shirt':[{fabricId:'FAB-02',name:'Neck Rib',type:'Separate',qty:1,length:44,width:5,gsm:240,layer:1,waste:10,status:'Trial'}],
'Basic Polo':[{fabricId:'FAB-02',name:'Flat Knit Collar',type:'Separate',qty:1,length:44,width:8,gsm:450,layer:1,waste:10,status:'Trial'},{fabricId:'FAB-01',name:'Placket',type:'Separate',qty:2,length:18,width:5,gsm:220,layer:1,waste:10,status:'Trial'}],
'Pullover Hoodie':[{fabricId:'FAB-01',name:'Hood',type:'Separate',qty:2,length:40,width:35,gsm:280,layer:1,waste:10,status:'Trial'},{fabricId:'FAB-02',name:'Bottom Rib',type:'Separate',qty:1,length:95,width:14,gsm:450,layer:1,waste:10,status:'Trial'},{fabricId:'FAB-02',name:'Cuffs',type:'Separate',qty:2,length:24,width:12,gsm:450,layer:1,waste:10,status:'Trial'},{fabricId:'FAB-01',name:'Kangaroo Pocket',type:'Overlay',qty:1,length:25,width:45,gsm:280,layer:1,waste:10,status:'Trial'}],
'Zipper Hoodie':[{fabricId:'FAB-01',name:'Hood',type:'Separate',qty:2,length:40,width:35,gsm:280,layer:1,waste:10,status:'Trial'}],
'Vest':[{fabricId:'FAB-02',name:'Neck Binding',type:'Separate',qty:1,length:55,width:5,gsm:200,layer:1,waste:10,status:'Trial'},{fabricId:'FAB-02',name:'Armhole Binding',type:'Separate',qty:2,length:48,width:5,gsm:200,layer:1,waste:10,status:'Trial'}],
'Ladies Leggings':[],'Joggers':[],'Knit Dress':[],'Knit Blazer':[],'Woven Shirt':[],'Woven Trouser':[]
};
const masters=[['M01 Style Master','Style/category/method'],['M02 Measurement Master','POM + synonym mapping'],['M03 Component Master','Physical components + fabric IDs'],['M04 Allowance Master','Seam/hem/fold/fullness/wastage'],['M05 Calculation Rule Master','Quick/area/marker rules'],['M06 CAD Validation Master','Estimate vs CAD'],['M07 Fabric Master','Construction/GSM/width'],['M08 Missing Input Master','Priority prompts'],['M09 Tenant/User Master','SaaS roles and isolation'],['M10 Audit Master','Status/version/approval trail']];
const allowances=[['KN-QF-01','Body top quick allowance',2,'cm','Trial'],['KN-QF-02','Body bottom quick allowance',2,'cm','Trial'],['KN-QF-03','Sleeve top quick allowance',2,'cm','Trial'],['KN-QF-04','Sleeve bottom quick allowance',2,'cm','Trial'],['KN-QF-05','Half chest left quick allowance',2,'cm','Trial'],['KN-QF-06','Half chest right quick allowance',2,'cm','Trial'],['KN-NK-01','Neck rib joining',1,'cm','Trial'],['KN-WS-01','Process wastage',10,'%','Editable']];

function quick(s,g,w){const sl=s.cb-s.sh/2;return{sl,kg:((s.bl+sl+8)*(s.hc+4)*2*g*12*(1+w/100))/10000000}}
function ckg(c){return num(c.length)*num(c.width)*num(c.qty)*num(c.layer)*num(c.gsm)*12*(1+num(c.waste)/100)/10000000}
function setStatus(s){state.status=s;q('approvalStatus').value=s;q('statusPill').textContent=s.replaceAll('_',' ');q('statusPill').className='pill '+((s==='CAD_VALIDATED'||s==='FINAL_APPROVED')?'green':s==='INPUT_REQUIRED'?'red':'orange')}
function activate(id){document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));document.querySelector(`[data-tab="${id}"]`)?.classList.add('active');q(id)?.classList.add('active')}
function init(){
  q('style').innerHTML=Object.keys(styleRules).map(s=>`<option>${s}</option>`).join('');
  renderSizes();renderMasters();loadTemplate();updateStyle();bind();loadConfig();refreshSaved();calcAll();
}
function bind(){
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>activate(b.dataset.tab));
  document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>activate(b.dataset.goto));
  q('style').onchange=()=>{state.style=q('style').value;loadTemplate();updateStyle()};
  q('gsm').oninput=calcAll;q('wastage').oninput=calcAll;q('calcBtn').onclick=calcAll;
  q('addComponentBtn').onclick=addComponent;q('applyRevisionBtn').onclick=applyRevision;
  q('analyzeBtn').onclick=analyze;q('loadDemoBtn').onclick=loadDemo;q('clearIntakeBtn').onclick=clearIntake;q('sendToCalcBtn').onclick=sendToCalc;
  q('compareCadBtn').onclick=compareCad;q('saveApprovalBtn').onclick=saveApproval;q('saveBtn').onclick=saveCalculation;q('refreshSavedBtn').onclick=refreshSaved;
  q('connectSupabaseBtn').onclick=manualConnect;q('signUpBtn').onclick=signUp;q('signInBtn').onclick=signIn;q('signOutBtn').onclick=signOut;q('authBtn').onclick=()=>activate('admin');
}
function renderSizes(){
  const tb=q('sizeTable').querySelector('tbody');tb.innerHTML='';
  sizes.forEach((s,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${s.size}</td><td><input data-i="${i}" data-f="bl" type="number" value="${s.bl}"></td><td><input data-i="${i}" data-f="hc" type="number" value="${s.hc}"></td><td><input data-i="${i}" data-f="cb" type="number" value="${s.cb}"></td><td><input data-i="${i}" data-f="sh" type="number" value="${s.sh}"></td><td class="sl"></td><td><input data-i="${i}" data-f="ratio" type="number" value="${s.ratio}"></td><td class="primary"></td><td class="revised"></td>`;tb.appendChild(tr)});
  tb.oninput=e=>{const i=+e.target.dataset.i,f=e.target.dataset.f;if(f){sizes[i][f]=num(e.target.value);calcAll()}};
}
function updateStyle(){state.style=q('style').value;const r=styleRules[state.style];q('styleNote').textContent=r.note;q('method').value=state.style.startsWith('Woven')?'woven':'quick';renderMissing();calcAll()}
function renderMissing(){const arr=styleRules[state.style].missing;q('missingList').innerHTML=arr.map(x=>`<div class="warn">• ${x[1]} <small>(${x[3]})</small></div>`).join('');q('revisedInputs').innerHTML=arr.map(x=>`<div class="inputrow"><label>${x[1]}<input data-key="${x[0]}" type="number" step=".1"></label><span>${x[2]}</span><span>${x[3]}</span></div>`).join('')}
function loadTemplate(){components=JSON.parse(JSON.stringify(templates[q('style').value]||[]));renderComponents()}
function addComponent(){components.push({fabricId:'FAB-02',name:'New Component',type:'Separate',qty:1,length:0,width:0,gsm:num(q('gsm').value),layer:1,waste:num(q('wastage').value),status:'Trial'});renderComponents();calcAll()}
function renderComponents(){
  const tb=q('componentTable').querySelector('tbody');tb.innerHTML='';
  components.forEach((c,i)=>{const tr=document.createElement('tr');tr.innerHTML=`<td><input data-i="${i}" data-f="fabricId" value="${c.fabricId}"></td><td><input data-i="${i}" data-f="name" value="${c.name}"></td><td><select data-i="${i}" data-f="type"><option ${c.type==='Separate'?'selected':''}>Separate</option><option ${c.type==='Replacement'?'selected':''}>Replacement</option><option ${c.type==='Overlay'?'selected':''}>Overlay</option><option ${c.type==='Integrated'?'selected':''}>Integrated</option></select></td><td><input data-i="${i}" data-f="qty" type="number" value="${c.qty}"></td><td><input data-i="${i}" data-f="length" type="number" value="${c.length}"></td><td><input data-i="${i}" data-f="width" type="number" value="${c.width}"></td><td><input data-i="${i}" data-f="gsm" type="number" value="${c.gsm}"></td><td><input data-i="${i}" data-f="layer" type="number" value="${c.layer}"></td><td><input data-i="${i}" data-f="waste" type="number" value="${c.waste}"></td><td>${ckg(c).toFixed(3)}</td><td>${c.status}</td><td><button data-del="${i}" class="secondary">×</button></td>`;tb.appendChild(tr)});
  tb.oninput=e=>{const i=+e.target.dataset.i,f=e.target.dataset.f;if(f){components[i][f]=['fabricId','name','type'].includes(f)?e.target.value:num(e.target.value);renderComponents();calcAll()}};
  tb.onclick=e=>{if(e.target.dataset.del!==undefined){components.splice(+e.target.dataset.del,1);renderComponents();calcAll()}};
  q('componentTotal').textContent=components.reduce((a,c)=>a+ckg(c),0).toFixed(3)+' KG/DZ';
}
function calcAll(){
  state.gsm=num(q('gsm').value);state.wastage=num(q('wastage').value);
  const comp=components.filter(c=>c.type!=='Replacement').reduce((a,c)=>a+ckg(c),0);
  let ps=0,rs=0,ratio=0;
  [...q('sizeTable').querySelectorAll('tbody tr')].forEach((tr,i)=>{
    const s=sizes[i];let p=0,r=0,sl=0;
    if(state.style.startsWith('Woven')){
      const vals={};document.querySelectorAll('#revisedInputs input').forEach(x=>vals[x.dataset.key]=num(x.value));
      r=(vals.markerLength&&vals.markerGarments)?(vals.markerLength/vals.markerGarments)*12*1.093613*(1+state.wastage/100):0;
    }else{const x=quick(s,state.gsm,state.wastage);sl=x.sl;p=x.kg;r=p+comp}
    s.primary=p;s.revised=r;s.sl=sl;ps+=p*s.ratio;rs+=r*s.ratio;ratio+=s.ratio;
    tr.querySelector('.sl').textContent=state.style.startsWith('Woven')?'—':sl.toFixed(1);tr.querySelector('.primary').textContent=p?p.toFixed(3):'Pending';tr.querySelector('.revised').textContent=r?r.toFixed(3):'Pending';
  });
  state.primary=ratio?ps/ratio:0;state.revised=ratio?rs/ratio:0;
  q('primaryAvg').textContent=state.primary?state.primary.toFixed(3):'Pending';q('revisedAvg').textContent=state.revised?state.revised.toFixed(3):'Pending';
  q('revisionVariance').textContent=state.primary?(((state.revised-state.primary)/state.primary)*100).toFixed(2)+'%':'—';
  q('calcConfidence').textContent=state.status==='CAD_VALIDATED'?'High':components.length?'Medium':'Low-Medium';q('cadRevised').textContent=state.revised?state.revised.toFixed(3):'—';
  fabricSummary();
}
function fabricSummary(){const groups={};if(state.primary)groups['FAB-01']={d:`Main Fabric ${state.gsm} GSM`,src:'Primary formula',kg:state.primary};components.filter(c=>c.type!=='Replacement').forEach(c=>{const k=c.fabricId||'UNASSIGNED';if(!groups[k])groups[k]={d:'Separate Components',src:'Component area',kg:0};groups[k].kg+=ckg(c)});q('fabricSummary').innerHTML=Object.entries(groups).map(([k,x])=>`<tr><td>${k}</td><td>${x.d}</td><td>${x.src}</td><td>${x.kg.toFixed(3)}</td></tr>`).join('')||'<tr><td>—</td><td>Pending</td><td>—</td><td>—</td></tr>'}
function escapeRx(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function detectStyle(text){text=text.toLowerCase();let best='Basic T-Shirt',score=0;Object.entries(styleRules).forEach(([style,r])=>{const s=r.keywords.reduce((a,k)=>a+(text.includes(k)?1:0),0);if(s>score){score=s;best=style}});return{style:best,score}}
function extractGsm(text){let m=text.match(/(\d{2,3})\s*gsm\b/i)||text.match(/gsm\s*[:=-]?\s*(\d{2,3})/i);return m?num(m[1]):null}
function extractRange(text){let m=text.match(/size\s*range\s*[:=-]?\s*([A-Z0-9XL\-– ]+)/i);return m?m[1].trim():'—'}
function extractMappings(text){const out=[];pomMaster.forEach(p=>{for(const syn of p.syn){const m=text.match(new RegExp(escapeRx(syn)+'\\s*[:=\\-]?\\s*(\\d+(?:\\.\\d+)?)','i'));if(m){out.push({term:syn,pom:p.pom,name:p.name,value:num(m[1]),unit:p.unit,confidence:'High',status:'Mapped'});break}}});return out}
async function analyze(){
  const text=q('sourceText').value;if(!text.trim()){alert('Paste extracted tech-pack text first.');return}
  const d=detectStyle(text),gsm=extractGsm(text);mapped=extractMappings(text);state.detectedStyle=d.style;
  q('detectedStyle').textContent=d.style;q('detectedConfidence').textContent=d.score>=2?'High':d.score===1?'Medium':'Low';q('detectedGsm').textContent=gsm?gsm+' GSM':'—';q('detectedRange').textContent=extractRange(text);
  renderMapping();renderAutoMissing(d.style);if(gsm)q('gsm').value=gsm;
}
function renderMapping(){q('mappingTable').querySelector('tbody').innerHTML=mapped.map(x=>`<tr><td>${x.term}</td><td>${x.pom} — ${x.name}</td><td>${x.value}</td><td>${x.unit}</td><td>${x.confidence}</td><td>${x.status}</td></tr>`).join('')||'<tr><td colspan="6">No mapped values detected.</td></tr>'}
function renderAutoMissing(style){const found=new Set(mapped.map(x=>x.pom)),a=[];[['BL','Body Length'],['HC','Half Chest'],['SH','Across Shoulder'],['CBSL','CB Sleeve']].forEach(x=>{if(!found.has(x[0]))a.push(x[1])});styleRules[style].missing.forEach(x=>a.push(x[1]));q('autoMissingList').innerHTML=a.map(x=>`<div class="warn">• ${x}</div>`).join('')||'<div class="ok">No critical missing inputs.</div>'}
function sendToCalc(){if(!state.detectedStyle){analyze()}q('style').value=state.detectedStyle||'Basic T-Shirt';const m={};mapped.forEach(x=>m[x.pom]=x.value);if(m.BL)sizes.forEach(s=>s.bl=m.BL);if(m.HC)sizes.forEach(s=>s.hc=m.HC);if(m.CBSL)sizes.forEach(s=>s.cb=m.CBSL);if(m.SH)sizes.forEach(s=>s.sh=m.SH);renderSizes();loadTemplate();updateStyle();activate('calculator')}
function loadDemo(){q('sourceText').value=`Style: Men's Basic Crew Neck T-Shirt
Fabric: 100% Cotton Single Jersey
GSM: 180
Size Range: XS-3XL
Back length h.s.p: 74
1/2 chest: 54
Across shoulder: 46
Sleeve length c.b: 43.5`;}
function clearIntake(){q('sourceText').value='';mapped=[];renderMapping();['detectedStyle','detectedConfidence','detectedGsm','detectedRange'].forEach(id=>q(id).textContent='—');q('autoMissingList').innerHTML=''}
function applyRevision(){const any=[...q('revisedInputs').querySelectorAll('input')].some(x=>num(x.value)>0);setStatus(any?'REVISED':'INPUT_REQUIRED');calcAll()}
function compareCad(){const cad=num(q('cadInput').value);if(!cad){alert('Enter CAD consumption first.');return}state.cad=cad;q('cadActual').textContent=cad.toFixed(3);const v=((state.revised-cad)/cad)*100;q('cadVariance').textContent=(v>=0?'+':'')+v.toFixed(2)+'%';q('cadResult').textContent=Math.abs(v)<=3?'Within 3% target':'Review Required';setStatus('CAD_VALIDATED')}
function saveApproval(){const r={status:q('approvalStatus').value,by:q('approvedBy').value||'Unspecified',remarks:q('approvalRemarks').value||'',at:new Date().toISOString()};state.approvalLog.unshift(r);setStatus(r.status);q('approvalLog').innerHTML=state.approvalLog.map(x=>`<div>${new Date(x.at).toLocaleString()} — <b>${x.status}</b> — ${x.by}${x.remarks?' — '+x.remarks:''}</div>`).join('');saveCalculation()}
function payload(){return{buyer:q('buyer').value,style_ref:q('styleRef').value,season:q('season').value,style_name:q('style').value,gsm:state.gsm,wastage_pct:state.wastage,status:state.status,primary_kg_dz:state.primary,revised_kg_dz:state.revised,cad_kg_dz:state.cad,sizes,components,mapped_measurements:mapped,approval_log:state.approvalLog,updated_at:new Date().toISOString()}}
async function saveCalculation(){
  const p=payload();state.buyer=p.buyer;state.styleRef=p.style_ref;state.season=p.season;
  if(sb&&user){const row={...p,user_id:user.id};delete row.sizes;delete row.components;delete row.mapped_measurements;delete row.approval_log;row.payload=p;const {data,error}=await sb.from('calculations').insert(row).select().single();if(error){alert('Cloud save failed: '+error.message);return}state.id=data.id}
  else{const item={id:crypto.randomUUID(),created_at:new Date().toISOString(),...p};savedLocal.unshift(item);localStorage.setItem('ocms_calculations',JSON.stringify(savedLocal))}
  await refreshSaved();alert('Calculation saved.');
}
async function refreshSaved(){
  let rows=[];
  if(sb&&user){const {data,error}=await sb.from('calculations').select('*').order('created_at',{ascending:false}).limit(100);if(!error)rows=data||[]}
  else{savedLocal=JSON.parse(localStorage.getItem('ocms_calculations')||'[]');rows=savedLocal}
  q('savedTable').querySelector('tbody').innerHTML=rows.map(r=>`<tr><td>${new Date(r.created_at||r.updated_at).toLocaleString()}</td><td>${r.buyer||''}</td><td>${r.style_ref||''}</td><td>${r.style_name||r.style||''}</td><td>${r.status||''}</td><td>${Number(r.primary_kg_dz||0).toFixed(3)}</td><td>${Number(r.revised_kg_dz||0).toFixed(3)}</td><td><button data-load="${r.id}" class="secondary">Load</button></td></tr>`).join('')||'<tr><td colspan="8">No saved calculations.</td></tr>';
  q('savedTable').onclick=e=>{if(e.target.dataset.load)loadSaved(e.target.dataset.load,rows)};
  q('kpiSaved').textContent=rows.length;q('kpiPending').textContent=rows.filter(x=>x.status==='INPUT_REQUIRED').length;q('kpiCad').textContent=rows.filter(x=>x.status==='CAD_VALIDATED').length;q('kpiApproved').textContent=rows.filter(x=>x.status==='FINAL_APPROVED').length;
}
function loadSaved(id,rows){const r=rows.find(x=>String(x.id)===String(id));const p=r?.payload||r;if(!p)return;q('buyer').value=p.buyer||'';q('styleRef').value=p.style_ref||'';q('season').value=p.season||'';q('style').value=p.style_name||p.style||'Basic T-Shirt';q('gsm').value=p.gsm||180;q('wastage').value=p.wastage_pct||10;sizes=p.sizes||JSON.parse(JSON.stringify(demoSizes));components=p.components||[];mapped=p.mapped_measurements||[];state.approvalLog=p.approval_log||[];state.cad=p.cad_kg_dz||null;renderSizes();renderComponents();updateStyle();setStatus(p.status||'PRIMARY');activate('calculator')}
function renderMasters(){q('masterGrid').innerHTML=masters.map(m=>`<div class="masteritem"><b>${m[0]}</b><span>${m[1]}</span></div>`).join('');q('pomTable').innerHTML=pomMaster.map(p=>`<tr><td>${p.pom}</td><td>${p.name}</td><td>${p.syn.join('; ')}</td><td>${p.unit}</td></tr>`).join('');q('allowanceTable').innerHTML=allowances.map(a=>`<tr><td>${a[0]}</td><td>${a[1]}</td><td contenteditable="true">${a[2]}</td><td>${a[3]}</td><td>${a[4]}</td></tr>`).join('')}
function loadConfig(){const u=localStorage.getItem('ocms_supabase_url')||cfg.SUPABASE_URL||'',k=localStorage.getItem('ocms_supabase_key')||cfg.SUPABASE_PUBLISHABLE_KEY||'';q('supabaseUrl').value=u;q('supabaseKey').value=k;if(u&&k)connect(u,k)}
function manualConnect(){const u=q('supabaseUrl').value.trim(),k=q('supabaseKey').value.trim();if(!u||!k){alert('Enter Supabase URL and publishable key.');return}localStorage.setItem('ocms_supabase_url',u);localStorage.setItem('ocms_supabase_key',k);connect(u,k)}
async function connect(u,k){try{sb=supabase.createClient(u,k);const {data}=await sb.auth.getSession();user=data.session?.user||null;setConnection(true);if(user)authChanged(user);sb.auth.onAuthStateChange((_e,s)=>{user=s?.user||null;authChanged(user)})}catch(e){sb=null;setConnection(false);q('authStatus').textContent='Connection failed: '+e.message}}
function setConnection(ok){q('connectionBadge').textContent=ok?'SUPABASE CONNECTED':'LOCAL DEMO';q('connectionBadge').className='badge '+(ok?'ok':'warn')}
function authChanged(u){q('authStatus').textContent=u?`Signed in: ${u.email}`:'Not signed in.';q('authBtn').textContent=u?'Account':'Sign In';refreshSaved()}
async function signUp(){if(!sb){alert('Connect Supabase first.');return}const {error}=await sb.auth.signUp({email:q('email').value,password:q('password').value});if(error)alert(error.message);else alert('Sign-up submitted. Check email if confirmation is enabled.')}
async function signIn(){if(!sb){alert('Connect Supabase first.');return}const {data,error}=await sb.auth.signInWithPassword({email:q('email').value,password:q('password').value});if(error)alert(error.message);else{user=data.user;authChanged(user);activate('dashboard')}}
async function signOut(){if(sb)await sb.auth.signOut();user=null;authChanged(null)}
return {init};
})();
document.addEventListener('DOMContentLoaded',OCMS.init);

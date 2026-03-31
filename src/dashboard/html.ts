// ── Dashboard SPA HTML ──────────────────────────────────────────────────
// Single-page application using Preact + htm (no build step required).
// Inline SVG charts replace Recharts for zero-dependency rendering.

export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ArtifactEvo Dashboard</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0f1117;--surface:#1a1d27;--surface2:#252833;--border:#2e3140;--text:#e0e0e6;--text2:#8b8fa3;--green:#22c55e;--red:#ef4444;--yellow:#eab308;--blue:#3b82f6;--purple:#a855f7}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.5;min-height:100vh}
a{color:var(--blue);text-decoration:none}
button{cursor:pointer;font:inherit;border:none;border-radius:6px;padding:8px 16px;background:var(--blue);color:#fff;transition:opacity .15s}
button:hover{opacity:.85}button:disabled{opacity:.5;cursor:default}
input,select{font:inherit;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:6px 10px}
.container{max-width:1200px;margin:0 auto;padding:0 20px}
header{background:var(--surface);border-bottom:1px solid var(--border);padding:12px 0;position:sticky;top:0;z-index:10}
header .inner{display:flex;align-items:center;gap:24px}
header h1{font-size:18px;font-weight:700;white-space:nowrap}
nav{display:flex;gap:4px}
nav button{background:transparent;color:var(--text2);padding:6px 14px;font-size:14px;border-radius:6px}
nav button.active{background:var(--surface2);color:var(--text)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:16px 0}
.card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px}
.card .label{font-size:12px;color:var(--text2);text-transform:uppercase;letter-spacing:.5px}
.card .value{font-size:28px;font-weight:700;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:14px}
th{text-align:left;color:var(--text2);font-weight:500;padding:8px 12px;border-bottom:1px solid var(--border)}
td{padding:8px 12px;border-bottom:1px solid var(--border)}
tr:hover td{background:var(--surface2)}
tr.clickable{cursor:pointer}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600}
.badge.success{background:rgba(34,197,94,.15);color:var(--green)}
.badge.regression{background:rgba(239,68,68,.15);color:var(--red)}
.badge.neutral{background:rgba(234,179,8,.15);color:var(--yellow)}
.badge.baseline{background:rgba(139,143,163,.15);color:var(--text2)}
.badge.crash{background:rgba(239,68,68,.25);color:var(--red)}
.badge.running{background:rgba(59,130,246,.15);color:var(--blue)}
.badge.completed{background:rgba(34,197,94,.15);color:var(--green)}
.badge.failed{background:rgba(239,68,68,.15);color:var(--red)}
.badge.high{background:rgba(239,68,68,.15);color:var(--red)}
.badge.medium{background:rgba(234,179,8,.15);color:var(--yellow)}
.badge.low{background:rgba(139,143,163,.15);color:var(--text2)}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px;margin-top:12px}
.row{display:flex;gap:12px;flex-wrap:wrap}
.col{flex:1;min-width:300px}
.mt{margin-top:16px}
.mb{margin-bottom:16px}
pre{background:var(--surface2);border-radius:6px;padding:12px;overflow-x:auto;font-size:13px;max-height:400px;overflow-y:auto}
.empty{color:var(--text2);text-align:center;padding:40px}
.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}
.controls input{width:80px}
.btn-green{background:var(--green)}
.btn-red{background:var(--red)}
.btn-yellow{background:#ca8a04}
.warning-box{background:rgba(234,179,8,.1);border:1px solid rgba(234,179,8,.3);border-radius:8px;padding:12px;margin:8px 0}
.warning-box .title{font-weight:600;color:var(--yellow);margin-bottom:4px}
.form-row{display:flex;gap:8px;align-items:end;margin:8px 0}
.form-row label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--text2)}
.indicator{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px}
.indicator.on{background:var(--green)}
.indicator.off{background:var(--text2)}
</style>
</head>
<body>
<div id="app"></div>
<script type="module">
import{h,render,Fragment}from'https://unpkg.com/preact@10.25.4/dist/preact.module.js';
import{useState,useEffect,useCallback,useRef}from'https://unpkg.com/preact@10.25.4/hooks/dist/hooks.module.js';
import htm from'https://unpkg.com/htm@3.1.1/dist/htm.module.js';
const html=htm.bind(h);

// ── Helpers ──────────────────────────────────────────────────────────
const api=async(path,opts)=>{
  try{
    const r=await fetch('/api/'+path,opts);
    if(!r.ok)return{error:await r.text()};
    return await r.json();
  }catch(e){return{error:String(e)}}
};
const post=(path,body)=>api(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const fmtDate=(s)=>s?new Date(s).toLocaleString():'—';
const pct=(n,d)=>d>0?Math.round(n/d*100):0;

// ── SVG Line Chart ───────────────────────────────────────────────────
function LineChart({series,width=600,height=200}){
  if(!series||series.length===0)return html\`<div class="empty">No data</div>\`;
  const pad={t:20,r:20,b:30,l:50};
  const w=width-pad.l-pad.r, h=height-pad.t-pad.b;
  const colors=['#3b82f6','#22c55e','#a855f7','#eab308','#ef4444','#06b6d4'];
  let allY=[];
  for(const s of series)for(const p of s.data)allY.push(p.y);
  if(allY.length===0)return html\`<div class="empty">No data points</div>\`;
  const minY=Math.min(...allY),maxY=Math.max(...allY);
  const rangeY=maxY-minY||1;
  const maxLen=Math.max(...series.map(s=>s.data.length));

  const toX=(i,len)=>pad.l+(len>1?i/(len-1)*w:w/2);
  const toY=(v)=>pad.t+h-(v-minY)/rangeY*h;

  const gridLines=5;
  const grids=[];
  for(let i=0;i<=gridLines;i++){
    const y=pad.t+h/gridLines*i;
    const val=maxY-(maxY-minY)/gridLines*i;
    grids.push(html\`<line x1=\${pad.l} y1=\${y} x2=\${pad.l+w} y2=\${y} stroke="var(--border)" stroke-width="1"/>
      <text x=\${pad.l-8} y=\${y+4} text-anchor="end" fill="var(--text2)" font-size="11">\${Math.round(val)}</text>\`);
  }

  return html\`<svg viewBox="0 0 \${width} \${height}" width="100%" style="max-width:\${width}px">
    \${grids}
    \${series.map((s,si)=>{
      const pts=s.data.map((p,i)=>\`\${toX(i,s.data.length)},\${toY(p.y)}\`).join(' ');
      return html\`<\${Fragment}>
        <polyline points=\${pts} fill="none" stroke=\${colors[si%colors.length]} stroke-width="2"/>
        \${s.data.map((p,i)=>html\`<circle cx=\${toX(i,s.data.length)} cy=\${toY(p.y)} r="3" fill=\${colors[si%colors.length]}><title>\${s.name}: \${p.y}</title></circle>\`)}
      </\${Fragment}>\`;
    })}
    \${series.length>1?html\`<g transform="translate(\${pad.l},\${height-8})">
      \${series.map((s,i)=>html\`<g transform="translate(\${i*100},0)">
        <rect width="12" height="3" fill=\${colors[i%colors.length]} rx="1"/>
        <text x="16" y="4" fill="var(--text2)" font-size="11">\${s.name}</text>
      </g>\`)}
    </g>\`:null}
  </svg>\`;
}

// ── Overview Tab ─────────────────────────────────────────────────────
function Overview(){
  const[status,setStatus]=useState(null);
  const[archive,setArchive]=useState([]);
  const load=useCallback(async()=>{
    const[s,a]=await Promise.all([api('status'),api('archive?limit=50')]);
    if(!s.error)setStatus(s);
    if(!a.error)setArchive(a);
  },[]);
  useEffect(()=>{load();const t=setInterval(load,10000);return()=>clearInterval(t)},[load]);

  if(!status)return html\`<div class="empty">Loading...</div>\`;
  const recent=(archive||[]).slice(0,10);

  // Build score-over-time series per artifact
  const byArt={};
  for(const e of[...(archive||[])].reverse()){
    if(e.score===null)continue;
    if(!byArt[e.artifact])byArt[e.artifact]=[];
    byArt[e.artifact].push({y:e.score});
  }
  const chartSeries=Object.entries(byArt).map(([name,data])=>({name,data}));

  return html\`
    <div class="cards">
      <div class="card"><div class="label">Artifacts</div><div class="value">\${status.artifact_count}</div></div>
      <div class="card"><div class="label">Experiments</div><div class="value">\${status.experiment_count}</div></div>
      <div class="card"><div class="label">Success Rate</div><div class="value" style="color:var(--green)">\${status.success_rate}%</div></div>
      <div class="card"><div class="label">Tokens Spent</div><div class="value">\${(status.total_tokens||0).toLocaleString()}</div></div>
    </div>
    <div class="row">
      <div class="col"><div class="panel">
        <h3>Score Over Time</h3>
        <\${LineChart} series=\${chartSeries} width=\${580} height=\${220}/>
      </div></div>
      <div class="col"><div class="panel">
        <h3 class="mb">Session</h3>
        <div><span class="indicator \${status.session_state==='running'?'on':'off'}"></span>\${status.session_state||'idle'}</div>
        <div style="margin-top:8px"><span class="indicator \${status.hook_mode?'on':'off'}"></span>Hook mode: \${status.hook_mode?'on':'off'}</div>
        <div><span class="indicator \${status.daemon_running?'on':'off'}"></span>Daemon: \${status.daemon_running?'running':'stopped'}</div>
      </div></div>
    </div>
    <div class="panel mt">
      <h3 class="mb">Recent Mutations</h3>
      \${recent.length===0?html\`<div class="empty">No mutations yet</div>\`:html\`<table>
        <tr><th>Gen</th><th>Artifact</th><th>Type</th><th>Score</th><th>Status</th><th>Time</th></tr>
        \${recent.map(e=>html\`<tr>
          <td>\${e.genid}</td><td>\${e.artifact}</td><td>\${e.mutation_type}</td>
          <td>\${e.score!==null?\`\${e.score}/\${e.max_score}\`:'—'}</td>
          <td><span class="badge \${e.status}">\${e.status}</span></td>
          <td style="color:var(--text2)">\${fmtDate(e.timestamp)}</td>
        </tr>\`)}
      </table>\`}
    </div>\`;
}

// ── Artifacts Tab ────────────────────────────────────────────────────
function Artifacts(){
  const[artifacts,setArtifacts]=useState([]);
  const[selected,setSelected]=useState(null);
  const[detail,setDetail]=useState(null);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({name:'',path:'',type:'prompt'});
  const[msg,setMsg]=useState('');

  const load=useCallback(async()=>{const d=await api('artifacts');if(!d.error)setArtifacts(d)},[]);
  useEffect(()=>{load()},[load]);

  const selectArt=async(id)=>{
    setSelected(id);
    const d=await api('artifacts/'+encodeURIComponent(id));
    if(!d.error)setDetail(d);
  };

  const addArtifact=async()=>{
    if(!form.name||!form.path){setMsg('Name and path required');return}
    const r=await post('artifacts',form);
    setMsg(r.error||r.message||'Added');
    if(!r.error){setShowForm(false);setForm({name:'',path:'',type:'prompt'});load()}
  };

  return html\`
    <div class="controls">
      <button onclick=\${()=>setShowForm(!showForm)}>\${showForm?'Cancel':'+ Add Artifact'}</button>
      \${msg?html\`<span style="color:var(--text2);font-size:13px">\${msg}</span>\`:null}
    </div>
    \${showForm?html\`<div class="panel mb">
      <div class="form-row">
        <label>Name<input value=\${form.name} oninput=\${e=>setForm({...form,name:e.target.value})}/></label>
        <label>File Path<input value=\${form.path} oninput=\${e=>setForm({...form,path:e.target.value})} style="width:240px"/></label>
        <label>Type<select value=\${form.type} onchange=\${e=>setForm({...form,type:e.target.value})}>
          <option value="prompt">prompt</option><option value="config">config</option>
          <option value="template">template</option><option value="doc">doc</option>
        </select></label>
        <button onclick=\${addArtifact}>Save</button>
      </div>
    </div>\`:null}
    <table>
      <tr><th>Name</th><th>Type</th><th>Score</th><th>Max</th><th>Mutations</th><th>Last Type</th><th>Success Rate</th></tr>
      \${(artifacts||[]).map(a=>html\`<tr class="clickable" onclick=\${()=>selectArt(a.name)}>
        <td style="font-weight:\${selected===a.name?'700':'400'}">\${a.name}</td>
        <td>\${a.type}</td><td>\${a.current_score??'—'}</td><td>\${a.max_score??'—'}</td>
        <td>\${a.mutations}</td><td>\${a.last_mutation_type||'—'}</td>
        <td>\${a.success_rate}%</td>
      </tr>\`)}
    </table>
    \${detail?html\`<div class="panel mt">
      <h3>\${selected}</h3>
      <div class="row mt">
        <div class="col">
          <h4 class="mb">Score History</h4>
          <\${LineChart} series=\${[{name:selected,data:(detail.score_history||[]).map(s=>({y:s}))}]} width=\${500} height=\${180}/>
        </div>
        <div class="col">
          <h4 class="mb">Recent Mutations</h4>
          \${(detail.recent_mutations||[]).length===0?html\`<div class="empty">None</div>\`:html\`<table>
            <tr><th>Gen</th><th>Type</th><th>Score</th><th>Status</th></tr>
            \${detail.recent_mutations.map(m=>html\`<tr>
              <td>\${m.genid}</td><td>\${m.mutation_type}</td>
              <td>\${m.score!==null?\`\${m.score}/\${m.max_score}\`:'—'}</td>
              <td><span class="badge \${m.status}">\${m.status}</span></td>
            </tr>\`)}
          </table>\`}
        </div>
      </div>
      \${detail.preview?html\`<div class="mt"><h4 class="mb">Content Preview</h4><pre>\${detail.preview}</pre></div>\`:null}
    </div>\`:null}\`;
}

// ── Evolution Tab ────────────────────────────────────────────────────
function Evolution(){
  const[budget,setBudget]=useState(10);
  const[artifact,setArtifact]=useState('');
  const[log,setLog]=useState([]);
  const[patterns,setPatterns]=useState([]);
  const[status,setStatus]=useState(null);
  const[msg,setMsg]=useState('');
  const polling=useRef(null);

  const loadStatus=useCallback(async()=>{
    const[s,p]=await Promise.all([api('status'),api('anti-patterns')]);
    if(!s.error)setStatus(s);
    if(!p.error)setPatterns(p);
  },[]);

  const loadLog=useCallback(async()=>{
    const a=await api('archive?limit=20');
    if(!a.error)setLog(a);
  },[]);

  useEffect(()=>{loadStatus();loadLog()},[loadStatus,loadLog]);

  const startPolling=()=>{if(!polling.current)polling.current=setInterval(()=>{loadLog();loadStatus()},3000)};
  const stopPolling=()=>{if(polling.current){clearInterval(polling.current);polling.current=null}};
  useEffect(()=>()=>stopPolling(),[]);

  const doBaseline=async()=>{setMsg('Running baseline...');const r=await post('baseline',{artifact:artifact||undefined});setMsg(r.error||r.message||'Done');loadLog()};
  const doEvolve=async()=>{setMsg('Starting evolution...');startPolling();const r=await post('evolve',{budget,artifact:artifact||undefined});setMsg(r.error||r.message||'Started');};
  const doPause=async()=>{const r=await post('pause',{});setMsg(r.error||r.message||'Paused');stopPolling()};
  const doResume=async()=>{const r=await post('resume',{});setMsg(r.error||r.message||'Resumed');startPolling()};

  return html\`
    <div class="controls">
      <button class="btn-green" onclick=\${doBaseline}>Run Baseline</button>
      <input type="number" value=\${budget} min=1 oninput=\${e=>setBudget(parseInt(e.target.value)||1)} title="Budget"/>
      <input placeholder="artifact (all)" value=\${artifact} oninput=\${e=>setArtifact(e.target.value)} style="width:140px"/>
      <button onclick=\${doEvolve}>Start Evolution</button>
      <button class="btn-yellow" onclick=\${doPause}>Pause</button>
      <button onclick=\${doResume}>Resume</button>
      \${msg?html\`<span style="color:var(--text2);font-size:13px">\${msg}</span>\`:null}
    </div>
    \${status?html\`<div class="cards" style="grid-template-columns:repeat(3,1fr)">
      <div class="card"><div class="label">Session</div><div class="value" style="font-size:20px">\${status.session_state||'idle'}</div></div>
      <div class="card"><div class="label">Experiments</div><div class="value">\${status.experiment_count}</div></div>
      <div class="card"><div class="label">Success Rate</div><div class="value" style="color:var(--green)">\${status.success_rate}%</div></div>
    </div>\`:null}
    \${patterns.length>0?html\`<div class="warning-box">
      <div class="title">Anti-Pattern Warnings (\${patterns.length})</div>
      \${patterns.map(p=>html\`<div style="margin:4px 0"><span class="badge \${p.severity}">\${p.severity}</span> <b>\${p.type}</b> on \${p.artifact}: \${p.message}<br/><span style="color:var(--text2);font-size:13px">\${p.suggestion}</span></div>\`)}
    </div>\`:null}
    <div class="panel mt">
      <h3 class="mb">Mutation Log</h3>
      \${(log||[]).length===0?html\`<div class="empty">No mutations yet</div>\`:html\`<table>
        <tr><th>Gen</th><th>Artifact</th><th>Type</th><th>Score</th><th>Status</th><th>Time</th></tr>
        \${log.map(e=>html\`<tr>
          <td>\${e.genid}</td><td>\${e.artifact}</td><td>\${e.mutation_type}</td>
          <td>\${e.score!==null?\`\${e.score}/\${e.max_score}\`:'—'}</td>
          <td><span class="badge \${e.status}">\${e.status}</span></td>
          <td style="color:var(--text2)">\${fmtDate(e.timestamp)}</td>
        </tr>\`)}
      </table>\`}
    </div>\`;
}

// ── Traces Tab ───────────────────────────────────────────────────────
function Traces(){
  const[runs,setRuns]=useState([]);
  const[selected,setSelected]=useState(null);
  const[detail,setDetail]=useState(null);
  const[filter,setFilter]=useState('');

  const load=useCallback(async()=>{
    const q=filter?'traces?artifact='+encodeURIComponent(filter):'traces';
    const d=await api(q);if(!d.error)setRuns(d);
  },[filter]);
  useEffect(()=>{load()},[load]);

  const selectRun=async(id)=>{
    setSelected(id);
    const d=await api('traces/'+encodeURIComponent(id));
    if(!d.error)setDetail(d);
  };

  return html\`
    <div class="controls">
      <input placeholder="Filter by artifact..." value=\${filter} oninput=\${e=>setFilter(e.target.value)} style="width:200px"/>
    </div>
    <table>
      <tr><th>Run ID</th><th>Artifact</th><th>Score</th><th>Status</th><th>Trigger</th><th>Duration</th><th>Time</th></tr>
      \${(runs||[]).map(r=>html\`<tr class="clickable" onclick=\${()=>selectRun(r.run_id)}>
        <td style="font-family:monospace;font-size:12px;font-weight:\${selected===r.run_id?'700':'400'}">\${r.run_id}</td>
        <td>\${r.artifact_id}</td>
        <td>\${r.score!==null?r.score:'—'}</td>
        <td><span class="badge \${r.status}">\${r.status}</span></td>
        <td>\${r.trigger}</td>
        <td>\${r.duration_seconds!=null?\`\${r.duration_seconds}s\`:'—'}</td>
        <td style="color:var(--text2)">\${fmtDate(r.started_at)}</td>
      </tr>\`)}
    </table>
    \${detail?html\`<div class="panel mt">
      <h3>Run: \${selected}</h3>
      <div class="row mt">
        <div class="col">
          <h4 class="mb">Manifest</h4>
          <pre>\${JSON.stringify(detail.manifest,null,2)}</pre>
        </div>
        <div class="col">
          <h4 class="mb">Scorecard</h4>
          \${detail.scorecard?html\`<pre>\${JSON.stringify(detail.scorecard,null,2)}</pre>\`:html\`<div class="empty">No scorecard</div>\`}
        </div>
      </div>
    </div>\`:null}\`;
}

// ── Settings Tab ─────────────────────────────────────────────────────
function Settings(){
  const[config,setConfig]=useState(null);
  useEffect(()=>{api('config').then(d=>{if(!d.error)setConfig(d)})},[]);
  if(!config)return html\`<div class="empty">Loading config...</div>\`;
  return html\`
    <div class="panel">
      <h3 class="mb">Current Configuration</h3>
      <pre>\${JSON.stringify(config,null,2)}</pre>
    </div>
    <div class="panel mt">
      <h3 class="mb">Settings</h3>
      <p style="color:var(--text2)">Configuration editing will be available in a future update. Edit <code>.evo/config.yaml</code> directly for now.</p>
    </div>\`;
}

// ── App ──────────────────────────────────────────────────────────────
function App(){
  const[tab,setTab]=useState('overview');
  const tabs=[['overview','Overview'],['artifacts','Artifacts'],['evolution','Evolution'],['traces','Traces'],['settings','Settings']];
  const content={overview:Overview,artifacts:Artifacts,evolution:Evolution,traces:Traces,settings:Settings};
  const Tab=content[tab];

  return html\`
    <header><div class="container inner">
      <h1>ArtifactEvo</h1>
      <nav>\${tabs.map(([k,label])=>html\`<button class=\${tab===k?'active':''} onclick=\${()=>setTab(k)}>\${label}</button>\`)}</nav>
    </div></header>
    <main class="container" style="padding-top:16px;padding-bottom:40px">
      <\${Tab}/>
    </main>\`;
}

render(html\`<\${App}/>\`,document.getElementById('app'));
</script>
</body>
</html>`;
}

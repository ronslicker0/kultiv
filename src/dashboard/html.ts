// ── Dashboard SPA HTML ──────────────────────────────────────────────────
// Single-page application using Preact + htm (no build step required).
// Inline SVG charts replace Recharts for zero-dependency rendering.

export function getDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Kultiv Dashboard</title>
<script type="importmap">
{"imports":{"preact":"https://unpkg.com/preact@10.25.4/dist/preact.module.js","preact/hooks":"https://unpkg.com/preact@10.25.4/hooks/dist/hooks.module.js","htm":"https://unpkg.com/htm@3.1.1/dist/htm.module.js"}}
</script>
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
.settings-form{display:flex;flex-direction:column;gap:24px}
.form-section{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px}
.form-section h3{font-size:15px;font-weight:600;margin-bottom:16px;color:var(--text)}
.form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
.form-group label{font-size:13px;color:var(--text2);font-weight:500}
.form-row-inline{display:flex;gap:12px;align-items:center}
.form-row-inline label{font-size:13px;color:var(--text2);cursor:pointer}
.radio-group{display:flex;gap:16px;margin-bottom:8px}
.test-btn{background:var(--surface2);color:var(--text);padding:8px 16px;border:1px solid var(--border)}
.test-btn:hover{border-color:var(--blue)}
.test-result{font-size:13px;margin-top:8px;padding:8px 12px;border-radius:4px}
.test-result.success{background:rgba(34,197,94,.1);color:var(--green)}
.test-result.error{background:rgba(239,68,68,.1);color:var(--red)}
.save-bar{display:flex;gap:12px;align-items:center;padding-top:8px}
.save-msg{font-size:13px}
.settings-warning{background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.3);border-radius:6px;padding:12px;font-size:12px;color:var(--yellow);margin-bottom:16px}
.toggle-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.toggle-row input[type="checkbox"]{width:18px;height:18px;accent-color:var(--blue)}
textarea.pg-input{font-family:'Consolas','Monaco','Courier New',monospace;font-size:13px;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:12px;resize:vertical;width:100%;line-height:1.6;tab-size:2}
.pg-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:900px){.pg-grid{grid-template-columns:1fr}}
.pg-controls{display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin:12px 0}
.pg-controls label{display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--text2)}
.sc-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border-bottom:1px solid var(--border)}
.sc-row .sc-name{flex:1;font-weight:500}
.sc-row .sc-score{font-family:monospace;min-width:60px;text-align:right}
.sc-total{font-weight:700;font-size:18px;padding:14px;background:var(--surface2);border-radius:6px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.sc-checks{padding:2px 12px 8px;font-size:12px;color:var(--text2)}
.sc-reasoning{padding:4px 12px 8px;font-size:13px;color:var(--text2);font-style:italic}
.btn-green{background:var(--green)!important}
.save-section{border-top:1px solid var(--border);padding-top:12px;margin-top:16px}
.dlg-detail{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:16px;margin:8px 0}
.dlg-detail h5{font-size:13px;color:var(--blue);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px}
.dlg-candidates{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.dlg-candidate{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:10px 12px;font-size:13px}
.dlg-candidate.selected{border-color:var(--green);background:rgba(34,197,94,.05)}
.dlg-candidate .dlg-type{font-weight:600;margin-right:8px}
.dlg-reasoning{background:var(--surface);border-radius:6px;padding:12px;font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.6}
.dlg-spec{background:var(--surface);border-radius:6px;padding:12px;font-size:13px;margin-bottom:12px}
.dlg-spec .dlg-field{margin-bottom:6px}
.dlg-spec .dlg-label{color:var(--text2);font-size:11px;text-transform:uppercase;letter-spacing:.3px}
.dlg-tokens{display:flex;gap:16px;font-size:12px;color:var(--text2);margin-top:8px}
tr.expanded td{border-bottom:none}
.docs-btn{background:transparent;color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:13px;margin-left:auto;display:flex;align-items:center;gap:6px}
.docs-btn:hover{color:var(--text);border-color:var(--text2)}
.docs-btn svg{width:16px;height:16px}
.docs-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:100;opacity:0;pointer-events:none;transition:opacity .2s}
.docs-overlay.open{opacity:1;pointer-events:auto}
.docs-panel{position:fixed;top:0;right:0;bottom:0;width:480px;max-width:90vw;background:var(--surface);border-left:1px solid var(--border);z-index:101;transform:translateX(100%);transition:transform .25s ease;display:flex;flex-direction:column}
.docs-panel.open{transform:translateX(0)}
.docs-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);flex-shrink:0}
.docs-header h2{font-size:16px;font-weight:600}
.docs-close{background:transparent;color:var(--text2);padding:4px 8px;font-size:18px}
.docs-close:hover{color:var(--text)}
.docs-nav{display:flex;gap:2px;padding:8px 12px;border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto}
.docs-nav button{background:transparent;color:var(--text2);padding:6px 12px;font-size:12px;white-space:nowrap;border-radius:4px}
.docs-nav button.active{background:var(--surface2);color:var(--text)}
.docs-body{flex:1;overflow-y:auto;padding:20px;font-size:14px;line-height:1.7}
.docs-body h1{font-size:20px;font-weight:700;margin:0 0 12px;color:var(--text)}
.docs-body h2{font-size:16px;font-weight:600;margin:20px 0 8px;color:var(--text);border-bottom:1px solid var(--border);padding-bottom:4px}
.docs-body h3{font-size:14px;font-weight:600;margin:16px 0 6px;color:var(--text)}
.docs-body p{margin:8px 0;color:var(--text2)}
.docs-body ul,.docs-body ol{margin:8px 0;padding-left:20px;color:var(--text2)}
.docs-body li{margin:4px 0}
.docs-body code{background:var(--surface2);padding:2px 6px;border-radius:3px;font-size:13px;font-family:'Consolas','Monaco','Courier New',monospace}
.docs-body pre{background:var(--surface2);border-radius:6px;padding:12px;overflow-x:auto;font-size:12px;line-height:1.5;margin:8px 0}
.docs-body pre code{background:none;padding:0}
.docs-body table{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}
.docs-body table th{text-align:left;color:var(--text2);font-weight:500;padding:6px 8px;border-bottom:1px solid var(--border)}
.docs-body table td{padding:6px 8px;border-bottom:1px solid var(--border);color:var(--text2)}
.docs-body strong{color:var(--text);font-weight:600}
.docs-body .tip{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);border-radius:6px;padding:10px 14px;margin:10px 0;font-size:13px}
.docs-search{padding:8px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
.docs-search input{width:100%;padding:8px 12px;font-size:13px}
</style>
</head>
<body>
<div id="app"></div>
<script type="module">
import{h,render,Fragment}from'preact';
import{useState,useEffect,useCallback,useRef}from'preact/hooks';
import htm from'htm';
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

// ── Dialogue Detail Component ───────────────────────────────────────
function DialogueDetail({trace}){
  if(!trace)return html\`<div class="dlg-detail"><div class="empty" style="padding:12px">Single-call mutation (no dialogue trace)</div></div>\`;
  const t=trace;
  return html\`<div class="dlg-detail">
    <h5>Explore — \${t.explore_candidates.length} Candidates</h5>
    <div class="dlg-candidates">
      \${t.explore_candidates.map((c,i)=>html\`<div class="dlg-candidate \${c.mutation_type===t.selected_candidate.mutation_type&&c.target===t.selected_candidate.target?'selected':''}">
        <span class="dlg-type">[\${c.mutation_type}]</span>
        <span>\${c.target}</span>
        <span class="badge \${c.regression_risk}" style="margin-left:8px">\${c.regression_risk} risk</span>
        <div style="color:var(--text2);margin-top:4px">\${c.rationale}</div>
      </div>\`)}
    </div>
    <h5>Critique — Why This Candidate</h5>
    <div class="dlg-reasoning">\${t.critique_reasoning}</div>
    <h5>Specification</h5>
    <div class="dlg-spec">
      <div class="dlg-field"><span class="dlg-label">Type: </span>\${t.selected_candidate.mutation_type}</div>
      <div class="dlg-field"><span class="dlg-label">Target: </span>\${t.selected_candidate.target}</div>
      <div class="dlg-field"><span class="dlg-label">Change: </span>\${t.specification}</div>
    </div>
    <div class="dlg-tokens">
      <span>Rounds: \${t.rounds_completed}/4</span>
      <span>Input tokens: \${t.total_input_tokens.toLocaleString()}</span>
      <span>Output tokens: \${t.total_output_tokens.toLocaleString()}</span>
    </div>
  </div>\`;
}

// ── Expandable Mutation Table ────────────────────────────────────────
function MutationTable({entries,showArtifact}){
  const[expanded,setExpanded]=useState(null);
  const[detail,setDetail]=useState(null);

  const toggle=async(genid)=>{
    if(expanded===genid){setExpanded(null);setDetail(null);return}
    setExpanded(genid);
    const entry=entries.find(e=>e.genid===genid);
    if(entry&&entry.dialogue_trace){setDetail(entry.dialogue_trace);return}
    const d=await api('archive/'+genid);
    setDetail(d.error?null:(d.dialogue_trace||null));
  };

  if(!entries||entries.length===0)return html\`<div class="empty">No mutations yet</div>\`;

  return html\`<table>
    <tr><th>Gen</th>\${showArtifact?html\`<th>Artifact</th>\`:null}<th>Type</th><th>Score</th><th>Status</th><th>Time</th></tr>
    \${entries.map(e=>html\`<\${Fragment}>
      <tr class="clickable \${expanded===e.genid?'expanded':''}" onclick=\${()=>toggle(e.genid)}>
        <td>\${e.genid}</td>
        \${showArtifact?html\`<td>\${e.artifact}</td>\`:null}
        <td>\${e.mutation_type}</td>
        <td>\${e.score!==null?\`\${e.score}/\${e.max_score}\`:'—'}</td>
        <td><span class="badge \${e.status}">\${e.status}</span></td>
        <td style="color:var(--text2)">\${fmtDate(e.timestamp)}</td>
      </tr>
      \${expanded===e.genid?html\`<tr><td colspan="\${showArtifact?6:5}" style="padding:0 12px 12px">
        <\${DialogueDetail} trace=\${detail}/>
      </td></tr>\`:null}
    </\${Fragment}>\`)}
  </table>\`;}


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

  return html\`<div>
    <svg viewBox="0 0 \${width} \${height}" width="100%" style="max-width:\${width}px">
    \${grids}
    \${series.map((s,si)=>{
      const pts=s.data.map((p,i)=>\`\${toX(i,s.data.length)},\${toY(p.y)}\`).join(' ');
      return html\`<\${Fragment}>
        <polyline points=\${pts} fill="none" stroke=\${colors[si%colors.length]} stroke-width="2"/>
        \${s.data.map((p,i)=>html\`<circle cx=\${toX(i,s.data.length)} cy=\${toY(p.y)} r="3" fill=\${colors[si%colors.length]}><title>\${s.name}: \${p.y}</title></circle>\`)}
      </\${Fragment}>\`;
    })}
  </svg>
    \${series.length>1?html\`<div style="display:flex;flex-wrap:wrap;gap:8px 16px;padding:8px 0 0 \${pad.l}px;font-size:12px">
      \${series.map((s,i)=>html\`<span style="display:flex;align-items:center;gap:4px;white-space:nowrap">
        <span style="width:12px;height:3px;border-radius:1px;background:\${colors[i%colors.length]};flex-shrink:0"></span>
        <span style="color:var(--text2)">\${s.name}</span>
      </span>\`)}
    </div>\`:null}
  </div>\`;
}

// ── Insights Panel ──────────────────────────────────────────────────
function InsightsPanel(){
  const[data,setData]=useState(null);
  const[pending,setPending]=useState([]);
  const[scans,setScans]=useState([]);
  const[reportContent,setReportContent]=useState(null);
  const[expandedScan,setExpandedScan]=useState(null);
  const load=useCallback(async()=>{
    const[d,p,s]=await Promise.all([api('insights'),api('pending'),api('scans')]);
    if(!d.error)setData(d);
    if(!p.error)setPending(p);
    if(!s.error)setScans(s);
  },[]);
  useEffect(()=>{load();const t=setInterval(load,15000);return()=>clearInterval(t)},[load]);

  const showReport=async(file)=>{
    if(reportContent&&reportContent.file===file){setReportContent(null);return}
    const d=await api('reports/'+encodeURIComponent(file));
    if(!d.error)setReportContent(d);
  };

  if(!data)return null;
  const{insights,reports}=data;
  const needsAttention=insights.filter(i=>i.weak_criteria.length>0||i.is_plateaued);
  const recentSuccesses=insights.filter(i=>i.last_success);
  const hasContent=needsAttention.length>0||recentSuccesses.length>0||(reports&&reports.length>0)||pending.length>0||scans.length>0;

  if(!hasContent)return null;

  return html\`<div>
    \${pending.length>0?html\`<div class="panel mt" style="border-color:rgba(239,68,68,.4)">
      <h3 style="color:var(--red);margin-bottom:12px">Pending Failures (\${pending.length})</h3>
      <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Real production errors queued for evolution. These will feed into the next mutation cycle.</div>
      <table style="font-size:13px">
        <tr><th style="padding:4px 8px">Agent</th><th style="padding:4px 8px">Category</th><th style="padding:4px 8px">Error</th></tr>
        \${pending.map(p=>html\`<tr>
          <td style="padding:4px 8px;font-weight:600">\${p.artifactId||'unknown'}</td>
          <td style="padding:4px 8px"><span class="badge regression">\${p.category||'UNKNOWN'}</span></td>
          <td style="padding:4px 8px;max-width:500px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title=\${p.error||''}>\${(p.error||'No description').slice(0,120)}</td>
        </tr>\`)}
      </table>
    </div>\`:null}
    \${scans.length>0?html\`<div class="panel mt" style="border-color:rgba(96,165,250,.4)">
      <h3 style="color:var(--blue);margin-bottom:12px">Agent Scans (\${scans.length})</h3>
      <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Structural analysis from kultiv scan. Recommendations feed into evolution automatically.</div>
      \${scans.map(s=>html\`<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;cursor:pointer" onclick=\${()=>setExpandedScan(expandedScan===s.artifactId?null:s.artifactId)}>
          <span style="font-weight:700">\${s.artifactId}</span>
          <span style="color:var(--text2);font-size:12px">\${s.domain}</span>
          <span style="font-size:12px;color:var(--text2)">\${s.hasExamples?'examples':'no examples'} | \${s.hasNegativeExamples?'anti-patterns':'no anti-patterns'} | \${s.hasDecisionTrees?'decision trees':'no decision trees'}</span>
        </div>
        <div style="font-size:13px;color:var(--text2);margin-bottom:4px">\${s.purpose}</div>
        \${expandedScan===s.artifactId&&s.recommendations&&s.recommendations.length>0?html\`<div style="margin-top:8px">
          \${s.recommendations.map(r=>html\`<div style="font-size:12px;margin:4px 0;padding:4px 8px;border-left:2px solid \${r.priority==='high'?'var(--red)':r.priority==='medium'?'var(--yellow)':'var(--text2)'}">
            <span style="font-weight:600;color:\${r.priority==='high'?'var(--red)':'var(--yellow)'}">\${r.type}</span> \${r.target} — <span style="color:var(--text2)">\${r.rationale}</span>
          </div>\`)}
        </div>\`:null}
      </div>\`)}
    </div>\`:null}
    \${needsAttention.length>0?html\`<div class="panel mt" style="border-color:rgba(234,179,8,.4)">
      <h3 style="color:var(--yellow);margin-bottom:12px">Improvement Suggestions</h3>
      \${needsAttention.map(i=>html\`<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-weight:700">\${i.artifact}</span>
          <span style="color:var(--text2)">\${i.current_score}/\${i.max_score}</span>
          \${i.is_plateaued?html\`<span class="badge regression" style="background:rgba(239,68,68,.1)">PLATEAUED</span>\`:null}
        </div>
        \${i.weak_criteria.length>0?html\`<table style="font-size:13px">
          <tr><th style="padding:4px 8px">Criterion</th><th style="padding:4px 8px">Score</th><th style="padding:4px 8px">Max</th><th style="padding:4px 8px">%</th><th style="padding:4px 8px">Points Available</th></tr>
          \${i.weak_criteria.map(c=>html\`<tr>
            <td style="padding:4px 8px">\${c.name}</td>
            <td style="padding:4px 8px;color:\${c.pct<50?'var(--red)':'var(--yellow)'}">\${c.score}</td>
            <td style="padding:4px 8px">\${c.max}</td>
            <td style="padding:4px 8px">\${c.pct}%</td>
            <td style="padding:4px 8px;color:var(--green)">+\${c.gap}</td>
          </tr>\`)}
        </table>\`:null}
        \${i.weak_criteria.length>0?html\`<div style="margin-top:8px;font-size:12px;color:var(--text2)">
          Total improvement potential: <span style="color:var(--green);font-weight:600">+\${i.weak_criteria.reduce((s,c)=>s+c.gap,0)} points</span> across \${i.weak_criteria.length} criteria
        </div>\`:null}
      </div>\`)}
    </div>\`:null}
    \${recentSuccesses.length>0?html\`<div class="panel mt" style="border-color:rgba(34,197,94,.4)">
      <h3 style="color:var(--green);margin-bottom:12px">Recent Improvements</h3>
      <table style="font-size:13px">
        <tr><th>Agent</th><th>Score</th><th>Mutation</th><th>When</th></tr>
        \${recentSuccesses.map(i=>html\`<tr>
          <td>\${i.artifact}</td>
          <td style="color:var(--green)">\${i.last_success.score}/\${i.max_score}</td>
          <td><span class="badge success">\${i.last_success.mutation_type}</span></td>
          <td style="color:var(--text2)">\${fmtDate(i.last_success.timestamp)}</td>
        </tr>\`)}
      </table>
    </div>\`:null}
    \${reports&&reports.length>0?html\`<div class="panel mt">
      <h3 class="mb">Improvement Reports</h3>
      \${reports.map(r=>html\`<div style="margin:6px 0">
        <span class="clickable" style="color:var(--blue);cursor:pointer;font-size:13px" onclick=\${()=>showReport(r.file)}>\${r.artifact} — \${r.timestamp||r.file}</span>
      </div>\`)}
      \${reportContent?html\`<pre style="margin-top:8px;white-space:pre-wrap">\${reportContent.content}</pre>\`:null}
    </div>\`:null}
  </div>\`;
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
    <\${InsightsPanel}/>
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
      <\${MutationTable} entries=\${recent} showArtifact=\${true}/>
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
          <\${MutationTable} entries=\${detail.recent_mutations||[]} showArtifact=\${false}/>
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
      <\${MutationTable} entries=\${log||[]} showArtifact=\${true}/>
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
  const[loading,setLoading]=useState(true);
  // LLM
  const[provider,setProvider]=useState('anthropic');
  const[authMode,setAuthMode]=useState('api_key');
  const[apiKey,setApiKey]=useState('');
  const[oauthToken,setOauthToken]=useState('');
  const[model,setModel]=useState('');
  const[baseUrl,setBaseUrl]=useState('');
  // Evolution
  const[budgetPerSession,setBudgetPerSession]=useState(10);
  const[feedbackInterval,setFeedbackInterval]=useState(3);
  const[outerInterval,setOuterInterval]=useState(10);
  const[plateauWindow,setPlateauWindow]=useState(5);
  // Automation
  const[hookMode,setHookMode]=useState(false);
  const[daemonMode,setDaemonMode]=useState(false);
  const[autoCommit,setAutoCommit]=useState(true);
  const[autoPush,setAutoPush]=useState(false);
  const[triggerAfter,setTriggerAfter]=useState(1);
  const[cooldownMinutes,setCooldownMinutes]=useState(10);
  const[maxRegressions,setMaxRegressions]=useState(3);
  const[daemonSchedule,setDaemonSchedule]=useState('');
  // Dashboard
  const[dashPort,setDashPort]=useState(4200);
  const[openBrowser,setOpenBrowser]=useState(true);
  // UI state
  const[testResult,setTestResult]=useState(null);
  const[testing,setTesting]=useState(false);
  const[saving,setSaving]=useState(false);
  const[saveMsg,setSaveMsg]=useState(null);

  const modelPlaceholders={anthropic:'claude-sonnet-4-20250514',openai:'gpt-4o',ollama:'llama3','claude-code':'claude-sonnet-4-20250514'};

  useEffect(()=>{
    api('config/full').then(d=>{
      if(d.error){setLoading(false);return}
      if(d.llm){
        if(d.llm.provider)setProvider(d.llm.provider);
        if(d.llm.model)setModel(d.llm.model);
        if(d.llm.base_url)setBaseUrl(d.llm.base_url);
        if(d.llm.api_key)setApiKey(d.llm.api_key);
        if(d.llm.oauth_token){setOauthToken(d.llm.oauth_token);setAuthMode('oauth_token')}
      }
      if(d.evolution){
        if(d.evolution.budget_per_session!=null)setBudgetPerSession(d.evolution.budget_per_session);
        if(d.evolution.feedback_interval!=null)setFeedbackInterval(d.evolution.feedback_interval);
        if(d.evolution.outer_interval!=null)setOuterInterval(d.evolution.outer_interval);
        if(d.evolution.plateau_window!=null)setPlateauWindow(d.evolution.plateau_window);
      }
      if(d.automation){
        if(d.automation.hook_mode!=null)setHookMode(d.automation.hook_mode);
        if(d.automation.daemon_mode!=null)setDaemonMode(d.automation.daemon_mode);
        if(d.automation.auto_commit!=null)setAutoCommit(d.automation.auto_commit);
        if(d.automation.auto_push!=null)setAutoPush(d.automation.auto_push);
        if(d.automation.trigger_after!=null)setTriggerAfter(d.automation.trigger_after);
        if(d.automation.cooldown_minutes!=null)setCooldownMinutes(d.automation.cooldown_minutes);
        if(d.automation.max_regressions_before_pause!=null)setMaxRegressions(d.automation.max_regressions_before_pause);
        if(d.automation.daemon_schedule)setDaemonSchedule(d.automation.daemon_schedule);
      }
      if(d.dashboard){
        if(d.dashboard.port!=null)setDashPort(d.dashboard.port);
        if(d.dashboard.open_browser!=null)setOpenBrowser(d.dashboard.open_browser);
      }
      setLoading(false);
    });
  },[]);

  const doTest=async()=>{
    setTesting(true);setTestResult(null);
    const payload={provider,model:model||modelPlaceholders[provider]||''};
    if(authMode==='api_key'&&apiKey&&!apiKey.startsWith('***'))payload.api_key=apiKey;
    if(authMode==='oauth_token'&&oauthToken&&!oauthToken.startsWith('***'))payload.oauth_token=oauthToken;
    if(provider==='ollama'&&baseUrl)payload.base_url=baseUrl;
    const r=await post('test-connection',payload);
    setTestResult(r);setTesting(false);
  };

  const doSave=async()=>{
    setSaving(true);setSaveMsg(null);
    const llm={provider,model:model||modelPlaceholders[provider]||''};
    if(authMode==='api_key'&&apiKey&&!apiKey.startsWith('***'))llm.api_key=apiKey;
    if(authMode==='oauth_token'&&oauthToken&&!oauthToken.startsWith('***'))llm.oauth_token=oauthToken;
    if(provider==='ollama'&&baseUrl)llm.base_url=baseUrl;

    const payload={
      llm,
      evolution:{budget_per_session:budgetPerSession,feedback_interval:feedbackInterval,outer_interval:outerInterval,plateau_window:plateauWindow},
      automation:{hook_mode:hookMode,daemon_mode:daemonMode,auto_commit:autoCommit,auto_push:autoPush,trigger_after:triggerAfter,cooldown_minutes:cooldownMinutes,max_regressions_before_pause:maxRegressions,daemon_schedule:daemonSchedule||undefined},
      dashboard:{port:dashPort,open_browser:openBrowser}
    };
    const r=await post('config',payload);
    setSaveMsg(r.success?{ok:true,text:'Configuration saved.'}:{ok:false,text:r.error||'Save failed.'});
    setSaving(false);
  };

  if(loading)return html\`<div class="empty">Loading config...</div>\`;

  return html\`<div class="settings-form">
    <div class="settings-warning">
      <strong>Security note:</strong> API keys and tokens are stored in plain text in your local <code>.kultiv/config.yaml</code> file. Ensure this file is in your <code>.gitignore</code>. For production use, prefer environment variable references (<code>auth_env</code>).
    </div>

    <div class="form-section">
      <h3>LLM Provider</h3>
      <div class="form-group">
        <label>Provider</label>
        <select value=\${provider} onchange=\${e=>{setProvider(e.target.value);setTestResult(null)}}>
          <option value="anthropic">Anthropic</option>
          <option value="openai">OpenAI</option>
          <option value="ollama">Ollama (local)</option>
          <option value="claude-code">Claude Code</option>
        </select>
      </div>
      \${provider==='anthropic'||provider==='openai'?html\`
        <div class="form-group">
          <label>Authentication</label>
          <div class="radio-group">
            <label class="form-row-inline"><input type="radio" name="authMode" value="api_key" checked=\${authMode==='api_key'} onchange=\${()=>setAuthMode('api_key')}/> API Key</label>
            <label class="form-row-inline"><input type="radio" name="authMode" value="oauth_token" checked=\${authMode==='oauth_token'} onchange=\${()=>setAuthMode('oauth_token')}/> OAuth Token</label>
          </div>
        </div>
        \${authMode==='api_key'?html\`<div class="form-group">
          <label>API Key</label>
          <input type="password" value=\${apiKey} oninput=\${e=>setApiKey(e.target.value)} placeholder="sk-..." style="max-width:400px"/>
        </div>\`:html\`<div class="form-group">
          <label>OAuth Token</label>
          <input type="password" value=\${oauthToken} oninput=\${e=>setOauthToken(e.target.value)} placeholder="Token..." style="max-width:400px"/>
        </div>\`}
      \`:null}
      <div class="form-group">
        <label>Model</label>
        <input value=\${model} oninput=\${e=>setModel(e.target.value)} placeholder=\${modelPlaceholders[provider]||'model-name'} style="max-width:300px"/>
      </div>
      \${provider==='ollama'?html\`<div class="form-group">
        <label>Base URL</label>
        <input value=\${baseUrl} oninput=\${e=>setBaseUrl(e.target.value)} placeholder="http://localhost:11434" style="max-width:300px"/>
      </div>\`:null}
      <button class="test-btn" onclick=\${doTest} disabled=\${testing}>\${testing?'Testing...':'Test Connection'}</button>
      \${testResult?html\`<div class=\${'test-result '+(testResult.success?'success':'error')}>
        \${testResult.success?\`Connected! (\${testResult.latencyMs}ms)\`:testResult.message||'Connection failed'}
      </div>\`:null}
    </div>

    <div class="form-section">
      <h3>Evolution Settings</h3>
      <div class="form-group">
        <label>Budget Per Session</label>
        <input type="number" value=\${budgetPerSession} min=1 oninput=\${e=>setBudgetPerSession(parseInt(e.target.value)||1)} style="max-width:120px"/>
      </div>
      <div class="form-group">
        <label>Feedback Interval</label>
        <input type="number" value=\${feedbackInterval} min=1 oninput=\${e=>setFeedbackInterval(parseInt(e.target.value)||1)} style="max-width:120px"/>
      </div>
      <div class="form-group">
        <label>Outer Interval</label>
        <input type="number" value=\${outerInterval} min=1 oninput=\${e=>setOuterInterval(parseInt(e.target.value)||1)} style="max-width:120px"/>
      </div>
      <div class="form-group">
        <label>Plateau Window</label>
        <input type="number" value=\${plateauWindow} min=1 oninput=\${e=>setPlateauWindow(parseInt(e.target.value)||1)} style="max-width:120px"/>
      </div>
    </div>

    <div class="form-section">
      <h3>Automation Settings</h3>
      <div class="toggle-row"><input type="checkbox" checked=\${hookMode} onchange=\${e=>setHookMode(e.target.checked)}/><label>Hook Mode</label></div>
      <div class="toggle-row"><input type="checkbox" checked=\${daemonMode} onchange=\${e=>setDaemonMode(e.target.checked)}/><label>Daemon Mode</label></div>
      <div class="toggle-row"><input type="checkbox" checked=\${autoCommit} onchange=\${e=>setAutoCommit(e.target.checked)}/><label>Auto Commit</label></div>
      <div class="toggle-row"><input type="checkbox" checked=\${autoPush} onchange=\${e=>setAutoPush(e.target.checked)}/><label>Auto Push</label></div>
      <div class="form-group">
        <label>Trigger After (commits)</label>
        <input type="number" value=\${triggerAfter} min=0 oninput=\${e=>setTriggerAfter(parseInt(e.target.value)||0)} style="max-width:120px"/>
      </div>
      <div class="form-group">
        <label>Cooldown Minutes</label>
        <input type="number" value=\${cooldownMinutes} min=0 oninput=\${e=>setCooldownMinutes(parseInt(e.target.value)||0)} style="max-width:120px"/>
      </div>
      <div class="form-group">
        <label>Max Regressions Before Pause</label>
        <input type="number" value=\${maxRegressions} min=1 oninput=\${e=>setMaxRegressions(parseInt(e.target.value)||1)} style="max-width:120px"/>
      </div>
      <div class="form-group">
        <label>Daemon Schedule</label>
        <input value=\${daemonSchedule} oninput=\${e=>setDaemonSchedule(e.target.value)} placeholder="e.g. */30 * * * *" style="max-width:250px"/>
      </div>
    </div>

    <div class="form-section">
      <h3>Dashboard Settings</h3>
      <div class="form-group">
        <label>Port</label>
        <input type="number" value=\${dashPort} min=1 max=65535 oninput=\${e=>setDashPort(parseInt(e.target.value)||4200)} style="max-width:120px"/>
      </div>
      <div class="toggle-row"><input type="checkbox" checked=\${openBrowser} onchange=\${e=>setOpenBrowser(e.target.checked)}/><label>Open Browser on Start</label></div>
    </div>

    <div class="save-bar">
      <button onclick=\${doSave} disabled=\${saving}>\${saving?'Saving...':'Save Configuration'}</button>
      \${saveMsg?html\`<span class="save-msg" style=\${'color:var(--'+(saveMsg.ok?'green':'red')+')'}>
        \${saveMsg.text}
      </span>\`:null}
    </div>
  </div>\`;
}

// ── Playground Tab ───────────────────────────────────────────────────
function Playground(){
  const[content,setContent]=useState('');
  const[type,setType]=useState('prompt');
  const[chainMode,setChainMode]=useState('default');
  const[chainArtifactId,setChainArtifactId]=useState('');
  const[chains,setChains]=useState([]);
  const[scoring,setScoring]=useState(false);
  const[scorecard,setSc]=useState(null);
  const[error,setError]=useState('');
  const[saveName,setSaveName]=useState('');
  const[savePath,setSavePath]=useState('');
  const[saving,setSaving]=useState(false);
  const[saveMsg,setSaveMsg]=useState('');

  useEffect(()=>{api('playground/chains').then(r=>{if(!r.error){setChains(r);if(r.length>0)setChainArtifactId(r[0].id)}});},[]);

  const doScore=async()=>{
    setScoring(true);setSc(null);setError('');
    const chain=chainMode==='default'?'default':chainArtifactId;
    const r=await post('playground/score',{content,type,chain});
    if(r.error)setError(r.error);else setSc(r);
    setScoring(false);
  };

  const doSave=async()=>{
    if(!saveName||!savePath){setSaveMsg('Name and path are required');return}
    setSaving(true);setSaveMsg('');
    const r=await post('playground/save',{content,name:saveName,type,path:savePath});
    setSaveMsg(r.error||'Saved as "'+saveName+'"');
    setSaving(false);
    if(!r.error)api('playground/chains').then(r2=>{if(!r2.error)setChains(r2)});
  };

  return html\`<div>
    <h2 style="margin-bottom:16px">Playground</h2>
    <div class="pg-grid">
      <div>
        <div class="card">
          <h3 style="margin-bottom:8px">Input</h3>
          <textarea class="pg-input" rows="18" placeholder="Paste your prompt, code, or config here..."
            value=\${content} onInput=\${e=>setContent(e.target.value)}></textarea>
          <div class="pg-controls">
            <label>Type
              <select value=\${type} onChange=\${e=>setType(e.target.value)}>
                <option value="prompt">Prompt</option>
                <option value="config">Config</option>
                <option value="template">Template</option>
                <option value="doc">Doc</option>
              </select>
            </label>
            <label>Score with
              <select value=\${chainMode==='default'?'default':chainArtifactId} onChange=\${e=>{
                if(e.target.value==='default'){setChainMode('default')}
                else{setChainMode('artifact');setChainArtifactId(e.target.value)}
              }}>
                <option value="default">Default (LLM Judge)</option>
                \${chains.map(ch=>html\`<option value=\${ch.id}>\${ch.id} (\${ch.chain_summary})</option>\`)}
              </select>
            </label>
            <div style="flex:1"></div>
            <button onclick=\${doScore} disabled=\${scoring||!content.trim()}
              style="padding:10px 24px;font-size:15px">
              \${scoring?'Scoring...':'Score It'}
            </button>
          </div>
        </div>
      </div>
      <div>
        \${scorecard?html\`<div class="card">
          <h3 style="margin-bottom:8px">Results</h3>
          <div class="sc-total">
            <span>Score: \${scorecard.total_score} / \${scorecard.max_score}</span>
            <span style="color:\${scorecard.percentage>=80?'var(--green)':scorecard.percentage>=60?'var(--yellow)':'var(--red)'}">
              \${scorecard.percentage}%
            </span>
          </div>
          <div>
            \${(scorecard.evaluators||[]).map(ev=>html\`<div>
              <div class="sc-row">
                <span class="sc-name">\${ev.name}</span>
                <span class="badge \${ev.passed?'success':'regression'}">\${ev.passed?'PASS':'FAIL'}</span>
                <span class="sc-score">\${Math.round(ev.score*100)/100}/\${ev.max}</span>
              </div>
              \${ev.details?.reasoning?html\`<div class="sc-reasoning">\${ev.details.reasoning}</div>\`:null}
              \${ev.details?.checks?html\`<div class="sc-checks">
                \${ev.details.checks.map(ck=>html\`<div style="margin:2px 0">
                  <span style="color:\${ck.passed?'var(--green)':'var(--red)'}">\${ck.passed?'✓':'✗'}</span>
                  \${' '}\${ck.name}\${ck.note?': '+ck.note:''}
                </div>\`)}
              </div>\`:null}
            </div>\`)}
          </div>
          <div class="save-section">
            <h4 style="margin-bottom:8px">Save as Artifact</h4>
            <div class="pg-controls">
              <label>Name
                <input placeholder="my-prompt" value=\${saveName} onInput=\${e=>setSaveName(e.target.value)}/>
              </label>
              <label>File Path
                <input placeholder="agents/my-prompt.md" value=\${savePath} onInput=\${e=>setSavePath(e.target.value)}/>
              </label>
              <button class="btn-green" onclick=\${doSave} disabled=\${saving}>
                \${saving?'Saving...':'Save'}
              </button>
            </div>
            \${saveMsg?html\`<div style="margin-top:6px;font-size:13px;color:var(--text2)">\${saveMsg}</div>\`:null}
          </div>
        </div>\`:null}
        \${error?html\`<div class="card" style="border-color:var(--red)">
          <div style="color:var(--red)">\${error}</div>
        </div>\`:null}
        \${!scorecard&&!error?html\`<div class="card" style="display:flex;align-items:center;justify-content:center;min-height:200px;color:var(--text2)">
          Paste content and click "Score It" to see results
        </div>\`:null}
      </div>
    </div>
  </div>\`;
}

// ── Docs Panel ──────────────────────────────────────────────────────
const DOCS_SECTIONS=[
  {id:'quickstart',title:'Quick Start',content:\`<h1>Quick Start</h1>
<p>Get started improving your AI agent prompts in 4 commands:</p>
<pre><code>cd your-project
kultiv init                       # creates .kultiv/ with config
kultiv add my-agent ./agents/my-agent.md
kultiv baseline                   # score the current version
kultiv evolve -n 10               # run 10 improvement experiments</code></pre>
<h2>What Happens</h2>
<ol>
<li><strong>Score</strong> — run your evaluator chain against the current artifact</li>
<li><strong>Mutate</strong> — single LLM call to apply one small change</li>
<li><strong>Re-score</strong> — same tests on the mutated version</li>
<li><strong>Keep or Revert</strong> — better score? Keep. Worse? Auto-revert</li>
<li><strong>Learn</strong> — every few experiments, Kultiv revises its own mutation strategy</li>
</ol>
<div class="tip"><strong>Tip:</strong> Start with <code>kultiv baseline</code> to see where your prompts score before evolving.</div>\`},
  {id:'mutations',title:'Mutation Types',content:\`<h1>9 Mutation Types</h1>
<p>Each experiment applies exactly one mutation. The type is chosen based on the meta-strategy and recent results.</p>
<table>
<tr><th>Type</th><th>What It Does</th><th>When Selected</th></tr>
<tr><td><code>ADD_RULE</code></td><td>Add a new instruction</td><td>Missing behavior detected</td></tr>
<tr><td><code>ADD_EXAMPLE</code></td><td>Add a "do this" example</td><td>Rule exists but misapplied</td></tr>
<tr><td><code>ADD_NEGATIVE_EXAMPLE</code></td><td>Add a "don't do this" example</td><td>Same mistake repeats 3+ times</td></tr>
<tr><td><code>REORDER</code></td><td>Move a section up or down</td><td>Important rule buried too deep</td></tr>
<tr><td><code>SIMPLIFY</code></td><td>Remove redundant content</td><td>Artifact bloated with low improvement</td></tr>
<tr><td><code>REPHRASE</code></td><td>Rewrite for clarity</td><td>Scores fluctuate on same content</td></tr>
<tr><td><code>DELETE_RULE</code></td><td>Remove a rule</td><td>Rule consistently causes regressions</td></tr>
<tr><td><code>MERGE_RULES</code></td><td>Combine related rules</td><td>Scattered rules cover same topic</td></tr>
<tr><td><code>RESTRUCTURE</code></td><td>Reorganize the whole artifact</td><td>Related content too far apart</td></tr>
</table>
<h2>Selection Rules</h2>
<ul>
<li>Never applies the same type twice in a row</li>
<li>Forces structural mutations after 3 consecutive additions</li>
<li>Deprioritizes types with &lt;20% success rate over last 10 runs</li>
</ul>
<h2>Risk Levels</h2>
<p><strong>Zero risk:</strong> REORDER (no content changes)<br/>
<strong>Low risk:</strong> ADD_RULE, ADD_EXAMPLE, REPHRASE (additive changes)<br/>
<strong>Medium risk:</strong> ADD_NEGATIVE_EXAMPLE, SIMPLIFY, MERGE_RULES<br/>
<strong>High risk:</strong> DELETE_RULE, RESTRUCTURE (can remove or reorder significantly)</p>\`},
  {id:'scoring',title:'Scoring',content:\`<h1>Scoring System</h1>
<p>Artifacts are scored using a <strong>weighted chain</strong> of evaluators. The total score is normalized to 100.</p>
<h2>Evaluator Types</h2>
<h3>Command Scorer (script)</h3>
<p>Runs a shell command (e.g., <code>npx tsc --noEmit</code>). Score derived from exit code and output parsing. Deterministic, zero LLM tokens.</p>
<h3>Pattern Scorer</h3>
<p>Regex rules against artifact content. Good for structural checks (section headers, required patterns). Configured via YAML rules file.</p>
<h3>LLM Judge</h3>
<p>Sends artifact to the LLM with a scoring rubric. Nuanced quality assessment but costs tokens. Configured via markdown rubric file.</p>
<h2>Chain Configuration</h2>
<pre><code>scorer:
  chain:
    - name: typecheck
      command: "npx tsc --noEmit"
      type: script
      weight: 3
    - name: tests
      command: "npx vitest run"
      type: script
      weight: 2
    - name: quality
      type: llm-judge
      rules_file: .kultiv/judge-rules.md
      weight: 1</code></pre>
<div class="tip"><strong>Tip:</strong> Use the Playground tab to test scoring against any content without running a full experiment.</div>\`},
  {id:'evolution',title:'Evolution',content:\`<h1>Evolution Loop</h1>
<h2>Inner Loop</h2>
<p>The core cycle that runs for each experiment:</p>
<ol>
<li><strong>Score</strong> — run evaluator chain on current artifact</li>
<li><strong>Select mutation type</strong> — pick from 9 types based on meta-strategy</li>
<li><strong>Mutate</strong> — single LLM call to apply the chosen mutation</li>
<li><strong>Re-score</strong> — same evaluator chain on mutated version</li>
<li><strong>Compare</strong> — better? Keep. Worse? Auto-revert</li>
<li><strong>Archive</strong> — log result to JSONL archive</li>
</ol>
<h2>Outer Loop (Meta-Evolution)</h2>
<p>Every N experiments (default: 10), Kultiv analyzes which mutation types succeed and which fail, then rewrites its own meta-strategy.</p>
<h2>Dialogue Trace</h2>
<p>Each mutation goes through a 4-round internal dialogue:</p>
<ol>
<li><strong>Explore</strong> — generate 5 candidate mutations</li>
<li><strong>Critique</strong> — evaluate and select the best candidate</li>
<li><strong>Specify</strong> — write the exact change to apply</li>
<li><strong>Validate</strong> — sanity-check the specification</li>
</ol>
<p>You can see these details by clicking any row in the Evolution tab.</p>
<h2>Anti-Pattern Detection</h2>
<p>Zero-token heuristics detect when evolution is stuck:</p>
<ul>
<li><strong>Plateau</strong> — score hasn't improved over N experiments</li>
<li><strong>Type fixation</strong> — same mutation type selected too often</li>
<li><strong>Overfitting</strong> — high score on one evaluator, low on others</li>
<li><strong>Bloat</strong> — artifact growing without score improvement</li>
</ul>\`},
  {id:'config',title:'Configuration',content:\`<h1>Configuration</h1>
<p>Main config file: <code>.kultiv/config.yaml</code></p>
<h2>LLM Settings</h2>
<pre><code>llm:
  provider: anthropic    # anthropic | openai | ollama | claude-code
  model: claude-sonnet-4-20250514
  auth_env: ANTHROPIC_API_KEY</code></pre>
<h2>Evolution Settings</h2>
<pre><code>evolution:
  budget_per_session: 10    # max experiments per evolve run
  feedback_interval: 3      # anti-pattern check every N runs
  outer_interval: 10        # meta-strategy revision every N runs
  plateau_window: 5         # experiments without improvement = plateau</code></pre>
<h2>Automation</h2>
<pre><code>automation:
  hook_mode: false           # Claude Code post-session hooks
  daemon_mode: false         # background cron daemon
  daemon_schedule: "*/30 * * * *"
  cooldown_minutes: 10
  auto_commit: true
  auto_push: false           # safety: manual review before push
  max_regressions_before_pause: 3</code></pre>
<div class="tip"><strong>Safety:</strong> <code>auto_push</code> defaults to false — you always review before pushing to remote.</div>\`},
  {id:'cli',title:'CLI Reference',content:\`<h1>CLI Reference</h1>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td><code>kultiv init</code></td><td>Create .kultiv/ directory with config and empty archive</td></tr>
<tr><td><code>kultiv add &lt;name&gt; &lt;path&gt;</code></td><td>Register an artifact to evolve</td></tr>
<tr><td><code>kultiv baseline</code></td><td>Score artifacts without changing them</td></tr>
<tr><td><code>kultiv run</code></td><td>Run a single mutation experiment</td></tr>
<tr><td><code>kultiv evolve -n &lt;N&gt;</code></td><td>Run N experiments in a session</td></tr>
<tr><td><code>kultiv status</code></td><td>Show scores, mutation counts, anti-patterns</td></tr>
<tr><td><code>kultiv history</code></td><td>Show experiment archive (most recent first)</td></tr>
<tr><td><code>kultiv trace "&lt;cmd&gt;"</code></td><td>Wrap a shell command as a traced run</td></tr>
<tr><td><code>kultiv pause</code></td><td>Pause an active evolution session</td></tr>
<tr><td><code>kultiv resume</code></td><td>Resume a paused session</td></tr>
<tr><td><code>kultiv daemon start</code></td><td>Start background automation daemon</td></tr>
<tr><td><code>kultiv daemon stop</code></td><td>Stop the daemon</td></tr>
<tr><td><code>kultiv dashboard</code></td><td>Open web dashboard at localhost:4200</td></tr>
</table>
<h2>Global Options</h2>
<p>All commands accept <code>-c, --config &lt;path&gt;</code> to use a custom config file.</p>
<h2>Presets</h2>
<pre><code>kultiv init --preset nextjs      # Next.js apps
kultiv init --preset typescript  # TypeScript libraries
kultiv init --preset python      # Python projects
kultiv init --preset go          # Go projects
kultiv init --preset rust        # Rust projects</code></pre>\`},
  {id:'dashboard',title:'Dashboard Guide',content:\`<h1>Dashboard Guide</h1>
<p>This dashboard shows real-time evolution data. Here's what each tab does:</p>
<h2>Overview</h2>
<p>Summary stats: total experiments, success rate, token usage, and session status. The score chart shows improvement over time for each artifact.</p>
<h2>Artifacts</h2>
<p>List of registered artifacts with their current scores, mutation counts, and success rates. Click an artifact to see its full score history.</p>
<h2>Evolution</h2>
<p>Experiment history table. Click any row to expand the <strong>dialogue trace</strong> — showing the Explore candidates, Critique reasoning, and final Specification that was applied.</p>
<h2>Playground</h2>
<p>Score any content against your evaluator chains without running a full experiment. Paste a prompt, select a scoring chain, and click "Score It". You can also save scored content as a new artifact.</p>
<h2>Traces</h2>
<p>Detailed run logs including scorecards, errors, and execution traces. Useful for debugging scoring issues.</p>
<h2>Settings</h2>
<p>Configure LLM provider, evolution parameters, and automation settings. Changes are saved to <code>.kultiv/config.yaml</code>.</p>
<div class="tip"><strong>Tip:</strong> The dashboard auto-refreshes data. You can run <code>kultiv evolve</code> in a terminal and watch progress here in real-time.</div>\`},
  {id:'workflow',title:'Workflows',content:\`<h1>Common Workflows</h1>
<h2>First-Time Setup</h2>
<pre><code># 1. Initialize in your project
kultiv init --preset nextjs

# 2. Register artifacts to evolve
kultiv add lilly-persona src/lib/lilly/prompts/persona.md

# 3. Establish baseline scores
kultiv baseline

# 4. Open dashboard to monitor
kultiv dashboard</code></pre>
<h2>Overnight Evolution</h2>
<pre><code># Run 30 experiments unattended
kultiv evolve -n 30

# Check results in the morning
kultiv status</code></pre>
<h2>Targeted Improvement</h2>
<p>When a specific criterion scores low:</p>
<ol>
<li>Check the <strong>Insights</strong> panel for weak criteria</li>
<li>Run a single experiment: <code>kultiv run</code></li>
<li>Expand the result in Evolution tab to see what mutation was tried</li>
<li>If it worked, run more: <code>kultiv evolve -n 5</code></li>
</ol>
<h2>Understanding the Dialogue Trace</h2>
<p>When you see output like "Explore — 5 Candidates", that's the mutation dialogue:</p>
<ul>
<li><strong>[ADD_RULE]</strong>, <strong>[REORDER]</strong>, etc. — the mutation type being proposed</li>
<li><strong>low/medium/high risk</strong> — how likely the change could cause regressions</li>
<li><strong>Critique</strong> — why this specific candidate was chosen over the others</li>
<li><strong>Specification</strong> — the exact change that will be applied to the artifact</li>
</ul>
<h2>Reading Scores</h2>
<p>Scores are percentages per rubric criterion:</p>
<ul>
<li><strong>0-40%</strong> — Minimal: criterion barely addressed</li>
<li><strong>40-60%</strong> — Below target: key gaps remain</li>
<li><strong>60-80%</strong> — Good: meets requirements with room for polish</li>
<li><strong>80-100%</strong> — Excellent: exceeds expectations</li>
</ul>\`}
];

function DocsPanel({open,onClose}){
  const[activeDoc,setActiveDoc]=useState('quickstart');
  const[search,setSearch]=useState('');
  const bodyRef=useRef(null);

  const filtered=search.trim()
    ?DOCS_SECTIONS.filter(s=>s.title.toLowerCase().includes(search.toLowerCase())||s.content.toLowerCase().includes(search.toLowerCase()))
    :DOCS_SECTIONS;
  const current=DOCS_SECTIONS.find(s=>s.id===activeDoc)||DOCS_SECTIONS[0];

  useEffect(()=>{
    if(bodyRef.current)bodyRef.current.scrollTop=0;
  },[activeDoc]);

  useEffect(()=>{
    const handleKey=(e)=>{if(e.key==='Escape'&&open)onClose()};
    document.addEventListener('keydown',handleKey);
    return()=>document.removeEventListener('keydown',handleKey);
  },[open,onClose]);

  return html\`<\${Fragment}>
    <div class="docs-overlay \${open?'open':''}" onclick=\${onClose}></div>
    <div class="docs-panel \${open?'open':''}">
      <div class="docs-header">
        <h2>Documentation</h2>
        <button class="docs-close" onclick=\${onClose}>✕</button>
      </div>
      <div class="docs-search">
        <input type="text" placeholder="Search docs..." value=\${search} onInput=\${e=>setSearch(e.target.value)}/>
      </div>
      <div class="docs-nav">
        \${filtered.map(s=>html\`<button class=\${activeDoc===s.id?'active':''} onclick=\${()=>setActiveDoc(s.id)}>\${s.title}</button>\`)}
      </div>
      <div class="docs-body" ref=\${bodyRef} dangerouslySetInnerHTML=\${{__html:current.content}}></div>
    </div>
  </\${Fragment}>\`;
}

// ── App ──────────────────────────────────────────────────────────────
function App(){
  const[tab,setTab]=useState('overview');
  const[docsOpen,setDocsOpen]=useState(false);
  const tabs=[['overview','Overview'],['artifacts','Artifacts'],['evolution','Evolution'],['playground','Playground'],['traces','Traces'],['settings','Settings']];
  const content={overview:Overview,artifacts:Artifacts,evolution:Evolution,playground:Playground,traces:Traces,settings:Settings};
  const Tab=content[tab];

  return html\`
    <header><div class="container inner">
      <h1>Kultiv</h1>
      <nav>\${tabs.map(([k,label])=>html\`<button class=\${tab===k?'active':''} onclick=\${()=>setTab(k)}>\${label}</button>\`)}</nav>
      <button class="docs-btn" onclick=\${()=>setDocsOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h6"/></svg>
        Docs
      </button>
    </div></header>
    <main class="container" style="padding-top:16px;padding-bottom:40px">
      <\${Tab}/>
    </main>
    <\${DocsPanel} open=\${docsOpen} onClose=\${()=>setDocsOpen(false)}/>\`;
}

render(html\`<\${App}/>\`,document.getElementById('app'));
</script>
</body>
</html>`;
}

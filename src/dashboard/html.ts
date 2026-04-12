// ── Dashboard SPA HTML ──────────────────────────────────────────────────
// Single-page application using Preact + htm (no build step required).
// Premium dark theme with glass-morphism, gradient accents, and micro-interactions.
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
/* ── Reset & Root ─────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0e1a;
  --surface:#111524;
  --surface2:#141824;
  --surface3:#1a1f30;
  --border:rgba(255,255,255,0.06);
  --border-glow:rgba(139,92,246,0.15);
  --text:#e8eaf0;
  --text2:#6b7290;
  --text3:#4a4f68;
  --accent:#8b5cf6;
  --accent2:#3b82f6;
  --accent-g:linear-gradient(135deg,#8b5cf6,#3b82f6);
  --green:#10b981;
  --green-soft:rgba(16,185,129,0.12);
  --red:#ef4444;
  --red-soft:rgba(239,68,68,0.1);
  --yellow:#f59e0b;
  --yellow-soft:rgba(245,158,11,0.1);
  --purple:#8b5cf6;
  --purple-soft:rgba(139,92,246,0.1);
  --blue:#3b82f6;
  --blue-soft:rgba(59,130,246,0.1);
  --radius:10px;
  --radius-sm:6px;
  --radius-lg:14px;
  --shadow-card:0 1px 3px rgba(0,0,0,0.3),0 0 0 1px var(--border);
  --shadow-glow:0 0 24px -4px rgba(139,92,246,0.15);
  --font:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;
  --mono:'JetBrains Mono','Fira Code',Consolas,monospace;
  --transition:200ms cubic-bezier(0.4,0,0.2,1);
}

body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.6;min-height:100vh;-webkit-font-smoothing:antialiased}
a{color:var(--blue);text-decoration:none}

/* ── Scrollbar ───────────────────────────────────────────── */
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.14)}

/* ── Animations ──────────────────────────────────────────── */
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeInScale{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
@keyframes pulse-soft{0%,100%{opacity:1}50%{opacity:0.5}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes glow-pulse{0%,100%{box-shadow:0 0 8px rgba(139,92,246,0.15)}50%{box-shadow:0 0 20px rgba(139,92,246,0.3)}}
@keyframes ring-draw{from{stroke-dashoffset:283}to{stroke-dashoffset:var(--ring-offset,283)}}
@keyframes checkmark{from{stroke-dashoffset:20}to{stroke-dashoffset:0}}
@keyframes success-pop{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
@keyframes stagger-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

.anim-fade{animation:fadeIn 0.4s ease both}
.anim-scale{animation:fadeInScale 0.3s ease both}
.stagger > *{animation:stagger-in 0.4s ease both}
.stagger > *:nth-child(1){animation-delay:0.02s}
.stagger > *:nth-child(2){animation-delay:0.06s}
.stagger > *:nth-child(3){animation-delay:0.10s}
.stagger > *:nth-child(4){animation-delay:0.14s}
.stagger > *:nth-child(5){animation-delay:0.18s}
.stagger > *:nth-child(6){animation-delay:0.22s}
.stagger > *:nth-child(7){animation-delay:0.26s}
.stagger > *:nth-child(8){animation-delay:0.30s}

/* ── Layout ──────────────────────────────────────────────── */
.container{max-width:1320px;margin:0 auto;padding:0 24px}
main.container{padding-top:24px;padding-bottom:48px}

/* ── Header ──────────────────────────────────────────────── */
header{
  background:rgba(17,21,36,0.8);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);
  padding:0;
  position:sticky;top:0;z-index:50;
}
header .inner{display:flex;align-items:center;gap:12px;height:56px}
.logo{display:flex;align-items:center;gap:10px;margin-right:8px}
.logo h1{font-size:17px;font-weight:700;letter-spacing:-0.02em;background:var(--accent-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.logo-icon{width:24px;height:24px;border-radius:6px;background:var(--accent-g);display:flex;align-items:center;justify-content:center}

nav{display:flex;gap:2px;flex:1;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
nav::-webkit-scrollbar{display:none}
nav button{
  background:transparent;color:var(--text2);padding:8px 14px;font-size:13px;
  font-weight:500;border:none;border-radius:var(--radius-sm);cursor:pointer;
  transition:all var(--transition);white-space:nowrap;position:relative;
}
nav button:hover{color:var(--text);background:rgba(255,255,255,0.04)}
nav button.active{color:var(--text);background:rgba(139,92,246,0.1)}
nav button.active::after{
  content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);
  width:16px;height:2px;background:var(--accent);border-radius:1px;
}

.header-actions{display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0}

/* ── Buttons ─────────────────────────────────────────────── */
button{cursor:pointer;font:inherit;border:none;border-radius:var(--radius-sm)}
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:8px 16px;font-size:13px;font-weight:500;border-radius:var(--radius-sm);
  transition:all var(--transition);border:none;cursor:pointer;
}
.btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.btn:disabled{opacity:0.4;cursor:not-allowed;pointer-events:none}

.btn-primary{background:var(--accent-g);color:#fff;box-shadow:0 1px 2px rgba(139,92,246,0.3)}
.btn-primary:hover:not(:disabled){box-shadow:0 4px 12px rgba(139,92,246,0.4);transform:translateY(-1px)}
.btn-primary:active{transform:translateY(0)}

.btn-secondary{background:var(--surface3);color:var(--text);border:1px solid var(--border)}
.btn-secondary:hover:not(:disabled){border-color:rgba(255,255,255,0.12);background:rgba(255,255,255,0.06)}

.btn-success{background:var(--green);color:#fff;box-shadow:0 1px 2px rgba(16,185,129,0.3)}
.btn-success:hover:not(:disabled){box-shadow:0 4px 12px rgba(16,185,129,0.4);transform:translateY(-1px)}

.btn-danger{background:var(--red);color:#fff}
.btn-danger:hover:not(:disabled){box-shadow:0 4px 12px rgba(239,68,68,0.4);transform:translateY(-1px)}

.btn-ghost{background:transparent;color:var(--text2);padding:6px 10px}
.btn-ghost:hover{color:var(--text);background:rgba(255,255,255,0.04)}

.btn-icon{padding:6px;background:transparent;color:var(--text2);border-radius:var(--radius-sm)}
.btn-icon:hover{color:var(--text);background:rgba(255,255,255,0.06)}
.btn-icon svg{width:18px;height:18px}

.btn-sm{padding:5px 10px;font-size:12px}
.btn-lg{padding:10px 24px;font-size:14px}

/* ── Cards (Glass) ───────────────────────────────────────── */
.glass-card{
  background:linear-gradient(135deg,rgba(20,24,36,0.9),rgba(26,31,48,0.6));
  border:1px solid var(--border);
  border-radius:var(--radius-lg);
  padding:20px;
  transition:all 0.3s ease;
  position:relative;
  overflow:hidden;
}
.glass-card::before{
  content:'';position:absolute;inset:0;border-radius:inherit;padding:1px;
  background:linear-gradient(135deg,rgba(255,255,255,0.06),transparent,rgba(139,92,246,0.05));
  -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;
}
.glass-card:hover{
  border-color:rgba(139,92,246,0.12);
  box-shadow:var(--shadow-glow);
  transform:translateY(-1px);
}

/* ── Stat Cards ──────────────────────────────────────────── */
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:20px 0}
.stat-card{
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:var(--radius);
  padding:18px 20px;
  position:relative;overflow:hidden;
  transition:all 0.3s ease;
}
.stat-card::after{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:var(--stat-accent,var(--accent-g));opacity:0;
  transition:opacity 0.3s ease;
}
.stat-card:hover{border-color:rgba(255,255,255,0.08)}
.stat-card:hover::after{opacity:1}
.stat-label{font-size:12px;font-weight:500;color:var(--text2);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px}
.stat-value{font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1}
.stat-sub{font-size:12px;color:var(--text2);margin-top:6px;display:flex;align-items:center;gap:4px}
.stat-icon{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;opacity:0.15}

/* ── Panels ──────────────────────────────────────────────── */
.panel{
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:var(--radius-lg);
  padding:20px 24px;
  margin-top:16px;
}
.panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.panel-title{font-size:14px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:8px}
.panel-title .icon{width:18px;height:18px;color:var(--accent)}

/* ── Tables ──────────────────────────────────────────────── */
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;color:var(--text2);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;padding:10px 14px;border-bottom:1px solid var(--border)}
td{padding:10px 14px;border-bottom:1px solid var(--border);transition:background 0.15s}
tr:hover td{background:rgba(255,255,255,0.02)}
tr.clickable{cursor:pointer}
tr.clickable:hover td{background:rgba(139,92,246,0.04)}
tr.expanded td{border-bottom-color:transparent}

/* ── Badges ──────────────────────────────────────────────── */
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:0.02em}
.badge.success{background:var(--green-soft);color:var(--green)}
.badge.regression{background:var(--red-soft);color:var(--red)}
.badge.neutral{background:var(--yellow-soft);color:var(--yellow)}
.badge.baseline{background:rgba(107,114,144,0.15);color:var(--text2)}
.badge.crash{background:var(--red-soft);color:var(--red)}
.badge.running{background:var(--blue-soft);color:var(--blue);animation:pulse-soft 2s infinite}
.badge.completed{background:var(--green-soft);color:var(--green)}
.badge.paused{background:var(--yellow-soft);color:var(--yellow)}
.badge.failed{background:var(--red-soft);color:var(--red)}
.badge.high{background:var(--red-soft);color:var(--red)}
.badge.medium{background:var(--yellow-soft);color:var(--yellow)}
.badge.low{background:rgba(107,114,144,0.15);color:var(--text2)}
.badge.purple{background:var(--purple-soft);color:var(--purple)}

/* ── Inputs ──────────────────────────────────────────────── */
input,select,textarea{
  font:inherit;font-size:13px;
  background:var(--surface);color:var(--text);
  border:1px solid var(--border);border-radius:var(--radius-sm);
  padding:8px 12px;transition:all var(--transition);
}
input:focus,select:focus,textarea:focus{
  outline:none;border-color:rgba(139,92,246,0.4);
  box-shadow:0 0 0 3px rgba(139,92,246,0.1);
}
input::placeholder,textarea::placeholder{color:var(--text3)}

/* ── Toggle Switch ───────────────────────────────────────── */
.toggle{position:relative;width:40px;height:22px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0;position:absolute}
.toggle-track{
  position:absolute;inset:0;cursor:pointer;border-radius:11px;
  background:var(--surface);border:1px solid var(--border);
  transition:all 0.25s ease;
}
.toggle-track::after{
  content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;
  border-radius:50%;background:var(--text2);transition:all 0.25s ease;
}
.toggle input:checked + .toggle-track{background:var(--accent);border-color:var(--accent)}
.toggle input:checked + .toggle-track::after{transform:translateX(18px);background:#fff}
.toggle input:focus-visible + .toggle-track{box-shadow:0 0 0 3px rgba(139,92,246,0.2)}

/* ── Range Slider ────────────────────────────────────────── */
input[type="range"]{
  -webkit-appearance:none;appearance:none;width:100%;height:6px;
  background:var(--surface);border:none;border-radius:3px;padding:0;
  cursor:pointer;
}
input[type="range"]::-webkit-slider-thumb{
  -webkit-appearance:none;width:18px;height:18px;border-radius:50%;
  background:var(--accent);border:2px solid var(--bg);
  box-shadow:0 0 0 3px rgba(139,92,246,0.2);cursor:pointer;
  transition:box-shadow 0.2s ease;
}
input[type="range"]::-webkit-slider-thumb:hover{
  box-shadow:0 0 0 5px rgba(139,92,246,0.3);
}
input[type="range"]::-moz-range-thumb{
  width:18px;height:18px;border-radius:50%;
  background:var(--accent);border:2px solid var(--bg);cursor:pointer;
}
.range-row{display:flex;align-items:center;gap:12px}
.range-value{font-size:14px;font-weight:600;font-family:var(--mono);min-width:28px;text-align:center;color:var(--accent)}

/* ── Segmented Control ───────────────────────────────────── */
.segmented{display:inline-flex;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:2px;gap:2px}
.segmented button{
  padding:5px 12px;font-size:12px;font-weight:500;border-radius:4px;
  background:transparent;color:var(--text2);border:none;cursor:pointer;
  transition:all var(--transition);white-space:nowrap;
}
.segmented button:hover{color:var(--text)}
.segmented button.active{background:var(--accent);color:#fff;box-shadow:0 1px 3px rgba(139,92,246,0.3)}

/* ── Misc ────────────────────────────────────────────────── */
.row{display:flex;gap:16px;flex-wrap:wrap}
.col{flex:1;min-width:320px}
.mt{margin-top:16px}
.mb{margin-bottom:16px}
.empty{color:var(--text2);text-align:center;padding:48px 24px;font-size:14px}
.empty-icon{font-size:48px;margin-bottom:12px;opacity:0.3}
pre{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;overflow-x:auto;font-size:12px;font-family:var(--mono);max-height:400px;overflow-y:auto;line-height:1.7}
.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0}
.divider{width:100%;height:1px;background:var(--border);margin:20px 0}

/* ── Progress Ring ───────────────────────────────────────── */
.progress-ring{position:relative;display:inline-flex;align-items:center;justify-content:center}
.progress-ring svg{transform:rotate(-90deg)}
.progress-ring .ring-bg{fill:none;stroke:var(--surface);stroke-width:4}
.progress-ring .ring-fill{fill:none;stroke-width:4;stroke-linecap:round;transition:stroke-dashoffset 1s ease;animation:ring-draw 1.2s ease both}
.progress-ring .ring-text{position:absolute;font-size:13px;font-weight:700;font-family:var(--mono)}

/* ── Sparkline ───────────────────────────────────────────── */
.sparkline{display:inline-block;vertical-align:middle}
.sparkline polyline{transition:d 0.5s ease}

/* ── Pulsing Dot ─────────────────────────────────────────── */
.pulse-dot{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500}
.pulse-dot::before{content:'';width:8px;height:8px;border-radius:50%;flex-shrink:0}
.pulse-dot.live::before{background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse-soft 1.5s infinite}
.pulse-dot.idle::before{background:var(--text3)}
.pulse-dot.paused::before{background:var(--yellow);animation:pulse-soft 2s infinite}

/* ── Tab Content Transition ──────────────────────────────── */
.tab-content{animation:fadeIn 0.35s ease both}

/* ── Config Panel ────────────────────────────────────────── */
.config-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;font-size:13px}
.config-item{display:flex;flex-direction:column;gap:2px}
.config-item .config-label{font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.05em}
.config-item .config-value{font-weight:600;color:var(--text)}

/* ── Flow Visualization ──────────────────────────────────── */
.flow-steps{display:flex;align-items:stretch;gap:0;margin:12px 0}
.flow-step{flex:1;padding:10px 14px;background:var(--surface);border:1px solid var(--border);position:relative;text-align:center}
.flow-step:first-child{border-radius:var(--radius-sm) 0 0 var(--radius-sm)}
.flow-step:last-child{border-radius:0 var(--radius-sm) var(--radius-sm) 0}
.flow-step:not(:last-child)::after{
  content:'';position:absolute;right:-7px;top:50%;transform:translateY(-50%);
  width:0;height:0;border:6px solid transparent;border-left-color:var(--text3);z-index:1;
}
.flow-step .step-label{font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:0.05em}
.flow-step .step-title{font-size:13px;font-weight:600;margin-top:2px}
.flow-step.active{background:var(--purple-soft);border-color:rgba(139,92,246,0.25)}
.flow-step.active .step-title{color:var(--purple)}

/* ── Settings Form ───────────────────────────────────────── */
.settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:20px}
@media(max-width:860px){.settings-grid{grid-template-columns:1fr}}
.form-section{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--radius-lg);padding:24px;
}
.form-section h3{font-size:14px;font-weight:600;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.form-section h3 .icon{color:var(--accent);width:18px;height:18px}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:12px;color:var(--text2);font-weight:500;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.04em}
.form-row-toggle{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)}
.form-row-toggle:last-child{border-bottom:none}
.form-row-toggle .toggle-label{font-size:13px;font-weight:500}
.form-row-toggle .toggle-desc{font-size:11px;color:var(--text2);margin-top:2px}

/* ── Cost Estimator ──────────────────────────────────────── */
.cost-bar{position:relative;height:28px;background:var(--surface);border-radius:var(--radius-sm);overflow:hidden;margin:8px 0}
.cost-fill{height:100%;border-radius:var(--radius-sm);transition:width 0.6s ease;position:relative}
.cost-fill::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
  animation:shimmer 3s infinite;
  background-size:200% 100%;
}
.cost-labels{display:flex;justify-content:space-between;font-size:11px;color:var(--text2);margin-top:4px}
.cost-amount{font-size:20px;font-weight:700;font-family:var(--mono);margin-top:4px}

/* ── Challenges ──────────────────────────────────────────── */
.challenge-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.challenge-card{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--radius);padding:18px;transition:all 0.3s ease;
}
.challenge-card:hover{border-color:rgba(255,255,255,0.1);transform:translateY(-1px)}
.challenge-header{display:flex;align-items:start;justify-content:space-between;gap:8px;margin-bottom:10px}
.challenge-name{font-size:14px;font-weight:600}
.challenge-desc{font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:12px}
.challenge-meta{display:flex;gap:12px;font-size:11px;color:var(--text2);flex-wrap:wrap}
.challenge-tags{display:flex;gap:4px;flex-wrap:wrap;margin-top:8px}
.challenge-tag{padding:2px 6px;border-radius:4px;font-size:10px;background:rgba(255,255,255,0.04);color:var(--text2)}
.difficulty-dots{display:flex;gap:2px;align-items:center}
.difficulty-dot{width:6px;height:6px;border-radius:50%;background:var(--text3)}
.difficulty-dot.filled{background:var(--yellow)}

/* ── Dialogue Detail ─────────────────────────────────────── */
.dlg-detail{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin:8px 0;animation:fadeIn 0.3s ease}
.dlg-section{margin-bottom:16px}
.dlg-section h5{font-size:11px;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;font-weight:600}
.dlg-candidate{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:6px;
  font-size:13px;transition:all 0.2s ease;
}
.dlg-candidate.selected{border-color:var(--green);background:rgba(16,185,129,0.05)}
.dlg-candidate .dlg-type{font-weight:600;color:var(--accent);margin-right:8px;font-family:var(--mono);font-size:12px}
.dlg-reasoning{background:var(--surface2);border-radius:var(--radius-sm);padding:14px;font-size:13px;color:var(--text2);line-height:1.7}
.dlg-spec{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px}
.dlg-spec-label{color:var(--text2);font-size:11px;text-transform:uppercase;letter-spacing:0.04em;padding-top:2px}
.dlg-tokens{display:flex;gap:16px;font-size:12px;color:var(--text2);margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}

/* ── Beam Visualization ──────────────────────────────────── */
.beam-container{margin-top:12px;padding:12px;background:var(--purple-soft);border:1px solid rgba(139,92,246,0.15);border-radius:var(--radius)}
.beam-label{font-size:11px;font-weight:600;color:var(--purple);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px}
.beam-variants{display:flex;gap:8px;flex-wrap:wrap}
.beam-variant{
  flex:1;min-width:80px;padding:8px 12px;background:var(--surface);
  border:1px solid var(--border);border-radius:var(--radius-sm);
  text-align:center;font-size:12px;transition:all 0.2s;
}
.beam-variant.winner{border-color:var(--green);background:rgba(16,185,129,0.06)}
.beam-variant .bv-score{font-size:16px;font-weight:700;font-family:var(--mono)}
.beam-variant .bv-label{font-size:10px;color:var(--text2);margin-top:2px}

/* ── Cross-validation ────────────────────────────────────── */
.cv-container{margin-top:12px;display:flex;gap:6px;flex-wrap:wrap}
.cv-badge{
  padding:4px 10px;border-radius:var(--radius-sm);font-size:11px;
  font-weight:500;font-family:var(--mono);
}

/* ── Playground ──────────────────────────────────────────── */
.pg-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:900px){.pg-grid{grid-template-columns:1fr}}
textarea.pg-input{
  font-family:var(--mono);font-size:13px;resize:vertical;
  width:100%;line-height:1.6;min-height:300px;
}
.sc-total{
  font-weight:700;font-size:20px;padding:16px;
  background:var(--surface);border-radius:var(--radius);margin-bottom:14px;
  display:flex;justify-content:space-between;align-items:center;
}
.sc-row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid var(--border)}
.sc-row:last-child{border-bottom:none}
.sc-name{flex:1;font-weight:500;font-size:13px}
.sc-score{font-family:var(--mono);min-width:60px;text-align:right;font-size:13px}
.sc-reasoning{padding:2px 14px 10px;font-size:12px;color:var(--text2);font-style:italic;line-height:1.6}
.sc-checks{padding:2px 14px 8px;font-size:12px;color:var(--text2)}

/* ── Docs Panel ──────────────────────────────────────────── */
.docs-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;opacity:0;pointer-events:none;transition:opacity 0.3s;backdrop-filter:blur(4px)}
.docs-overlay.open{opacity:1;pointer-events:auto}
.docs-panel{
  position:fixed;top:0;right:0;bottom:0;width:500px;max-width:92vw;
  background:var(--surface);border-left:1px solid var(--border);z-index:101;
  transform:translateX(100%);transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);
  display:flex;flex-direction:column;
}
.docs-panel.open{transform:translateX(0)}
.docs-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);flex-shrink:0}
.docs-header h2{font-size:15px;font-weight:600}
.docs-nav{display:flex;gap:2px;padding:8px 12px;border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto;scrollbar-width:none}
.docs-nav::-webkit-scrollbar{display:none}
.docs-nav button{background:transparent;color:var(--text2);padding:5px 10px;font-size:12px;white-space:nowrap;border-radius:4px;border:none;cursor:pointer;transition:all var(--transition)}
.docs-nav button.active{background:var(--purple-soft);color:var(--accent)}
.docs-body{flex:1;overflow-y:auto;padding:24px;font-size:13px;line-height:1.8}
.docs-body h1{font-size:20px;font-weight:700;margin:0 0 12px;color:var(--text)}
.docs-body h2{font-size:15px;font-weight:600;margin:24px 0 8px;color:var(--text);border-bottom:1px solid var(--border);padding-bottom:6px}
.docs-body h3{font-size:13px;font-weight:600;margin:16px 0 6px;color:var(--text)}
.docs-body p{margin:8px 0;color:var(--text2)}
.docs-body ul,.docs-body ol{margin:8px 0;padding-left:20px;color:var(--text2)}
.docs-body li{margin:4px 0}
.docs-body code{background:var(--surface2);padding:2px 6px;border-radius:3px;font-size:12px;font-family:var(--mono)}
.docs-body pre{background:var(--surface2);border-radius:var(--radius-sm);padding:14px;overflow-x:auto;font-size:11px;line-height:1.6;margin:8px 0}
.docs-body pre code{background:none;padding:0}
.docs-body table{width:100%;border-collapse:collapse;font-size:12px;margin:8px 0}
.docs-body table th{text-align:left;color:var(--text2);font-weight:500;padding:6px 8px;border-bottom:1px solid var(--border)}
.docs-body table td{padding:6px 8px;border-bottom:1px solid var(--border);color:var(--text2)}
.docs-body strong{color:var(--text);font-weight:600}
.docs-body .tip{background:var(--purple-soft);border:1px solid rgba(139,92,246,0.15);border-radius:var(--radius-sm);padding:10px 14px;margin:12px 0;font-size:12px}
.docs-search{padding:8px 12px;border-bottom:1px solid var(--border);flex-shrink:0}
.docs-search input{width:100%;padding:8px 12px;font-size:12px}

/* ── Save animation ──────────────────────────────────────── */
.save-success{animation:success-pop 0.4s ease;color:var(--green);display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500}
.save-error{color:var(--red);font-size:13px;font-weight:500}

/* ── Skeleton ────────────────────────────────────────────── */
.skeleton{
  background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);
  background-size:200% 100%;animation:shimmer 1.5s infinite;
  border-radius:var(--radius-sm);
}

/* ── Warning Box ─────────────────────────────────────────── */
.warning-box{background:var(--yellow-soft);border:1px solid rgba(245,158,11,0.2);border-radius:var(--radius);padding:14px 16px;margin:12px 0}
.warning-box .title{font-weight:600;color:var(--yellow);margin-bottom:6px;font-size:13px}

/* ── Artifact Grid ───────────────────────────────────────── */
.artifact-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin:16px 0}

/* ── Responsive ──────────────────────────────────────────── */
@media(max-width:640px){
  .container{padding:0 16px}
  .stat-grid{grid-template-columns:1fr 1fr}
  .artifact-grid{grid-template-columns:1fr}
  .settings-grid{grid-template-columns:1fr}
  .flow-steps{flex-direction:column}
  .flow-step:not(:last-child)::after{display:none}
  .flow-step{border-radius:var(--radius-sm)!important}
}
</style>
</head>
<body>
<div id="app"></div>
<script type="module">
import{h,render,Fragment}from'preact';
import{useState,useEffect,useCallback,useRef,useMemo}from'preact/hooks';
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
const fmtDate=(s)=>{
  if(!s)return '--';
  const d=new Date(s);
  const now=new Date();
  const diff=now-d;
  if(diff<60000)return 'just now';
  if(diff<3600000)return Math.floor(diff/60000)+'m ago';
  if(diff<86400000)return Math.floor(diff/3600000)+'h ago';
  return d.toLocaleDateString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
};
const pct=(n,d)=>d>0?Math.round(n/d*100):0;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));

// ── SVG Icons (inline) ─────────────────────────────────────────────
const Icons={
  beaker:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3M9 3v4.5A4.5 4.5 0 0 0 9 12v0a4.5 4.5 0 0 0 0 4.5V21"/></svg>\`,
  dna:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6"/></svg>\`,
  zap:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>\`,
  target:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>\`,
  settings:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>\`,
  shield:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>\`,
  refresh:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>\`,
  dollar:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>\`,
  play:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>\`,
  pause:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>\`,
  check:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>\`,
  x:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\`,
  plus:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>\`,
  spark:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2L9.5 8.5 3 10l5 4.5L6.5 21 12 17.5 17.5 21 16 14.5 21 10l-6.5-1.5z"/></svg>\`,
  book:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>\`,
  activity:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>\`,
  layers:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>\`,
  terminal:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>\`,
  clock:html\`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>\`,
};

// ── Progress Ring Component ─────────────────────────────────────────
function ProgressRing({value=0,max=100,size=64,color='var(--green)'}){
  const pctVal=max>0?clamp(value/max*100,0,100):0;
  const r=26;const circ=2*Math.PI*r;
  const offset=circ-(pctVal/100)*circ;
  return html\`<div class="progress-ring" style="width:\${size}px;height:\${size}px">
    <svg width=\${size} height=\${size} viewBox="0 0 60 60">
      <circle class="ring-bg" cx="30" cy="30" r=\${r} stroke-width="5"/>
      <circle class="ring-fill" cx="30" cy="30" r=\${r} stroke=\${color}
        stroke-dasharray=\${circ} stroke-dashoffset=\${offset}
        style="--ring-offset:\${offset}"/>
    </svg>
    <span class="ring-text" style="color:\${color}">\${Math.round(pctVal)}</span>
  </div>\`;
}

// ── Sparkline Component ─────────────────────────────────────────────
function Sparkline({data=[],width=120,height=32,color='var(--accent)'}){
  if(data.length<2)return html\`<span style="color:var(--text3);font-size:11px">--</span>\`;
  const min=Math.min(...data),max=Math.max(...data);
  const range=max-min||1;
  const pts=data.map((v,i)=>{
    const x=(i/(data.length-1))*width;
    const y=height-((v-min)/range)*(height-4)-2;
    return x+','+y;
  }).join(' ');
  const gradId='sp'+Math.random().toString(36).slice(2,8);
  const areaPath='M0,'+height+' L'+data.map((v,i)=>{
    const x=(i/(data.length-1))*width;
    const y=height-((v-min)/range)*(height-4)-2;
    return x+','+y;
  }).join(' L')+' L'+width+','+height+' Z';
  return html\`<svg class="sparkline" width=\${width} height=\${height} viewBox="0 0 \${width} \${height}">
    <defs><linearGradient id=\${gradId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color=\${color} stop-opacity="0.3"/><stop offset="100%" stop-color=\${color} stop-opacity="0"/></linearGradient></defs>
    <path d=\${areaPath} fill="url(#\${gradId})"/>
    <polyline points=\${pts} fill="none" stroke=\${color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>\`;
}

// ── Toggle Component ────────────────────────────────────────────────
function Toggle({checked,onChange,disabled}){
  return html\`<label class="toggle">
    <input type="checkbox" checked=\${checked} onChange=\${e=>onChange(e.target.checked)} disabled=\${disabled}/>
    <span class="toggle-track"></span>
  </label>\`;
}

// ── SVG Line Chart ──────────────────────────────────────────────────
function LineChart({series,width=600,height=220}){
  if(!series||series.length===0)return html\`<div class="empty" style="padding:24px">No data available</div>\`;
  const pad={t:24,r:24,b:32,l:52};
  const w=width-pad.l-pad.r,ch=height-pad.t-pad.b;
  const colors=['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4'];
  let allY=[];
  for(const s of series)for(const p of s.data)allY.push(p.y);
  if(allY.length===0)return html\`<div class="empty" style="padding:24px">No data points</div>\`;
  const minY=Math.min(...allY),maxY=Math.max(...allY);
  const rangeY=maxY-minY||1;
  const maxLen=Math.max(...series.map(s=>s.data.length));

  const toX=(i,len)=>pad.l+(len>1?i/(len-1)*w:w/2);
  const toY=(v)=>pad.t+ch-(v-minY)/rangeY*ch;

  const gridLines=4;
  const grids=[];
  for(let i=0;i<=gridLines;i++){
    const y=pad.t+ch/gridLines*i;
    const val=maxY-(maxY-minY)/gridLines*i;
    grids.push(html\`<line x1=\${pad.l} y1=\${y} x2=\${pad.l+w} y2=\${y} stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <text x=\${pad.l-10} y=\${y+4} text-anchor="end" fill="var(--text3)" font-size="10" font-family="var(--mono)">\${Math.round(val)}</text>\`);
  }

  return html\`<div>
    <svg viewBox="0 0 \${width} \${height}" width="100%" style="max-width:\${width}px">
    <defs>
      \${series.map((s,si)=>html\`<linearGradient id="cg\${si}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color=\${colors[si%colors.length]} stop-opacity="0.2"/>
        <stop offset="100%" stop-color=\${colors[si%colors.length]} stop-opacity="0"/>
      </linearGradient>\`)}
    </defs>
    \${grids}
    \${series.map((s,si)=>{
      const color=colors[si%colors.length];
      const pts=s.data.map((p,i)=>[toX(i,s.data.length),toY(p.y)]);
      const line=pts.map(p=>p.join(',')).join(' ');
      const area='M'+pad.l+','+toY(minY)+' L'+pts.map(p=>p.join(',')).join(' L')+' L'+(pts.length>0?pts[pts.length-1][0]:pad.l)+','+toY(minY)+' Z';
      return html\`<\${Fragment}>
        <path d=\${area} fill="url(#cg\${si})"/>
        <polyline points=\${line} fill="none" stroke=\${color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        \${s.data.length<=30?s.data.map((p,i)=>html\`<circle cx=\${toX(i,s.data.length)} cy=\${toY(p.y)} r="3" fill=\${color} opacity="0.7"><title>\${s.name}: \${p.y}</title></circle>\`):null}
      </\${Fragment}>\`;
    })}
    </svg>
    \${series.length>1?html\`<div style="display:flex;flex-wrap:wrap;gap:8px 16px;padding:10px 0 0 \${pad.l}px;font-size:11px">
      \${series.map((s,i)=>html\`<span style="display:flex;align-items:center;gap:6px">
        <span style="width:10px;height:3px;border-radius:2px;background:\${colors[i%colors.length]};flex-shrink:0"></span>
        <span style="color:var(--text2)">\${s.name}</span>
      </span>\`)}
    </div>\`:null}
  </div>\`;
}

// ── Dialogue Detail Component ───────────────────────────────────────
function DialogueDetail({trace}){
  if(!trace)return html\`<div class="dlg-detail">
    <div style="text-align:center;padding:16px;color:var(--text2)">
      <div style="font-size:13px">Single-call mutation (no dialogue trace)</div>
    </div>
  </div>\`;
  const t=trace;
  return html\`<div class="dlg-detail">
    <div class="flow-steps mb">
      <div class="flow-step active"><div class="step-label">Step 1</div><div class="step-title">Explore</div></div>
      <div class="flow-step active"><div class="step-label">Step 2</div><div class="step-title">Critique</div></div>
      <div class="flow-step active"><div class="step-label">Step 3</div><div class="step-title">Specify</div></div>
      <div class="flow-step \${t.rounds_completed>=4?'active':''}"><div class="step-label">Step 4</div><div class="step-title">Generate</div></div>
    </div>

    <div class="dlg-section">
      <h5>Explore -- \${t.explore_candidates.length} Candidates</h5>
      \${t.explore_candidates.map((c,i)=>html\`<div class="dlg-candidate \${c.mutation_type===t.selected_candidate.mutation_type&&c.target===t.selected_candidate.target?'selected':''}">
        <span class="dlg-type">[\${c.mutation_type}]</span>
        <span style="font-weight:500">\${c.target}</span>
        <span class="badge \${c.regression_risk}" style="margin-left:8px">\${c.regression_risk} risk</span>
        <div style="color:var(--text2);margin-top:4px;font-size:12px;line-height:1.5">\${c.rationale}</div>
      </div>\`)}
    </div>

    <div class="dlg-section">
      <h5>Critique -- Selection Reasoning</h5>
      <div class="dlg-reasoning">\${t.critique_reasoning}</div>
    </div>

    <div class="dlg-section">
      <h5>Specification</h5>
      <div class="dlg-spec" style="background:var(--surface2);padding:14px;border-radius:var(--radius-sm)">
        <span class="dlg-spec-label">Type</span><span style="font-family:var(--mono);font-size:12px">\${t.selected_candidate.mutation_type}</span>
        <span class="dlg-spec-label">Target</span><span>\${t.selected_candidate.target}</span>
        <span class="dlg-spec-label">Change</span><span>\${t.specification}</span>
      </div>
    </div>

    <div class="dlg-tokens">
      <span>Rounds: \${t.rounds_completed}/4</span>
      <span>Input: \${(t.total_input_tokens||0).toLocaleString()} tokens</span>
      <span>Output: \${(t.total_output_tokens||0).toLocaleString()} tokens</span>
    </div>

    \${t.beam_variants_count > 1 ? html\`
      <div class="beam-container">
        <div class="beam-label">Beam Search -- \${t.beam_variants_count} Variants</div>
        <div class="beam-variants">
          \${Array.from({length:t.beam_variants_count},(_,i)=>html\`
            <div class="beam-variant \${i===(t.selected_variant_index??0)?'winner':''}">
              <div class="bv-label">Variant \${i+1}</div>
              <div class="bv-score">\${i===(t.selected_variant_index??0)?'Winner':'--'}</div>
            </div>
          \`)}
        </div>
      </div>
    \` : ''}

    \${t.cross_validation_scores?.length > 0 ? html\`
      <div style="margin-top:12px">
        <h5 style="font-size:11px;color:var(--accent);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;font-weight:600">Cross-Validation</h5>
        <div class="cv-container">
          \${t.cross_validation_scores.map(cv => html\`
            <span class="cv-badge" style="background:\${cv.regressed?'var(--red-soft)':'var(--green-soft)'};color:\${cv.regressed?'var(--red)':'var(--green)'}">
              \${cv.challengeId || cv.challenge_id}: \${cv.score}/\${cv.max_score} \${cv.regressed ? '(regressed)' : ''}
            </span>
          \`)}
        </div>
      </div>
    \` : ''}
  </div>\`;
}

// ── Expandable Mutation Table ────────────────────────────────────────
function MutationTable({entries,showArtifact,compact}){
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

  if(!entries||entries.length===0)return html\`<div class="empty">
    <div class="empty-icon">...</div>
    <div>No mutations yet</div>
    <div style="font-size:12px;margin-top:4px;color:var(--text3)">Run an evolution cycle to see results here</div>
  </div>\`;

  const cols=showArtifact?6:5;
  return html\`<div style="overflow-x:auto"><table>
    <tr><th>Gen</th>\${showArtifact?html\`<th>Artifact</th>\`:null}<th>Mutation</th><th>Score</th><th>Status</th><th>Time</th></tr>
    \${entries.map(e=>html\`<\${Fragment}>
      <tr class="clickable \${expanded===e.genid?'expanded':''}" onclick=\${()=>toggle(e.genid)}>
        <td style="font-family:var(--mono);font-size:12px;color:var(--text2)">\${e.genid}</td>
        \${showArtifact?html\`<td style="font-weight:500">\${e.artifact}</td>\`:null}
        <td>
          <span style="font-family:var(--mono);font-size:12px">\${e.mutation_type}</span>
          \${e.challenge ? html\`<span class="badge purple" style="margin-left:6px">\${e.challenge}</span>\` : ''}
        </td>
        <td style="font-family:var(--mono)">\${e.score!==null?\`\${e.score}/\${e.max_score}\`:'--'}</td>
        <td><span class="badge \${e.status}">\${e.status}</span></td>
        <td style="color:var(--text2);font-size:12px">\${fmtDate(e.timestamp)}</td>
      </tr>
      \${expanded===e.genid?html\`<tr><td colspan="\${cols}" style="padding:0 14px 14px">
        <\${DialogueDetail} trace=\${detail}/>
      </td></tr>\`:null}
    </\${Fragment}>\`)}
  </table></div>\`;
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
    \${pending.length>0?html\`<div class="panel mt" style="border-color:rgba(239,68,68,0.2)">
      <div class="panel-header">
        <span class="panel-title" style="color:var(--red)"><span class="icon" style="color:var(--red)">\${Icons.zap}</span> Pending Failures (\${pending.length})</span>
      </div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:10px">Real production errors queued for evolution. These feed into the next mutation cycle.</div>
      <div style="overflow-x:auto"><table>
        <tr><th>Agent</th><th>Category</th><th>Error</th></tr>
        \${pending.map(p=>html\`<tr>
          <td style="font-weight:600">\${p.artifactId||'unknown'}</td>
          <td><span class="badge regression">\${p.category||'UNKNOWN'}</span></td>
          <td style="max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--text2)" title=\${p.error||''}>\${(p.error||'No description').slice(0,120)}</td>
        </tr>\`)}
      </table></div>
    </div>\`:null}

    \${scans.length>0?html\`<div class="panel mt" style="border-color:rgba(59,130,246,0.2)">
      <div class="panel-header">
        <span class="panel-title"><span class="icon">\${Icons.target}</span> Agent Scans (\${scans.length})</span>
      </div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:10px">Structural analysis from kultiv scan. Recommendations feed into evolution automatically.</div>
      \${scans.map(s=>html\`<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;cursor:pointer" onclick=\${()=>setExpandedScan(expandedScan===s.artifactId?null:s.artifactId)}>
          <span style="font-weight:600">\${s.artifactId}</span>
          <span class="badge baseline">\${s.domain}</span>
          <span style="font-size:11px;color:var(--text3);margin-left:auto">\${s.hasExamples?'examples':'no examples'} | \${s.hasDecisionTrees?'decision trees':'--'}</span>
        </div>
        <div style="font-size:12px;color:var(--text2);margin:4px 0">\${s.purpose}</div>
        \${expandedScan===s.artifactId&&s.recommendations?.length>0?html\`<div style="margin-top:8px">
          \${s.recommendations.map(r=>html\`<div style="font-size:12px;margin:4px 0;padding:6px 10px;border-left:2px solid \${r.priority==='high'?'var(--red)':r.priority==='medium'?'var(--yellow)':'var(--text3)'}">
            <span style="font-weight:600;color:\${r.priority==='high'?'var(--red)':'var(--yellow)'}">\${r.type}</span> \${r.target} -- <span style="color:var(--text2)">\${r.rationale}</span>
          </div>\`)}
        </div>\`:null}
      </div>\`)}
    </div>\`:null}

    \${needsAttention.length>0?html\`<div class="panel mt" style="border-color:rgba(245,158,11,0.2)">
      <div class="panel-header">
        <span class="panel-title" style="color:var(--yellow)"><span class="icon" style="color:var(--yellow)">\${Icons.activity}</span> Improvement Suggestions</span>
      </div>
      \${needsAttention.map(i=>html\`<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-weight:600">\${i.artifact}</span>
          <span style="font-family:var(--mono);font-size:12px;color:var(--text2)">\${i.current_score}/\${i.max_score}</span>
          \${i.is_plateaued?html\`<span class="badge regression">PLATEAUED</span>\`:null}
        </div>
        \${i.weak_criteria.length>0?html\`<div style="overflow-x:auto"><table style="font-size:12px">
          <tr><th>Criterion</th><th>Score</th><th>Max</th><th>%</th><th>Gap</th></tr>
          \${i.weak_criteria.map(c=>html\`<tr>
            <td>\${c.name}</td>
            <td style="color:\${c.pct<50?'var(--red)':'var(--yellow)'};\${c.pct<50?'font-weight:600':''}">\${c.score}</td>
            <td>\${c.max}</td>
            <td>\${c.pct}%</td>
            <td style="color:var(--green)">+\${c.gap}</td>
          </tr>\`)}
        </table></div>\`:null}
        \${i.weak_criteria.length>0?html\`<div style="margin-top:8px;font-size:11px;color:var(--text2)">
          Improvement potential: <span style="color:var(--green);font-weight:600">+\${i.weak_criteria.reduce((s,c)=>s+c.gap,0)} points</span> across \${i.weak_criteria.length} criteria
        </div>\`:null}
      </div>\`)}
    </div>\`:null}

    \${recentSuccesses.length>0?html\`<div class="panel mt" style="border-color:rgba(16,185,129,0.2)">
      <div class="panel-header">
        <span class="panel-title" style="color:var(--green)"><span class="icon" style="color:var(--green)">\${Icons.check}</span> Recent Improvements</span>
      </div>
      <div style="overflow-x:auto"><table style="font-size:12px">
        <tr><th>Agent</th><th>Score</th><th>Mutation</th><th>When</th></tr>
        \${recentSuccesses.map(i=>html\`<tr>
          <td style="font-weight:500">\${i.artifact}</td>
          <td style="color:var(--green);font-family:var(--mono)">\${i.last_success.score}/\${i.max_score}</td>
          <td><span class="badge success">\${i.last_success.mutation_type}</span></td>
          <td style="color:var(--text2)">\${fmtDate(i.last_success.timestamp)}</td>
        </tr>\`)}
      </table></div>
    </div>\`:null}

    \${reports&&reports.length>0?html\`<div class="panel mt">
      <div class="panel-header"><span class="panel-title"><span class="icon">\${Icons.book}</span> Reports</span></div>
      \${reports.map(r=>html\`<div style="margin:6px 0">
        <span style="color:var(--blue);cursor:pointer;font-size:13px" onclick=\${()=>showReport(r.file)}>\${r.artifact} -- \${r.timestamp||r.file}</span>
      </div>\`)}
      \${reportContent?html\`<pre style="margin-top:8px;white-space:pre-wrap;font-size:11px">\${reportContent.content}</pre>\`:null}
    </div>\`:null}
  </div>\`;
}

// ── Overview Tab ─────────────────────────────────────────────────────
function Overview(){
  const[status,setStatus]=useState(null);
  const[archive,setArchive]=useState([]);
  const[config,setConfig]=useState(null);
  const load=useCallback(async()=>{
    const[s,a,cfg]=await Promise.all([api('status'),api('archive?limit=50'),api('config')]);
    if(!s.error)setStatus(s);
    if(!a.error)setArchive(a);
    if(!cfg.error)setConfig(cfg);
  },[]);
  useEffect(()=>{load();const t=setInterval(load,10000);return()=>clearInterval(t)},[load]);

  if(!status)return html\`<div class="empty" style="padding:80px 24px">
    <div style="width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>
    <div>Loading dashboard...</div>
  </div>\`;

  if(!status.initialized)return html\`<div class="empty" style="padding:80px 24px">
    <div style="font-size:42px;margin-bottom:16px;opacity:0.2">...</div>
    <div style="font-size:16px;font-weight:600;margin-bottom:8px">No Kultiv project found</div>
    <div style="max-width:400px;margin:0 auto;color:var(--text2)">Run <code style="background:var(--surface);padding:2px 8px;border-radius:4px;font-family:var(--mono)">kultiv init</code> in your project directory to get started.</div>
  </div>\`;

  const recent=(archive||[]).slice(0,10);
  // Build score-over-time series per artifact
  const byArt={};
  for(const e of[...(archive||[])].reverse()){
    if(e.score===null)continue;
    if(!byArt[e.artifact])byArt[e.artifact]=[];
    byArt[e.artifact].push({y:e.score});
  }
  const chartSeries=Object.entries(byArt).map(([name,data])=>({name,data}));

  // Sparkline data per artifact
  const sparkData={};
  for(const e of[...(archive||[])].reverse()){
    if(e.score===null)continue;
    if(!sparkData[e.artifact])sparkData[e.artifact]=[];
    sparkData[e.artifact].push(e.score);
  }

  const sessionLabel=status.session?.status||'idle';
  const sessionClass=sessionLabel==='running'?'live':sessionLabel==='paused'?'paused':'idle';

  return html\`<div class="tab-content">
    <div class="stat-grid stagger">
      <div class="stat-card" style="--stat-accent:var(--accent-g)">
        <div class="stat-label">Experiments</div>
        <div class="stat-value">\${status.experiment_count}</div>
        <div class="stat-sub">\${status.artifact_count} artifact\${status.artifact_count!==1?'s':''} tracked</div>
        <div class="stat-icon" style="background:var(--accent-g)">\${Icons.beaker}</div>
      </div>
      <div class="stat-card" style="--stat-accent:linear-gradient(135deg,#10b981,#34d399)">
        <div class="stat-label">Success Rate</div>
        <div class="stat-value" style="color:var(--green)">\${status.success_rate}%</div>
        <div class="stat-sub">\${status.success_count} successes / \${status.regression_count} regressions</div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#10b981,#34d399)">\${Icons.check}</div>
      </div>
      <div class="stat-card" style="--stat-accent:linear-gradient(135deg,#f59e0b,#fbbf24)">
        <div class="stat-label">Tokens Spent</div>
        <div class="stat-value">\${(status.total_tokens||0).toLocaleString()}</div>
        <div class="stat-sub">across all experiments</div>
        <div class="stat-icon" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)">\${Icons.zap}</div>
      </div>
      <div class="stat-card" style="--stat-accent:linear-gradient(135deg,#3b82f6,#60a5fa)">
        <div class="stat-label">Session</div>
        <div class="stat-value" style="font-size:18px"><span class="pulse-dot \${sessionClass}">\${sessionLabel}</span></div>
        \${status.session?html\`<div class="stat-sub">Progress: \${status.session.progress}/\${status.session.budget}</div>\`:html\`<div class="stat-sub">No active session</div>\`}
        <div class="stat-icon" style="background:linear-gradient(135deg,#3b82f6,#60a5fa)">\${Icons.activity}</div>
      </div>
    </div>

    \${config && config.evolution ? html\`
    <div class="panel anim-fade">
      <div class="panel-header">
        <span class="panel-title"><span class="icon">\${Icons.settings}</span> Evolution Config</span>
      </div>
      <div class="config-grid">
        <div class="config-item"><span class="config-label">Selection</span><span class="config-value">\${config.evolution.selection?.parent_method ?? 'greedy'}</span></div>
        <div class="config-item"><span class="config-label">Beam Width</span><span class="config-value">\${config.evolution.beam_width ?? 1}</span></div>
        <div class="config-item"><span class="config-label">Cross-validation</span><span class="config-value">\${config.evolution.cross_validation_count ?? 0}x</span></div>
        <div class="config-item"><span class="config-label">Mutation Mode</span><span class="config-value">\${config.evolution.mutation_mode ?? 'single'}</span></div>
        <div class="config-item"><span class="config-label">Outer Loop</span><span class="config-value">\${config.outer_loop?.mode ?? 'single'}</span></div>
        <div class="config-item"><span class="config-label">Budget</span><span class="config-value">\${config.evolution.budget_per_session ?? 10}</span></div>
      </div>
    </div>
    \` : ''}

    \${Object.keys(sparkData).length>0?html\`<div class="panel mt anim-fade">
      <div class="panel-header"><span class="panel-title"><span class="icon">\${Icons.activity}</span> Score Progress</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
        \${Object.entries(sparkData).map(([name,data])=>html\`<div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:var(--surface);border-radius:var(--radius-sm)">
          <div>
            <div style="font-size:13px;font-weight:500">\${name}</div>
            <div style="font-size:18px;font-weight:700;font-family:var(--mono);color:\${data[data.length-1]>=data[0]?'var(--green)':'var(--text)'}">\${data[data.length-1]}</div>
          </div>
          <div style="margin-left:auto"><\${Sparkline} data=\${data} color=\${data[data.length-1]>=data[0]?'var(--green)':'var(--accent)'}/></div>
        </div>\`)}
      </div>
    </div>\`:''}

    <\${InsightsPanel}/>

    <div class="row mt">
      <div class="col"><div class="panel">
        <div class="panel-header"><span class="panel-title"><span class="icon">\${Icons.layers}</span> Score Over Time</span></div>
        <\${LineChart} series=\${chartSeries} width=\${620} height=\${240}/>
      </div></div>
    </div>

    <div class="panel mt">
      <div class="panel-header"><span class="panel-title"><span class="icon">\${Icons.dna}</span> Recent Mutations</span></div>
      <\${MutationTable} entries=\${recent} showArtifact=\${true}/>
    </div>
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
    if(selected===id){setSelected(null);setDetail(null);return}
    setSelected(id);
    const d=await api('artifacts/'+encodeURIComponent(id));
    if(!d.error)setDetail(d);
  };

  const addArtifact=async()=>{
    if(!form.name||!form.path){setMsg('Name and path required');return}
    const r=await post('artifacts',form);
    setMsg(r.error||r.message||'Added!');
    if(!r.error){setShowForm(false);setForm({name:'',path:'',type:'prompt'});load()}
  };

  return html\`<div class="tab-content">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:18px;font-weight:600">Artifacts</h2>
      <button class="btn btn-primary btn-sm" onclick=\${()=>setShowForm(!showForm)}>
        <span style="width:14px;height:14px">\${showForm?Icons.x:Icons.plus}</span>
        \${showForm?'Cancel':'Add Artifact'}
      </button>
    </div>

    \${showForm?html\`<div class="panel mb anim-scale">
      <div style="display:flex;gap:12px;align-items:end;flex-wrap:wrap">
        <div class="form-group" style="margin:0;flex:1;min-width:140px">
          <label>Name</label>
          <input value=\${form.name} oninput=\${e=>setForm({...form,name:e.target.value})} placeholder="my-agent"/>
        </div>
        <div class="form-group" style="margin:0;flex:2;min-width:200px">
          <label>File Path</label>
          <input value=\${form.path} oninput=\${e=>setForm({...form,path:e.target.value})} placeholder="agents/my-agent.md"/>
        </div>
        <div class="form-group" style="margin:0;min-width:100px">
          <label>Type</label>
          <select value=\${form.type} onchange=\${e=>setForm({...form,type:e.target.value})}>
            <option value="prompt">prompt</option><option value="config">config</option>
            <option value="template">template</option><option value="doc">doc</option>
          </select>
        </div>
        <button class="btn btn-success" onclick=\${addArtifact}>Save</button>
      </div>
      \${msg?html\`<div style="margin-top:8px;font-size:12px;color:var(--text2)">\${msg}</div>\`:null}
    </div>\`:null}

    <div class="artifact-grid stagger">
      \${(artifacts||[]).map(a=>{
        const scoreColor=a.best_score===null?'var(--text2)':pct(a.best_score,a.max_score)>=80?'var(--green)':pct(a.best_score,a.max_score)>=60?'var(--yellow)':'var(--red)';
        return html\`<div class="glass-card" style="cursor:pointer;\${selected===a.id?'border-color:rgba(139,92,246,0.3)':''}" onclick=\${()=>selectArt(a.id)}>
          <div style="display:flex;align-items:start;gap:14px">
            <\${ProgressRing} value=\${a.best_score||0} max=\${a.max_score||100} size=\${56} color=\${scoreColor}/>
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:600;margin-bottom:2px">\${a.id}</div>
              <div style="font-size:11px;color:var(--text2)">\${a.type} -- \${a.path}</div>
              <div style="display:flex;gap:12px;margin-top:8px;font-size:12px">
                <span style="color:var(--text2)">\${a.mutations} mutations</span>
                <span style="color:var(--green)">\${a.success_rate}% success</span>
              </div>
            </div>
          </div>
        </div>\`;
      })}
    </div>

    \${!artifacts||artifacts.length===0?html\`<div class="empty">
      <div style="font-size:42px;margin-bottom:12px;opacity:0.15">...</div>
      <div style="font-size:15px;font-weight:500;margin-bottom:6px">No artifacts registered</div>
      <div style="color:var(--text3);max-width:360px;margin:0 auto">Add an artifact to start evolving your AI agent prompts.</div>
    </div>\`:null}

    \${detail?html\`<div class="panel mt anim-fade">
      <div class="panel-header">
        <span class="panel-title">\${selected}</span>
      </div>
      <div class="row">
        <div class="col">
          <h4 style="font-size:13px;font-weight:600;margin-bottom:12px">Score History</h4>
          <\${LineChart} series=\${[{name:selected,data:(detail.score_history||[]).map(s=>({y:typeof s==='object'?s.score:s}))}]} width=\${540} height=\${200}/>
        </div>
        <div class="col">
          <h4 style="font-size:13px;font-weight:600;margin-bottom:12px">Recent Mutations</h4>
          <\${MutationTable} entries=\${detail.recent_mutations||[]} showArtifact=\${false}/>
        </div>
      </div>
    </div>\`:null}
  </div>\`;
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
    const a=await api('archive?limit=30');
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

  const sessionLabel=status?.session?.status||'idle';

  return html\`<div class="tab-content">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <h2 style="font-size:18px;font-weight:600">Evolution</h2>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-success btn-sm" onclick=\${doBaseline}><span style="width:14px;height:14px">\${Icons.target}</span> Baseline</button>
        <div style="display:flex;align-items:center;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:2px 8px">
          <span style="font-size:11px;color:var(--text2)">Budget</span>
          <input type="number" value=\${budget} min=1 oninput=\${e=>setBudget(parseInt(e.target.value)||1)} style="width:52px;border:none;background:transparent;padding:4px;text-align:center;font-family:var(--mono)"/>
        </div>
        <input placeholder="artifact (all)" value=\${artifact} oninput=\${e=>setArtifact(e.target.value)} style="width:130px;font-size:12px"/>
        <button class="btn btn-primary btn-sm" onclick=\${doEvolve}><span style="width:14px;height:14px">\${Icons.play}</span> Evolve</button>
        <button class="btn btn-secondary btn-sm" onclick=\${doPause} style="color:var(--yellow)"><span style="width:14px;height:14px">\${Icons.pause}</span> Pause</button>
        <button class="btn btn-secondary btn-sm" onclick=\${doResume}><span style="width:14px;height:14px">\${Icons.play}</span> Resume</button>
      </div>
    </div>
    \${msg?html\`<div style="font-size:12px;color:var(--text2);margin-bottom:12px;padding:6px 12px;background:var(--surface2);border-radius:var(--radius-sm)">\${msg}</div>\`:null}

    \${status?html\`<div class="stat-grid stagger" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card">
        <div class="stat-label">Session</div>
        <div class="stat-value" style="font-size:18px"><span class="pulse-dot \${sessionLabel==='running'?'live':sessionLabel==='paused'?'paused':'idle'}">\${sessionLabel}</span></div>
        \${status.session?html\`<div class="stat-sub">Progress: \${status.session.progress}/\${status.session.budget}</div>\`:null}
      </div>
      <div class="stat-card">
        <div class="stat-label">Experiments</div>
        <div class="stat-value">\${status.experiment_count}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Success Rate</div>
        <div class="stat-value" style="color:var(--green)">\${status.success_rate}%</div>
      </div>
    </div>\`:null}

    \${patterns.length>0?html\`<div class="warning-box">
      <div class="title">Anti-Pattern Warnings (\${patterns.length})</div>
      \${patterns.map(p=>html\`<div style="margin:6px 0;font-size:13px">
        <span class="badge \${p.severity}">\${p.severity}</span>
        <strong style="margin:0 4px">\${p.type}</strong> on <span style="font-weight:500">\${p.artifact}</span>: \${p.message}
        <div style="color:var(--text2);font-size:12px;margin-top:2px;padding-left:24px">\${p.suggestion}</div>
      </div>\`)}
    </div>\`:null}

    <div class="panel mt">
      <div class="panel-header"><span class="panel-title"><span class="icon">\${Icons.dna}</span> Mutation Log</span></div>
      <\${MutationTable} entries=\${log||[]} showArtifact=\${true}/>
    </div>
  </div>\`;
}

// ── Challenges Tab ──────────────────────────────────────────────────
function Challenges(){
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[generating,setGenerating]=useState(false);
  const[genMsg,setGenMsg]=useState(null);

  const load=useCallback(async()=>{
    setLoading(true);
    const d=await api('challenges');
    if(!d.error)setData(d);
    setLoading(false);
  },[]);
  useEffect(()=>{load()},[load]);

  const generateNew=async(artifactId)=>{
    setGenerating(true);setGenMsg(null);
    // The server may not have this endpoint yet; we attempt and handle gracefully
    const r=await post('challenges/generate',{artifact:artifactId});
    if(r.error){
      setGenMsg({ok:false,text:r.error.includes('404')?'Challenge generation endpoint not available. Run "kultiv challenges --generate" from CLI.':r.error});
    }else{
      setGenMsg({ok:true,text:'Challenges generated!'});
      load();
    }
    setGenerating(false);
  };

  if(loading)return html\`<div class="tab-content"><div class="empty" style="padding:80px">
    <div style="width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>
    Loading challenges...
  </div></div>\`;

  const allChallenges=data||[];
  const hasAnyChallenges=allChallenges.some(a=>a.challenges?.length>0);

  return html\`<div class="tab-content">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
      <h2 style="font-size:18px;font-weight:600">Challenges</h2>
      \${genMsg?html\`<span class=\${genMsg.ok?'save-success':'save-error'}>\${genMsg.text}</span>\`:null}
    </div>

    \${!hasAnyChallenges?html\`<div class="glass-card" style="text-align:center;padding:60px 24px;max-width:520px;margin:40px auto">
      <div style="width:56px;height:56px;border-radius:16px;background:var(--purple-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
        <span style="width:28px;height:28px;color:var(--accent)">\${Icons.target}</span>
      </div>
      <div style="font-size:18px;font-weight:600;margin-bottom:8px">No challenges yet</div>
      <div style="font-size:13px;color:var(--text2);max-width:380px;margin:0 auto 24px;line-height:1.6">
        Challenges test your artifacts against specific scenarios. Generate them automatically using LLM analysis of your weak criteria.
      </div>
      \${allChallenges.length>0?html\`<div style="display:flex;flex-direction:column;gap:8px;align-items:center">
        \${allChallenges.map(a=>html\`<button class="btn btn-primary" onclick=\${()=>generateNew(a.artifact)} disabled=\${generating}>
          <span style="width:16px;height:16px">\${Icons.spark}</span>
          Generate for \${a.artifact}
        </button>\`)}
      </div>\`:html\`<div style="font-size:12px;color:var(--text3)">Add artifacts first, then generate challenges.</div>\`}
    </div>\`:null}

    \${allChallenges.filter(a=>a.challenges?.length>0).map(a=>html\`<div class="mb">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <h3 style="font-size:15px;font-weight:600">\${a.artifact}</h3>
        <span class="badge baseline">\${a.challenges.length} challenge\${a.challenges.length!==1?'s':''}</span>
        <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick=\${()=>generateNew(a.artifact)} disabled=\${generating}>
          <span style="width:14px;height:14px">\${Icons.spark}</span>
          Generate More
        </button>
      </div>
      <div class="challenge-grid stagger">
        \${a.challenges.map(ch=>html\`<div class="challenge-card">
          <div class="challenge-header">
            <span class="challenge-name">\${ch.name||ch.id}</span>
            <div class="difficulty-dots" title="Difficulty: \${ch.difficulty||'?'}/10">
              \${Array.from({length:10},(_,i)=>html\`<span class="difficulty-dot \${i<(ch.difficulty||0)?'filled':''}"></span>\`)}
            </div>
          </div>
          <div class="challenge-desc">\${ch.description||'No description'}</div>
          <div class="challenge-meta">
            \${ch.times_attempted!=null?html\`<span>Attempted: \${ch.times_attempted}x</span>\`:null}
            \${ch.avg_score!=null?html\`<span>Avg: \${ch.avg_score}</span>\`:null}
          </div>
          \${ch.tags?.length>0?html\`<div class="challenge-tags">
            \${ch.tags.map(t=>html\`<span class="challenge-tag">\${t}</span>\`)}
          </div>\`:null}
        </div>\`)}
      </div>
    </div>\`)}
  </div>\`;
}

// ── Engine Settings Tab ─────────────────────────────────────────────
function EngineSettings(){
  const[loading,setLoading]=useState(true);
  // LLM
  const[provider,setProvider]=useState('anthropic');
  const[authMode,setAuthMode]=useState('api_key');
  const[apiKey,setApiKey]=useState('');
  const[oauthToken,setOauthToken]=useState('');
  const[model,setModel]=useState('');
  const[baseUrl,setBaseUrl]=useState('');
  // Evolution / Mutation Engine
  const[mutationMode,setMutationMode]=useState('dialogue');
  const[beamWidth,setBeamWidth]=useState(3);
  const[budgetPerSession,setBudgetPerSession]=useState(10);
  // Selection
  const[parentMethod,setParentMethod]=useState('tournament');
  const[parentTemp,setParentTemp]=useState(2.0);
  const[challengeMethod,setChallengeMethod]=useState('curriculum');
  // Guards
  const[crossValCount,setCrossValCount]=useState(2);
  const[semanticGuard,setSemanticGuard]=useState(true);
  // Feedback
  const[feedbackInterval,setFeedbackInterval]=useState(3);
  const[llmReflection,setLlmReflection]=useState(true);
  const[llmReflectionInterval,setLlmReflectionInterval]=useState(6);
  const[outerMode,setOuterMode]=useState('dialogue');
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
  const[openBrowserSetting,setOpenBrowserSetting]=useState(true);
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
        if(d.evolution.mutation_mode)setMutationMode(d.evolution.mutation_mode);
        if(d.evolution.beam_width!=null)setBeamWidth(d.evolution.beam_width);
        if(d.evolution.cross_validation_count!=null)setCrossValCount(d.evolution.cross_validation_count);
        if(d.evolution.plateau_window!=null)setPlateauWindow(d.evolution.plateau_window);
        if(d.evolution.selection){
          if(d.evolution.selection.parent_method)setParentMethod(d.evolution.selection.parent_method);
          if(d.evolution.selection.parent_temperature!=null)setParentTemp(d.evolution.selection.parent_temperature);
          if(d.evolution.selection.challenge_method)setChallengeMethod(d.evolution.selection.challenge_method);
        }
      }
      if(d.feedback){
        if(d.feedback.deterministic_interval!=null)setFeedbackInterval(d.feedback.deterministic_interval);
        if(d.feedback.llm_reflection_enabled!=null)setLlmReflection(d.feedback.llm_reflection_enabled);
        if(d.feedback.llm_reflection_interval!=null)setLlmReflectionInterval(d.feedback.llm_reflection_interval);
      }
      if(d.outer_loop){
        if(d.outer_loop.mode)setOuterMode(d.outer_loop.mode);
      }
      if(d.evolution?.outer_interval!=null)setOuterInterval(d.evolution.outer_interval);
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
        if(d.dashboard.open_browser!=null)setOpenBrowserSetting(d.dashboard.open_browser);
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
      evolution:{
        budget_per_session:budgetPerSession,
        mutation_mode:mutationMode,
        beam_width:beamWidth,
        cross_validation_count:crossValCount,
        plateau_window:plateauWindow,
        outer_interval:outerInterval,
        feedback_interval:feedbackInterval,
        selection:{parent_method:parentMethod,parent_temperature:parentTemp,challenge_method:challengeMethod},
      },
      feedback:{deterministic_interval:feedbackInterval,llm_reflection_enabled:llmReflection,llm_reflection_interval:llmReflectionInterval},
      outer_loop:{mode:outerMode},
      automation:{hook_mode:hookMode,daemon_mode:daemonMode,auto_commit:autoCommit,auto_push:autoPush,trigger_after:triggerAfter,cooldown_minutes:cooldownMinutes,max_regressions_before_pause:maxRegressions,daemon_schedule:daemonSchedule||undefined},
      dashboard:{port:dashPort,open_browser:openBrowserSetting}
    };
    const r=await post('config',payload);
    setSaveMsg(r.success?{ok:true,text:'Configuration saved'}:{ok:false,text:r.error||'Save failed'});
    setSaving(false);
    if(r.success)setTimeout(()=>setSaveMsg(null),4000);
  };

  // Cost estimation (rough)
  const estimateCost=useMemo(()=>{
    const baseTokens=mutationMode==='dialogue'?8000:2000;
    const beamMult=beamWidth;
    const cvMult=1+crossValCount*0.3;
    const reflectMult=llmReflection?1.2:1;
    const perIter=baseTokens*beamMult*cvMult*reflectMult;
    // Rough pricing: $3/Mtok input + $15/Mtok output ~= $0.008 per 1k tokens avg
    const costPer=perIter*0.000008;
    const sessionCost=costPer*budgetPerSession;
    return{perIter:Math.round(perIter),costPer:costPer.toFixed(4),sessionCost:sessionCost.toFixed(2),level:costPer<0.05?'cheap':costPer<0.15?'moderate':'expensive'};
  },[mutationMode,beamWidth,crossValCount,llmReflection,budgetPerSession]);

  if(loading)return html\`<div class="tab-content"><div class="empty" style="padding:80px">
    <div style="width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>
    Loading configuration...
  </div></div>\`;

  return html\`<div class="tab-content">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:8px">
      <h2 style="font-size:18px;font-weight:600">Engine Settings</h2>
      <div style="display:flex;gap:8px;align-items:center">
        \${saveMsg?html\`<span class=\${saveMsg.ok?'save-success':'save-error'}>
          \${saveMsg.ok?html\`<span style="width:16px;height:16px">\${Icons.check}</span>\`:null}
          \${saveMsg.text}
        </span>\`:null}
        <button class="btn btn-primary" onclick=\${doSave} disabled=\${saving}>
          \${saving?'Saving...':'Save Configuration'}
        </button>
      </div>
    </div>

    <div style="background:var(--yellow-soft);border:1px solid rgba(245,158,11,0.15);border-radius:var(--radius);padding:10px 14px;font-size:12px;color:var(--yellow);margin-bottom:20px;display:flex;align-items:center;gap:8px">
      <span style="width:16px;height:16px;flex-shrink:0">\${Icons.shield}</span>
      <span>API keys are stored in <code style="background:rgba(0,0,0,0.2);padding:1px 4px;border-radius:2px">.kultiv/config.yaml</code>. Ensure this file is in your .gitignore.</span>
    </div>

    <div class="settings-grid">
      <!-- LLM Provider -->
      <div class="form-section anim-fade">
        <h3><span class="icon">\${Icons.zap}</span> LLM Provider</h3>
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
            <div class="segmented">
              <button class=\${authMode==='api_key'?'active':''} onclick=\${()=>setAuthMode('api_key')}>API Key</button>
              <button class=\${authMode==='oauth_token'?'active':''} onclick=\${()=>setAuthMode('oauth_token')}>OAuth Token</button>
            </div>
          </div>
          \${authMode==='api_key'?html\`<div class="form-group">
            <label>API Key</label>
            <input type="password" value=\${apiKey} oninput=\${e=>setApiKey(e.target.value)} placeholder="sk-..." style="max-width:100%"/>
          </div>\`:html\`<div class="form-group">
            <label>OAuth Token</label>
            <input type="password" value=\${oauthToken} oninput=\${e=>setOauthToken(e.target.value)} placeholder="Token..." style="max-width:100%"/>
          </div>\`}
        \`:null}
        <div class="form-group">
          <label>Model</label>
          <input value=\${model} oninput=\${e=>setModel(e.target.value)} placeholder=\${modelPlaceholders[provider]||'model-name'} style="max-width:100%"/>
        </div>
        \${provider==='ollama'?html\`<div class="form-group">
          <label>Base URL</label>
          <input value=\${baseUrl} oninput=\${e=>setBaseUrl(e.target.value)} placeholder="http://localhost:11434" style="max-width:100%"/>
        </div>\`:null}
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
          <button class="btn btn-secondary btn-sm" onclick=\${doTest} disabled=\${testing}>
            \${testing?html\`<span style="width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--text);border-radius:50%;animation:spin 0.6s linear infinite;display:inline-block"></span>\`:'Test Connection'}
          </button>
          \${testResult?html\`<span style="font-size:12px;color:\${testResult.success?'var(--green)':'var(--red)'}">
            \${testResult.success?'Connected ('+testResult.latencyMs+'ms)':testResult.message||'Failed'}
          </span>\`:null}
        </div>
      </div>

      <!-- Mutation Engine -->
      <div class="form-section anim-fade">
        <h3><span class="icon">\${Icons.dna}</span> Mutation Engine</h3>
        <div class="form-group">
          <label>Mutation Mode</label>
          <div class="segmented">
            <button class=\${mutationMode==='dialogue'?'active':''} onclick=\${()=>setMutationMode('dialogue')}>Dialogue (4-step)</button>
            <button class=\${mutationMode==='single'?'active':''} onclick=\${()=>setMutationMode('single')}>Single Call</button>
          </div>
        </div>
        <div class="form-group">
          <label>Beam Width</label>
          <div class="range-row">
            <input type="range" min="1" max="5" value=\${beamWidth} oninput=\${e=>setBeamWidth(parseInt(e.target.value))}/>
            <span class="range-value">\${beamWidth}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">\${beamWidth===1?'No beam search (fastest)':beamWidth+' variants per mutation (beam search)'}</div>
        </div>
        <div class="form-group">
          <label>Budget Per Session</label>
          <div class="range-row">
            <input type="range" min="1" max="50" value=\${budgetPerSession} oninput=\${e=>setBudgetPerSession(parseInt(e.target.value))}/>
            <span class="range-value">\${budgetPerSession}</span>
          </div>
        </div>
      </div>

      <!-- Selection Strategy -->
      <div class="form-section anim-fade">
        <h3><span class="icon">\${Icons.target}</span> Selection Strategy</h3>
        <div class="form-group">
          <label>Parent Method</label>
          <div class="segmented">
            <button class=\${parentMethod==='tournament'?'active':''} onclick=\${()=>setParentMethod('tournament')}>Tournament</button>
            <button class=\${parentMethod==='greedy'?'active':''} onclick=\${()=>setParentMethod('greedy')}>Greedy</button>
          </div>
        </div>
        <div class="form-group">
          <label>Temperature</label>
          <div class="range-row">
            <input type="range" min="0.5" max="5" step="0.5" value=\${parentTemp} oninput=\${e=>setParentTemp(parseFloat(e.target.value))}/>
            <span class="range-value">\${parentTemp}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">Higher = more exploration, lower = more exploitation</div>
        </div>
        <div class="form-group">
          <label>Challenge Method</label>
          <div class="segmented">
            <button class=\${challengeMethod==='curriculum'?'active':''} onclick=\${()=>setChallengeMethod('curriculum')}>Curriculum</button>
            <button class=\${challengeMethod==='min_score'?'active':''} onclick=\${()=>setChallengeMethod('min_score')}>Min Score</button>
            <button class=\${challengeMethod==='round_robin'?'active':''} onclick=\${()=>setChallengeMethod('round_robin')}>Round Robin</button>
          </div>
        </div>
      </div>

      <!-- Guards & Validation -->
      <div class="form-section anim-fade">
        <h3><span class="icon">\${Icons.shield}</span> Guards & Validation</h3>
        <div class="form-row-toggle">
          <div>
            <div class="toggle-label">Semantic Diff Guard</div>
            <div class="toggle-desc">Verify mutations match their specifications</div>
          </div>
          <\${Toggle} checked=\${semanticGuard} onChange=\${setSemanticGuard}/>
        </div>
        <div class="form-group" style="margin-top:12px">
          <label>Cross-Validation Count</label>
          <div class="range-row">
            <input type="range" min="0" max="5" value=\${crossValCount} oninput=\${e=>setCrossValCount(parseInt(e.target.value))}/>
            <span class="range-value">\${crossValCount}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">\${crossValCount===0?'No cross-validation':crossValCount+' challenge(s) per mutation for regression testing'}</div>
        </div>
        <div class="form-group">
          <label>Plateau Window</label>
          <div class="range-row">
            <input type="range" min="2" max="20" value=\${plateauWindow} oninput=\${e=>setPlateauWindow(parseInt(e.target.value))}/>
            <span class="range-value">\${plateauWindow}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">Experiments without improvement before plateau detection</div>
        </div>
      </div>

      <!-- Feedback Loops -->
      <div class="form-section anim-fade">
        <h3><span class="icon">\${Icons.refresh}</span> Feedback Loops</h3>
        <div class="form-group">
          <label>Deterministic Feedback Interval</label>
          <div class="range-row">
            <input type="range" min="1" max="10" value=\${feedbackInterval} oninput=\${e=>setFeedbackInterval(parseInt(e.target.value))}/>
            <span class="range-value">\${feedbackInterval}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">Anti-pattern check every \${feedbackInterval} experiment(s)</div>
        </div>
        <div class="form-row-toggle" style="margin:12px 0">
          <div>
            <div class="toggle-label">LLM Reflection</div>
            <div class="toggle-desc">Use LLM to analyze mutation patterns</div>
          </div>
          <\${Toggle} checked=\${llmReflection} onChange=\${setLlmReflection}/>
        </div>
        \${llmReflection?html\`<div class="form-group">
          <label>Reflection Interval</label>
          <div class="range-row">
            <input type="range" min="2" max="20" value=\${llmReflectionInterval} oninput=\${e=>setLlmReflectionInterval(parseInt(e.target.value))}/>
            <span class="range-value">\${llmReflectionInterval}</span>
          </div>
        </div>\`:null}
        <div class="form-group" style="margin-top:8px">
          <label>Outer Loop Mode</label>
          <div class="segmented">
            <button class=\${outerMode==='dialogue'?'active':''} onclick=\${()=>setOuterMode('dialogue')}>Dialogue</button>
            <button class=\${outerMode==='single'?'active':''} onclick=\${()=>setOuterMode('single')}>Single</button>
          </div>
        </div>
        <div class="form-group">
          <label>Outer Loop Interval</label>
          <div class="range-row">
            <input type="range" min="3" max="30" value=\${outerInterval} oninput=\${e=>setOuterInterval(parseInt(e.target.value))}/>
            <span class="range-value">\${outerInterval}</span>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">Meta-strategy revision every \${outerInterval} experiments</div>
        </div>
      </div>

      <!-- Cost Estimator -->
      <div class="form-section anim-fade">
        <h3><span class="icon">\${Icons.dollar}</span> Cost Estimator</h3>
        <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Estimated cost per iteration with current settings</div>
        <div class="cost-amount" style="color:\${estimateCost.level==='cheap'?'var(--green)':estimateCost.level==='moderate'?'var(--yellow)':'var(--red)'}">
          ~$\${estimateCost.costPer}
          <span style="font-size:12px;font-weight:400;color:var(--text2)"> /iteration</span>
        </div>
        <div class="cost-bar">
          <div class="cost-fill" style="width:\${Math.min(100,parseFloat(estimateCost.costPer)/0.2*100)}%;background:\${estimateCost.level==='cheap'?'linear-gradient(90deg,#10b981,#34d399)':estimateCost.level==='moderate'?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#ef4444,#f87171)'}"></div>
        </div>
        <div class="cost-labels">
          <span>Cheap</span>
          <span>Full</span>
        </div>
        <div style="margin-top:12px;padding:10px;background:var(--surface);border-radius:var(--radius-sm);font-size:12px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <span style="color:var(--text2)">Tokens/iteration:</span>
            <span style="font-family:var(--mono);font-weight:500">~\${estimateCost.perIter.toLocaleString()}</span>
            <span style="color:var(--text2)">Session estimate:</span>
            <span style="font-family:var(--mono);font-weight:500">~$\${estimateCost.sessionCost}</span>
            <span style="color:var(--text2)">Budget:</span>
            <span style="font-family:var(--mono);font-weight:500">\${budgetPerSession} iterations</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Automation Section (full width) -->
    <div class="form-section mt anim-fade">
      <h3><span class="icon">\${Icons.settings}</span> Automation</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        <div>
          <div class="form-row-toggle">
            <div><div class="toggle-label">Hook Mode</div><div class="toggle-desc">Claude Code post-session hooks</div></div>
            <\${Toggle} checked=\${hookMode} onChange=\${setHookMode}/>
          </div>
          <div class="form-row-toggle">
            <div><div class="toggle-label">Daemon Mode</div><div class="toggle-desc">Background cron daemon</div></div>
            <\${Toggle} checked=\${daemonMode} onChange=\${setDaemonMode}/>
          </div>
          <div class="form-row-toggle">
            <div><div class="toggle-label">Auto Commit</div><div class="toggle-desc">Commit successful mutations</div></div>
            <\${Toggle} checked=\${autoCommit} onChange=\${setAutoCommit}/>
          </div>
          <div class="form-row-toggle">
            <div><div class="toggle-label">Auto Push</div><div class="toggle-desc">Push commits to remote</div></div>
            <\${Toggle} checked=\${autoPush} onChange=\${setAutoPush}/>
          </div>
        </div>
        <div>
          <div class="form-group">
            <label>Trigger After (commits)</label>
            <input type="number" value=\${triggerAfter} min=0 oninput=\${e=>setTriggerAfter(parseInt(e.target.value)||0)} style="max-width:140px"/>
          </div>
          <div class="form-group">
            <label>Cooldown (minutes)</label>
            <input type="number" value=\${cooldownMinutes} min=0 oninput=\${e=>setCooldownMinutes(parseInt(e.target.value)||0)} style="max-width:140px"/>
          </div>
          <div class="form-group">
            <label>Max Regressions Before Pause</label>
            <input type="number" value=\${maxRegressions} min=1 oninput=\${e=>setMaxRegressions(parseInt(e.target.value)||1)} style="max-width:140px"/>
          </div>
          <div class="form-group">
            <label>Daemon Schedule</label>
            <input value=\${daemonSchedule} oninput=\${e=>setDaemonSchedule(e.target.value)} placeholder="*/30 * * * *" style="max-width:200px"/>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Settings -->
    <div class="form-section mt anim-fade">
      <h3><span class="icon">\${Icons.layers}</span> Dashboard</h3>
      <div style="display:flex;gap:24px;align-items:end;flex-wrap:wrap">
        <div class="form-group" style="margin:0">
          <label>Port</label>
          <input type="number" value=\${dashPort} min=1 max=65535 oninput=\${e=>setDashPort(parseInt(e.target.value)||4200)} style="max-width:120px"/>
        </div>
        <div class="form-row-toggle" style="border:none;padding:0">
          <div><div class="toggle-label">Open Browser on Start</div></div>
          <\${Toggle} checked=\${openBrowserSetting} onChange=\${setOpenBrowserSetting}/>
        </div>
      </div>
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

  return html\`<div class="tab-content">
    <h2 style="font-size:18px;font-weight:600;margin-bottom:16px">Playground</h2>
    <div class="pg-grid">
      <div>
        <div class="glass-card" style="padding:20px">
          <div style="font-size:14px;font-weight:600;margin-bottom:12px">Input</div>
          <textarea class="pg-input" rows="16" placeholder="Paste your prompt, code, or config here..."
            value=\${content} onInput=\${e=>setContent(e.target.value)}></textarea>
          <div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin-top:12px">
            <div class="form-group" style="margin:0">
              <label>Type</label>
              <select value=\${type} onChange=\${e=>setType(e.target.value)}>
                <option value="prompt">Prompt</option>
                <option value="config">Config</option>
                <option value="template">Template</option>
                <option value="doc">Doc</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;flex:1;min-width:150px">
              <label>Score With</label>
              <select value=\${chainMode==='default'?'default':chainArtifactId} onChange=\${e=>{
                if(e.target.value==='default'){setChainMode('default')}
                else{setChainMode('artifact');setChainArtifactId(e.target.value)}
              }}>
                <option value="default">Default (LLM Judge)</option>
                \${chains.map(ch=>html\`<option value=\${ch.id}>\${ch.id} (\${ch.chain_summary})</option>\`)}
              </select>
            </div>
            <button class="btn btn-primary btn-lg" onclick=\${doScore} disabled=\${scoring||!content.trim()}>
              \${scoring?html\`<span style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.6s linear infinite;display:inline-block"></span>\`:'Score It'}
            </button>
          </div>
        </div>
      </div>
      <div>
        \${scorecard?html\`<div class="glass-card anim-scale" style="padding:20px">
          <div style="font-size:14px;font-weight:600;margin-bottom:12px">Results</div>
          <div class="sc-total">
            <span>Score: \${scorecard.total_score} / \${scorecard.max_score}</span>
            <span style="color:\${scorecard.percentage>=80?'var(--green)':scorecard.percentage>=60?'var(--yellow)':'var(--red)'};\
font-size:24px;font-family:var(--mono)">
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
                \${ev.details.checks.map(ck=>html\`<div style="margin:2px 0;display:flex;align-items:center;gap:4px">
                  <span style="color:\${ck.passed?'var(--green)':'var(--red)'};\
width:14px;height:14px;flex-shrink:0">\${ck.passed?Icons.check:Icons.x}</span>
                  <span>\${ck.name}\${ck.note?': '+ck.note:''}</span>
                </div>\`)}
              </div>\`:null}
            </div>\`)}
          </div>
          <div class="divider"></div>
          <div style="font-size:13px;font-weight:600;margin-bottom:10px">Save as Artifact</div>
          <div style="display:flex;gap:8px;align-items:end;flex-wrap:wrap">
            <div class="form-group" style="margin:0;flex:1;min-width:100px">
              <label>Name</label>
              <input placeholder="my-prompt" value=\${saveName} onInput=\${e=>setSaveName(e.target.value)}/>
            </div>
            <div class="form-group" style="margin:0;flex:1;min-width:140px">
              <label>File Path</label>
              <input placeholder="agents/my-prompt.md" value=\${savePath} onInput=\${e=>setSavePath(e.target.value)}/>
            </div>
            <button class="btn btn-success btn-sm" onclick=\${doSave} disabled=\${saving}>
              \${saving?'Saving...':'Save'}
            </button>
          </div>
          \${saveMsg?html\`<div style="margin-top:6px;font-size:12px;color:var(--text2)">\${saveMsg}</div>\`:null}
        </div>\`:null}
        \${error?html\`<div class="glass-card" style="border-color:rgba(239,68,68,0.3);padding:20px">
          <div style="color:var(--red);font-size:13px">\${error}</div>
        </div>\`:null}
        \${!scorecard&&!error?html\`<div class="glass-card" style="display:flex;align-items:center;justify-content:center;min-height:300px;text-align:center;padding:40px">
          <div>
            <div style="width:48px;height:48px;border-radius:12px;background:var(--surface3);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--text3)">
              <span style="width:24px;height:24px">\${Icons.beaker}</span>
            </div>
            <div style="color:var(--text2);font-size:14px;font-weight:500">Paste content and click "Score It"</div>
            <div style="color:var(--text3);font-size:12px;margin-top:4px">Results will appear here</div>
          </div>
        </div>\`:null}
      </div>
    </div>
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
    if(selected===id){setSelected(null);setDetail(null);return}
    setSelected(id);
    const d=await api('traces/'+encodeURIComponent(id));
    if(!d.error)setDetail(d);
  };

  return html\`<div class="tab-content">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:18px;font-weight:600">Traces</h2>
      <input placeholder="Filter by artifact..." value=\${filter} oninput=\${e=>setFilter(e.target.value)} style="width:200px;font-size:12px"/>
    </div>
    <div style="overflow-x:auto"><table>
      <tr><th>Run ID</th><th>Artifact</th><th>Score</th><th>Status</th><th>Trigger</th><th>Duration</th><th>Time</th></tr>
      \${(runs||[]).map(r=>html\`<tr class="clickable" onclick=\${()=>selectRun(r.run_id)}>
        <td style="font-family:var(--mono);font-size:11px;\${selected===r.run_id?'color:var(--accent);font-weight:600':''}">\${r.run_id?.slice(0,12)}...</td>
        <td style="font-weight:500">\${r.artifact_id}</td>
        <td style="font-family:var(--mono)">\${r.score!==null?r.score:'--'}</td>
        <td><span class="badge \${r.status}">\${r.status}</span></td>
        <td style="font-size:12px;color:var(--text2)">\${r.trigger}</td>
        <td style="font-family:var(--mono);font-size:12px">\${r.duration_seconds!=null?r.duration_seconds+'s':'--'}</td>
        <td style="color:var(--text2);font-size:12px">\${fmtDate(r.started_at)}</td>
      </tr>\`)}
    </table></div>
    \${runs.length===0?html\`<div class="empty">
      <div style="font-size:42px;margin-bottom:12px;opacity:0.15">...</div>
      <div>No traces yet</div>
    </div>\`:null}
    \${detail?html\`<div class="panel mt anim-fade">
      <div class="panel-header"><span class="panel-title"><span class="icon">\${Icons.terminal}</span> Run: \${selected?.slice(0,12)}...</span></div>
      <div class="row mt">
        <div class="col">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">Manifest</div>
          <pre>\${JSON.stringify(detail.manifest,null,2)}</pre>
        </div>
        <div class="col">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">Scorecard</div>
          \${detail.scorecard?html\`<pre>\${JSON.stringify(detail.scorecard,null,2)}</pre>\`:html\`<div class="empty">No scorecard</div>\`}
        </div>
      </div>
    </div>\`:null}
  </div>\`;
}

// ── Docs Panel ──────────────────────────────────────────────────────
const DOCS_SECTIONS=[
  {id:'quickstart',title:'Quick Start',content:'<h1>Quick Start</h1><p>Get started improving your AI agent prompts in 4 commands:</p><pre><code>cd your-project\\nkultiv init\\nkultiv add my-agent ./agents/my-agent.md\\nkultiv baseline\\nkultiv evolve -n 10</code></pre><h2>What Happens</h2><ol><li><strong>Score</strong> -- run your evaluator chain against the current artifact</li><li><strong>Mutate</strong> -- LLM applies one small change via dialogue</li><li><strong>Re-score</strong> -- same tests on the mutated version</li><li><strong>Keep or Revert</strong> -- better score? Keep. Worse? Auto-revert</li><li><strong>Learn</strong> -- every few experiments, Kultiv revises its mutation strategy</li></ol><div class="tip"><strong>Tip:</strong> Start with <code>kultiv baseline</code> to see where your prompts score before evolving.</div>'},
  {id:'mutations',title:'Mutations',content:'<h1>9 Mutation Types</h1><p>Each experiment applies exactly one mutation. The type is chosen based on the meta-strategy and recent results.</p><table><tr><th>Type</th><th>What It Does</th></tr><tr><td><code>ADD_RULE</code></td><td>Add a new instruction</td></tr><tr><td><code>ADD_EXAMPLE</code></td><td>Add a "do this" example</td></tr><tr><td><code>ADD_NEGATIVE_EXAMPLE</code></td><td>Add a "do NOT do this" example</td></tr><tr><td><code>REORDER</code></td><td>Move a section up or down</td></tr><tr><td><code>SIMPLIFY</code></td><td>Remove redundant content</td></tr><tr><td><code>REPHRASE</code></td><td>Rewrite for clarity</td></tr><tr><td><code>DELETE_RULE</code></td><td>Remove a rule</td></tr><tr><td><code>MERGE_RULES</code></td><td>Combine related rules</td></tr><tr><td><code>RESTRUCTURE</code></td><td>Reorganize the whole artifact</td></tr></table>'},
  {id:'scoring',title:'Scoring',content:'<h1>Scoring System</h1><p>Artifacts are scored using a <strong>weighted chain</strong> of evaluators. The total score is normalized to 100.</p><h2>Evaluator Types</h2><h3>Command Scorer (script)</h3><p>Runs a shell command. Score from exit code and output parsing. Deterministic, zero LLM tokens.</p><h3>Pattern Scorer</h3><p>Regex rules against artifact content. Good for structural checks.</p><h3>LLM Judge</h3><p>Sends artifact to the LLM with a scoring rubric. Nuanced quality assessment but costs tokens.</p>'},
  {id:'evolution',title:'Evolution',content:'<h1>Evolution Loop</h1><h2>Inner Loop</h2><ol><li><strong>Score</strong> -- run evaluator chain</li><li><strong>Select mutation type</strong> -- pick from 9 types</li><li><strong>Mutate</strong> -- LLM dialogue to apply the mutation</li><li><strong>Re-score</strong> -- same evaluator chain on mutated version</li><li><strong>Compare</strong> -- better? Keep. Worse? Revert</li><li><strong>Archive</strong> -- log result</li></ol><h2>Dialogue Trace</h2><ol><li><strong>Explore</strong> -- generate 5 candidate mutations</li><li><strong>Critique</strong> -- evaluate and select the best candidate</li><li><strong>Specify</strong> -- write the exact change</li><li><strong>Generate</strong> -- apply the change</li></ol><h2>Beam Search</h2><p>When beam width > 1, multiple variants are generated and the best is selected.</p><h2>Cross-Validation</h2><p>After a successful mutation, re-score against challenge scenarios to detect regressions.</p>'},
  {id:'config',title:'Config',content:'<h1>Configuration</h1><p>Main config: <code>.kultiv/config.yaml</code></p><h2>Key Sections</h2><ul><li><strong>llm</strong> -- provider, model, authentication</li><li><strong>evolution</strong> -- budget, beam width, cross-validation, selection strategy</li><li><strong>feedback</strong> -- deterministic intervals, LLM reflection</li><li><strong>outer_loop</strong> -- meta-strategy revision mode</li><li><strong>automation</strong> -- hooks, daemon, auto-commit</li></ul>'},
  {id:'cli',title:'CLI',content:'<h1>CLI Reference</h1><table><tr><th>Command</th><th>Description</th></tr><tr><td><code>kultiv init</code></td><td>Create .kultiv/ directory</td></tr><tr><td><code>kultiv add &lt;name&gt; &lt;path&gt;</code></td><td>Register an artifact</td></tr><tr><td><code>kultiv baseline</code></td><td>Score without changing</td></tr><tr><td><code>kultiv evolve -n &lt;N&gt;</code></td><td>Run N experiments</td></tr><tr><td><code>kultiv status</code></td><td>Show scores and patterns</td></tr><tr><td><code>kultiv dashboard</code></td><td>Open web dashboard</td></tr></table>'},
];

function DocsPanel({open,onClose}){
  const[activeDoc,setActiveDoc]=useState('quickstart');
  const[search,setSearch]=useState('');
  const bodyRef=useRef(null);

  const filtered=search.trim()
    ?DOCS_SECTIONS.filter(s=>s.title.toLowerCase().includes(search.toLowerCase())||s.content.toLowerCase().includes(search.toLowerCase()))
    :DOCS_SECTIONS;
  const current=DOCS_SECTIONS.find(s=>s.id===activeDoc)||DOCS_SECTIONS[0];

  useEffect(()=>{if(bodyRef.current)bodyRef.current.scrollTop=0},[activeDoc]);
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
        <button class="btn-icon" onclick=\${onClose}><span style="width:18px;height:18px">\${Icons.x}</span></button>
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

  const tabs=[
    ['overview','Overview'],
    ['artifacts','Artifacts'],
    ['evolution','Evolution'],
    ['challenges','Challenges'],
    ['settings','Engine Settings'],
    ['playground','Playground'],
    ['traces','Traces'],
  ];

  const content={
    overview:Overview,
    artifacts:Artifacts,
    evolution:Evolution,
    challenges:Challenges,
    settings:EngineSettings,
    playground:Playground,
    traces:Traces,
  };
  const Tab=content[tab];

  return html\`
    <header>
      <div class="container inner">
        <div class="logo">
          <div class="logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
              <path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6"/>
            </svg>
          </div>
          <h1>Kultiv</h1>
        </div>
        <nav>
          \${tabs.map(([k,label])=>html\`<button class=\${tab===k?'active':''} onclick=\${()=>setTab(k)}>\${label}</button>\`)}
        </nav>
        <div class="header-actions">
          <button class="btn-icon" onclick=\${()=>setDocsOpen(true)} title="Documentation">
            <span style="width:18px;height:18px">\${Icons.book}</span>
          </button>
        </div>
      </div>
    </header>
    <main class="container">
      <\${Tab} key=\${tab}/>
    </main>
    <\${DocsPanel} open=\${docsOpen} onClose=\${()=>setDocsOpen(false)}/>
  \`;
}

render(html\`<\${App}/>\`,document.getElementById('app'));
</script>
</body>
</html>`;
}

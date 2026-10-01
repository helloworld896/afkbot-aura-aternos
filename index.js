const mineflayer = require('mineflayer');
const express = require('express');
const settings = require('./settings.json');

let bot = null;
let state = { status: 'starting', lastError: null, connectedAt: null, lastAction: null };
let reconnectTimer = null;

function log(...args) {
  const line = `[${new Date().toISOString()}]`;
  console.log(line, ...args);
  state.lastAction = args.join(' ');
}

function connect() {
  if (bot) {
    try { bot.quit('reconnecting'); } catch (_) {}
    bot = null;
  }
  state.status = 'connecting';
  state.lastError = null;
  log(`Conectando em ${settings.ip}:${settings.port} como ${settings.name}`);

  const options = {
    host: settings.ip,
    port: Number(settings.port),
    username: settings.name,
    auth: 'offline'
  };
  if (settings.version && settings.version !== 'auto') options.version = settings.version;

  try {
    bot = mineflayer.createBot(options);
  } catch (err) {
    fail(err);
    return;
  }

  bot.once('spawn', () => {
    state.status = 'connected';
    state.connectedAt = new Date().toISOString();
    log('Bot conectado e pronto.');
    startAfkMovement();
  });
  bot.on('kicked', (reason) => fail(new Error(`Expulso: ${reason}`)));
  bot.on('error', fail);
  bot.on('end', () => {
    state.status = 'disconnected';
    log('Conexão encerrada; tentando reconectar.');
    scheduleReconnect();
  });
}

function fail(err) {
  state.status = 'error';
  state.lastError = err && err.message ? err.message : String(err);
  console.error(`[${new Date().toISOString()}]`, err);
  scheduleReconnect();
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, Number(settings.reconnectDelayMs) || 15000);
}

function startAfkMovement() {
  const move = () => {
    if (!bot || state.status !== 'connected') return;
    try {
      bot.setControlState('forward', true);
      setTimeout(() => bot && bot.setControlState('forward', false), 1800);
      bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.35, true);
      if (Math.random() > 0.5) bot.setControlState('jump', true);
      setTimeout(() => bot && bot.setControlState('jump', false), 500);
      log('Movimento AFK executado.');
    } catch (err) {
      state.lastError = err.message;
    }
  };
  move();
  setInterval(move, Number(settings.moveIntervalMs) || 30000);
}

const app = express();
app.get('/', (_req, res) => res.type('html').send(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AFK Bot Dashboard</title><style>body{font-family:system-ui;background:#101827;color:#e5e7eb;max-width:720px;margin:40px auto;padding:0 20px}main{background:#1f2937;border-radius:14px;padding:24px;box-shadow:0 10px 30px #0005}h1{margin-top:0}.pill{display:inline-block;padding:6px 12px;border-radius:999px;background:#065f46}.row{display:flex;justify-content:space-between;border-bottom:1px solid #374151;padding:10px 0;gap:20px}.muted{color:#9ca3af;font-size:.9rem}</style></head><body><main><h1>AFK Bot Dashboard</h1><p>Status: <span class="pill" id="status">carregando</span></p><div id="details"></div><p class="muted">Atualização automática a cada 5 segundos.</p></main><script>async function refresh(){const d=await fetch('/api/status').then(r=>r.json());document.querySelector('#status').textContent=d.status;document.querySelector('#details').innerHTML=Object.entries(d).map(([k,v])=>'<div class="row"><b>'+k+'</b><span>'+String(v??'')+'</span></div>').join('')}refresh();setInterval(refresh,5000)</script></body></html>`));
app.get('/api/status', (_req, res) => res.json({ ...state, ip: settings.ip, port: settings.port, name: settings.name, version: settings.version }));
const webPort = Number(process.env.PORT || settings.webPort || 3000);
app.listen(webPort, '0.0.0.0', () => log(`Dashboard em http://0.0.0.0:${webPort}`));
connect();

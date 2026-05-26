import React, { useState, useEffect, useRef } from 'react';

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=IBM+Plex+Mono:wght@300;400;500&family=Instrument+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0A0A0F;
    color: #F0F0F0;
    font-family: 'Instrument Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .aivo-grid-bg {
    background-color: #0A0A0F;
    background-image:
      linear-gradient(rgba(201,168,76,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.035) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 currentColor; }
    50% { opacity: 0.7; transform: scale(1.15); box-shadow: 0 0 6px 2px currentColor; }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-right {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes blink-cursor {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .fade-up   { animation: fade-up 0.3s ease both; }
  .slide-in  { animation: slide-right 0.3s ease both; }

  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: #0A0A0F; }
  ::-webkit-scrollbar-thumb { background: #252535; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #C9A84C; }

  input, textarea, select {
    outline: none;
    color: #F0F0F0;
    font-family: 'Instrument Sans', sans-serif;
  }
  input::placeholder, textarea::placeholder { color: #3A3A50; }
  button { cursor: pointer; font-family: 'Instrument Sans', sans-serif; }
  select option { background: #141420; color: #F0F0F0; }
`;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:          '#0A0A0F',
  surface:     '#141420',
  surfaceHigh: '#1A1A2C',
  surfaceCard: 'rgba(20,20,32,0.82)',
  gold:        '#C9A84C',
  goldDim:     'rgba(201,168,76,0.22)',
  goldGlow:    'rgba(201,168,76,0.08)',
  white:       '#F0F0F0',
  purple:      '#6B7FD7',
  muted:       '#888898',
  mutedDark:   '#3A3A50',
  border:      '#1E1E2E',
  borderLight: '#252535',
  success:     '#4CAF82',
  error:       '#CF5060',
  busy:        '#E07830',
};

// ─── EMPLOYEE DATA ─────────────────────────────────────────────────────────────
const DEFAULT_EMPLOYEES = [
  {
    id: 'aria', name: 'ARIA', role: 'Sekretärin & Organisation',
    initials: 'AR', symbol: '◈',
    accent: '#C9A84C', accentBg: 'rgba(201,168,76,0.1)',
    tags: ['Termine', 'Anrufe', 'Korrespondenz', 'E-Mail'],
    done: 24, status: 'available',
    bio: 'Präzise, freundlich und stets einen Schritt voraus. Ihr Büro läuft wie ein Uhrwerk.',
    prompt: 'Du bist ARIA, eine hochprofessionelle KI-Sekretärin. Du kommunizierst präzise, freundlich und organisiert. Du hilfst bei Terminen, Anrufen, Korrespondenz und Büroorganisation. Antworte immer strukturiert und proaktiv.',
  },
  {
    id: 'felix', name: 'FELIX', role: 'Datenanalyst',
    initials: 'FX', symbol: '◇',
    accent: '#6B7FD7', accentBg: 'rgba(107,127,215,0.1)',
    tags: ['Datenanalyse', 'Strukturierung', 'Berichte', 'KPIs'],
    done: 31, status: 'busy',
    bio: 'Faktenbasiert und präzise. Verwandelt komplexe Datensätze in glasklare Erkenntnisse.',
    prompt: 'Du bist FELIX, ein präziser KI-Datenanalyst. Du filterst, sortierst und strukturierst Informationen mit höchster Genauigkeit. Du lieferst klare Übersichten, Tabellen und Kategorisierungen. Immer faktenbasiert. Nutze strukturierte Formate in deinen Antworten.',
  },
  {
    id: 'nova', name: 'NOVA', role: 'Unternehmensberaterin',
    initials: 'NV', symbol: '✦',
    accent: '#9B6FD7', accentBg: 'rgba(155,111,215,0.1)',
    tags: ['Strategie', 'Frameworks', 'KPIs', 'Marktanalyse'],
    done: 18, status: 'available',
    bio: 'Senior-Level Strategin. Erkennt Chancen, wo andere nur Risiken sehen.',
    prompt: 'Du bist NOVA, eine erfahrene KI-Unternehmensberaterin auf Senior-Level. Du analysierst Geschäftssituationen, erkennst Chancen und Risiken und gibst strategische Handlungsempfehlungen. Denkst in Frameworks und KPIs.',
  },
  {
    id: 'max', name: 'MAX', role: 'Projektkoordinator',
    initials: 'MX', symbol: '◉',
    accent: '#4CAF82', accentBg: 'rgba(76,175,130,0.1)',
    tags: ['Projekte', 'Deadlines', 'Teams', 'Sprints'],
    done: 42, status: 'task',
    bio: 'Direkt, effizient, ergebnisorientiert. Kein Bottleneck entgeht seiner Aufmerksamkeit.',
    prompt: 'Du bist MAX, ein effizienter KI-Projektkoordinator. Du strukturierst Projekte, setzt Prioritäten, erkennst Bottlenecks und hältst Teams auf Kurs. Kommunizierst direkt und ergebnisorientiert. Nutze Aufgabenlisten und klare Strukturen.',
  },
  {
    id: 'lyra', name: 'LYRA', role: 'Kommunikation',
    initials: 'LY', symbol: '◎',
    accent: '#D77FA8', accentBg: 'rgba(215,127,168,0.1)',
    tags: ['E-Mails', 'Berichte', 'Texte', 'Zusammenfassungen'],
    done: 29, status: 'available',
    bio: 'Eloquent und überzeugend. Jedes Wort sitzt, jede Botschaft wirkt.',
    prompt: 'Du bist LYRA, eine eloquente KI-Kommunikationsspezialistin. Du verfasst professionelle E-Mails, Reports und Zusammenfassungen. Dein Stil ist klar, überzeugend und immer zielgruppengerecht.',
  },
];

const INITIAL_TASKS = [
  { id: 1, title: 'Quartalsbericht Q2 erstellen',       assignee: 'felix', priority: 'high',   status: 'in-progress', category: 'Analyse',       created: '2025-05-25' },
  { id: 2, title: 'Investoren-Meeting vorbereiten',      assignee: 'nova',  priority: 'high',   status: 'open',        category: 'Beratung',      created: '2025-05-25' },
  { id: 3, title: 'Newsletter-Vorlage entwerfen',        assignee: 'lyra',  priority: 'medium', status: 'open',        category: 'Kommunikation', created: '2025-05-24' },
  { id: 4, title: 'Sprint-Planung KW23 durchführen',     assignee: 'max',   priority: 'medium', status: 'done',        category: 'Projekt',       created: '2025-05-23' },
  { id: 5, title: 'Kundentermine für Juni koordinieren', assignee: 'aria',  priority: 'low',    status: 'done',        category: 'Organisation',  created: '2025-05-22' },
];

const ACTIVITY_LOG = [
  { id: 1, emp: 'FELIX', empId: 'felix', msg: 'Analysiert Marktdaten für Q2-Report',              time: '2 min',  icon: '◇' },
  { id: 2, emp: 'ARIA',  empId: 'aria',  msg: '3 Termine für nächste Woche bestätigt',            time: '8 min',  icon: '◈' },
  { id: 3, emp: 'MAX',   empId: 'max',   msg: 'Sprint-Review erfolgreich abgeschlossen',          time: '15 min', icon: '◉' },
  { id: 4, emp: 'LYRA',  empId: 'lyra',  msg: 'Entwurf für Investoren-Mail fertiggestellt',       time: '23 min', icon: '◎' },
  { id: 5, emp: 'NOVA',  empId: 'nova',  msg: '3 Wachstumspotenziale im DACH-Markt identifiziert', time: '34 min', icon: '✦' },
  { id: 6, emp: 'ARIA',  empId: 'aria',  msg: 'Anfrage von Müller GmbH bearbeitet',              time: '1h',     icon: '◈' },
];

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────

function StatusDot({ status, size = 8 }) {
  const map = { available: C.success, busy: C.busy, task: C.purple };
  const color = map[status] || C.muted;
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      backgroundColor: color, flexShrink: 0,
      animation: status === 'available' ? 'pulse-dot 2.2s ease-in-out infinite' : 'none',
    }} />
  );
}

function Chip({ label, color }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 3,
      fontSize: 10, letterSpacing: '0.04em',
      fontFamily: "'IBM Plex Mono', monospace",
      color: color || C.gold,
      border: `1px solid ${color ? color + '45' : C.goldDim}`,
      background: color ? color + '12' : C.goldGlow,
    }}>{label}</span>
  );
}

function Spinner({ color = C.gold }) {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: `2px solid ${color}30`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: '0' }} />;
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
      color: C.gold, letterSpacing: '0.18em', marginBottom: 10,
    }}>{children}</div>
  );
}

// ─── EMPLOYEE CARD ────────────────────────────────────────────────────────────

function EmployeeCard({ emp, onChat, compact = false }) {
  const [hov, setHov] = useState(false);
  const statusLabel = { available: 'Verfügbar', busy: 'Beschäftigt', task: 'In Aufgabe' };

  return (
    <div
      className="fade-up"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(26,26,44,0.95)' : C.surfaceCard,
        backdropFilter: 'blur(16px)',
        border: `1px solid ${hov ? emp.accent + '50' : C.border}`,
        borderRadius: 10,
        padding: compact ? '16px' : '22px',
        transition: 'all 0.28s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov
          ? `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${emp.accent}18`
          : '0 2px 12px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: compact ? 10 : 14 }}>
        {/* Avatar */}
        <div style={{
          width: compact ? 42 : 50, height: compact ? 42 : 50,
          borderRadius: 8, flexShrink: 0,
          background: emp.accentBg, border: `1px solid ${emp.accent}38`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: compact ? 13 : 15, color: emp.accent, fontWeight: 500,
          }}>{emp.initials}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: compact ? 15 : 17, color: C.white, fontWeight: 600,
            }}>{emp.name}</span>
            <StatusDot status={emp.status} />
          </div>
          <div style={{
            fontSize: 10, color: C.muted,
            fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.04em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{emp.role}</div>
        </div>

        {!compact && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 22, color: emp.accent, fontWeight: 500, lineHeight: 1,
            }}>{emp.done}</div>
            <div style={{ fontSize: 9, color: C.mutedDark, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.05em' }}>TASKS</div>
          </div>
        )}
      </div>

      {!compact && (
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.65, marginBottom: 14, fontStyle: 'italic' }}>
          {emp.bio}
        </p>
      )}

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: compact ? 12 : 16 }}>
        {emp.tags.slice(0, compact ? 2 : 4).map(t => <Chip key={t} label={t} color={emp.accent} />)}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StatusDot status={emp.status} size={6} />
          <span style={{
            fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
            color: emp.status === 'available' ? C.success : emp.status === 'busy' ? C.busy : C.purple,
          }}>{statusLabel[emp.status]}</span>
        </div>
        <button
          onClick={() => onChat(emp)}
          style={{
            padding: '6px 16px', borderRadius: 4,
            fontSize: 11, fontWeight: 500,
            color: hov ? C.bg : emp.accent,
            background: hov ? emp.accent : 'transparent',
            border: `1px solid ${emp.accent}55`,
            transition: 'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
        >Chat starten</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ employees, tasks, onChat, onNavigate }) {
  const done  = tasks.filter(t => t.status === 'done').length;
  const avail = employees.filter(e => e.status === 'available').length;
  const hours = Math.round(done * 1.4);

  return (
    <div style={{ padding: '36px 44px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <SectionLabel>OPERATIONS CENTER // 26. MAI 2025</SectionLabel>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 38, fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 8,
        }}>Willkommen zurück.</h1>
        <p style={{ color: C.muted, fontSize: 13 }}>
          {avail} KI-Mitarbeiter verfügbar · {tasks.filter(t => t.status !== 'done').length} offene Aufgaben
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Erledigte Aufgaben heute', val: done,  unit: 'Tasks',   color: C.success },
          { label: 'Aktive KI-Mitarbeiter',    val: avail, unit: 'Online',  color: C.gold },
          { label: 'Eingesparte Stunden',      val: hours, unit: 'Stunden', color: C.purple },
        ].map(m => (
          <div key={m.label} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: '22px 26px',
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 38, fontWeight: 500, color: m.color, lineHeight: 1, marginBottom: 6,
            }}>{m.val}</div>
            <div style={{ fontSize: 10, color: m.color, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em', marginBottom: 4 }}>{m.unit}</div>
            <div style={{ fontSize: 11, color: C.mutedDark }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28 }}>
        {/* Employees preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.white, fontWeight: 600 }}>
              KI-Mitarbeiter
            </h2>
            <button onClick={() => onNavigate('roster')} style={{
              fontSize: 11, color: C.gold, background: 'transparent', border: 'none',
              fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.04em',
            }}>Alle anzeigen →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {employees.slice(0, 4).map(e => <EmployeeCard key={e.id} emp={e} onChat={onChat} compact />)}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live activity */}
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: C.white, fontWeight: 600, marginBottom: 16 }}>
              Live-Aktivität
            </h2>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
              {ACTIVITY_LOG.map((item, i) => {
                const emp = employees.find(e => e.id === item.empId);
                return (
                  <div key={item.id} style={{
                    padding: '13px 18px',
                    borderBottom: i < ACTIVITY_LOG.length - 1 ? `1px solid ${C.border}` : 'none',
                    animation: `slide-right 0.3s ease ${i * 0.04}s both`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ color: emp?.accent || C.gold, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                          color: emp?.accent || C.gold, letterSpacing: '0.06em',
                        }}>{item.emp}</span>
                        <p style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.5 }}>{item.msg}</p>
                      </div>
                      <span style={{ fontSize: 10, color: C.mutedDark, fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>
                        {item.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <SectionLabel>SCHNELLAKTIONEN</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => onNavigate('tasks')} style={{
                padding: '12px', borderRadius: 7,
                background: 'transparent', border: `1px solid ${C.goldDim}`,
                color: C.gold, fontSize: 12, letterSpacing: '0.02em',
                transition: 'all 0.2s',
              }}>+ Aufgabe zuweisen</button>
              <button onClick={() => onNavigate('settings')} style={{
                padding: '12px', borderRadius: 7,
                background: 'transparent', border: `1px solid ${C.border}`,
                color: C.muted, fontSize: 12, letterSpacing: '0.02em',
                transition: 'all 0.2s',
              }}>+ Mitarbeiter hinzufügen</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROSTER ───────────────────────────────────────────────────────────────────

function Roster({ employees, onChat }) {
  return (
    <div style={{ padding: '36px 44px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>KI-MITARBEITER // WORKFORCE</SectionLabel>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: C.white }}>
          Ihr digitales Team.
        </h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {employees.map(e => <EmployeeCard key={e.id} emp={e} onChat={onChat} />)}
      </div>
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

function Chat({ employees, selectedEmp, onSelectEmp, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [streaming, setStreaming] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streaming]);

  const typewrite = (text, onDone) => {
    let i = 0;
    setStreaming('');
    const iv = setInterval(() => {
      if (i < text.length) { setStreaming(t => t + text[i]); i++; }
      else { clearInterval(iv); onDone(text); }
    }, 12);
  };

  const send = async () => {
    if (!input.trim() || !selectedEmp || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);
    setStreaming('');

    if (!apiKey) {
      setTimeout(() => {
        typewrite(
          `Hallo! Ich bin ${selectedEmp.name}. Um echte Antworten zu erhalten, trage bitte deinen Anthropic API-Key in den Einstellungen ein. Im Demo-Modus kann ich leider nicht vollständig antworten.`,
          text => { setMessages(p => [...p, { role: 'assistant', content: text }]); setStreaming(''); setLoading(false); }
        );
      }, 400);
      return;
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: selectedEmp.prompt,
          messages: history,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      typewrite(data.content[0].text, text => {
        setMessages(p => [...p, { role: 'assistant', content: text }]);
        setStreaming(''); setLoading(false);
      });
    } catch (err) {
      setMessages(p => [...p, { role: 'assistant', content: `Fehler: ${err.message}` }]);
      setStreaming(''); setLoading(false);
    }
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{
      padding: '36px 44px', maxWidth: 1280, margin: '0 auto',
      height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>CHAT // DIREKTKOMMUNIKATION</SectionLabel>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: C.white }}>
          Mit Ihrem Team sprechen.
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0, overflowY: 'auto' }}>
          <SectionLabel>MITARBEITER</SectionLabel>
          {employees.map(e => (
            <div key={e.id} onClick={() => { onSelectEmp(e); setMessages([]); setStreaming(''); }} style={{
              padding: '11px 13px', marginBottom: 6, borderRadius: 8, cursor: 'pointer',
              background: selectedEmp?.id === e.id ? e.accentBg : 'transparent',
              border: `1px solid ${selectedEmp?.id === e.id ? e.accent + '50' : C.border}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 5,
                  background: e.accentBg, border: `1px solid ${e.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: e.accent }}>{e.initials}</span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: C.white, fontWeight: 500 }}>{e.name}</div>
                  <div style={{ fontSize: 10, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.role.split(' ')[0]}
                  </div>
                </div>
                <StatusDot status={e.status} size={6} />
              </div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden',
        }}>
          {!selectedEmp ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: C.mutedDark }}>
                <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.4 }}>◎</div>
                <p style={{ fontSize: 13, color: C.muted }}>Wähle einen Mitarbeiter aus, um ein Gespräch zu beginnen.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                padding: '14px 20px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 7,
                  background: selectedEmp.accentBg, border: `1px solid ${selectedEmp.accent}38`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: selectedEmp.accent }}>
                    {selectedEmp.initials}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: C.white, fontWeight: 600 }}>
                    {selectedEmp.name}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted }}>{selectedEmp.role}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <StatusDot status={selectedEmp.status} size={7} />
                  <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: C.muted }}>
                    {{ available: 'Verfügbar', busy: 'Beschäftigt', task: 'In Aufgabe' }[selectedEmp.status]}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: C.muted }}>
                    <div style={{ fontSize: 30, marginBottom: 12, color: selectedEmp.accent, opacity: 0.45 }}>
                      {selectedEmp.symbol}
                    </div>
                    <p style={{ fontSize: 13, marginBottom: 5 }}>
                      Gespräch mit <strong style={{ color: selectedEmp.accent }}>{selectedEmp.name}</strong>
                    </p>
                    <p style={{ fontSize: 11, color: C.mutedDark, fontStyle: 'italic' }}>{selectedEmp.bio}</p>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className="fade-up" style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '74%', padding: '11px 15px',
                      borderRadius: m.role === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                      background: m.role === 'user' ? selectedEmp.accent : C.surfaceHigh,
                      color: m.role === 'user' ? C.bg : C.white,
                      fontSize: 13, lineHeight: 1.65,
                      border: m.role === 'assistant' ? `1px solid ${C.borderLight}` : 'none',
                      whiteSpace: 'pre-wrap',
                    }}>{m.content}</div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      maxWidth: '74%', padding: '11px 15px',
                      borderRadius: '10px 10px 10px 3px',
                      background: C.surfaceHigh, border: `1px solid ${C.borderLight}`,
                      fontSize: 13, lineHeight: 1.65, color: C.white, whiteSpace: 'pre-wrap',
                    }}>
                      {streaming || (
                        <span style={{ color: C.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Spinner color={selectedEmp.accent} />
                          {selectedEmp.name} schreibt…
                        </span>
                      )}
                      {streaming && (
                        <span style={{
                          display: 'inline-block', width: 2, height: '1em',
                          background: selectedEmp.accent, marginLeft: 2,
                          verticalAlign: 'text-bottom',
                          animation: 'blink-cursor 0.7s infinite',
                        }} />
                      )}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 18px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={`Schreibe ${selectedEmp.name}…`}
                  rows={1}
                  style={{
                    flex: 1, padding: '11px 14px', borderRadius: 8,
                    background: C.surfaceHigh, border: `1px solid ${C.border}`,
                    fontSize: 13, lineHeight: 1.5, resize: 'none',
                    maxHeight: 110, overflowY: 'auto',
                  }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  style={{
                    padding: '11px 22px', borderRadius: 8, border: 'none',
                    background: input.trim() && !loading ? selectedEmp.accent : C.borderLight,
                    color: input.trim() && !loading ? C.bg : C.mutedDark,
                    fontSize: 13, fontWeight: 600,
                    transition: 'all 0.2s', flexShrink: 0,
                    cursor: input.trim() && !loading ? 'pointer' : 'default',
                  }}
                >Senden</button>
              </div>
            </>
          )}
        </div>
      </div>

      {!apiKey && (
        <div style={{
          marginTop: 12, padding: '8px 16px', borderRadius: 6,
          background: 'rgba(224,120,48,0.1)', border: `1px solid rgba(224,120,48,0.28)`,
          fontSize: 11, color: C.busy, fontFamily: "'IBM Plex Mono', monospace",
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠</span> Kein API-Key gesetzt – Demo-Modus aktiv. Echte Antworten erst nach Konfiguration in den Einstellungen.
        </div>
      )}
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

function Tasks({ tasks, setTasks, employees }) {
  const [filter, setFilter]     = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ title: '', assignee: '', priority: 'medium', category: '' });

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const addTask = () => {
    if (!form.title.trim()) return;
    setTasks(p => [{ id: Date.now(), ...form, status: 'open', created: new Date().toISOString().split('T')[0] }, ...p]);
    setForm({ title: '', assignee: '', priority: 'medium', category: '' });
    setShowForm(false);
  };

  const pColors  = { high: C.error, medium: C.busy, low: C.success };
  const pLabels  = { high: 'Hoch', medium: 'Mittel', low: 'Niedrig' };
  const stColors = { open: C.muted, 'in-progress': C.purple, done: C.success };
  const tabs     = [
    { k: 'all', l: 'Alle' }, { k: 'open', l: 'Offen' },
    { k: 'in-progress', l: 'In Bearbeitung' }, { k: 'done', l: 'Erledigt' },
  ];

  return (
    <div style={{ padding: '36px 44px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <SectionLabel>AUFGABEN // TASK MANAGEMENT</SectionLabel>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: C.white }}>
            Aufgaben-Manager.
          </h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 22px', borderRadius: 7,
          background: C.gold, color: C.bg, border: 'none',
          fontSize: 13, fontWeight: 600, letterSpacing: '0.02em',
        }}>+ Neue Aufgabe</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fade-up" style={{
          background: C.surface, border: `1px solid ${C.goldDim}`,
          borderRadius: 10, padding: '24px', marginBottom: 24,
        }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: C.white, marginBottom: 18 }}>
            Neue Aufgabe erstellen
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            {[
              { key: 'title', label: 'AUFGABE', ph: 'Aufgabe beschreiben…', type: 'input' },
              { key: 'category', label: 'KATEGORIE', ph: 'z.B. Analyse, Marketing…', type: 'input' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 10, color: C.muted, display: 'block', marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em' }}>
                  {f.label}
                </label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.ph}
                  style={{
                    width: '100%', padding: '10px 12px',
                    background: C.surfaceHigh, border: `1px solid ${C.border}`,
                    borderRadius: 7, fontSize: 13,
                  }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 10, color: C.muted, display: 'block', marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em' }}>
                ZUWEISEN AN
              </label>
              <select value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: C.surfaceHigh, border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 13, cursor: 'pointer',
                }}>
                <option value="">Mitarbeiter wählen</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} – {e.role}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: C.muted, display: 'block', marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em' }}>
                PRIORITÄT
              </label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: C.surfaceHigh, border: `1px solid ${C.border}`,
                  borderRadius: 7, fontSize: 13, cursor: 'pointer',
                }}>
                <option value="high">Hoch</option>
                <option value="medium">Mittel</option>
                <option value="low">Niedrig</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={addTask} style={{
              padding: '10px 26px', borderRadius: 7, background: C.gold, color: C.bg,
              border: 'none', fontSize: 13, fontWeight: 600,
            }}>Erstellen</button>
            <button onClick={() => setShowForm(false)} style={{
              padding: '10px 26px', borderRadius: 7, background: 'transparent',
              color: C.muted, border: `1px solid ${C.border}`, fontSize: 13,
            }}>Abbrechen</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 22 }}>
        {tabs.map(t => {
          const count = t.k === 'all' ? tasks.length : tasks.filter(x => x.status === t.k).length;
          return (
            <button key={t.k} onClick={() => setFilter(t.k)} style={{
              padding: '7px 16px', borderRadius: 6,
              background: filter === t.k ? C.gold : 'transparent',
              color: filter === t.k ? C.bg : C.muted,
              border: filter === t.k ? 'none' : `1px solid ${C.border}`,
              fontSize: 12, fontWeight: filter === t.k ? 600 : 400,
              transition: 'all 0.18s',
            }}>{t.l} ({count})</button>
          );
        })}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(task => {
          const emp = employees.find(e => e.id === task.assignee);
          return (
            <div key={task.id} className="fade-up" style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 9, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: 4, height: 38, borderRadius: 2, flexShrink: 0,
                background: pColors[task.priority],
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, color: task.status === 'done' ? C.muted : C.white,
                  textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  marginBottom: 5,
                }}>{task.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {task.category && <Chip label={task.category} />}
                  {emp && <Chip label={emp.name} color={emp.accent} />}
                  <span style={{ fontSize: 10, color: C.mutedDark, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {task.created}
                  </span>
                </div>
              </div>

              <select value={task.status}
                onChange={e => setTasks(p => p.map(t => t.id === task.id ? { ...t, status: e.target.value } : t))}
                style={{
                  padding: '6px 10px', borderRadius: 5,
                  background: C.surfaceHigh, border: `1px solid ${stColors[task.status]}40`,
                  color: stColors[task.status], fontSize: 10,
                  fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer', flexShrink: 0,
                }}>
                <option value="open">Offen</option>
                <option value="in-progress">In Bearbeitung</option>
                <option value="done">Erledigt</option>
              </select>

              <Chip label={pLabels[task.priority]} color={pColors[task.priority]} />

              <button
                onClick={() => setTasks(p => p.filter(t => t.id !== task.id))}
                style={{
                  width: 26, height: 26, borderRadius: 5, flexShrink: 0,
                  background: 'transparent', border: `1px solid ${C.border}`,
                  color: C.muted, fontSize: 15, lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >×</button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.mutedDark }}>
            <p style={{ fontSize: 13 }}>Keine Aufgaben in dieser Kategorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

function Settings({ employees, setEmployees, apiKey, setApiKey }) {
  const [localKey, setLocalKey]   = useState(apiKey);
  const [showKey, setShowKey]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [editId, setEditId]       = useState(null);
  const [showNew, setShowNew]     = useState(false);
  const [newEmp, setNewEmp]       = useState({ name: '', role: '', focus: '' });

  const saveKey = () => {
    setApiKey(localKey);
    localStorage.setItem('aivo_api_key', localKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const hire = () => {
    if (!newEmp.name.trim()) return;
    const id = newEmp.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    setEmployees(p => [...p, {
      id, name: newEmp.name.toUpperCase(), role: newEmp.role || 'KI-Assistent',
      initials: newEmp.name.slice(0, 2).toUpperCase(), symbol: '◆',
      accent: C.purple, accentBg: 'rgba(107,127,215,0.1)',
      tags: newEmp.focus ? newEmp.focus.split(',').map(t => t.trim()).filter(Boolean) : ['Assistent'],
      done: 0, status: 'available',
      bio: `${newEmp.name.toUpperCase()} ist bereit, neue Aufgaben zu übernehmen.`,
      prompt: `Du bist ${newEmp.name.toUpperCase()}, ein KI-Assistent${newEmp.role ? ' mit der Rolle: ' + newEmp.role : ''}${newEmp.focus ? ', spezialisiert auf: ' + newEmp.focus : ''}. Sei professionell, hilfsbereit und präzise.`,
    }]);
    setNewEmp({ name: '', role: '', focus: '' });
    setShowNew(false);
  };

  const isDefault = id => DEFAULT_EMPLOYEES.some(d => d.id === id);

  const inputStyle = {
    flex: 1, padding: '10px 12px',
    background: C.surfaceHigh, border: `1px solid ${C.border}`,
    borderRadius: 7, fontSize: 13, color: C.white,
  };

  return (
    <div style={{ padding: '36px 44px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <SectionLabel>EINSTELLUNGEN // CONFIGURATION</SectionLabel>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: C.white }}>
          System-Konfiguration.
        </h1>
      </div>

      {/* API Key */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '26px', marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: C.white, marginBottom: 6 }}>
          Anthropic API-Key
        </h2>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 18 }}>
          Dein Key wird ausschließlich in{' '}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.gold }}>localStorage</span>{' '}
          deines Browsers gespeichert und nie übertragen.
          Erhältlich unter{' '}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.gold }}>console.anthropic.com</span>.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={localKey}
            onChange={e => setLocalKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            style={{
              ...inputStyle,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: localKey && !showKey ? '0.18em' : 'normal',
              border: `1px solid ${localKey ? C.goldDim : C.border}`,
            }}
          />
          <button onClick={() => setShowKey(!showKey)} style={{
            padding: '10px 16px', borderRadius: 7, fontSize: 12,
            background: C.surfaceHigh, border: `1px solid ${C.border}`, color: C.muted,
          }}>{showKey ? 'Verbergen' : 'Anzeigen'}</button>
          <button onClick={saveKey} style={{
            padding: '10px 24px', borderRadius: 7, border: 'none', fontSize: 13, fontWeight: 600,
            background: saved ? C.success : C.gold, color: C.bg, transition: 'background 0.3s',
          }}>{saved ? '✓ Gespeichert' : 'Speichern'}</button>
        </div>
        <div style={{
          padding: '10px 14px', borderRadius: 7, fontSize: 11,
          fontFamily: "'IBM Plex Mono', monospace",
          background: apiKey ? 'rgba(76,175,130,0.1)' : 'rgba(224,120,48,0.1)',
          border: `1px solid ${apiKey ? 'rgba(76,175,130,0.3)' : 'rgba(224,120,48,0.3)'}`,
          color: apiKey ? C.success : C.busy,
        }}>
          {apiKey ? '✓ API-Key aktiv – Chat-Funktion vollständig verfügbar' : '⚠ Kein API-Key – Chat im Demo-Modus'}
        </div>
      </div>

      {/* Employee management */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: C.white }}>
            KI-Mitarbeiter verwalten
          </h2>
          <button onClick={() => setShowNew(!showNew)} style={{
            padding: '8px 18px', borderRadius: 7, border: 'none',
            background: C.gold, color: C.bg, fontSize: 12, fontWeight: 600,
          }}>+ Einstellen</button>
        </div>

        {showNew && (
          <div className="fade-up" style={{
            background: C.surfaceHigh, border: `1px solid ${C.goldDim}`,
            borderRadius: 8, padding: '20px', marginBottom: 18,
          }}>
            <SectionLabel>NEUEN MITARBEITER EINSTELLEN</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {[
                { k: 'name', l: 'NAME', ph: 'z.B. ZARA' },
                { k: 'role', l: 'ROLLE', ph: 'z.B. Kundenbetreuung' },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 10, color: C.muted, display: 'block', marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em' }}>
                    {f.l}
                  </label>
                  <input value={newEmp[f.k]} onChange={e => setNewEmp(p => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.ph} style={{ ...inputStyle, width: '100%' }} />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 10, color: C.muted, display: 'block', marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.1em' }}>
                  FACHGEBIETE (kommagetrennt)
                </label>
                <input value={newEmp.focus} onChange={e => setNewEmp(p => ({ ...p, focus: e.target.value }))}
                  placeholder="z.B. Support, CRM, Onboarding"
                  style={{ ...inputStyle, width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={hire} style={{
                padding: '8px 22px', borderRadius: 7, background: C.gold, color: C.bg,
                border: 'none', fontSize: 13, fontWeight: 600,
              }}>Einstellen</button>
              <button onClick={() => setShowNew(false)} style={{
                padding: '8px 22px', borderRadius: 7, background: 'transparent',
                color: C.muted, border: `1px solid ${C.border}`, fontSize: 13,
              }}>Abbrechen</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {employees.map(emp => (
            <div key={emp.id} style={{
              padding: '13px 16px', borderRadius: 8,
              background: C.surfaceHigh,
              border: `1px solid ${editId === emp.id ? emp.accent + '45' : C.border}`,
              display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 7, flexShrink: 0,
                background: emp.accentBg, border: `1px solid ${emp.accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: emp.accent }}>{emp.initials}</span>
              </div>

              {editId === emp.id ? (
                <>
                  <input value={emp.name}
                    onChange={e => setEmployees(p => p.map(x => x.id === emp.id ? { ...x, name: e.target.value } : x))}
                    style={{ ...inputStyle, flex: '0 0 120px', width: 120 }} />
                  <input value={emp.role}
                    onChange={e => setEmployees(p => p.map(x => x.id === emp.id ? { ...x, role: e.target.value } : x))}
                    style={{ ...inputStyle }} />
                  <button onClick={() => setEditId(null)} style={{
                    padding: '6px 16px', borderRadius: 6, background: C.gold, color: C.bg,
                    border: 'none', fontSize: 12, fontWeight: 600, flexShrink: 0,
                  }}>OK</button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{emp.role}</div>
                  </div>
                  <StatusDot status={emp.status} size={7} />
                  <button onClick={() => setEditId(emp.id)} style={{
                    padding: '6px 14px', borderRadius: 6, background: 'transparent',
                    color: C.muted, border: `1px solid ${C.border}`, fontSize: 11,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>Bearbeiten</button>
                  {!isDefault(emp.id) && (
                    <button onClick={() => setEmployees(p => p.filter(x => x.id !== emp.id))} style={{
                      padding: '6px 14px', borderRadius: 6, background: 'transparent',
                      color: C.error, border: `1px solid ${C.error}38`, fontSize: 11,
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}>Entlassen</button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function AIVO() {
  const [tab, setTab]     = useState('dashboard');
  const [employees, setEmployees] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aivo_employees')) || DEFAULT_EMPLOYEES; }
    catch { return DEFAULT_EMPLOYEES; }
  });
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aivo_tasks')) || INITIAL_TASKS; }
    catch { return INITIAL_TASKS; }
  });
  const [apiKey, setApiKey]       = useState(() => localStorage.getItem('aivo_api_key') || '');
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => { localStorage.setItem('aivo_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('aivo_tasks', JSON.stringify(tasks)); }, [tasks]);

  const startChat = emp => { setSelectedEmp(emp); setTab('chat'); };

  const NAV = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'roster',    label: 'Team' },
    { id: 'chat',      label: 'Chat' },
    { id: 'tasks',     label: 'Aufgaben' },
    { id: 'settings',  label: 'Einstellungen' },
  ];

  return (
    <div className="aivo-grid-bg" style={{ minHeight: '100vh' }}>
      {/* NAV */}
      <nav style={{
        height: 62, position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', padding: '0 44px', gap: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginRight: 44 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: C.goldGlow, border: `1px solid ${C.goldDim}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.gold, fontWeight: 500 }}>AI</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: C.white, letterSpacing: '0.06em', lineHeight: 1 }}>
              AIVO
            </div>
            <div style={{ fontSize: 8, color: C.goldDim, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.14em' }}>
              YOUR AI WORKFORCE
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 3 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              padding: '7px 17px', borderRadius: 7,
              background: tab === n.id ? C.goldGlow : 'transparent',
              color: tab === n.id ? C.gold : C.muted,
              border: `1px solid ${tab === n.id ? C.goldDim : 'transparent'}`,
              fontSize: 13, fontWeight: tab === n.id ? 500 : 400,
              transition: 'all 0.2s', letterSpacing: '0.01em',
            }}>{n.label}</button>
          ))}
        </div>

        {/* Right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StatusDot status="available" size={7} />
            <span style={{ fontSize: 10, color: C.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
              {employees.filter(e => e.status === 'available').length} VERFÜGBAR
            </span>
          </div>
          {!apiKey && (
            <button onClick={() => setTab('settings')} style={{
              padding: '4px 11px', borderRadius: 5,
              background: 'rgba(224,120,48,0.12)', border: `1px solid rgba(224,120,48,0.3)`,
              fontSize: 9, color: C.busy, fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.08em',
            }}>API-KEY FEHLT</button>
          )}
        </div>
      </nav>

      {/* CONTENT */}
      <main>
        {tab === 'dashboard' && (
          <Dashboard employees={employees} tasks={tasks} onChat={startChat} onNavigate={setTab} />
        )}
        {tab === 'roster' && (
          <Roster employees={employees} onChat={startChat} />
        )}
        {tab === 'chat' && (
          <Chat employees={employees} selectedEmp={selectedEmp} onSelectEmp={setSelectedEmp} apiKey={apiKey} />
        )}
        {tab === 'tasks' && (
          <Tasks tasks={tasks} setTasks={setTasks} employees={employees} />
        )}
        {tab === 'settings' && (
          <Settings employees={employees} setEmployees={setEmployees} apiKey={apiKey} setApiKey={setApiKey} />
        )}
      </main>

      {/* Subtle footer line */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${C.goldDim}, transparent)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}

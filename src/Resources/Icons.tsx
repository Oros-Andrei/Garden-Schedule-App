import React from 'react';

const s: React.CSSProperties = { width: '100%', height: '100%' };

export const DesertRoseIcon: React.FC<{ accent: string }> = ({ accent }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={s}>
    <rect x="27" y="55" width="26" height="18" rx="3" fill="#C4956A" />
    <rect x="24" y="52" width="32" height="7" rx="3" fill="#D4A574" />
    <ellipse cx="35" cy="53" rx="4" ry="2" fill="#E8E0D0" />
    <ellipse cx="45" cy="53" rx="3" ry="2" fill="#E8E0D0" />
    <ellipse cx="40" cy="48" rx="9" ry="7" fill="#8B6A4A" />
    <ellipse cx="40" cy="50" rx="7" ry="5" fill="#A07850" />
    <line x1="40" y1="45" x2="30" y2="28" stroke="#7A5C3A" strokeWidth="3" strokeLinecap="round" />
    <line x1="40" y1="45" x2="50" y2="28" stroke="#7A5C3A" strokeWidth="3" strokeLinecap="round" />
    <line x1="40" y1="45" x2="40" y2="22" stroke="#7A5C3A" strokeWidth="3" strokeLinecap="round" />
    {([{ cx: 30, cy: 26 }, { cx: 50, cy: 26 }, { cx: 40, cy: 20 }] as {cx:number,cy:number}[]).map((pos, i) => (
      <g key={i}>
        {[0, 72, 144, 216, 288].map((angle, j) => (
          <ellipse key={j}
            cx={pos.cx + 5.5 * Math.cos(angle * Math.PI / 180)}
            cy={pos.cy + 5.5 * Math.sin(angle * Math.PI / 180)}
            rx="3.5" ry="2.5" fill={accent}
            transform={`rotate(${angle} ${pos.cx + 5.5 * Math.cos(angle * Math.PI / 180)} ${pos.cy + 5.5 * Math.sin(angle * Math.PI / 180)})`}
          />
        ))}
        <circle cx={pos.cx} cy={pos.cy} r="3" fill="#FFD700" />
      </g>
    ))}
    <ellipse cx="34" cy="36" rx="5" ry="3" fill="#4A7C3F" transform="rotate(-30 34 36)" />
    <ellipse cx="46" cy="36" rx="5" ry="3" fill="#4A7C3F" transform="rotate(30 46 36)" />
  </svg>
);

export const JadePlantIcon: React.FC<{ accent: string }> = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={s}>
    <rect x="27" y="55" width="26" height="18" rx="2" fill="#7BAFD4" />
    <rect x="24" y="52" width="32" height="6" rx="2" fill="#9ABFE0" />
    <ellipse cx="35" cy="53" rx="4" ry="2" fill="#E8E0D0" />
    <ellipse cx="45" cy="53" rx="3" ry="2" fill="#E8E0D0" />
    <rect x="36" y="36" width="8" height="16" rx="4" fill="#8B6A4A" />
    {([{x:20,y:38,r:-20},{x:50,y:35,r:25},{x:25,y:26,r:-35},{x:48,y:24,r:40},{x:32,y:18,r:-10},{x:44,y:20,r:15}] as {x:number,y:number,r:number}[]).map((l, i) => (
      <ellipse key={i} cx={l.x} cy={l.y} rx="10" ry="7"
        fill={i % 2 === 0 ? '#5A9E4A' : '#4A8C3A'}
        transform={`rotate(${l.r} ${l.x} ${l.y})`} />
    ))}
    {([{x:20,y:36},{x:50,y:33},{x:25,y:24}] as {x:number,y:number}[]).map((l, i) => (
      <ellipse key={i} cx={l.x} cy={l.y} rx="3" ry="2" fill="rgba(255,255,255,0.3)" />
    ))}
  </svg>
);

export const IrishRoseIcon: React.FC<{ accent: string }> = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={s}>
    <rect x="27" y="55" width="26" height="18" rx="3" fill="#C4724A" />
    <rect x="24" y="52" width="32" height="7" rx="3" fill="#D4845A" />
    <ellipse cx="35" cy="53" rx="4" ry="2" fill="#E8E0D0" />
    <ellipse cx="45" cy="53" rx="3" ry="2" fill="#E8E0D0" />
    <line x1="40" y1="52" x2="40" y2="30" stroke="#7A5C3A" strokeWidth="3" strokeLinecap="round" />
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => (
      <ellipse key={i}
        cx={40 + 10 * Math.cos(angle * Math.PI / 180)}
        cy={30 + 10 * Math.sin(angle * Math.PI / 180)}
        rx="7" ry="4"
        fill={i % 3 === 0 ? '#2D5A2A' : i % 3 === 1 ? '#3D7A38' : '#4A8C42'}
        transform={`rotate(${angle} ${40 + 10 * Math.cos(angle * Math.PI / 180)} ${30 + 10 * Math.sin(angle * Math.PI / 180)})`}
      />
    ))}
    <circle cx="40" cy="30" r="6" fill="#3D7A38" />
    <circle cx="40" cy="30" r="3" fill="#5AAA52" />
  </svg>
);

export const HouseleekIcon: React.FC<{ accent: string }> = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={s}>
    <rect x="27" y="55" width="26" height="18" rx="2" fill="#7BAFD4" />
    <rect x="24" y="52" width="32" height="6" rx="2" fill="#9ABFE0" />
    <rect x="27" y="60" width="26" height="3" fill="#FFB74D" opacity="0.6" />
    {[0,45,90,135,180,225,270,315].map((angle, i) => (
      <ellipse key={i}
        cx={40 + 11 * Math.cos(angle * Math.PI / 180)}
        cy={46 + 11 * Math.sin(angle * Math.PI / 180)}
        rx="7" ry="4"
        fill={i % 2 === 0 ? '#3A7A50' : '#2A6A40'}
        transform={`rotate(${angle} ${40 + 11 * Math.cos(angle * Math.PI / 180)} ${46 + 11 * Math.sin(angle * Math.PI / 180)})`}
      />
    ))}
    <circle cx="40" cy="46" r="6" fill="#4A8A5A" />
    <circle cx="40" cy="46" r="3" fill="#6AAA7A" />
    {([{cx:24,cy:44},{cx:55,cy:46}] as {cx:number,cy:number}[]).map((b, i) => (
      <g key={i}>
        {[0, 72, 144, 216, 288].map((angle, j) => (
          <ellipse key={j}
            cx={b.cx + 5 * Math.cos(angle * Math.PI / 180)}
            cy={b.cy + 5 * Math.sin(angle * Math.PI / 180)}
            rx="4" ry="2.5" fill="#5A9A6A"
            transform={`rotate(${angle} ${b.cx + 5 * Math.cos(angle * Math.PI / 180)} ${b.cy + 5 * Math.sin(angle * Math.PI / 180)})`}
          />
        ))}
        <circle cx={b.cx} cy={b.cy} r="3" fill="#7ABB8A" />
      </g>
    ))}
    <line x1="29" y1="47" x2="34" y2="47" stroke="#4A7A5A" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="46" y1="47" x2="50" y2="47" stroke="#4A7A5A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const MandarinIcon: React.FC<{ accent: string }> = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={s}>
    <rect x="27" y="55" width="26" height="18" rx="3" fill="#C4724A" />
    <rect x="24" y="52" width="32" height="7" rx="3" fill="#D4845A" />
    <rect x="27" y="60" width="26" height="3" fill="#FFB74D" opacity="0.6" />
    <rect x="37" y="38" width="6" height="15" rx="3" fill="#8B6A4A" />
    <circle cx="40" cy="30" r="18" fill="#4A8C3A" />
    <circle cx="32" cy="26" r="10" fill="#5A9E4A" />
    <circle cx="48" cy="26" r="10" fill="#5A9E4A" />
    <circle cx="40" cy="20" r="11" fill="#6AAE5A" />
    {([{cx:33,cy:32},{cx:47,cy:30},{cx:40,cy:24},{cx:36,cy:22}] as {cx:number,cy:number}[]).map((f, i) => (
      <g key={i}>
        <circle cx={f.cx} cy={f.cy} r="5" fill="#FF9020" />
        <circle cx={f.cx - 1} cy={f.cy - 1} r="2" fill="#FFB040" opacity="0.7" />
        <line x1={f.cx} y1={f.cy - 5} x2={f.cx} y2={f.cy - 8} stroke="#4A7C3A" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx={f.cx + 2} cy={f.cy - 8} rx="3" ry="1.5" fill="#5A8C4A" transform={`rotate(-20 ${f.cx + 2} ${f.cy - 8})`} />
      </g>
    ))}
  </svg>
);

export const TomatoIcon: React.FC<{ accent: string }> = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={s}>
    <rect x="18" y="58" width="44" height="16" rx="4" fill="#7BAFD4" />
    <rect x="15" y="54" width="50" height="7" rx="3" fill="#9ABFE0" />
    <rect x="18" y="54" width="44" height="5" rx="2" fill="#6B4A2A" />
    <line x1="40" y1="54" x2="40" y2="20" stroke="#4A7A2A" strokeWidth="3" strokeLinecap="round" />
    <line x1="40" y1="44" x2="26" y2="34" stroke="#4A7A2A" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="40" y1="36" x2="54" y2="26" stroke="#4A7A2A" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="40" y1="28" x2="28" y2="20" stroke="#4A7A2A" strokeWidth="2" strokeLinecap="round" />
    {([{cx:22,cy:30,r:-40},{cx:56,cy:22,r:40},{cx:24,cy:18,r:-50},{cx:40,cy:14,r:0}] as {cx:number,cy:number,r:number}[]).map((l, i) => (
      <ellipse key={i} cx={l.cx} cy={l.cy} rx="9" ry="5" fill={i % 2 === 0 ? '#4A8C2A' : '#5AA030'} transform={`rotate(${l.r} ${l.cx} ${l.cy})`} />
    ))}
    {([{cx:28,cy:42},{cx:52,cy:32},{cx:34,cy:24}] as {cx:number,cy:number}[]).map((t, i) => (
      <g key={i}>
        <line x1={t.cx} y1={t.cy - 7} x2={t.cx - 4} y2={t.cy - 11} stroke="#3A7A1A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={t.cx} y1={t.cy - 7} x2={t.cx + 4} y2={t.cy - 11} stroke="#3A7A1A" strokeWidth="1.5" strokeLinecap="round" />
        <line x1={t.cx} y1={t.cy - 7} x2={t.cx} y2={t.cy - 12} stroke="#3A7A1A" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={t.cx} cy={t.cy} r="7" fill={i === 0 ? '#E03020' : i === 1 ? '#C85020' : '#D44020'} />
        <circle cx={t.cx - 2} cy={t.cy - 2} r="2.5" fill="rgba(255,255,255,0.25)" />
      </g>
    ))}
    <rect x="55" y="20" width="2.5" height="35" rx="1" fill="#8B6A4A" opacity="0.7" />
  </svg>
);

export const TradescantiaIcon: React.FC<{ accent: string }> = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={s}>
    <rect x="27" y="55" width="26" height="18" rx="3" fill="#C4956A" />
    <rect x="24" y="52" width="32" height="7" rx="3" fill="#D4A574" />
    <path d="M40 52 C38 45 28 42 22 48" stroke="#6A8A3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M40 52 C42 44 54 42 58 36" stroke="#6A8A3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M40 52 C36 40 30 32 26 24" stroke="#6A8A3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M40 52 C44 38 48 28 52 20" stroke="#6A8A3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M40 52 C38 38 34 28 38 18" stroke="#6A8A3A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {([
      {cx:22,cy:47,r:-30,c1:'#C87AAA',c2:'#8EBC6A'},
      {cx:57,cy:35,r:20,c1:'#D490B8',c2:'#A0C870'},
      {cx:27,cy:24,r:-50,c1:'#BC6A9C',c2:'#7AAA58'},
      {cx:52,cy:20,r:40,c1:'#CC80AE',c2:'#8AB864'},
      {cx:38,cy:18,r:-10,c1:'#D898BE',c2:'#96C472'},
      {cx:30,cy:35,r:-20,c1:'#C070A0',c2:'#80AE58'},
      {cx:50,cy:42,r:30,c1:'#DC9EC4',c2:'#A2CA78'},
    ] as {cx:number,cy:number,r:number,c1:string,c2:string}[]).map((l, i) => (
      <g key={i} transform={`rotate(${l.r} ${l.cx} ${l.cy})`}>
        <path d={`M${l.cx} ${l.cy - 6} Q${l.cx + 7} ${l.cy} ${l.cx} ${l.cy + 6} Z`} fill={l.c1} opacity="0.9" />
        <path d={`M${l.cx} ${l.cy - 6} Q${l.cx - 7} ${l.cy} ${l.cx} ${l.cy + 6} Z`} fill={l.c2} opacity="0.9" />
        <line x1={l.cx} y1={l.cy - 5} x2={l.cx} y2={l.cy + 5} stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      </g>
    ))}
    {([{cx:24,cy:44},{cx:55,cy:32}] as {cx:number,cy:number}[]).map((f, i) => (
      <g key={i}>
        {[0, 120, 240].map((a, j) => (
          <ellipse key={j}
            cx={f.cx + 3.5 * Math.cos(a * Math.PI / 180)}
            cy={f.cy + 3.5 * Math.sin(a * Math.PI / 180)}
            rx="2.5" ry="1.8" fill="#F0B8D8"
            transform={`rotate(${a} ${f.cx + 3.5 * Math.cos(a * Math.PI / 180)} ${f.cy + 3.5 * Math.sin(a * Math.PI / 180)})`}
          />
        ))}
        <circle cx={f.cx} cy={f.cy} r="2" fill="#FFE87A" />
      </g>
    ))}
  </svg>
);

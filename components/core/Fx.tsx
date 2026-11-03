/** Lane: components. Keyframes shared by core components (self-contained; no globals.css edits). */
export default function Fx() {
  return (
    <style>{`
      @keyframes sp-fly-in { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
      @keyframes sp-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes sp-blink { 50% { opacity: 0; } }
      @keyframes sp-ping-ring { 0% { box-shadow: 0 0 0 0 rgba(45,125,255,.55); } 100% { box-shadow: 0 0 0 12px rgba(45,125,255,0); } }
      @keyframes sp-sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
      .sp-fly-in { animation: sp-fly-in .45s cubic-bezier(.2,.8,.2,1) both; }
      .sp-fade-in { animation: sp-fade-in .35s ease both; }
      .sp-caret::after { content: "▍"; margin-left: 1px; color: #B3A369; animation: sp-blink 1s steps(1) infinite; }
      .sp-ping { animation: sp-ping-ring 1.4s ease-out infinite; }
      .sp-sweep { animation: sp-sweep 1.6s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { .sp-fly-in, .sp-fade-in, .sp-caret::after, .sp-ping, .sp-sweep { animation: none !important; } }
    `}</style>
  );
}

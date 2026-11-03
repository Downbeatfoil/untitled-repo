/** Lane: lab. Self-contained keyframes/utility classes for lab pages (globals.css belongs to pages). */
export default function LabStyles() {
  return (
    <style>{`
      @keyframes lab-rise { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: none; } }
      @keyframes lab-pop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes lab-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px) rotate(-1deg); } 40% { transform: translateX(6px) rotate(1deg); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
      @keyframes lab-lunge-l { 0%,100% { transform: translateX(0); } 40% { transform: translateX(46px) scale(1.06); } }
      @keyframes lab-lunge-r { 0%,100% { transform: translateX(0); } 40% { transform: translateX(-46px) scale(1.06); } }
      @keyframes lab-flash { 0% { opacity: .0; } 15% { opacity: .85; } 100% { opacity: 0; } }
      @keyframes lab-float { 50% { transform: translateY(-8px); } }
      @keyframes lab-glow { 0%,100% { box-shadow: 0 0 30px -8px rgba(179,163,105,.55); } 50% { box-shadow: 0 0 60px -6px rgba(179,163,105,.95); } }
      @keyframes lab-scan { from { background-position: 0 0; } to { background-position: 0 -200px; } }
      @keyframes lab-spin { to { transform: rotate(360deg); } }
      @keyframes lab-dot { 0%,80%,100% { opacity: .25; transform: scale(.7); } 40% { opacity: 1; transform: scale(1); } }
      .lab-rise { animation: lab-rise .6s cubic-bezier(.2,.8,.2,1) both; }
      .lab-pop { animation: lab-pop .55s cubic-bezier(.2,.9,.3,1.2) both; }
      .lab-shake { animation: lab-shake .5s ease both; }
      .lab-lunge-l { animation: lab-lunge-l .7s cubic-bezier(.3,.7,.2,1) both; }
      .lab-lunge-r { animation: lab-lunge-r .7s cubic-bezier(.3,.7,.2,1) both; }
      .lab-float { animation: lab-float 4s ease-in-out infinite; }
      .lab-glow { animation: lab-glow 2.6s ease-in-out infinite; }
      .lab-caret::after { content: "▍"; margin-left: 2px; color: #B3A369; animation: sp-blink 1s steps(1) infinite; }
      .lab-grid { background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 44px 44px; mask-image: radial-gradient(ellipse at 50% 0%, #000 15%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000 15%, transparent 70%); }
      .lab-dots span { display: inline-block; width: 7px; height: 7px; margin: 0 3px; border-radius: 99px; background: #B3A369; animation: lab-dot 1.2s infinite; }
      .lab-dots span:nth-child(2) { animation-delay: .15s; } .lab-dots span:nth-child(3) { animation-delay: .3s; }
      .lab-btn-big { position: relative; overflow: hidden; }
      .lab-btn-big::after { content: ""; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,.35) 50%, transparent 65%); transform: translateX(-120%); animation: sp-sweep 2.8s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) { .lab-rise,.lab-pop,.lab-shake,.lab-lunge-l,.lab-lunge-r,.lab-float,.lab-glow,.lab-dots span,.lab-btn-big::after,.lab-caret::after { animation: none !important; } }
    `}</style>
  );
}

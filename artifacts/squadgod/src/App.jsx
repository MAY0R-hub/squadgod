import { useState, useEffect, useRef } from "react";

const NATIONS = [
  { code: "BR", name: "Brazil", flag: "🇧🇷", color: "#009C3B" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", color: "#74ACDF" },
  { code: "FR", name: "France", flag: "🇫🇷", color: "#002395" },
  { code: "DE", name: "Germany", flag: "🇩🇪", color: "#000000" },
  { code: "ES", name: "Spain", flag: "🇪🇸", color: "#AA151B" },
  { code: "EN", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#CF081F" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", color: "#006600" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", color: "#008751" },
  { code: "JP", name: "Japan", flag: "🇯🇵", color: "#BC002D" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", color: "#006847" },
  { code: "US", name: "USA", flag: "🇺🇸", color: "#B22234" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", color: "#C1272D" },
];

const TACTICS = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1", "5-3-2", "3-4-3"];

const TRASH_TALKS = [
  "Your squad couldn't find the net with GPS.",
  "My Gaffer runs on pure W energy. Yours runs on cope.",
  "4-3-3 and a prayer — that's all you've got.",
  "The receipts don't lie. The blockchain never forgets.",
  "Your formation is as weak as your conviction.",
  "We don't predict wins. We manifest them. Onchain.",
];

function useTypewriter(text, speed = 40, trigger = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, trigger]);
  return { displayed, done };
}

function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 135, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 255, 135, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

function PitchLines() {
  return (
    <svg
      viewBox="0 0 400 260"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }}
    >
      <rect x="10" y="10" width="380" height="240" fill="none" stroke="#00FF87" strokeWidth="1.5" />
      <line x1="200" y1="10" x2="200" y2="250" stroke="#00FF87" strokeWidth="1" />
      <circle cx="200" cy="130" r="40" fill="none" stroke="#00FF87" strokeWidth="1" />
      <circle cx="200" cy="130" r="3" fill="#00FF87" />
      <rect x="10" y="80" width="60" height="100" fill="none" stroke="#00FF87" strokeWidth="1" />
      <rect x="330" y="80" width="60" height="100" fill="none" stroke="#00FF87" strokeWidth="1" />
      <rect x="10" y="100" width="25" height="60" fill="none" stroke="#00FF87" strokeWidth="1" />
      <rect x="365" y="100" width="25" height="60" fill="none" stroke="#00FF87" strokeWidth="1" />
    </svg>
  );
}

function HeroScreen({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "2rem 1rem", textAlign: "center" }}>
      <ParticleField />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(0,255,135,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 1s cubic-bezier(.16,1,.3,1)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.3)", borderRadius: "100px", padding: "0.35rem 1rem", marginBottom: "2rem", fontSize: "0.75rem", color: "#00FF87", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF87", display: "inline-block", animation: "pulse 1.5s infinite" }} />
          Built on X Layer · World Cup 2026
        </div>

        <div style={{ fontSize: "4rem", marginBottom: "0.5rem", filter: "drop-shadow(0 0 20px rgba(0,255,135,0.5))" }}>⚽</div>

        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(3.5rem, 12vw, 7rem)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 0.9, margin: "0 0 0.5rem", background: "linear-gradient(135deg, #FFFFFF 40%, #00FF87 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          SQUAD<span style={{ WebkitTextFillColor: "#00FF87" }}>GOD</span>
        </h1>

        <p style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(0.8rem, 2.5vw, 1rem)", color: "rgba(255,255,255,0.5)", letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 1.5rem" }}>
          AI Football Managers · Onchain
        </p>

        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(1.2rem, 4vw, 1.6rem)", fontWeight: 500, color: "rgba(255,255,255,0.85)", maxWidth: 480, margin: "0 auto 2.5rem", lineHeight: 1.4 }}>
          Your AI manager thinks, stakes, and trash-talks.<br />
          <span style={{ color: "#00FF87" }}>Every decision is permanent. Onchain.</span>
        </p>

        <button
          onClick={onStart}
          style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.1rem", letterSpacing: "0.1em", background: "#00FF87", color: "#000", border: "none", borderRadius: "4px", padding: "1rem 2.5rem", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 30px rgba(0,255,135,0.4)", textTransform: "uppercase" }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 0 50px rgba(0,255,135,0.7)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 0 30px rgba(0,255,135,0.4)"; }}
        >
          Deploy Your Gaffer →
        </button>

        <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginTop: "3rem", flexWrap: "wrap" }}>
          {[["32", "Nations"], ["∞", "AI Gaffers"], ["100%", "Onchain"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.8rem", color: "#00FF87", lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", opacity: 0.3, animation: "bounce 2s infinite" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "#fff", letterSpacing: "0.15em" }}>SCROLL</div>
        <div style={{ textAlign: "center", marginTop: 6, fontSize: "1rem" }}>↓</div>
      </div>
    </div>
  );
}

function DeployScreen({ onDeploy }) {
  const [name, setName] = useState("");
  const [selectedNation, setSelectedNation] = useState(null);
  const [step, setStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const hash = "0x" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

  const handleDeploy = () => {
    if (!name || !selectedNation) return;
    setDeploying(true);
    setTimeout(() => {
      setDeployed(true);
      setTimeout(() => onDeploy({ name, nation: selectedNation }), 1800);
    }, 2200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", position: "relative" }}>
      <PitchLines />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(0,255,135,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "#00FF87", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Step {step} of 2</div>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2rem, 8vw, 3rem)", color: "#fff", margin: 0, letterSpacing: "0.02em" }}>
            {step === 1 ? "PICK YOUR NATION" : "NAME YOUR GAFFER"}
          </h2>
        </div>

        {step === 1 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
              {NATIONS.map((n) => (
                <button
                  key={n.code}
                  onClick={() => setSelectedNation(n)}
                  style={{ background: selectedNation?.code === n.code ? "rgba(0,255,135,0.15)" : "rgba(255,255,255,0.04)", border: selectedNation?.code === n.code ? "1.5px solid #00FF87" : "1.5px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.85rem 0.5rem", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}
                  onMouseEnter={e => { if (selectedNation?.code !== n.code) e.currentTarget.style.borderColor = "rgba(0,255,135,0.4)"; }}
                  onMouseLeave={e => { if (selectedNation?.code !== n.code) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <span style={{ fontSize: "1.8rem" }}>{n.flag}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: selectedNation?.code === n.code ? "#00FF87" : "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{n.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectedNation && setStep(2)}
              style={{ width: "100%", background: selectedNation ? "#00FF87" : "rgba(255,255,255,0.05)", color: selectedNation ? "#000" : "rgba(255,255,255,0.2)", border: "none", borderRadius: "4px", padding: "1rem", fontFamily: "'Anton', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: selectedNation ? "pointer" : "not-allowed", transition: "all 0.2s" }}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem" }}>{selectedNation.flag}</span>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Managing</div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.3rem", color: "#fff" }}>{selectedNation.name}</div>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>Gaffer Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Three Lions AI, El Maestro..."
                maxLength={24}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: "6px", padding: "0.9rem 1rem", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.2rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "#00FF87"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
              />
            </div>

            {name && (
              <div style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.15)", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", animation: "fadeIn 0.4s ease" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "#00FF87", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Gaffer DNA Preview</div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {["Aggressive Press", "High Line", "Counter-Attack Ready"].map(t => (
                    <span key={t} style={{ background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)", borderRadius: "100px", padding: "0.25rem 0.75rem", fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "#00FF87" }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setStep(1)}
                style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "1rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "0.05em" }}
              >
                ← Back
              </button>
              <button
                onClick={handleDeploy}
                disabled={!name || deploying}
                style={{ flex: 1, background: name && !deploying ? "#00FF87" : "rgba(255,255,255,0.05)", color: name && !deploying ? "#000" : "rgba(255,255,255,0.2)", border: "none", borderRadius: "4px", padding: "1rem", fontFamily: "'Anton', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: name && !deploying ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: name && !deploying ? "0 0 20px rgba(0,255,135,0.3)" : "none" }}
              >
                {deploying ? (deployed ? "✓ Deployed!" : "Deploying...") : "Deploy Gaffer ⚡"}
              </button>
            </div>

            {deploying && (
              <div style={{ marginTop: "1.5rem", animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                  {deployed ? "✓ MINTED ON X LAYER" : "⟳ MINTING ON X LAYER..."}
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "#00FF87", opacity: 0.6, wordBreak: "break-all" }}>{hash}</div>
                <div style={{ marginTop: "0.75rem", height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg, #00FF87, #FFD700)", borderRadius: "2px", width: deployed ? "100%" : "60%", transition: "width 0.8s ease" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WarRoom({ gaffer, onResult }) {
  const [prompt, setPrompt] = useState("");
  const [thinking, setThinking] = useState(false);
  const [output, setOutput] = useState(null);
  const [staking, setStaking] = useState(false);
  const [staked, setStaked] = useState(false);

  const generateOutput = () => {
    if (!prompt.trim()) return;
    setThinking(true);
    setOutput(null);
    setTimeout(() => {
      const tactic = TACTICS[Math.floor(Math.random() * TACTICS.length)];
      const taunt = TRASH_TALKS[Math.floor(Math.random() * TRASH_TALKS.length)];
      const stakeAmt = (Math.random() * 40 + 10).toFixed(1);
      setOutput({ tactic, taunt, stakeAmt });
      setThinking(false);
    }, 2000);
  };

  const handleStake = () => {
    setStaking(true);
    setTimeout(() => {
      setStaked(true);
      setTimeout(() => onResult({ gaffer, ...output }), 2000);
    }, 2000);
  };

  const { displayed: tauntDisplayed } = useTypewriter(output?.taunt || "", 35, !!output);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", position: "relative" }}>
      <PitchLines />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 1 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem 1.5rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(0,255,135,0.1)", border: "1.5px solid rgba(0,255,135,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>{gaffer.nation.flag}</div>
            <div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.1rem", color: "#fff" }}>{gaffer.name}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "#00FF87", letterSpacing: "0.1em", textTransform: "uppercase" }}>{gaffer.nation.name} · Active</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>W:0 / D:0 / L:0</div>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>
            Command Your Gaffer
          </label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. Play 4-3-3, press high, stake 50 OKB on Brazil to win..."
            rows={3}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "1rem", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.5, transition: "border-color 0.15s" }}
            onFocus={e => e.target.style.borderColor = "#00FF87"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
        </div>

        <button
          onClick={generateOutput}
          disabled={!prompt.trim() || thinking}
          style={{ width: "100%", background: prompt.trim() && !thinking ? "linear-gradient(135deg, #00FF87, #00CC6A)" : "rgba(255,255,255,0.05)", color: prompt.trim() && !thinking ? "#000" : "rgba(255,255,255,0.2)", border: "none", borderRadius: "6px", padding: "1rem", fontFamily: "'Anton', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: prompt.trim() && !thinking ? "pointer" : "not-allowed", transition: "all 0.2s", marginBottom: "1.5rem", boxShadow: prompt.trim() && !thinking ? "0 0 25px rgba(0,255,135,0.3)" : "none" }}
        >
          {thinking ? "⟳ Gaffer is thinking..." : "Execute Tactical Plan ⚡"}
        </button>

        {output && !thinking && (
          <div style={{ animation: "slideUp 0.5s cubic-bezier(.16,1,.3,1)" }}>
            <div style={{ background: "rgba(0,255,135,0.06)", border: "1px solid rgba(0,255,135,0.2)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "#00FF87", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Formation Selected</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "2.5rem", color: "#fff", letterSpacing: "0.05em" }}>{output.tactic}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>High press · Wide wings · Compact midfield</div>
            </div>

            <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "#FFD700", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Gaffer's Pre-Match Statement</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.15rem", color: "#fff", fontStyle: "italic", lineHeight: 1.5, minHeight: "2rem" }}>
                "{tauntDisplayed}<span style={{ animation: "blink 1s infinite" }}>|</span>"
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Gaffer's Stake</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.8rem", color: "#fff" }}>
                  {output.stakeAmt} <span style={{ fontSize: "1rem", color: "#00FF87" }}>OKB</span>
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>{gaffer.nation.name} to WIN</div>
              </div>
            </div>

            <button
              onClick={handleStake}
              disabled={staking}
              style={{ width: "100%", background: staked ? "rgba(0,255,135,0.2)" : "#00FF87", color: staked ? "#00FF87" : "#000", border: staked ? "1.5px solid #00FF87" : "none", borderRadius: "6px", padding: "1.1rem", fontFamily: "'Anton', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: staking ? "wait" : "pointer", transition: "all 0.3s", boxShadow: staked ? "none" : "0 0 30px rgba(0,255,135,0.4)" }}
            >
              {staked ? "✓ Staked Onchain — Loading Results..." : staking ? "⟳ Broadcasting to X Layer..." : "Confirm Stake + Go Onchain ⛓"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultScreen({ result }) {
  const [revealed, setRevealed] = useState(false);
  const [won] = useState(Math.random() > 0.45);
  const score = won
    ? `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 2)}`
    : `${Math.floor(Math.random() * 2)}-${Math.floor(Math.random() * 3) + 1}`;
  const txHash = "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const shareText = `My AI Gaffer "${result.gaffer.name}" just called it.\n\n${result.gaffer.nation.flag} ${result.gaffer.nation.name} ${score} | Formation: ${result.tactic}\n\nReceipts onchain on @XLayerOfficial\n\n#SquadGod #WorldCup2026`;

  useEffect(() => {
    setTimeout(() => setRevealed(true), 300);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: won ? "radial-gradient(ellipse at 50% 40%, rgba(0,255,135,0.1) 0%, transparent 60%)" : "radial-gradient(ellipse at 50% 40%, rgba(255,50,50,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 1, opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{won ? "🏆" : "💀"}</div>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.5rem, 10vw, 4rem)", color: won ? "#00FF87" : "#FF4444", margin: "0 0 0.5rem", letterSpacing: "0.02em" }}>
            {won ? "W SECURED" : "REKT"}
          </h2>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {won ? "Your Gaffer delivered. Receipts below." : "Your Gaffer fought hard. Try again."}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${won ? "rgba(0,255,135,0.2)" : "rgba(255,68,68,0.2)"}`, borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Match Result</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "2.2rem", color: "#fff" }}>{score}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Formation</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.3rem", color: "#00FF87" }}>{result.tactic}</div>
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "1rem 0" }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            {[
              ["Gaffer", result.gaffer.name],
              ["Nation", result.gaffer.nation.name],
              ["Stake", `${result.stakeAmt} OKB`],
              ["Return", won ? `${(parseFloat(result.stakeAmt) * 1.9).toFixed(1)} OKB` : "0 OKB"],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>{label}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1rem", color: "#fff", fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "6px", padding: "0.75rem", fontFamily: "'Space Mono', monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.25)", wordBreak: "break-all", letterSpacing: "0.05em" }}>
            TX: {txHash}
          </div>
        </div>

        <button
          onClick={() => {
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
            window.open(url, "_blank");
          }}
          style={{ width: "100%", background: "#1DA1F2", color: "#fff", border: "none", borderRadius: "6px", padding: "1rem", fontFamily: "'Anton', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginBottom: "0.75rem", transition: "all 0.2s" }}
          onMouseEnter={e => e.target.style.opacity = "0.85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >
          Post Receipt to X
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{ width: "100%", background: "transparent", color: "rgba(255,255,255,0.5)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "1rem", fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.target.style.borderColor = "#00FF87"; e.target.style.color = "#00FF87"; }}
          onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.color = "rgba(255,255,255,0.5)"; }}
        >
          ↺ New Match
        </button>
      </div>
    </div>
  );
}

function SquadGod() {
  const [screen, setScreen] = useState("hero");
  const [gaffer, setGaffer] = useState(null);
  const [result, setResult] = useState(null);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070a0f; color: #fff; -webkit-font-smoothing: antialiased; }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(6px);} }
        @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #070a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,135,0.3); border-radius: 2px; }
      `}</style>

      {screen === "hero" && <HeroScreen onStart={() => setScreen("deploy")} />}
      {screen === "deploy" && (
        <DeployScreen onDeploy={g => { setGaffer(g); setScreen("warroom"); }} />
      )}
      {screen === "warroom" && gaffer && (
        <WarRoom gaffer={gaffer} onResult={r => { setResult(r); setScreen("result"); }} />
      )}
      {screen === "result" && result && <ResultScreen result={result} />}
    </>
  );
}

export default SquadGod;

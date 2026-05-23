import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { 
  Cloud, Zap, TrendingDown, Shield, Brain, ArrowRight, 
  CheckCircle, BarChart3, Bell, Server, Globe
} from "lucide-react";

/* ─── Particle Neural Network Canvas ─── */
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODE_COUNT = 70;
    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      });
    }

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    canvas.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        // Mouse attraction
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          n.vx += dx * 0.0002;
          n.vy += dy * 0.0002;
        }

        // Speed limit
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 1.5) {
          n.vx = (n.vx / speed) * 1.5;
          n.vy = (n.vy / speed) * 1.5;
        }
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.35;
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, `rgba(0,245,255,${alpha})`);
            grad.addColorStop(1, `rgba(124,58,237,${alpha})`);
            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grd.addColorStop(0, "rgba(0,245,255,0.9)");
        grd.addColorStop(0.5, "rgba(124,58,237,0.4)");
        grd.addColorStop(1, "rgba(0,245,255,0)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,245,255,0.85)";
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ─── Rotating 3D Cloud Globe ─── */
function CloudGlobe() {
  return (
    <div
      className="relative w-64 h-64 md:w-80 md:h-80 mx-auto"
      style={{ perspective: "800px" }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border border-cyan-400/20"
        style={{
          animation: "spin-slow 20s linear infinite",
          transformStyle: "preserve-3d",
          borderWidth: "1px",
          boxShadow: "0 0 40px rgba(0,245,255,0.1), inset 0 0 40px rgba(0,245,255,0.05)",
        }}
      />
      {/* Middle ring */}
      <div
        className="absolute"
        style={{
          inset: "20px",
          borderRadius: "50%",
          border: "1px solid rgba(124,58,237,0.3)",
          animation: "spin-slow 15s linear infinite reverse",
          transformStyle: "preserve-3d",
          boxShadow: "0 0 30px rgba(124,58,237,0.15)",
        }}
      />
      {/* Inner sphere */}
      <div
        className="absolute"
        style={{
          inset: "40px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, rgba(0,245,255,0.3) 0%, rgba(124,58,237,0.4) 50%, rgba(8,10,25,0.9) 100%)",
          border: "1px solid rgba(0,245,255,0.25)",
          boxShadow: "0 0 60px rgba(0,245,255,0.2), 0 0 120px rgba(124,58,237,0.15), inset 0 0 40px rgba(124,58,237,0.2)",
          animation: "float-3d 6s ease-in-out infinite",
        }}
      >
        {/* Grid lines on sphere */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(0,245,255,0.07) 19px),
              repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(0,245,255,0.07) 19px)
            `,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        />
      </div>

      {/* Orbiting dots */}
      {[
        { color: "#FF9900", label: "AWS", delay: "0s", radius: "50%", duration: "6s" },
        { color: "#4285F4", label: "GCP", delay: "-2s", radius: "55%", duration: "9s" },
        { color: "#0078D4", label: "Azure", delay: "-4s", radius: "58%", duration: "12s" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            inset: `-${parseInt(p.radius) - 40}%`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: `orbit ${p.duration} linear infinite`,
            animationDelay: p.delay,
            "--orbit-radius": "0px",
          } as React.CSSProperties}
        >
          <div
            className="absolute"
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: p.color,
              boxShadow: `0 0 8px ${p.color}, 0 0 20px ${p.color}50`,
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Animated Counter ─── */
function AnimCounter({ target, prefix = "", suffix = "", duration = 2000 }: {
  target: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) setStarted(true);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <div ref={ref}>{prefix}{count.toLocaleString()}{suffix}</div>;
}

/* ─── 3D Feature Card ─── */
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: React.ElementType; title: string; desc: string; color: string; delay: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative p-6 rounded-2xl cursor-pointer"
      style={{
        background: `linear-gradient(135deg, rgba(15,20,40,0.8), rgba(15,20,40,0.6))`,
        border: `1px solid ${hovered ? color + "50" : "rgba(124,58,237,0.15)"}`,
        backdropFilter: "blur(16px)",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        boxShadow: hovered
          ? `0 25px 50px rgba(0,0,0,0.5), 0 0 30px ${color}25`
          : "0 4px 20px rgba(0,0,0,0.3)",
        animationDelay: delay,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 1 : 0.4,
          transition: "opacity 0.3s",
        }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}35`,
          boxShadow: hovered ? `0 0 20px ${color}30` : "none",
          transition: "box-shadow 0.3s",
        }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3
        className="text-lg font-bold mb-2"
        style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(180,190,220,0.7)" }}>
        {desc}
      </p>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      desc: "Machine learning models detect spending anomalies and idle resources in real-time across all cloud providers.",
      color: "#00f5ff",
    },
    {
      icon: TrendingDown,
      title: "Cost Forecasting",
      desc: "Predict your monthly cloud spend up to 90 days ahead with 94% accuracy using time-series AI models.",
      color: "#7c3aed",
    },
    {
      icon: Zap,
      title: "Instant Recommendations",
      desc: "Get actionable optimization suggestions — rightsizing, reserved instances, and auto-scaling policies.",
      color: "#39ff14",
    },
    {
      icon: Shield,
      title: "Multi-Cloud Coverage",
      desc: "Unified monitoring for AWS, Google Cloud, and Azure from a single intelligent control plane.",
      color: "#ff8228",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      desc: "Real-time notifications when costs spike above thresholds or unused resources are detected.",
      color: "#ff4fab",
    },
    {
      icon: BarChart3,
      title: "Deep Analytics",
      desc: "Drill down into per-service, per-region, and per-team spending with interactive 3D visualizations.",
      color: "#7c3aed",
    },
  ];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #050a18 0%, #0a0820 50%, #050a18 100%)" }}
    >
      {/* Neural Network Canvas Background */}
      <NeuralCanvas />

      {/* Aurora Orbs */}
      <div
        className="aurora-orb"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
          top: "-200px",
          left: "-100px",
          animationDuration: "20s",
        }}
      />
      <div
        className="aurora-orb"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(0,245,255,0.15) 0%, transparent 70%)",
          top: "30%",
          right: "-150px",
          animationDuration: "25s",
          animationDelay: "-8s",
        }}
      />
      <div
        className="aurora-orb"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 70%)",
          bottom: "10%",
          left: "30%",
          animationDuration: "18s",
          animationDelay: "-12s",
        }}
      />

      {/* ─── NAVBAR ─── */}
      <nav
        className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5"
        style={{
          borderBottom: "1px solid rgba(124,58,237,0.12)",
          background: "rgba(5,10,24,0.7)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(124,58,237,0.3))",
              border: "1px solid rgba(0,245,255,0.3)",
              boxShadow: "0 0 15px rgba(0,245,255,0.2)",
            }}
          >
            <Cloud className="w-5 h-5" style={{ color: "#00f5ff" }} />
          </div>
          <span
            className="text-xl font-black"
            style={{
              fontFamily: "'Exo 2', sans-serif",
              background: "linear-gradient(135deg, #00f5ff, #a764ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NimbusAI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "Docs", "Blog"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium transition-colors hover:text-cyan-400"
              style={{ color: "rgba(180,190,220,0.7)", fontFamily: "'Inter', sans-serif" }}
            >
              {item}
            </a>
          ))}
        </div>

        <Link href="/">
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(124,58,237,0.25))",
              border: "1px solid rgba(0,245,255,0.3)",
              color: "#00f5ff",
              boxShadow: "0 0 20px rgba(0,245,255,0.15)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 pt-20 pb-24 gap-12">
        {/* Left Content */}
        <div
          className="flex-1 max-w-2xl"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s cubic-bezier(0.23,1,0.32,1)",
          }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-semibold"
            style={{
              background: "rgba(0,245,255,0.08)",
              border: "1px solid rgba(0,245,255,0.2)",
              color: "#00f5ff",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span className="led-green" style={{ width: "6px", height: "6px" }} />
            AI-Powered • Multi-Cloud • Real-Time
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-black leading-tight mb-6"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            <span style={{ color: "#e8ecf5" }}>See Your Cloud.</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00f5ff 0%, #7c3aed 60%, #a764ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Control Your Costs.
            </span>
          </h1>

          <p
            className="text-lg md:text-xl mb-10 leading-relaxed"
            style={{ color: "rgba(180,190,220,0.75)", fontFamily: "'Inter', sans-serif" }}
          >
            NimbusAI continuously monitors your AWS, GCP, and Azure infrastructure,
            detects wasteful spending, predicts future costs, and gives you AI-powered
            recommendations to cut your cloud bill by up to{" "}
            <span style={{ color: "#39ff14", fontWeight: 700 }}>40%</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link href="/">
              <button
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #00f5ff)",
                  color: "#050a18",
                  fontFamily: "'Exo 2', sans-serif",
                  boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 0 60px rgba(0,245,255,0.15)",
                }}
              >
                <Zap className="w-5 h-5" />
                Start Optimizing Free
              </button>
            </Link>
            <button
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:scale-105"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a764ff",
                fontFamily: "'Exo 2', sans-serif",
              }}
            >
              <Globe className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6">
            {[
              { icon: CheckCircle, text: "No credit card required" },
              { icon: Shield, text: "SOC2 Type II certified" },
              { icon: Server, text: "Setup in 5 minutes" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: "#39ff14" }} />
                <span className="text-sm" style={{ color: "rgba(180,190,220,0.6)", fontFamily: "'Inter', sans-serif" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — 3D Globe */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 1s cubic-bezier(0.23,1,0.32,1) 0.2s",
          }}
        >
          <CloudGlobe />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section
        className="relative z-10 py-16 px-6 md:px-12"
        style={{ borderTop: "1px solid rgba(124,58,237,0.1)", borderBottom: "1px solid rgba(124,58,237,0.1)" }}
      >
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{
            background: "rgba(12,16,32,0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(124,58,237,0.12)",
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: 2400, suf: "+", label: "DevOps Teams", color: "#00f5ff" },
              { val: 40, suf: "%", label: "Avg Cost Reduction", color: "#39ff14" },
              { val: 8500000, suf: "$", label: "Saved This Month", color: "#a764ff", pre: "$" },
              { val: 99, suf: ".9%", label: "Platform Uptime", color: "#ff8228" },
            ].map(({ val, suf, label, color, pre }, i) => (
              <div key={i}>
                <div
                  className="text-4xl md:text-5xl font-black mb-2"
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    color,
                    textShadow: `0 0 20px ${color}60`,
                  }}
                >
                  <AnimCounter target={val} prefix={pre || ""} suffix={suf} />
                </div>
                <div className="text-sm" style={{ color: "rgba(180,190,220,0.5)", fontFamily: "'Inter', sans-serif" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <div className="text-center mb-16">
          <div
            className="inline-block text-xs font-semibold px-4 py-2 rounded-full mb-4"
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "#a764ff",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            CAPABILITIES
          </div>
          <h2
            className="text-4xl md:text-5xl font-black mb-4"
            style={{
              fontFamily: "'Exo 2', sans-serif",
              background: "linear-gradient(135deg, #e8ecf5, #a764ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Everything You Need
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(180,190,220,0.6)", fontFamily: "'Inter', sans-serif" }}>
            NimbusAI combines real-time monitoring, AI prediction, and actionable recommendations
            in one intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={`${i * 0.1}s`} />
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="relative z-10 py-24 px-6 md:px-12">
        <div
          className="max-w-4xl mx-auto text-center rounded-3xl p-12 md:p-16 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(0,245,255,0.08))",
            border: "1px solid rgba(124,58,237,0.25)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 rounded-tl-3xl" style={{ borderColor: "#00f5ff" }} />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 rounded-br-3xl" style={{ borderColor: "#7c3aed" }} />

          <h2
            className="text-4xl md:text-5xl font-black mb-6"
            style={{ fontFamily: "'Exo 2', sans-serif", color: "#e8ecf5" }}
          >
            Ready to cut your
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00f5ff, #39ff14)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              cloud bill in half?
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(180,190,220,0.65)", fontFamily: "'Inter', sans-serif" }}>
            Connect your cloud accounts in under 5 minutes. No complex setup. Start saving today.
          </p>
          <Link href="/">
            <button
              className="flex items-center gap-3 mx-auto px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #00f5ff)",
                color: "#050a18",
                fontFamily: "'Exo 2', sans-serif",
                boxShadow: "0 0 50px rgba(124,58,237,0.5), 0 0 100px rgba(0,245,255,0.2)",
              }}
            >
              <Zap className="w-6 h-6" />
              Open Dashboard
              <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 text-center py-8 px-6"
        style={{
          borderTop: "1px solid rgba(124,58,237,0.1)",
          color: "rgba(140,150,180,0.4)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
        }}
      >
        © 2025 NimbusAI — Cloud Cost Intelligence • Built for DevOps Heroes
      </footer>
    </div>
  );
}

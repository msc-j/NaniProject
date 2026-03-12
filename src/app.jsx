import { useState } from "react";

const EMOJIS = {
  sounds: ["🦁", "🐯", "🦊", "🐸", "🐝", "🦋", "🌸", "⭐", "🎈", "🌈"],
  success: ["🎉", "⭐", "🌟", "✨", "🏆", "🎊"],
};

const THEMES = {
  animals: { label: "Животные", emoji: "🐾" },
  nature: { label: "Природа", emoji: "🌿" },
  food: { label: "Еда", emoji: "🍎" },
  family: { label: "Семья", emoji: "👨‍👩‍👧" },
  body: { label: "Тело", emoji: "💪" },
};

const GOALS = [
  { id: "articulation", label: "Артикуляция", emoji: "👄" },
  { id: "vocabulary", label: "Словарный запас", emoji: "📚" },
  { id: "fluency", label: "Плавность речи", emoji: "🌊" },
  { id: "comprehension", label: "Понимание", emoji: "🧠" },
  { id: "phonology", label: "Фонология", emoji: "🔤" },
];

async function generateActivity({ age, targetSound, theme, goal }) {
  const themeLabel = THEMES[theme]?.label || theme;
  const goalLabel = GOALS.find((g) => g.id === goal)?.label || goal;

  const prompt = `You are a creative speech therapy assistant helping a therapist who works with Russian-speaking children with disabilities in Thailand.

Generate a structured, playful speech therapy activity in Russian for a child aged ${age} years.
- Target sound/word: "${targetSound}"
- Theme: ${themeLabel}
- Therapy goal: ${goalLabel}

Respond ONLY with a valid JSON object (no markdown, no backticks, no explanation) in this exact format:
{
  "title": "Fun activity title in Russian",
  "emoji": "single relevant emoji",
  "instructions": "2-3 sentence therapist instruction in Russian",
  "words": ["word1", "word2", "word3", "word4", "word5"],
  "sentence": "A simple practice sentence in Russian using the target sound",
  "game": {
    "name": "Mini-game name in Russian",
    "description": "Short description of a simple interactive exercise the child can do in Russian"
  },
  "tip": "One therapist tip in Russian for encouraging the child",
  "praise": ["Short praise phrase 1 in Russian", "Short praise phrase 2 in Russian", "Short praise phrase 3 in Russian"]
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.find((b) => b.type === "text")?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function WordCard({ word, targetSound, onTap }) {
  const [tapped, setTapped] = useState(false);
  const highlight = (w) => {
    if (!targetSound) return w;
    const regex = new RegExp(`(${targetSound})`, "gi");
    const parts = w.split(regex);
    return parts.map((p, i) =>
      regex.test(p) ? (
        <span key={i} style={{ color: "#f59e0b", fontWeight: 800 }}>
          {p}
        </span>
      ) : (
        p
      )
    );
  };

  return (
    <button
      onClick={() => {
        setTapped(true);
        onTap(word);
        setTimeout(() => setTapped(false), 600);
      }}
      style={{
        background: tapped ? "#1e3a5f" : "rgba(255,255,255,0.06)",
        border: tapped ? "2px solid #60a5fa" : "2px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "10px 18px",
        color: "#e2e8f0",
        fontSize: 20,
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
        transform: tapped ? "scale(0.95)" : "scale(1)",
        letterSpacing: 1,
      }}
    >
      {highlight(word)}
    </button>
  );
}

function PraiseToast({ phrase }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "linear-gradient(135deg, #f59e0b, #ef4444)",
        color: "white",
        padding: "12px 28px",
        borderRadius: 50,
        fontSize: 22,
        fontWeight: 800,
        fontFamily: "'Nunito', sans-serif",
        zIndex: 1000,
        boxShadow: "0 8px 32px rgba(245,158,11,0.4)",
        animation: "fadeInOut 2s ease forwards",
        pointerEvents: "none",
      }}
    >
      {EMOJIS.success[Math.floor(Math.random() * EMOJIS.success.length)]} {phrase}
    </div>
  );
}

export default function App() {
  const [age, setAge] = useState(5);
  const [targetSound, setTargetSound] = useState("р");
  const [theme, setTheme] = useState("animals");
  const [goal, setGoal] = useState("articulation");
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [praise, setPraise] = useState(null);
  const [tappedWords, setTappedWords] = useState([]);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setActivity(null);
    setTappedWords([]);
    try {
      const result = await generateActivity({ age, targetSound, theme, goal });
      setActivity(result);
    } catch (e) {
      setError("Не удалось создать активность. Попробуйте снова.");
    }
    setLoading(false);
  };

  const handleWordTap = (word) => {
    setTappedWords((prev) => [...prev, word]);
    if (activity?.praise) {
      const p = activity.praise[Math.floor(Math.random() * activity.praise.length)];
      setPraise(p);
      setTimeout(() => setPraise(null), 2000);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)",
        fontFamily: "'Nunito', sans-serif",
        color: "#e2e8f0",
        padding: "0 0 60px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Unbounded:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .card { transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
      `}</style>

      {praise && <PraiseToast phrase={praise} />}

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, transparent 100%)",
          padding: "36px 24px 28px",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 13, letterSpacing: 4, color: "#60a5fa", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
          Логопед • Ассистент
        </div>
        <h1
          style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: "clamp(22px, 5vw, 38px)",
            fontWeight: 900,
            margin: 0,
            background: "linear-gradient(135deg, #e2e8f0 30%, #60a5fa 70%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
          }}
        >
          Говорим Вместе
        </h1>
        <p style={{ color: "#64748b", fontSize: 15, margin: "10px 0 0", fontWeight: 600 }}>
          AI-помощник для логопедических занятий
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

        {/* Config Panel */}
        <div
          className="card"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Age */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                Возраст
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setAge(Math.max(2, age - 1))}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "white", fontSize: 20, cursor: "pointer" }}>−</button>
                <span style={{ fontSize: 28, fontWeight: 900, minWidth: 40, textAlign: "center" }}>{age}</span>
                <button onClick={() => setAge(Math.min(12, age + 1))}
                  style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "white", fontSize: 20, cursor: "pointer" }}>+</button>
              </div>
            </div>
            {/* Target sound */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                Целевой звук / слово
              </label>
              <input
                value={targetSound}
                onChange={(e) => setTargetSound(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  padding: "8px 14px",
                  color: "#e2e8f0",
                  fontSize: 22,
                  fontWeight: 800,
                  width: "100%",
                  outline: "none",
                  fontFamily: "'Nunito', sans-serif",
                }}
                placeholder="р, ш, лес..."
              />
            </div>
          </div>

          {/* Theme */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              Тема
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(THEMES).map(([key, val]) => (
                <button key={key} onClick={() => setTheme(key)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
                    background: theme === key ? "#3b82f6" : "rgba(255,255,255,0.07)",
                    color: theme === key ? "white" : "#94a3b8",
                    transition: "all 0.15s",
                  }}>
                  {val.emoji} {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
              Цель занятия
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {GOALS.map((g) => (
                <button key={g.id} onClick={() => setGoal(g.id)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
                    background: goal === g.id ? "#8b5cf6" : "rgba(255,255,255,0.07)",
                    color: goal === g.id ? "white" : "#94a3b8",
                    transition: "all 0.15s",
                  }}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={loading || !targetSound.trim()}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: loading ? "#64748b" : "white",
              fontSize: 17,
              fontWeight: 800,
              fontFamily: "'Nunito', sans-serif",
              cursor: loading || !targetSound.trim() ? "not-allowed" : "pointer",
              letterSpacing: 0.5,
              boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.3)",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <span style={{ animation: "pulse 1.2s infinite" }}>✨ Создаю активность...</span>
            ) : (
              "✨ Создать активность"
            )}
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 16, color: "#fca5a5", fontSize: 15, marginBottom: 16, textAlign: "center" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Activity Output */}
        {activity && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Title card */}
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: 20,
                padding: 24,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 52 }}>{activity.emoji}</div>
              <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 22, fontWeight: 900, margin: "8px 0 6px", color: "#e2e8f0" }}>{activity.title}</h2>
              <p style={{ color: "#94a3b8", fontSize: 15, margin: 0, lineHeight: 1.5 }}>{activity.instructions}</p>
            </div>

            {/* Words */}
            <div
              className="card"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 12, color: "#60a5fa", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
                👆 Нажмите на слова
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {activity.words?.map((word, i) => (
                  <WordCard key={i} word={word} targetSound={targetSound} onTap={handleWordTap} />
                ))}
              </div>
              {tappedWords.length > 0 && (
                <div style={{ marginTop: 14, fontSize: 13, color: "#64748b" }}>
                  Произнесено: {tappedWords.length} {tappedWords.length === 1 ? "слово" : "слов"} ⭐
                </div>
              )}
            </div>

            {/* Sentence */}
            <div
              className="card"
              style={{
                background: "rgba(245,158,11,0.07)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 20,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
                📖 Практическое предложение
              </div>
              <p style={{ fontSize: 19, fontWeight: 700, margin: 0, lineHeight: 1.5, color: "#e2e8f0" }}>
                «{activity.sentence}»
              </p>
            </div>

            {/* Mini game */}
            <div
              className="card"
              style={{
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 20,
                padding: 20,
              }}
            >
              <div style={{ fontSize: 12, color: "#10b981", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
                🎮 {activity.game?.name}
              </div>
              <p style={{ fontSize: 16, margin: 0, lineHeight: 1.6, color: "#94a3b8" }}>{activity.game?.description}</p>
            </div>

            {/* Therapist tip */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px dashed rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: 18,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 24 }}>💡</span>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 5 }}>Совет логопеда</div>
                <p style={{ margin: 0, fontSize: 14, color: "#94a3b8", lineHeight: 1.6 }}>{activity.tip}</p>
              </div>
            </div>

            {/* Regenerate */}
            <button
              onClick={generate}
              style={{
                padding: "12px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "#94a3b8",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#e2e8f0"; }}
              onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#94a3b8"; }}
            >
              🔄 Создать другую активность
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 36, color: "#334155", fontSize: 13, fontWeight: 600 }}>
          Создано с ❤️ для Нани и её учеников
        </div>
      </div>
    </div>
  );
}

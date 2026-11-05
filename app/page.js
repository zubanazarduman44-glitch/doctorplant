"use client";

import { useRef, useState } from "react";

// Барлық мәтіндер екі тілде / Все тексты на двух языках
const T = {
  kk: {
    title: "Өсімдік дәрігері",
    subtitle: "Өсімдікті суретке түсіріңіз — ЖИ түрін, жағдайын анықтап, күтім бойынша кеңес береді",
    upload: "Сурет түсіру немесе таңдау",
    change: "Басқа сурет",
    analyze: "Талдау",
    analyzing: "Талдап жатырмыз…",
    tips: "Жақсы нәтиже үшін: күндізгі жарықта, ауру жапыраққа жақын түсіріңіз",
    plant: "Өсімдік",
    confidence: "Сенімділік",
    status: "Жағдайы",
    diagnosis: "Диагноз",
    symptoms: "Белгілері",
    causes: "Себептері",
    treatment: "Не істеу керек",
    care: "Күтім",
    watering: "Суару",
    light: "Жарық",
    temperature: "Температура",
    soil: "Топырақ және тыңайтқыш",
    toxicity: "Назар аударыңыз",
    photoTip: "Сурет туралы кеңес",
    notPlant: "Суретте өсімдік табылмады",
    helpful: "Жауап пайдалы болды ма?",
    thanks: "Рахмет! Пікіріңіз біз үшін маңызды",
    disclaimer:
      "ЖИ қателесуі мүмкін. Кеңестер ақпараттық сипатта. Химиялық препараттарды қолданбас бұрын маманмен ақылдасыңыз және нұсқаулықты оқыңыз.",
    statuses: { healthy: "Сау", needs_attention: "Назар қажет", sick: "Ауру", unknown: "Белгісіз" },
    lowConf: "ЖИ сенімді емес — басқа бұрыштан тағы бір сурет жіберіп көріңіз",
  },
  ru: {
    title: "Доктор растений",
    subtitle: "Сфотографируйте растение — ИИ определит вид, состояние и даст советы по уходу",
    upload: "Сделать или выбрать фото",
    change: "Другое фото",
    analyze: "Анализировать",
    analyzing: "Анализируем…",
    tips: "Для точности: снимайте при дневном свете, близко к больному листу",
    plant: "Растение",
    confidence: "Уверенность",
    status: "Состояние",
    diagnosis: "Диагноз",
    symptoms: "Симптомы",
    causes: "Причины",
    treatment: "Что делать",
    care: "Уход",
    watering: "Полив",
    light: "Свет",
    temperature: "Температура",
    soil: "Почва и удобрения",
    toxicity: "Обратите внимание",
    photoTip: "Совет по фото",
    notPlant: "На фото не найдено растение",
    helpful: "Ответ был полезен?",
    thanks: "Спасибо! Ваш отзыв важен для нас",
    disclaimer:
      "ИИ может ошибаться. Советы носят информационный характер. Перед применением химических препаратов проконсультируйтесь со специалистом и прочитайте инструкцию.",
    statuses: { healthy: "Здорово", needs_attention: "Требует внимания", sick: "Болеет", unknown: "Неизвестно" },
    lowConf: "ИИ не уверен — попробуйте прислать ещё одно фото с другого ракурса",
  },
};

// Суретті кішірейтеміз (жылдамырақ, арзанырақ) және EXIF/геолокацияны өшіреміз
// Уменьшаем фото (быстрее, дешевле) и удаляем EXIF/геолокацию
function compressImage(file, maxSize = 1280) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Home() {
  const [lang, setLang] = useState("kk");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);
  const t = T[lang];

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setError("");
    setFeedback(null);
    try {
      setImage(await compressImage(file));
    } catch {
      setError("Error reading image");
    }
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setError("");
    setResult(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">
          <span className="logo">🌿</span>
          <span>{t.title}</span>
        </div>
        <div className="lang">
          {["kk", "ru"].map((l) => (
            <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>
              {l === "kk" ? "ҚАЗ" : "РУС"}
            </button>
          ))}
        </div>
      </header>

      <p className="subtitle">{t.subtitle}</p>

      <section className="card upload">
        <input ref={inputRef} type="file" accept="image/*" onChange={onFile} hidden />
        {image ? (
          <img src={image} alt="" className="preview" />
        ) : (
          <button className="drop" onClick={() => inputRef.current?.click()}>
            <span className="cam">📷</span>
            <span>{t.upload}</span>
          </button>
        )}
        <p className="hint">{t.tips}</p>
        {image && (
          <div className="row">
            <button className="ghost" onClick={() => inputRef.current?.click()} disabled={loading}>
              {t.change}
            </button>
            <button className="primary" onClick={analyze} disabled={loading}>
              {loading ? t.analyzing : t.analyze}
            </button>
          </div>
        )}
      </section>

      {error && <div className="card err">⚠️ {error}</div>}

      {result && <Result r={result} t={t} />}

      {result && (
        <div className="card feedback">
          {feedback ? (
            <span>{t.thanks}</span>
          ) : (
            <>
              <span>{t.helpful}</span>
              <button onClick={() => setFeedback("up")}>👍</button>
              <button onClick={() => setFeedback("down")}>👎</button>
            </>
          )}
        </div>
      )}

      <footer className="disclaimer">{t.disclaimer}</footer>
    </main>
  );
}

function Result({ r, t }) {
  if (r.is_plant === false) {
    return (
      <div className="card">
        <h2>{t.notPlant}</h2>
        {r.photo_tip && <p>{r.photo_tip}</p>}
      </div>
    );
  }
  const status = r.health_status || "unknown";
  return (
    <section className="card result">
      <div className="head">
        <div>
          <div className="label">{t.plant}</div>
          <h2>{r.plant_name || "—"}</h2>
          {r.latin_name && <div className="latin">{r.latin_name}</div>}
        </div>
        <span className={`badge ${status}`}>{t.statuses[status]}</span>
      </div>

      <div className="conf">
        <div className="label">
          {t.confidence}: {r.confidence ?? 0}%
        </div>
        <div className="bar">
          <div style={{ width: `${r.confidence ?? 0}%` }} />
        </div>
        {(r.confidence ?? 0) < 60 && <p className="warn">{t.lowConf}</p>}
      </div>

      <Block title={t.diagnosis}>
        <p className="diag">{r.diagnosis}</p>
      </Block>
      <List title={t.symptoms} items={r.symptoms} />
      <List title={t.causes} items={r.causes} />
      <List title={t.treatment} items={r.treatment} ordered />

      {r.care && (
        <Block title={t.care}>
          <div className="care">
            <Care icon="💧" k={t.watering} v={r.care.watering} />
            <Care icon="☀️" k={t.light} v={r.care.light} />
            <Care icon="🌡️" k={t.temperature} v={r.care.temperature} />
            <Care icon="🪴" k={t.soil} v={r.care.soil_fertilizer} />
          </div>
        </Block>
      )}

      {r.toxicity_note && (
        <Block title={t.toxicity}>
          <p className="note">⚠️ {r.toxicity_note}</p>
        </Block>
      )}
      {r.photo_tip && (
        <Block title={t.photoTip}>
          <p className="note">📸 {r.photo_tip}</p>
        </Block>
      )}
    </section>
  );
}

function Block({ title, children }) {
  return (
    <div className="block">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function List({ title, items, ordered }) {
  if (!items?.length) return null;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Block title={title}>
      <Tag>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </Tag>
    </Block>
  );
}

function Care({ icon, k, v }) {
  if (!v) return null;
  return (
    <div className="care-item">
      <span className="ci">{icon}</span>
      <div>
        <div className="label">{k}</div>
        <div>{v}</div>
      </div>
    </div>
  );
}

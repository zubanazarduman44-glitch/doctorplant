"use client";

import { useEffect, useRef, useState } from "react";

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
    diagnosis: "Диагноз",
    symptoms: "Белгілері",
    causes: "Себептері",
    treatment: "Не істеу керек",
    products: "Қазақстанда қандай препарат алуға болады",
    activeIngredient: "Әсер етуші зат",
    brands: "Мысалы",
    searchKaspi: "Kaspi-ден іздеу",
    productsNote:
      "ЖИ ұсынған препараттар — тек бағдар. Сатып алмас бұрын нұсқаулықты оқыңыз, мөлшерді қаптамадан алыңыз, күмән болса агродүкен маманынан сұраңыз.",
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
    whatWrong: "Не дұрыс емес? (міндетті емес)",
    send: "Жіберу",
    chatTitle: "Сұрақ қойыңыз",
    chatPlaceholder: "Мысалы: қаншалықты жиі суару керек?",
    chatSuggest: ["Қанша рет суару керек?", "Басқа өсімдіктерге жұға ма?", "Қайта отырғызу керек пе?"],
    thinking: "Жазып жатыр…",
    history: "Тарих",
    historyEmpty: "Әзірге тарих жоқ",
    clear: "Тазалау",
    back: "← Артқа",
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
    diagnosis: "Диагноз",
    symptoms: "Симптомы",
    causes: "Причины",
    treatment: "Что делать",
    products: "Какие препараты купить в Казахстане",
    activeIngredient: "Действующее вещество",
    brands: "Например",
    searchKaspi: "Найти на Kaspi",
    productsNote:
      "Препараты, предложенные ИИ, — только ориентир. Перед покупкой прочитайте инструкцию, дозировку берите с упаковки, при сомнениях спросите консультанта в агромагазине.",
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
    whatWrong: "Что не так? (необязательно)",
    send: "Отправить",
    chatTitle: "Задайте вопрос",
    chatPlaceholder: "Например: как часто поливать?",
    chatSuggest: ["Как часто поливать?", "Перейдёт ли на другие растения?", "Нужно ли пересаживать?"],
    thinking: "Печатает…",
    history: "История",
    historyEmpty: "Пока истории нет",
    clear: "Очистить",
    back: "← Назад",
    disclaimer:
      "ИИ может ошибаться. Советы носят информационный характер. Перед применением химических препаратов проконсультируйтесь со специалистом и прочитайте инструкцию.",
    statuses: { healthy: "Здорово", needs_attention: "Требует внимания", sick: "Болеет", unknown: "Неизвестно" },
    lowConf: "ИИ не уверен — попробуйте прислать ещё одно фото с другого ракурса",
  },
};

const HISTORY_KEY = "osimdik_history_v1";
const CLIENT_KEY = "osimdik_client_id";
const LANG_KEY = "osimdik_lang";

// localStorage кейде қолжетімсіз болады — абайлап қолданамыз
function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch {
    return null;
  }
}

// Суретті кішірейтеміз (жылдамырақ, арзанырақ) және EXIF/геолокацияны өшіреміз
function compressImage(file, maxSize = 1280, quality = 0.85) {
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
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Тарих үшін кішкентай нобай / Маленькая миниатюра для истории
function thumbnail(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 96;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const s = Math.min(img.width, img.height);
      canvas
        .getContext("2d")
        .drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // Сервер кейде JSON емес мәтін қайтарады (таймаут т.б.) — абайлап оқимыз
  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(
      res.status === 504
        ? "Сервер уақытында жауап бермеді, қайталап көріңіз / Сервер не успел ответить, попробуйте ещё раз"
        : `Сервер қатесі ${res.status} / Ошибка сервера ${res.status}: ${raw.slice(0, 120)}`
    );
  }
  if (!res.ok) throw new Error(data.error || "Error");
  return data;
}

export default function Home() {
  const [lang, setLang] = useState("kk");
  const [view, setView] = useState("main"); // main | history
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [clientId, setClientId] = useState(null);
  const inputRef = useRef(null);
  const t = T[lang];

  useEffect(() => {
    const savedLang = store(LANG_KEY);
    if (savedLang === "kk" || savedLang === "ru") setLang(savedLang);
    try {
      setHistory(JSON.parse(store(HISTORY_KEY) || "[]"));
    } catch {}
    let id = store(CLIENT_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || String(Date.now());
      store(CLIENT_KEY, id);
    }
    setClientId(id);
  }, []);

  function changeLang(l) {
    setLang(l);
    store(LANG_KEY, l);
  }

  function saveHistory(list) {
    setHistory(list);
    store(HISTORY_KEY, JSON.stringify(list));
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setResult(null);
    setError("");
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
    try {
      const data = await postJSON("/api/diagnose", { image, lang, clientId });
      const entry = {
        key: data.id || String(Date.now()),
        date: new Date().toISOString(),
        lang,
        thumb: await thumbnail(image),
        result: data,
        chat: [],
        feedback: null,
      };
      setResult(entry);
      if (data.is_plant !== false) saveHistory([entry, ...history].slice(0, 20));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Нәтижедегі өзгерістерді (чат, пікір) тарихқа да жазамыз
  function updateEntry(patch) {
    const key = result?.key;
    setResult((prev) => ({ ...prev, ...patch }));
    setHistory((list) => {
      const next = list.map((h) => (h.key === key ? { ...h, ...patch } : h));
      store(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  function openFromHistory(entry) {
    setResult(entry);
    setImage(null);
    setError("");
    setView("main");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="wrap">
      <header className="top">
        <button className="brand" onClick={() => setView("main")}>
          <span className="logo">🌿</span>
          <span>{t.title}</span>
        </button>
        <div className="top-right">
          <button className="hist-btn" onClick={() => setView(view === "history" ? "main" : "history")}>
            🕘 {t.history}
            {history.length > 0 && <span className="count">{history.length}</span>}
          </button>
          <div className="lang">
            {["kk", "ru"].map((l) => (
              <button key={l} className={lang === l ? "on" : ""} onClick={() => changeLang(l)}>
                {l === "kk" ? "ҚАЗ" : "РУС"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {view === "history" ? (
        <History
          t={t}
          history={history}
          onOpen={openFromHistory}
          onClear={() => saveHistory([])}
          onBack={() => setView("main")}
        />
      ) : (
        <>
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

          {result && (
            <>
              <Result r={result.result} t={t} thumb={!image ? result.thumb : null} />
              {result.result.is_plant !== false && (
                <>
                  <Feedback t={t} entry={result} onUpdate={updateEntry} />
                  <Chat t={t} lang={result.lang || lang} entry={result} onUpdate={updateEntry} />
                </>
              )}
            </>
          )}
        </>
      )}

      <footer className="disclaimer">{t.disclaimer}</footer>
    </main>
  );
}

function History({ t, history, onOpen, onClear, onBack }) {
  return (
    <section>
      <div className="hist-head">
        <button className="link" onClick={onBack}>
          {t.back}
        </button>
        {history.length > 0 && (
          <button className="link" onClick={onClear}>
            {t.clear}
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="card muted">{t.historyEmpty}</div>
      ) : (
        history.map((h) => {
          const status = h.result?.health_status || "unknown";
          return (
            <button key={h.key} className="card hist-item" onClick={() => onOpen(h)}>
              {h.thumb ? <img src={h.thumb} alt="" /> : <span className="hist-ph">🌱</span>}
              <div className="hist-text">
                <strong>{h.result?.plant_name || "—"}</strong>
                <span className="hist-diag">{h.result?.diagnosis}</span>
                <span className="hist-date">{new Date(h.date).toLocaleDateString()}</span>
              </div>
              <span className={`badge ${status}`}>{t.statuses[status]}</span>
            </button>
          );
        })
      )}
    </section>
  );
}

function Result({ r, t, thumb }) {
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
        {thumb && <img src={thumb} alt="" className="head-thumb" />}
        <div className="head-text">
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

      {r.products?.length > 0 && (
        <Block title={`🧴 ${t.products}`}>
          <div className="products">
            {r.products.map((p, i) => (
              <div key={i} className="product">
                <div className="p-type">{p.product_type}</div>
                {p.active_ingredient && (
                  <div className="p-line">
                    <span className="label">{t.activeIngredient}:</span> {p.active_ingredient}
                  </div>
                )}
                {p.example_brands?.length > 0 && (
                  <div className="p-line">
                    <span className="label">{t.brands}:</span> {p.example_brands.join(", ")}
                  </div>
                )}
                {p.safety && <div className="p-safety">⚠️ {p.safety}</div>}
                <a
                  className="p-link"
                  href={`https://kaspi.kz/shop/search/?text=${encodeURIComponent(
                    p.search_query || p.active_ingredient || p.product_type
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔎 {t.searchKaspi}
                </a>
              </div>
            ))}
          </div>
          <p className="p-note">{t.productsNote}</p>
        </Block>
      )}

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

function Feedback({ t, entry, onUpdate }) {
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const id = entry.result?.id;

  function vote(v) {
    onUpdate({ feedback: v });
    if (v === "up") send(v, "");
  }

  function send(v, c) {
    setSent(true);
    if (id) postJSON("/api/feedback", { id, feedback: v, comment: c }).catch(() => {});
  }

  if (entry.feedback && (entry.feedback === "up" || sent)) {
    return <div className="card feedback">{t.thanks}</div>;
  }

  if (entry.feedback === "down") {
    return (
      <div className="card feedback col">
        <span>{t.whatWrong}</span>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={500} />
        <button className="primary small" onClick={() => send("down", comment)}>
          {t.send}
        </button>
      </div>
    );
  }

  return (
    <div className="card feedback">
      <span>{t.helpful}</span>
      <button onClick={() => vote("up")}>👍</button>
      <button onClick={() => vote("down")}>👎</button>
    </div>
  );
}

function Chat({ t, lang, entry, onUpdate }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef(null);
  const messages = entry.chat || [];

  useEffect(() => {
    if (messages.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, busy]);

  async function ask(q) {
    const question = (q ?? text).trim();
    if (!question || busy) return;
    const next = [...messages, { role: "user", text: question }];
    onUpdate({ chat: next });
    setText("");
    setBusy(true);
    setErr("");
    try {
      const data = await postJSON("/api/chat", {
        messages: next,
        diagnosis: entry.result,
        diagnosisId: entry.result?.id,
        lang,
      });
      onUpdate({ chat: [...next, { role: "assistant", text: data.reply }] });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card chat">
      <h3>💬 {t.chatTitle}</h3>
      {messages.length === 0 && (
        <div className="suggest">
          {t.chatSuggest.map((s) => (
            <button key={s} onClick={() => ask(s)} disabled={busy}>
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="msgs">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {busy && <div className="msg assistant muted">{t.thinking}</div>}
        <div ref={endRef} />
      </div>
      {err && <p className="warn">⚠️ {err}</p>}
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.chatPlaceholder}
          maxLength={1000}
          disabled={busy}
        />
        <button type="submit" className="primary" disabled={busy || !text.trim()}>
          ➤
        </button>
      </form>
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

"use client";

import { useEffect, useRef, useState } from "react";

// Барлық мәтіндер екі тілде / Все тексты на двух языках
const T = {
  kk: {
    brand: "Өсімдік дәрігері",
    nav: { diagnose: "Диагноз", chat: "Кеңесші", history: "Тарих", about: "Туралы" },
    navHint: {
      diagnose: "Суреттен анықтау",
      chat: "ЖИ-ден сұрау",
      history: "Бұрынғы талдаулар",
      about: "Қалай жұмыс істейді",
    },
    heroTitle: "Өсімдігіңізге не болды?",
    heroText: "Жапырақты жақыннан түсіріңіз — түрін, ауруын және не істеу керегін айтамыз.",
    upload: "Сурет жүктеу",
    uploadSub: "немесе осында сүйреп әкеліңіз",
    camera: "Камера",
    change: "Басқа сурет",
    analyze: "Талдау",
    analyzing: "Жапырақты қарап жатырмыз…",
    tips: ["Күндізгі жарық", "Жапыраққа жақын", "Ауру жерін көрсетіңіз"],
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
      "ЖИ ұсынған препараттар — тек бағдар. Мөлшерді қаптамадан алыңыз, күмән болса агродүкен маманынан сұраңыз.",
    care: "Күтім",
    watering: "Суару",
    light: "Жарық",
    temperature: "Температура",
    soil: "Топырақ және тыңайтқыш",
    toxicity: "Назар аударыңыз",
    photoTip: "Сурет туралы кеңес",
    notPlant: "Суретте өсімдік табылмады",
    helpful: "Жауап пайдалы болды ма?",
    thanks: "Рахмет, пікіріңіз сақталды",
    whatWrong: "Не дұрыс емес? (міндетті емес)",
    send: "Жіберу",
    askAbout: "Осы өсімдік туралы сұрау",
    chatTitle: "ЖИ кеңесші",
    chatEmpty: "Өсімдік, күтім, ауру туралы кез келген сұрақ қойыңыз.",
    chatAbout: "Әңгіме тақырыбы",
    chatGeneral: "Жалпы сұрақтар",
    chatClear: "Жаңа әңгіме",
    chatPlaceholder: "Сұрағыңызды жазыңыз…",
    chatSuggestPlant: ["Қанша рет суару керек?", "Басқа өсімдіктерге жұға ма?", "Қайта отырғызу керек пе?"],
    chatSuggestGeneral: [
      "Жапырақтары неге сарғаяды?",
      "Қызанақты қалай тыңайтамын?",
      "Қараңғы бөлмеге қандай гүл қолайлы?",
    ],
    thinking: "Жазып жатыр…",
    historyTitle: "Тарих",
    historyEmpty: "Әзірге талдау жоқ. Бірінші суретті жүктеп көріңіз.",
    historyStart: "Диагнозға өту",
    clear: "Тарихты тазалау",
    aboutTitle: "Қалай жұмыс істейді",
    about: [
      ["Сурет", "Сурет браузерде кішірейтіледі, геолокация өшіріледі. Серверде сурет сақталмайды."],
      ["Талдау", "Google Gemini моделі түрін, жағдайын және ықтимал ауруын анықтайды."],
      ["Кеңес", "Күтім, емдеу қадамдары және Қазақстанда сатылатын препарат түрлері."],
      ["Сіздің пікіріңіз", "👍/👎 арқылы жауаптардың дәлдігін жақсартамыз."],
    ],
    disclaimer:
      "ЖИ қателесуі мүмкін. Кеңестер ақпараттық сипатта. Химиялық препараттарды қолданбас бұрын нұсқаулықты оқыңыз және маманмен ақылдасыңыз.",
    statuses: { healthy: "Сау", needs_attention: "Назар қажет", sick: "Ауру", unknown: "Белгісіз" },
    lowConf: "ЖИ сенімді емес — басқа бұрыштан тағы бір сурет жіберіп көріңіз",
    theme: "Тақырып",
  },
  ru: {
    brand: "Доктор растений",
    nav: { diagnose: "Диагноз", chat: "Консультант", history: "История", about: "О сервисе" },
    navHint: {
      diagnose: "Анализ по фото",
      chat: "Спросить ИИ",
      history: "Прошлые анализы",
      about: "Как это работает",
    },
    heroTitle: "Что с вашим растением?",
    heroText: "Снимите лист крупным планом — определим вид, болезнь и подскажем, что делать.",
    upload: "Загрузить фото",
    uploadSub: "или перетащите его сюда",
    camera: "Камера",
    change: "Другое фото",
    analyze: "Анализировать",
    analyzing: "Рассматриваем лист…",
    tips: ["Дневной свет", "Близко к листу", "Покажите больное место"],
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
      "Препараты от ИИ — только ориентир. Дозировку берите с упаковки, при сомнениях спросите консультанта в агромагазине.",
    care: "Уход",
    watering: "Полив",
    light: "Свет",
    temperature: "Температура",
    soil: "Почва и удобрения",
    toxicity: "Обратите внимание",
    photoTip: "Совет по фото",
    notPlant: "На фото не найдено растение",
    helpful: "Ответ был полезен?",
    thanks: "Спасибо, отзыв сохранён",
    whatWrong: "Что не так? (необязательно)",
    send: "Отправить",
    askAbout: "Спросить об этом растении",
    chatTitle: "ИИ-консультант",
    chatEmpty: "Задайте любой вопрос о растениях, уходе и болезнях.",
    chatAbout: "Тема разговора",
    chatGeneral: "Общие вопросы",
    chatClear: "Новый разговор",
    chatPlaceholder: "Напишите вопрос…",
    chatSuggestPlant: ["Как часто поливать?", "Перейдёт ли на другие растения?", "Нужно ли пересаживать?"],
    chatSuggestGeneral: [
      "Почему желтеют листья?",
      "Чем подкормить томаты?",
      "Какой цветок подойдёт для тёмной комнаты?",
    ],
    thinking: "Печатает…",
    historyTitle: "История",
    historyEmpty: "Анализов пока нет. Загрузите первое фото.",
    historyStart: "Перейти к диагнозу",
    clear: "Очистить историю",
    aboutTitle: "Как это работает",
    about: [
      ["Фото", "Фото уменьшается в браузере, геолокация удаляется. На сервере фото не хранится."],
      ["Анализ", "Модель Google Gemini определяет вид, состояние и вероятную болезнь."],
      ["Совет", "Уход, шаги лечения и типы препаратов, которые продаются в Казахстане."],
      ["Ваш отзыв", "Оценки 👍/👎 помогают сделать ответы точнее."],
    ],
    disclaimer:
      "ИИ может ошибаться. Советы носят информационный характер. Перед применением химических препаратов прочитайте инструкцию и проконсультируйтесь со специалистом.",
    statuses: { healthy: "Здорово", needs_attention: "Требует внимания", sick: "Болеет", unknown: "Неизвестно" },
    lowConf: "ИИ не уверен — попробуйте прислать ещё одно фото с другого ракурса",
    theme: "Тема",
  },
};

const HISTORY_KEY = "osimdik_history_v1";
const CLIENT_KEY = "osimdik_client_id";
const LANG_KEY = "osimdik_lang";
const THEME_KEY = "osimdik_theme";
const GENERAL_CHAT_KEY = "osimdik_general_chat";

// localStorage кейде қолжетімсіз болады — абайлап қолданамыз
function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch {
    return null;
  }
}

// Суретті кішірейтеміз және EXIF/геолокацияны өшіреміз
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

function thumbnail(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 160;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const s = Math.min(img.width, img.height);
      canvas
        .getContext("2d")
        .drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
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

/* ───────────── Иконкалар ───────────── */
const ICONS = {
  diagnose: (
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M9 15c0-3.5 2-6 6-6 0 4-2.5 6-6 6Zm0 0-1.5 1.5" />
  ),
  chat: <path d="M5 18.5V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 2.5ZM9 9h6M9 12h4" />,
  history: <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v3.5h3.5M12 8v4l2.5 2" />,
  about: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01" />,
  upload: <path d="M12 16V5m0 0-4 4m4-4 4 4M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15" />,
  camera: (
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9ZM12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  ),
  send: <path d="M5 12h13M13 6l6 6-6 6" />,
  sun: <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  leaf: <path d="M6 18c0-7 4.5-12 13-12 0 8.5-5 13-12 13Zm0 0 4-4" />,
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const TABS = ["diagnose", "chat", "history", "about"];

/* ───────────── Басты бет ───────────── */
export default function Home() {
  const [lang, setLang] = useState("kk");
  const [theme, setTheme] = useState(null);
  const [tab, setTab] = useState("diagnose");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(null); // соңғы/ашылған талдау
  const [chatKey, setChatKey] = useState(null); // қай талдау туралы чат (null = жалпы)
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [generalChat, setGeneralChat] = useState([]);
  const [clientId, setClientId] = useState(null);
  const t = T[lang];

  useEffect(() => {
    const savedLang = store(LANG_KEY);
    if (savedLang === "kk" || savedLang === "ru") setLang(savedLang);
    const savedTheme = store(THEME_KEY);
    setTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    try {
      setHistory(JSON.parse(store(HISTORY_KEY) || "[]"));
      setGeneralChat(JSON.parse(store(GENERAL_CHAT_KEY) || "[]"));
    } catch {}
    let id = store(CLIENT_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || String(Date.now());
      store(CLIENT_KEY, id);
    }
    setClientId(id);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function changeLang(l) {
    setLang(l);
    store(LANG_KEY, l);
  }

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    store(THEME_KEY, next);
  }

  function saveHistory(list) {
    setHistory(list);
    store(HISTORY_KEY, JSON.stringify(list));
  }

  function patchEntry(key, patch) {
    setCurrent((prev) => (prev?.key === key ? { ...prev, ...patch } : prev));
    setHistory((list) => {
      const next = list.map((h) => (h.key === key ? { ...h, ...patch } : h));
      store(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function pickFile(file) {
    if (!file || !file.type?.startsWith("image/")) return;
    setCurrent(null);
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
    setCurrent(null);
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
      setCurrent(entry);
      if (data.is_plant !== false) saveHistory([entry, ...history].slice(0, 30));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openEntry(entry) {
    setCurrent(entry);
    setImage(null);
    setError("");
    setTab("diagnose");
    window.scrollTo({ top: 0 });
  }

  function askAbout(entry) {
    setChatKey(entry.key);
    setTab("chat");
    window.scrollTo({ top: 0 });
  }

  const chatEntry = chatKey ? history.find((h) => h.key === chatKey) || null : null;

  return (
    <div className="app">
      <aside className="side">
        <button className="brand" onClick={() => setTab("diagnose")}>
          <span className="brand-mark">
            <Icon name="leaf" size={18} />
          </span>
          <span className="brand-name">{t.brand}</span>
        </button>

        <nav className="nav" aria-label="Menu">
          {TABS.map((k) => (
            <button
              key={k}
              className={`nav-item ${tab === k ? "active" : ""}`}
              onClick={() => setTab(k)}
              aria-current={tab === k ? "page" : undefined}
            >
              <Icon name={k} />
              <span className="nav-text">
                <span>{t.nav[k]}</span>
                <small>{t.navHint[k]}</small>
              </span>
              {k === "history" && history.length > 0 && <span className="nav-count">{history.length}</span>}
            </button>
          ))}
        </nav>

        <div className="side-foot">
          <div className="seg" role="group" aria-label="Language">
            {["kk", "ru"].map((l) => (
              <button key={l} className={lang === l ? "on" : ""} onClick={() => changeLang(l)}>
                {l === "kk" ? "Қаз" : "Рус"}
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={toggleTheme} aria-label={t.theme} title={t.theme}>
            <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
          </button>
        </div>
      </aside>

      <main className="main">
        {tab === "diagnose" && (
          <Diagnose
            t={t}
            image={image}
            loading={loading}
            error={error}
            current={current}
            onPick={pickFile}
            onAnalyze={analyze}
            onPatch={patchEntry}
            onAsk={askAbout}
          />
        )}
        {tab === "chat" && (
          <ChatPage
            t={t}
            lang={lang}
            history={history}
            entry={chatEntry}
            onSelect={setChatKey}
            messages={chatEntry ? chatEntry.chat || [] : generalChat}
            setMessages={(msgs) => {
              if (chatEntry) patchEntry(chatEntry.key, { chat: msgs });
              else {
                setGeneralChat(msgs);
                store(GENERAL_CHAT_KEY, JSON.stringify(msgs));
              }
            }}
          />
        )}
        {tab === "history" && (
          <HistoryPage
            t={t}
            history={history}
            onOpen={openEntry}
            onClear={() => saveHistory([])}
            onStart={() => setTab("diagnose")}
          />
        )}
        {tab === "about" && <About t={t} />}

        {tab !== "chat" && <footer className="disclaimer">{t.disclaimer}</footer>}
      </main>
    </div>
  );
}

/* ───────────── Диагноз ───────────── */
function Diagnose({ t, image, loading, error, current, onPick, onAnalyze, onPatch, onAsk }) {
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const showUpload = !current || image;

  return (
    <div className="page">
      {!current && !image && (
        <header className="hero">
          <h1>{t.heroTitle}</h1>
          <p>{t.heroText}</p>
        </header>
      )}

      {showUpload && (
        <section
          className={`drop ${drag ? "drag" : ""} ${image ? "has-image" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            onPick(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              onPick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <input
            ref={camRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              onPick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {image ? (
            <div className={`specimen ${loading ? "scanning" : ""}`}>
              <img src={image} alt="" />
              {loading && <span className="scan-line" aria-hidden="true" />}
            </div>
          ) : (
            <div className="drop-empty">
              <span className="drop-icon">
                <Icon name="upload" size={26} />
              </span>
              <div className="drop-actions">
                <button className="btn primary" onClick={() => fileRef.current?.click()}>
                  {t.upload}
                </button>
                <button className="btn tonal only-touch" onClick={() => camRef.current?.click()}>
                  <Icon name="camera" size={18} /> {t.camera}
                </button>
              </div>
              <span className="drop-sub">{t.uploadSub}</span>
            </div>
          )}

          <ul className="tips" aria-label="Tips">
            {t.tips.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          {image && (
            <div className="drop-bar">
              <button className="btn ghost" onClick={() => fileRef.current?.click()} disabled={loading}>
                {t.change}
              </button>
              <button className="btn primary grow" onClick={onAnalyze} disabled={loading}>
                {loading ? t.analyzing : t.analyze}
              </button>
            </div>
          )}
        </section>
      )}

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      {current && (
        <>
          {!image && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  onPick(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button className="btn ghost back-new" onClick={() => fileRef.current?.click()}>
                <Icon name="plus" size={18} /> {t.upload}
              </button>
            </>
          )}
          <Result t={t} entry={current} onAsk={onAsk} />
          {current.result.is_plant !== false && (
            <Feedback t={t} entry={current} onPatch={onPatch} />
          )}
        </>
      )}
    </div>
  );
}

function Result({ t, entry, onAsk }) {
  const r = entry.result;
  if (r.is_plant === false) {
    return (
      <section className="panel">
        <h2 className="panel-title">{t.notPlant}</h2>
        {r.photo_tip && <p className="muted">{r.photo_tip}</p>}
      </section>
    );
  }
  const status = r.health_status || "unknown";
  const conf = Math.max(0, Math.min(100, r.confidence ?? 0));

  return (
    <article className="result">
      <header className={`verdict s-${status}`}>
        <div className="ring" style={{ "--p": conf }}>
          {entry.thumb ? <img src={entry.thumb} alt="" /> : <Icon name="leaf" size={28} />}
        </div>
        <div className="verdict-text">
          <span className={`status s-${status}`}>{t.statuses[status]}</span>
          <h2>{r.plant_name || "—"}</h2>
          {r.latin_name && <p className="latin">{r.latin_name}</p>}
          <p className="conf">
            {t.confidence} {conf}%
          </p>
        </div>
      </header>

      {conf < 60 && <p className="note warn">{t.lowConf}</p>}

      <section className="diag">
        <h3>{t.diagnosis}</h3>
        <p>{r.diagnosis}</p>
      </section>

      <div className="cols">
        <List title={t.symptoms} items={r.symptoms} />
        <List title={t.causes} items={r.causes} />
      </div>

      {r.treatment?.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">{t.treatment}</h3>
          <ol className="steps">
            {r.treatment.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ol>
        </section>
      )}

      {r.products?.length > 0 && (
        <section className="panel">
          <h3 className="panel-title">{t.products}</h3>
          <div className="products">
            {r.products.map((p, i) => (
              <div key={i} className="product">
                <p className="p-type">{p.product_type}</p>
                {p.active_ingredient && (
                  <p className="p-line">
                    <span>{t.activeIngredient}</span> {p.active_ingredient}
                  </p>
                )}
                {p.example_brands?.length > 0 && (
                  <p className="p-line">
                    <span>{t.brands}</span> {p.example_brands.join(", ")}
                  </p>
                )}
                {p.safety && <p className="p-safety">{p.safety}</p>}
                <a
                  className="btn tonal small"
                  href={`https://kaspi.kz/shop/search/?text=${encodeURIComponent(
                    p.search_query || p.active_ingredient || p.product_type
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.searchKaspi}
                </a>
              </div>
            ))}
          </div>
          <p className="fine">{t.productsNote}</p>
        </section>
      )}

      {r.care && (
        <section className="panel">
          <h3 className="panel-title">{t.care}</h3>
          <dl className="care">
            <Care k={t.watering} v={r.care.watering} />
            <Care k={t.light} v={r.care.light} />
            <Care k={t.temperature} v={r.care.temperature} />
            <Care k={t.soil} v={r.care.soil_fertilizer} />
          </dl>
        </section>
      )}

      {r.toxicity_note && <p className="note warn">{r.toxicity_note}</p>}
      {r.photo_tip && <p className="note">{r.photo_tip}</p>}

      <button className="btn primary ask" onClick={() => onAsk(entry)}>
        <Icon name="chat" size={18} /> {t.askAbout}
      </button>
    </article>
  );
}

function List({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="panel">
      <h3 className="panel-title">{title}</h3>
      <ul className="bullets">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

function Care({ k, v }) {
  if (!v) return null;
  return (
    <div>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Feedback({ t, entry, onPatch }) {
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const id = entry.result?.id;

  function send(v, c) {
    setSent(true);
    if (id) postJSON("/api/feedback", { id, feedback: v, comment: c }).catch(() => {});
  }

  if (entry.feedback === "up" || (entry.feedback === "down" && sent)) {
    return <div className="feedback done">{t.thanks}</div>;
  }
  if (entry.feedback === "down") {
    return (
      <div className="feedback col">
        <label htmlFor="fb">{t.whatWrong}</label>
        <textarea id="fb" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={500} />
        <button className="btn primary" onClick={() => send("down", comment)}>
          {t.send}
        </button>
      </div>
    );
  }
  return (
    <div className="feedback">
      <span>{t.helpful}</span>
      <div className="fb-btns">
        <button
          aria-label="👍"
          onClick={() => {
            onPatch(entry.key, { feedback: "up" });
            send("up", "");
          }}
        >
          👍
        </button>
        <button aria-label="👎" onClick={() => onPatch(entry.key, { feedback: "down" })}>
          👎
        </button>
      </div>
    </div>
  );
}

/* ───────────── Кеңесші (чат) ───────────── */
function ChatPage({ t, lang, history, entry, onSelect, messages, setMessages }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  useEffect(() => {
    setErr("");
  }, [entry?.key]);

  async function ask(q) {
    const question = (q ?? text).trim();
    if (!question || busy) return;
    const next = [...messages, { role: "user", text: question }];
    setMessages(next);
    setText("");
    setBusy(true);
    setErr("");
    try {
      const data = await postJSON("/api/chat", {
        messages: next,
        diagnosis: entry?.result || null,
        diagnosisId: entry?.result?.id,
        lang,
      });
      setMessages([...next, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const suggestions = entry ? t.chatSuggestPlant : t.chatSuggestGeneral;

  return (
    <div className="chat-page">
      <header className="chat-head">
        <h1>{t.chatTitle}</h1>
        <div className="chat-tools">
          <label className="ctx">
            <span className="sr-only">{t.chatAbout}</span>
            <select value={entry?.key || ""} onChange={(e) => onSelect(e.target.value || null)}>
              <option value="">{t.chatGeneral}</option>
              {history.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.result?.plant_name || "—"} · {new Date(h.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </label>
          {messages.length > 0 && (
            <button className="btn ghost small" onClick={() => setMessages([])} disabled={busy}>
              {t.chatClear}
            </button>
          )}
        </div>
      </header>

      <div className="thread">
        {entry && (
          <div className="ctx-card">
            {entry.thumb && <img src={entry.thumb} alt="" />}
            <div>
              <strong>{entry.result?.plant_name}</strong>
              <span>{entry.result?.diagnosis}</span>
            </div>
          </div>
        )}

        {messages.length === 0 && !busy && (
          <div className="chat-empty">
            <p>{t.chatEmpty}</p>
            <div className="chips">
              {suggestions.map((s) => (
                <button key={s} className="chip" onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === "assistant" && (
              <span className="avatar" aria-hidden="true">
                <Icon name="leaf" size={16} />
              </span>
            )}
            <div className="bubble">{m.text}</div>
          </div>
        ))}
        {busy && (
          <div className="msg assistant">
            <span className="avatar" aria-hidden="true">
              <Icon name="leaf" size={16} />
            </span>
            <div className="bubble typing">
              <span />
              <span />
              <span />
              <span className="sr-only">{t.thinking}</span>
            </div>
          </div>
        )}
        {err && (
          <div className="alert" role="alert">
            {err}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <textarea
          ref={inputRef}
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask();
            }
          }}
          placeholder={t.chatPlaceholder}
          maxLength={1000}
          aria-label={t.chatPlaceholder}
        />
        <button type="submit" className="send" disabled={busy || !text.trim()} aria-label={t.send}>
          <Icon name="send" size={20} />
        </button>
      </form>
      <p className="composer-fine">{t.disclaimer}</p>
    </div>
  );
}

/* ───────────── Тарих ───────────── */
function HistoryPage({ t, history, onOpen, onClear, onStart }) {
  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.historyTitle}</h1>
        {history.length > 0 && (
          <button className="btn ghost small" onClick={onClear}>
            {t.clear}
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <div className="empty">
          <p>{t.historyEmpty}</p>
          <button className="btn primary" onClick={onStart}>
            {t.historyStart}
          </button>
        </div>
      ) : (
        <ul className="hist">
          {history.map((h) => {
            const status = h.result?.health_status || "unknown";
            return (
              <li key={h.key}>
                <button className="hist-item" onClick={() => onOpen(h)}>
                  <span className={`hist-thumb s-${status}`}>
                    {h.thumb ? <img src={h.thumb} alt="" /> : <Icon name="leaf" />}
                  </span>
                  <span className="hist-text">
                    <strong>{h.result?.plant_name || "—"}</strong>
                    <span className="hist-diag">{h.result?.diagnosis}</span>
                  </span>
                  <span className="hist-meta">
                    <span className={`status s-${status}`}>{t.statuses[status]}</span>
                    <time>{new Date(h.date).toLocaleDateString()}</time>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ───────────── Туралы ───────────── */
function About({ t }) {
  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.aboutTitle}</h1>
      </header>
      <ol className="flow">
        {t.about.map(([title, text]) => (
          <li key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

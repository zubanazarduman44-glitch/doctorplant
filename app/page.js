"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CITIES, PLANTS, ACTIVES, REGISTRY_URL } from "./data";
import { photoUrl, photoSet, PLANT_PHOTOS, photoForLatin, SCENES } from "./photos";
import {
  getAuthConfig,
  signInWithGoogle,
  consumeRedirect,
  getSession,
  getUser,
  signOut,
  loadCloud,
  saveCloud,
  deleteCloud,
  mergePlants,
  mergeHistory,
} from "../lib/auth";

// Барлық мәтіндер екі тілде / Все тексты на двух языках
const T = {
  kk: {
    brand: "Tamyr",
    nav: { diagnose: "Диагноз", plants: "Өсімдіктер", map: "Карта", chat: "Кеңесші", history: "Тарих", about: "Анықтамалық" },
    navHint: {
      diagnose: "Суреттен анықтау",
      chat: "Ботаника және экология",
      history: "Бұрынғы талдаулар",
      about: "Қалай жұмыс істейді",
    },
    plantsTitle: "Менің өсімдіктерім",
    plantsEmpty: "Өсімдіктеріңізді қосыңыз — суару уақытын еске саламыз.",
    addPlant: "Өсімдік қосу",
    saveToPlants: "Өсімдіктеріме қосу",
    savedToPlants: "Өсімдіктеріңізге қосылды",
    watered: "Суардым",
    fertilized: "Тыңайттым",
    dueToday: "Бүгін суару керек",
    dueIn: (n) => (n === 1 ? "Ертең суару" : `${n} күннен кейін суару`),
    overdue: (n) => `Суару ${n} күн кешікті`,
    fertDue: "Тыңайту уақыты келді",
    everyN: (n) => `әр ${n} күн сайын`,
    summaryDue: (n) => `Бүгін ${n} өсімдікті суару керек`,
    summaryOk: "Бүгін бәрі суарылған",
    lastWatered: "Соңғы суару",
    fName: "Атауы",
    fPhoto: "Сурет",
    fWater: "Суару жиілігі, күн",
    fFert: "Тыңайту жиілігі, күн (0 — керек емес)",
    fLast: "Соңғы рет суарылған күн",
    fNote: "Ескертпе",
    fNotePh: "Мысалы: терезе алдында, жазда жиірек",
    save: "Сақтау",
    cancel: "Болдырмау",
    edit: "Өзгерту",
    del: "Жою",
    delConfirm: "Иә, жою",
    calendar: "Күнтізбеге қосу",
    calendarHint: "Телефон күнтізбесі сағат 9:00-де суару уақытын өзі еске салады — сайт жабық болса да.",
    notify: "Хабарландыруды қосу",
    notifyOn: "Хабарландыру қосулы",
    notifyDenied: "Хабарландыруға браузер баптауларынан рұқсат беріңіз",
    notifyHint: "Сайтты ашқанда суару керек өсімдіктер туралы хабарлайды.",
    notifyTitle: "Өсімдіктерді суару уақыты",
    remindersTitle: "Еске салу",
    topics: [
      { id: "care", icon: "drop", title: "Күтім", qs: ["Жапырақтары неге сарғаяды?", "Үй гүлін қай кезде қайта отырғызу керек?", "Қызанақты қалай тыңайтамын?", "Қараңғы бөлмеге қандай гүл қолайлы?"] },
      { id: "bio", icon: "leaf", title: "Ботаника", qs: ["Фотосинтез қалай жүреді?", "Тозаңдану дегеніміз не?", "Өсімдіктер суды қалай тасымалдайды?", "Неліктен күзде жапырақтар түсін өзгертеді?"] },
      { id: "eco", icon: "sprout", title: "Экология", qs: ["Ара жоқ болса, өсімдіктерге не болады?", "Шөлейттену дегеніміз не?", "Инвазиялық түрлер неге қауіпті?", "Компостты қалай жасаймын?"] },
      { id: "kz", icon: "shield", title: "Қазақстан флорасы", qs: ["Қызыл кітапқа қандай өсімдіктер енген?", "Жабайы қызғалдақтар туралы айтып бер", "Сиверс алмасы неге маңызды?", "Сексеуіл неге құнды?"] },
    ],
    factTitle: "Күннің фактісі",
    factAsk: "Толығырақ сұрау",
    attach: "Сурет тіркеу",
    removePhoto: "Суретті алып тастау",
    photoQuestion: "Бұл қандай өсімдік?",
    copy: "Көшіру",
    copied: "Көшірілді",
    retry: "Қайталау",
    facts: [
      "Үйдегі алманың арғы атасы — Іле Алатауы мен Жоңғар Алатауында өсетін жабайы Сиверс алмасы (Malus sieversii).",
      "Қазақстанда жабайы қызғалдақтың 30-дан астам түрі өседі, олардың бірі — Грейг қызғалдағы.",
      "Шыбынжұтқыш (Venus flytrap) қақпанын бір емес, қысқа уақыт ішінде екі рет тигенде ғана жабады.",
      "Ұялшақ мимоза (Mimosa pudica) қол тигенде жапырақтарын бірнеше секундта жиып алады.",
      "Кейбір бамбук түрлері бір тәулікте 90 см-ге дейін өседі.",
      "Күзде жапырақтың сарғаюы — хлорофилл ыдырап, бұрыннан бар сары-қызғылт пигменттердің көрінуі.",
      "Жас күнбағыс басы күнмен бірге бұрылады, ал пісіп-жетілгенде шығысқа қарап тоқтайды.",
      "Жер атмосферасындағы оттегінің шамамен жартысын мұхиттағы микроскопиялық балдырлар (фитопланктон) береді.",
      "Зиянкес шабуыл жасағанда көптеген өсімдіктер ұшпа заттар бөліп, көршілерін «ескертеді».",
      "Әлемдегі ең көне ағаштардың бірі — қылқанды қарағай (bristlecone pine), жасы 4 800 жылдан асады.",
    ],
    mapTitle: "Өсімдіктер картасы",
    mapSub: "Қалаңызда қай жерде қандай өсімдіктер өсетінін және қандай аурулар таралып жатқанын көріңіз.",
    mapFilters: { all: "Барлығы", sick: "Ауру", healthy: "Сау", protected: "Қызыл кітап" },
    mapSearch: "Өсімдік атауы бойынша сүзу",
    mapCount: (n) => `Аймақта ${n} белгі`,
    mapTopDisease: (x) => `Жиі кездесетін мәселе: ${x}`,
    mapEmpty: "Бұл аймақта әзірге белгі жоқ. Өсімдігіңізді бірінші болып белгілеңіз!",
    mapAdd: "Өсімдік белгілеу",
    mapPrivacy: "Орын шамамен 500 м дәлдікпен, Қызыл кітаптағы түрлер — 5 км дәлдікпен сақталады. Суреттер жарияланбайды.",
    mapProtected: "Қызыл кітап (орны жасырылған)",
    mapLoading: "Карта жүктелуде…",
    mapError: "Картаны жүктеу мүмкін болмады",
    mapNotConfigured: "Карта базасы әлі бапталмаған",
    showOnMap: "Картада көрсету",
    shownOnMap: "Картаға қосылды",
    showOnMapHint: "Қаладағы басқа адамдар бұл өсімдікті және оның жағдайын көре алады. Орын шамамен көрсетіледі.",
    geoDenied: "Орынды анықтау мүмкін болмады. Браузерге геолокацияға рұқсат беріңіз.",
    mapPickTitle: "Қай өсімдікті белгілейміз?",
    mapPickFromHistory: "Тарихтан таңдау",
    mapPickNone: "— таңдамау —",
    mapPickName: "Немесе атауын жазыңыз",
    mapPickStatus: "Жағдайы",
    mapSave: "Белгілеу",
    mapHere: "Белгі сіздің қазіргі орныңызға шамамен қойылады.",
    footerTag: "Өсімдіктерге арналған ЖИ-көмекші: диагноз, күтім, карта және кеңес — қазақша және орысша.",
    footerSections: "Бөлімдер",
    footerAbout: "Жоба туралы",
    footerTop: "Жоғары",
    login: "Кіру",
    profile: {
      title: "Профиль",
      guestTitle: "Tamyr аккаунты",
      guestSub: "Google (Gmail) арқылы бір батырмамен кіріңіз — аккаунт өзі ашылады.",
      perks: [
        ["cloud", "Өсімдіктеріңіз бен тарихыңыз бұлтта сақталады"],
        ["sprout", "Телефоннан да, компьютерден де бірдей ашылады"],
        ["trophy", "Жетістіктер мен жеке статистика"],
      ],
      google: "Google арқылы кіру",
      privacy: "Біз тек атыңыз бен поштаңызды көреміз. Құпиясөз сақталмайды.",
      notReady: "Кіру әлі бапталмаған — әзірлеуші Google кіруін қосқанда жұмыс істейді.",
      since: "Tamyr-да",
      editName: "Атын өзгерту",
      save: "Сақтау",
      stats: { plants: "Өсімдік", diag: "Диагноз", streak: "Үздік серия", mapped: "Картада" },
      days: "күн",
      badgesTitle: "Жетістіктер",
      badges: {
        first: ["Алғашқы диагноз", "Бірінші өсімдікті тексерді"],
        five: ["Бағбан", "5 өсімдік қосты"],
        week: ["Тұрақты күтім", "7 күндік серия"],
        mapper: ["Зерттеуші", "Картаға белгі қойды"],
        healer: ["Емші", "Ауру өсімдікті тапты"],
        rare: ["Қызыл кітап", "Сирек өсімдікті кездестірді"],
      },
      syncTitle: "Бұлттағы сақтау",
      syncing: "Сақталып жатыр…",
      synced: "Сақталды",
      syncErr: "Сақтау сәтсіз — интернетті тексеріңіз",
      syncNow: "Қазір сақтау",
      settings: "Баптаулар",
      language: "Тіл",
      theme: "Тақырып",
      light: "Жарық",
      dark: "Қараңғы",
      logout: "Шығу",
      wipe: "Бұлттағы деректерді өшіру",
      wipeConfirm: "Бұлттағы барлық деректер өшеді (құрылғыдағы қалады). Жалғастырамыз ба?",
      wiped: "Бұлттағы деректер өшірілді",
      loginErr: "Кіру сәтсіз болды",
    },
    voiceAsk: "Дауыспен сұрау",
    voiceHint: "Микрофонды басып, қазақша немесе орысша сұраңыз",
    listening: "Тыңдап тұрмын…",
    voiceStop: "Жіберу",
    transcribing: "Дауысты мәтінге айналдырып жатырмын…",
    micDenied: "Микрофонға рұқсат жоқ. Браузер баптауларынан рұқсат беріңіз.",
    voiceUnsupported: "Бұл браузер дауыс жазуды қолдамайды.",
    noSpeech: "Сөз естілмеді, қайталап көріңіз.",
    mapPickHint: "Өсімдік тұрған жерді картадан басыңыз",
    mapPicked: "Орын картадан таңдалды.",
    mapLocate: "Мені табу",
    recentTitle: "Соңғы талдаулар",
    showAll: "Барлығын көру",
    showLess: "Жасыру",
    addPhoto: "Тағы сурет",
    photosHint: "3 суретке дейін: жалпы көрінісі, жапырақтың үсті мен асты",
    progressTitle: "Емдеу барысы",
    progressHint: "Бірнеше күннен кейін сол өсімдікті қайта түсіріңіз — ЖИ өзгерісті бағалайды.",
    progressBtn: "Қайта тексеру",
    progressChecking: "Салыстырып жатырмыз…",
    verdicts: { improved: "Жақсарды", same: "Өзгеріс жоқ", worse: "Нашарлады", unclear: "Анық емес" },
    dayN: (n) => (n === 0 ? "Бүгін" : `${n}-күн`),
    progressStart: "Бастапқы диагноз",
    weatherTitle: "Ауа райы және ескертулер",
    myLocation: "Менің орным",
    weatherLoading: "Ауа райы жүктелуде…",
    weatherError: "Ауа райын жүктеу мүмкін болмады",
    weatherSource: "Деректер: Open-Meteo",
    wFrost: (x) => `Аяз ${x}°C дейін: көшеттер мен бақша өсімдіктерін жабыңыз, гүлдерді салқын терезе алдынан алыңыз.`,
    wCold: (x) => `Түнде ${x}°C: жылу сүйгіш өсімдіктерді үйге кіргізіңіз.`,
    wHeat: (x) => `Аптап ${x}°C: таңертең немесе кешке суарыңыз, күннен көлеңкелеңіз.`,
    wRain: (x) => `Жаңбыр ${x} мм: бақшаны суаруды кейінге қалдырыңыз.`,
    wWind: (x) => `Қатты жел ${x} км/сағ: биік өсімдіктерді байлаңыз.`,
    wDry: "Алдағы күндері жаңбыр жоқ және ыстық: бақшаны жиірек суарыңыз.",
    wOk: "Алдағы күндері ауа райы өсімдіктерге қолайлы.",
    refTitle: "Анықтамалық",
    refTabs: { enc: "Энциклопедия", meds: "Препараттар", guide: "Нұсқаулық" },
    encSearch: "Өсімдікті іздеу немесе ЖИ-ден сұрау…",
    encGroups: { all: "Барлығы", home: "Үй гүлдері", garden: "Бақша", kz: "Қазақстан флорасы" },
    encAskAI: (q) => `«${q}» туралы ЖИ карточкасын жасау`,
    encLoading: "Карточка жасалуда…",
    encNotFound: "Мұндай өсімдік табылмады",
    encAIBadge: "ЖИ жасаған карточка — сын көзбен оқыңыз",
    lightLabels: ["Көлеңке", "Шашыраңқы жарық", "Күн"],
    diffLabels: ["Оңай", "Орташа", "Қиын"],
    fLightE: "Жарық",
    fWaterE: "Суару",
    fTempE: "Температура",
    fDiffE: "Күтім",
    fToxicE: "Уыттылығы",
    fKzE: "Қазақстанда",
    fFactE: "Қызықты дерек",
    fTipE: "Басты кеңес",
    daysRange: (a, b) => (a === b ? `${a} күнде бір` : `${a}–${b} күнде бір`),
    encAdd: "Өсімдіктеріме қосу",
    encAdded: "Қосылды",
    encAsk: "Кеңесшіден сұрау",
    encAskQ: (n) => `${n} туралы толығырақ айтып бер: күтімі, аурулары, көбейтуі`,
    encBack: "Барлық өсімдіктер",
    medsIntro:
      "Препараттар әсер етуші зат бойынша топталған, сауда атаулары — тек мысал. Сатып алмас бұрын препараттың Қазақстанда тіркелгенін ресми тізімнен тексеріңіз, мөлшерді қаптамадан алыңыз.",
    medsRegistry: "Рұқсат етілген пестицидтер тізімі (2025–2035)",
    medsCats: { all: "Барлығы", fungicide: "Фунгицидтер", insecticide: "Инсектицидтер", bio: "Биопрепараттар", fertilizer: "Тыңайтқыштар" },
    medsSearch: "Мәселе бойынша іздеу: бітелер, ақұнтақ, хлороз…",
    medsFor: "Неден көмектеседі",
    medsHow: "Әсері",
    medsSafety: "Қауіпсіздік",
    medsEmpty: "Ештеңе табылмады",
    quickTitle: "Танымал өсімдіктерді бір басумен қосыңыз",
    quick: [
      ["Монстера", "Monstera deliciosa", 7, 14],
      ["Фикус", "Ficus elastica", 10, 30],
      ["Алоэ", "Aloe vera", 21, 0],
      ["Спатифиллум", "Spathiphyllum", 5, 14],
      ["Сансевиерия", "Sansevieria", 14, 30],
      ["Орхидея", "Phalaenopsis", 7, 14],
      ["Қызанақ", "Solanum lycopersicum", 3, 14],
      ["Кактус", "Cactaceae", 21, 0],
    ],
    weekTitle: "Апта жоспары",
    weekRest: "суару жоқ",
    statPlants: "Өсімдік",
    statWeek: "Осы аптада суарылды",
    statStreak: "Серия",
    statBest: "Рекорд",
    nDays: (n) => `${n} күн`,
    nTimes: (n) => `${n} рет`,
    streakHint: "Қатарынан неше күн бірде-бір өсімдік кешікпеді",
    locale: "kk-KZ",
    heroTitle: "Өсімдігіңізге не болды?",
    heroText: "Жапырақты жақыннан түсіріңіз — түрін, ауруын және не істеу керегін айтамыз.",
    sheetSpecies: "Түрі",
    sheetDate: "Күні",
    sheetPending: "анықталмаған",
    fShootTitle: "Қалай түсіру керек",
    scanKicker: "Tamyr осылай көреді",
    scanName: "Монстера",
    scanStatus: "Сау · сенімділік 96%",
    scanTip: "Келесі суару: 5 күннен кейін",
    gallery: [["Үй гүлдері", "monstera"], ["Бақша", "tomato"], ["Гүлдер", "orchid"], ["Жеміс ағаштары", "sieversii"]],
    aiHi: "Сәлем",
    aiAsk: "бүгін немен көмектесейін?",
    aiTools: "Құралдар",
    aiNew: "Жаңа чат",
    share: "Бөлісу",
    good: "Жақсы жауап",
    bad: "Нашар жауап",
    editQ: "Өңдеу",
    aiName: "Tamyr ЖИ",
    fFindTitle: "Не анықтаймыз",
    fFind: ["Өсімдік түрі", "Ауру және себебі", "Емдеу қадамдары", "ҚР-дағы препараттар"],
    fPrivTitle: "Сурет сақталмайды",
    fPrivText: "Сурет браузерде кішірейтіледі, геолокация өшіріледі. Серверге тек талдау үшін жіберіледі.",
    upload: "Сурет жүктеу",
    uploadSub: "немесе осында сүйреп әкеліңіз",
    camera: "Камера",
    shoot: "Түсіру",
    close: "Жабу",
    camError: "Камераны ашу мүмкін болмады. Браузерге камераға рұқсат беріңіз немесе суретті файлмен жүктеңіз.",
    camHint: "Жапырақты жақтауға орналастырыңыз",
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
    chatEmpty: "Өсімдіктер, гүлдер, ботаника және экология туралы кез келген сұрақ қойыңыз.",
    chatAbout: "Әңгіме тақырыбы",
    chatGeneral: "Жалпы сұрақтар",
    chatClear: "Жаңа әңгіме",
    chatPlaceholder: "Сұрағыңызды жазыңыз…",
    chatSuggestPlant: ["Қанша рет суару керек?", "Басқа өсімдіктерге жұға ма?", "Қайта отырғызу керек пе?"],
    chatSuggestGeneral: [
      "Фотосинтез қалай жүреді?",
      "Қазақстанның Қызыл кітабына қандай өсімдіктер енген?",
      "Ара жоқ болса, өсімдіктерге не болады?",
      "Жапырақтары неге сарғаяды?",
    ],
    thinking: "Жазып жатыр…",
    historyTitle: "Тарих",
    historyEmpty: "Әзірге талдау жоқ. Бірінші суретті жүктеп көріңіз.",
    historyStart: "Диагнозға өту",
    clear: "Тарихты тазалау",
    aboutTitle: "Нұсқаулық",
    about: [
      ["Сурет", "Сурет браузерде кішірейтіледі, геолокация өшіріледі. Серверде сурет сақталмайды."],
      ["Талдау", "Google Gemini моделі түрін, жағдайын және ықтимал ауруын анықтайды."],
      ["Кеңес", "Күтім, емдеу қадамдары және Қазақстанда сатылатын препарат түрлері."],
      ["Сіздің пікіріңіз", "Жауапты бағалау арқылы дәлдікті жақсартамыз."],
    ],
    disclaimer:
      "ЖИ қателесуі мүмкін. Кеңестер ақпараттық сипатта. Химиялық препараттарды қолданбас бұрын нұсқаулықты оқыңыз және маманмен ақылдасыңыз.",
    statuses: { healthy: "Сау", needs_attention: "Назар қажет", sick: "Ауру", unknown: "Белгісіз" },
    lowConf: "ЖИ сенімді емес — басқа бұрыштан тағы бір сурет жіберіп көріңіз",
    theme: "Тақырып",
  },
  ru: {
    brand: "Tamyr",
    nav: { diagnose: "Диагноз", plants: "Растения", map: "Карта", chat: "Консультант", history: "История", about: "Справочник" },
    navHint: {
      diagnose: "Анализ по фото",
      chat: "Ботаника и экология",
      history: "Прошлые анализы",
      about: "Как это работает",
    },
    plantsTitle: "Мои растения",
    plantsEmpty: "Добавьте свои растения — напомним, когда поливать.",
    addPlant: "Добавить растение",
    saveToPlants: "Добавить в мои растения",
    savedToPlants: "Добавлено в ваши растения",
    watered: "Полито",
    fertilized: "Подкормлено",
    dueToday: "Пора поливать",
    dueIn: (n) => (n === 1 ? "Полить завтра" : `Полить через ${n} дн.`),
    overdue: (n) => `Полив просрочен на ${n} дн.`,
    fertDue: "Пора подкормить",
    everyN: (n) => `каждые ${n} дн.`,
    summaryDue: (n) => `Сегодня нужно полить: ${n}`,
    summaryOk: "Сегодня всё полито",
    lastWatered: "Последний полив",
    fName: "Название",
    fPhoto: "Фото",
    fWater: "Полив каждые, дней",
    fFert: "Подкормка каждые, дней (0 — не нужна)",
    fLast: "Дата последнего полива",
    fNote: "Заметка",
    fNotePh: "Например: на подоконнике, летом чаще",
    save: "Сохранить",
    cancel: "Отмена",
    edit: "Изменить",
    del: "Удалить",
    delConfirm: "Да, удалить",
    calendar: "Добавить в календарь",
    calendarHint: "Календарь телефона сам напомнит о поливе в 9:00 — даже когда сайт закрыт.",
    notify: "Включить уведомления",
    notifyOn: "Уведомления включены",
    notifyDenied: "Разрешите уведомления в настройках браузера",
    notifyHint: "Когда вы открываете сайт, он напомнит, какие растения пора полить.",
    notifyTitle: "Пора полить растения",
    remindersTitle: "Напоминания",
    topics: [
      { id: "care", icon: "drop", title: "Уход", qs: ["Почему желтеют листья?", "Когда пересаживать комнатные растения?", "Чем подкормить томаты?", "Какой цветок подойдёт для тёмной комнаты?"] },
      { id: "bio", icon: "leaf", title: "Ботаника", qs: ["Как происходит фотосинтез?", "Что такое опыление?", "Как растения поднимают воду?", "Почему осенью листья меняют цвет?"] },
      { id: "eco", icon: "sprout", title: "Экология", qs: ["Что будет с растениями без пчёл?", "Что такое опустынивание?", "Чем опасны инвазивные виды?", "Как сделать компост?"] },
      { id: "kz", icon: "shield", title: "Флора Казахстана", qs: ["Какие растения в Красной книге Казахстана?", "Расскажи о диких тюльпанах", "Почему важна яблоня Сиверса?", "Чем ценен саксаул?"] },
    ],
    factTitle: "Факт дня",
    factAsk: "Спросить подробнее",
    attach: "Прикрепить фото",
    removePhoto: "Убрать фото",
    photoQuestion: "Что это за растение?",
    copy: "Копировать",
    copied: "Скопировано",
    retry: "Повторить",
    facts: [
      "Предок домашней яблони — дикая яблоня Сиверса (Malus sieversii), растущая в горах Заилийского и Джунгарского Алатау.",
      "В Казахстане растёт больше 30 видов диких тюльпанов, среди них — тюльпан Грейга.",
      "Венерина мухоловка захлопывает ловушку только после двух касаний за короткое время.",
      "Мимоза стыдливая (Mimosa pudica) складывает листья за несколько секунд после прикосновения.",
      "Некоторые виды бамбука вырастают до 90 см за сутки.",
      "Осенью листья желтеют, потому что разрушается хлорофилл и становятся видны жёлто-оранжевые пигменты, которые были в листе всегда.",
      "Молодая корзинка подсолнуха поворачивается за солнцем, а созревшая останавливается и смотрит на восток.",
      "Около половины кислорода в атмосфере Земли производят микроскопические водоросли океана — фитопланктон.",
      "Когда растение атакуют вредители, многие виды выделяют летучие вещества и «предупреждают» соседей.",
      "Одни из старейших деревьев на Земле — остистые сосны (bristlecone pine), их возраст превышает 4 800 лет.",
    ],
    mapTitle: "Карта растений",
    mapSub: "Смотрите, где в вашем городе растут какие растения и где распространяются болезни.",
    mapFilters: { all: "Все", sick: "Больные", healthy: "Здоровые", protected: "Красная книга" },
    mapSearch: "Фильтр по названию растения",
    mapCount: (n) => `Отметок в районе: ${n}`,
    mapTopDisease: (x) => `Чаще всего: ${x}`,
    mapEmpty: "Здесь пока нет отметок. Отметьте своё растение первым!",
    mapAdd: "Отметить растение",
    mapPrivacy: "Место хранится с точностью ~500 м, для видов из Красной книги — ~5 км. Фото не публикуются.",
    mapProtected: "Красная книга (место скрыто)",
    mapLoading: "Загружаем карту…",
    mapError: "Не удалось загрузить карту",
    mapNotConfigured: "База карты ещё не настроена",
    showOnMap: "Показать на карте",
    shownOnMap: "Добавлено на карту",
    showOnMapHint: "Другие жители города увидят это растение и его состояние. Место показывается приблизительно.",
    geoDenied: "Не удалось определить местоположение. Разрешите браузеру доступ к геолокации.",
    mapPickTitle: "Какое растение отметить?",
    mapPickFromHistory: "Выбрать из истории",
    mapPickNone: "— не выбрано —",
    mapPickName: "Или введите название",
    mapPickStatus: "Состояние",
    mapSave: "Отметить",
    mapHere: "Отметка ставится примерно в ваше текущее место.",
    footerTag: "ИИ-помощник для растений: диагноз, уход, карта и советы — на казахском и русском.",
    footerSections: "Разделы",
    footerAbout: "О проекте",
    footerTop: "Наверх",
    login: "Войти",
    profile: {
      title: "Профиль",
      guestTitle: "Аккаунт Tamyr",
      guestSub: "Войдите через Google (Gmail) одной кнопкой — аккаунт создастся сам.",
      perks: [
        ["cloud", "Растения и история сохраняются в облаке"],
        ["sprout", "Одинаково открываются с телефона и компьютера"],
        ["trophy", "Достижения и личная статистика"],
      ],
      google: "Войти через Google",
      privacy: "Мы видим только имя и почту. Пароли не хранятся.",
      notReady: "Вход ещё не настроен — заработает, когда разработчик включит вход через Google.",
      since: "В Tamyr с",
      editName: "Изменить имя",
      save: "Сохранить",
      stats: { plants: "Растений", diag: "Диагнозов", streak: "Лучшая серия", mapped: "На карте" },
      days: "дн.",
      badgesTitle: "Достижения",
      badges: {
        first: ["Первый диагноз", "Проверил первое растение"],
        five: ["Садовод", "Добавил 5 растений"],
        week: ["Заботливый", "Серия 7 дней"],
        mapper: ["Исследователь", "Отметил растение на карте"],
        healer: ["Лекарь", "Нашёл больное растение"],
        rare: ["Красная книга", "Встретил редкое растение"],
      },
      syncTitle: "Облачное сохранение",
      syncing: "Сохраняется…",
      synced: "Сохранено",
      syncErr: "Не удалось сохранить — проверьте интернет",
      syncNow: "Сохранить сейчас",
      settings: "Настройки",
      language: "Язык",
      theme: "Тема",
      light: "Светлая",
      dark: "Тёмная",
      logout: "Выйти",
      wipe: "Удалить данные в облаке",
      wipeConfirm: "Все данные в облаке будут удалены (на устройстве останутся). Продолжить?",
      wiped: "Данные в облаке удалены",
      loginErr: "Не удалось войти",
    },
    voiceAsk: "Спросить голосом",
    voiceHint: "Нажмите на микрофон и спросите по-казахски или по-русски",
    listening: "Слушаю…",
    voiceStop: "Отправить",
    transcribing: "Распознаём речь…",
    micDenied: "Нет доступа к микрофону. Разрешите его в настройках браузера.",
    voiceUnsupported: "Этот браузер не поддерживает запись голоса.",
    noSpeech: "Речь не распознана, попробуйте ещё раз.",
    mapPickHint: "Нажмите на карте место, где растёт растение",
    mapPicked: "Место выбрано на карте.",
    mapLocate: "Найти меня",
    recentTitle: "Последние анализы",
    showAll: "Показать все",
    showLess: "Свернуть",
    addPhoto: "Ещё фото",
    photosHint: "До 3 фото: общий вид, лист сверху и снизу",
    progressTitle: "Ход лечения",
    progressHint: "Через несколько дней сфотографируйте растение снова — ИИ оценит изменения.",
    progressBtn: "Проверить снова",
    progressChecking: "Сравниваем…",
    verdicts: { improved: "Стало лучше", same: "Без изменений", worse: "Стало хуже", unclear: "Неясно" },
    dayN: (n) => (n === 0 ? "Сегодня" : `День ${n}`),
    progressStart: "Исходный диагноз",
    weatherTitle: "Погода и предупреждения",
    myLocation: "Моё местоположение",
    weatherLoading: "Загружаем погоду…",
    weatherError: "Не удалось загрузить погоду",
    weatherSource: "Данные: Open-Meteo",
    wFrost: (x) => `Заморозок до ${x}°C: укройте рассаду и садовые растения, уберите цветы от холодного окна.`,
    wCold: (x) => `Ночью ${x}°C: занесите теплолюбивые растения в дом.`,
    wHeat: (x) => `Жара ${x}°C: поливайте утром или вечером, притеняйте от солнца.`,
    wRain: (x) => `Дождь ${x} мм: отложите полив сада.`,
    wWind: (x) => `Сильный ветер ${x} км/ч: подвяжите высокие растения.`,
    wDry: "В ближайшие дни без дождя и жарко: поливайте сад чаще.",
    wOk: "В ближайшие дни погода благоприятна для растений.",
    refTitle: "Справочник",
    refTabs: { enc: "Энциклопедия", meds: "Препараты", guide: "Инструкция" },
    encSearch: "Найти растение или спросить ИИ…",
    encGroups: { all: "Все", home: "Комнатные", garden: "Огород", kz: "Флора Казахстана" },
    encAskAI: (q) => `Создать карточку ИИ: «${q}»`,
    encLoading: "Создаём карточку…",
    encNotFound: "Такое растение не найдено",
    encAIBadge: "Карточка создана ИИ — читайте критически",
    lightLabels: ["Тень", "Рассеянный свет", "Солнце"],
    diffLabels: ["Легко", "Средне", "Сложно"],
    fLightE: "Свет",
    fWaterE: "Полив",
    fTempE: "Температура",
    fDiffE: "Уход",
    fToxicE: "Токсичность",
    fKzE: "В Казахстане",
    fFactE: "Интересный факт",
    fTipE: "Главный совет",
    daysRange: (a, b) => (a === b ? `раз в ${a} дн.` : `раз в ${a}–${b} дн.`),
    encAdd: "В мои растения",
    encAdded: "Добавлено",
    encAsk: "Спросить консультанта",
    encAskQ: (n) => `Расскажи подробнее про ${n}: уход, болезни, размножение`,
    encBack: "Все растения",
    medsIntro:
      "Препараты сгруппированы по действующему веществу, торговые названия — только примеры. Перед покупкой проверьте регистрацию препарата в Казахстане по официальному списку, дозировку берите с упаковки.",
    medsRegistry: "Список разрешённых пестицидов (2025–2035)",
    medsCats: { all: "Все", fungicide: "Фунгициды", insecticide: "Инсектициды", bio: "Биопрепараты", fertilizer: "Удобрения" },
    medsSearch: "Поиск по проблеме: тля, мучнистая роса, хлороз…",
    medsFor: "От чего помогает",
    medsHow: "Действие",
    medsSafety: "Безопасность",
    medsEmpty: "Ничего не найдено",
    quickTitle: "Добавьте популярные растения в один клик",
    quick: [
      ["Монстера", "Monstera deliciosa", 7, 14],
      ["Фикус", "Ficus elastica", 10, 30],
      ["Алоэ", "Aloe vera", 21, 0],
      ["Спатифиллум", "Spathiphyllum", 5, 14],
      ["Сансевиерия", "Sansevieria", 14, 30],
      ["Орхидея", "Phalaenopsis", 7, 14],
      ["Томат", "Solanum lycopersicum", 3, 14],
      ["Кактус", "Cactaceae", 21, 0],
    ],
    weekTitle: "План на неделю",
    weekRest: "без полива",
    statPlants: "Растений",
    statWeek: "Полито за неделю",
    statStreak: "Серия",
    statBest: "Рекорд",
    nDays: (n) => `${n} дн.`,
    nTimes: (n) => `${n} раз`,
    streakHint: "Сколько дней подряд ни одно растение не просрочено",
    locale: "ru-RU",
    heroTitle: "Что с вашим растением?",
    heroText: "Снимите лист крупным планом — определим вид, болезнь и подскажем, что делать.",
    sheetSpecies: "Вид",
    sheetDate: "Дата",
    sheetPending: "не определён",
    fShootTitle: "Как снимать",
    scanKicker: "Так видит Tamyr",
    scanName: "Монстера",
    scanStatus: "Здорова · уверенность 96%",
    scanTip: "Следующий полив: через 5 дней",
    gallery: [["Комнатные", "monstera"], ["Огород", "tomato"], ["Цветы", "orchid"], ["Плодовые", "sieversii"]],
    aiHi: "Привет",
    aiAsk: "чем помочь сегодня?",
    aiTools: "Инструменты",
    aiNew: "Новый чат",
    share: "Поделиться",
    good: "Хороший ответ",
    bad: "Плохой ответ",
    editQ: "Изменить",
    aiName: "Tamyr ИИ",
    fFindTitle: "Что определяем",
    fFind: ["Вид растения", "Болезнь и причину", "Шаги лечения", "Препараты в Казахстане"],
    fPrivTitle: "Фото не сохраняется",
    fPrivText: "Фото уменьшается в браузере, геолокация удаляется. На сервер оно уходит только для анализа.",
    upload: "Загрузить фото",
    uploadSub: "или перетащите его сюда",
    camera: "Камера",
    shoot: "Снять",
    close: "Закрыть",
    camError: "Не удалось открыть камеру. Разрешите браузеру доступ к камере или загрузите фото файлом.",
    camHint: "Поместите лист в рамку",
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
    chatEmpty: "Задайте любой вопрос о растениях, цветах, ботанике и экологии.",
    chatAbout: "Тема разговора",
    chatGeneral: "Общие вопросы",
    chatClear: "Новый разговор",
    chatPlaceholder: "Напишите вопрос…",
    chatSuggestPlant: ["Как часто поливать?", "Перейдёт ли на другие растения?", "Нужно ли пересаживать?"],
    chatSuggestGeneral: [
      "Как происходит фотосинтез?",
      "Какие растения в Красной книге Казахстана?",
      "Что будет с растениями без пчёл?",
      "Почему желтеют листья?",
    ],
    thinking: "Печатает…",
    historyTitle: "История",
    historyEmpty: "Анализов пока нет. Загрузите первое фото.",
    historyStart: "Перейти к диагнозу",
    clear: "Очистить историю",
    aboutTitle: "Инструкция",
    about: [
      ["Фото", "Фото уменьшается в браузере, геолокация удаляется. На сервере фото не хранится."],
      ["Анализ", "Модель Google Gemini определяет вид, состояние и вероятную болезнь."],
      ["Совет", "Уход, шаги лечения и типы препаратов, которые продаются в Казахстане."],
      ["Ваш отзыв", "Оценки ответов помогают сделать их точнее."],
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
const PLANTS_KEY = "osimdik_plants_v1";
const NOTIFIED_KEY = "osimdik_notified_day";

const DAY = 86_400_000;
function dayStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}
// Келесі суаруға дейін неше күн қалды (0 — бүгін, теріс — кешікті)
function daysLeft(lastISO, every) {
  if (!every) return null;
  const last = dayStart(new Date(lastISO || Date.now()));
  return Math.round((last + every * DAY - dayStart()) / DAY);
}
const BEST_KEY = "osimdik_best_streak";

// Суару журналы (ескі өсімдіктерде журнал жоқ — соңғы суаруды аламыз)
function plantLog(p) {
  return p.log?.length ? p.log : [p.lastWatered];
}
function addToLog(p, iso) {
  const log = plantLog(p);
  const d = dayStart(new Date(iso));
  if (log.some((x) => dayStart(new Date(x)) === d)) return log;
  return [...log, iso].sort().slice(-120);
}
function startOf(p) {
  return dayStart(new Date(p.createdAt || p.lastWatered || Date.now()));
}
// D күнінің соңында өсімдік кешігіп тұр ма?
function lateOn(p, D) {
  if (D < startOf(p)) return false;
  let last = null;
  for (const iso of plantLog(p)) {
    const x = dayStart(new Date(iso));
    if (x <= D && (last === null || x > last)) last = x;
  }
  if (last === null) last = startOf(p);
  return (D - last) / DAY > p.waterEvery;
}
// Серия: бүгіннен артқа қарай қатарынан неше күн ешбір өсімдік кешікпеді
function calcStreak(plants) {
  if (!plants.length) return 0;
  const earliest = Math.min(...plants.map(startOf));
  let n = 0;
  for (let k = 0; k < 366; k++) {
    const D = dayStart() - k * DAY;
    if (D < earliest) break;
    if (plants.some((p) => lateOn(p, D))) break;
    n++;
  }
  return n;
}
function wateredThisWeek(plants) {
  const from = dayStart() - 6 * DAY;
  return plants.reduce((sum, p) => sum + plantLog(p).filter((x) => dayStart(new Date(x)) >= from).length, 0);
}
// Алдағы 7 күн: әр күні қай өсімдіктерді суару керек
function weekPlan(plants) {
  const days = Array.from({ length: 7 }, (_, i) => ({ date: new Date(dayStart() + i * DAY), items: [] }));
  for (const p of plants) {
    const left = daysLeft(p.lastWatered, p.waterEvery);
    if (left === null) continue;
    for (let d = Math.max(0, left); d < 7; d += p.waterEvery) {
      days[d].items.push({ plant: p, late: left < 0 && d === 0 });
    }
  }
  return days;
}

function todayISO() {
  return new Date().toISOString();
}
function dateInput(iso) {
  const d = new Date(iso || Date.now());
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Телефон күнтізбесіне қайталанатын оқиға (.ics)
function downloadICS(plant, t) {
  const left = Math.max(0, daysLeft(plant.lastWatered, plant.waterEvery) ?? 0);
  const start = new Date(dayStart() + left * DAY);
  const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const esc = (x) => String(x).replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, " ");
  const title = `${t.watered === "Суардым" ? "Суару" : "Полить"}: ${plant.name}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tamyr//KZ",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${plant.id}@osimdik-doctor`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(start)}`,
    `DTEND;VALUE=DATE:${ymd(new Date(start.getTime() + DAY))}`,
    `RRULE:FREQ=DAILY;INTERVAL=${plant.waterEvery}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(plant.note || t.everyN(plant.waterEvery))}`,
    "BEGIN:VALARM",
    "TRIGGER:PT9H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${plant.name.replace(/[^\p{L}\p{N}]+/gu, "-") || "plant"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
function compressImage(file, maxSize = 1024, quality = 0.82) {
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

/* ───────────── Жауапты пішімдеу ───────────── */
// **қалың** мәтін
function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part.replace(/\*/g, "")
  );
}
// Абзацтар, «- » тізімдер, «1. » нөмірленген тізімдер
function RichText({ text }) {
  const blocks = [];
  let list = null;
  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    const ul = line.match(/^[-•*]\s+(.*)/);
    const ol = line.match(/^\d+[.)]\s+(.*)/);
    if (ul || ol) {
      const type = ul ? "ul" : "ol";
      if (!list || list.type !== type) {
        list = { type, items: [] };
        blocks.push(list);
      }
      list.items.push((ul || ol)[1]);
    } else {
      list = null;
      if (line) blocks.push({ type: "p", text: line.replace(/^#+\s*/, "") });
    }
  }
  return (
    <div className="rich">
      {blocks.map((b, i) => {
        if (b.type === "p") return <p key={i}>{inline(b.text)}</p>;
        const Tag = b.type;
        return (
          <Tag key={i}>
            {b.items.map((x, k) => (
              <li key={k}>{inline(x)}</li>
            ))}
          </Tag>
        );
      })}
    </div>
  );
}

/* ───────────── Логотип: төрт жапырақты беде (клевер) ───────────── */
const CLOVER_LEAF = "M0 0C-10.5-3.5-16.5-11.5-14.6-19.2C-13-24.6-5.4-25.6 0-19.8C5.4-25.6 13-24.6 14.6-19.2C16.5-11.5 10.5-3.5 0 0Z";
function Logo({ size = 36 }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="tamyr-cl" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0" stopColor="#11602f" />
          <stop offset="0.5" stopColor="#26994f" />
          <stop offset="1" stopColor="#8ee063" />
        </linearGradient>
      </defs>
      <path d="M32 30C33.5 41 37.5 51 43.5 59.5" fill="none" stroke="#14532d" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(32 28.5) scale(0.98)">
        <g className="logo-leaves">
        {[45, 135, 225, 315].map((a) => (
          <g key={a} transform={`rotate(${a}) translate(0 -1.6) scale(0.8 1)`}>
            <path d={CLOVER_LEAF} fill="url(#tamyr-cl)" stroke="#0e4f2b" strokeWidth="0.9" strokeLinejoin="round" />
            <path d="M-11.2-17.8C-10.2-21.6-6-22.6-3.2-20.2" fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M-7.2-11.6Q0-6.8 7.2-11.6" fill="none" stroke="#f3ffe9" strokeOpacity="0.6" strokeWidth="2.1" strokeLinecap="round" />
          </g>
        ))}
        <circle r="2" fill="#0e4f2b" />
        </g>
      </g>
    </svg>
  );
}

/* ───────────── Дауыс: жазу → WAV ───────────── */
async function blobToWavDataUrl(blob) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const audio = await ctx.decodeAudioData(await blob.arrayBuffer());
  ctx.close?.();
  const rate = 16000;
  const off = new OfflineAudioContext(1, Math.max(1, Math.ceil(audio.duration * rate)), rate);
  const src = off.createBufferSource();
  src.buffer = audio;
  src.connect(off.destination);
  src.start();
  const data = (await off.startRendering()).getChannelData(0);
  const buf = new ArrayBuffer(44 + data.length * 2);
  const v = new DataView(buf);
  const w = (o, str) => [...str].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  v.setUint32(4, 36 + data.length * 2, true);
  w(8, "WAVE");
  w(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, data.length * 2, true);
  for (let i = 0; i < data.length; i++) {
    const x = Math.max(-1, Math.min(1, data[i]));
    v.setInt16(44 + i * 2, x < 0 ? x * 0x8000 : x * 0x7fff, true);
  }
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:audio/wav;base64,${btoa(bin)}`;
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
  drop: <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />,
  thermo: <path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0ZM12 16.5v-6" />,
  sprout: <path d="M12 20v-8m0 0c0-3-2-5-6-5 0 3 2 5 6 5Zm0 0c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6ZM6 20h12" />,
  shield: <path d="M12 3 5 6v5.5c0 4.3 3 7.7 7 9.5 4-1.8 7-5.2 7-9.5V6l-7-3ZM9 12l2 2 4-4" />,
  search: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4" />,
  up: <path d="M7 11v8H4.5a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5H7Zm0 0 4-7a2 2 0 0 1 2 2v3.5h5a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 17 19H7" />,
  down: <path d="M17 13V5h2.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H17Zm0 0-4 7a2 2 0 0 1-2-2v-3.5H6a2 2 0 0 1-2-2.3l1-6A2 2 0 0 1 7 5h10" />,
  alert: <path d="M12 9v4M12 17h.01M10.3 4.2 2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" />,
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  plants: <path d="M7 14h10l-1.2 6.2a1 1 0 0 1-1 .8H9.2a1 1 0 0 1-1-.8L7 14ZM12 14V9m0 0c0-2.5-1.7-4-4.5-4 0 2.5 1.7 4 4.5 4Zm0 0c0-2.8 1.8-4.5 5-4.5 0 2.8-1.8 4.5-5 4.5Z" />,
  bell: <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20a2 2 0 0 0 4 0" />,
  calendar: <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-11ZM5 10h14M9 3v4M15 3v4" />,
  edit: <path d="M5 19h4L19 9l-4-4L5 15v4ZM13 7l4 4" />,
  trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />,
  check: <path d="M5 12.5 10 17l9-10" />,
  copy: <path d="M9 9h10v10H9V9ZM5 15V5h10" />,
  cloud: <path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18Z" />,
  rain: <path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 15ZM8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5" />,
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 6l2.5-1.5M9.5 19.5 12 18l2.5 1.5" />,
  wind: <path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7" />,
  pin: <path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  book: <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15ZM5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7h6" />,
  pill: <path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7ZM7 10l7 7" />,
  back: <path d="M15 6l-6 6 6 6" />,
  trend: <path d="M4 16l5-5 4 4 7-7M15 8h5v5" />,
  mic: <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3ZM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />,
  speaker: <path d="M5 9.5h3l4.5-4v13l-4.5-4H5v-5ZM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />,
  stop: <path d="M7 7h10v10H7z" />,
  map: <path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4Zm0 0v13m6-10v13" />,
  locate: <path d="M12 2v3M12 19v3M2 12h3M19 12h3M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" />,
  image: <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11ZM4 15l4.5-4.5L13 15m-1.5-1.5L14 11l6 6M15.5 9h.01" />,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />,
  flame: <path d="M12 21c3.6 0 6-2.5 6-6 0-4.5-4-6.5-4.5-11-2.5 2-4 4.5-4 7-1 0-2-1-2.5-2.5C5.5 10 6 12 6 15c0 3.5 2.4 6 6 6Z" />,
  trophy: <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6M10 17h4" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  sparkle: <path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5ZM18.5 15.5c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8Z" />,
  plusCircle: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8v8M8 12h8" />,
  thumbUp: <path d="M7 10v10H4V10h3Zm0 0 4-7c1.7 0 2.7 1.2 2.4 2.8L13 9h5.5a2 2 0 0 1 2 2.4l-1.3 6.8A2.2 2.2 0 0 1 17 20H7" />,
  thumbDown: <path d="M7 14V4H4v10h3Zm0 0 4 7c1.7 0 2.7-1.2 2.4-2.8L13 15h5.5a2 2 0 0 0 2-2.4l-1.3-6.8A2.2 2.2 0 0 0 17 4H7" />,
  share: <path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />,
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />,
  mail: <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM3.5 6.5 12 13l8.5-6.5" />,
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

const TABS = ["diagnose", "plants", "map", "chat", "about"];

/* ───────────── Басты бет ───────────── */
export default function Home() {
  const [lang, setLang] = useState("kk");
  const [theme, setTheme] = useState(null);
  const [tab, setTab] = useState("diagnose");
  const [images, setImages] = useState([]);
  const image = images[0] || null;
  const [pendingQ, setPendingQ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(null); // соңғы/ашылған талдау
  const [chatKey, setChatKey] = useState(null); // қай талдау туралы чат (null = жалпы)
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [generalChat, setGeneralChat] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [plants, setPlants] = useState([]);
  const t = T[lang];

  useEffect(() => {
    const savedLang = store(LANG_KEY);
    if (savedLang === "kk" || savedLang === "ru") setLang(savedLang);
    const savedTheme = store(THEME_KEY);
    setTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    try {
      setHistory(JSON.parse(store(HISTORY_KEY) || "[]"));
      setGeneralChat(JSON.parse(store(GENERAL_CHAT_KEY) || "[]"));
      setPlants(JSON.parse(store(PLANTS_KEY) || "[]"));
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

  /* ── Аккаунт / Аккаунт ── */
  const [authReady, setAuthReady] = useState(null); // null — тексерілуде, false — бапталмаған
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [sync, setSync] = useState({ state: "idle", at: null });
  const [authMsg, setAuthMsg] = useState("");
  const syncedRef = useRef(false);

  useEffect(() => {
    const { error, got } = consumeRedirect();
    if (error) {
      setAuthMsg(error);
      setTab("profile");
    }
    if (got) setTab("profile");
    (async () => {
      const cfg = await getAuthConfig();
      setAuthReady(Boolean(cfg));
      if (!cfg || !(await getSession())) return;
      try {
        const u = await getUser();
        if (u) await startSync(u);
      } catch {}
    })();
  }, []);

  // Кіргеннен кейін: бұлт пен құрылғыны біріктіреміз
  async function startSync(u) {
    setUser(u);
    setSync({ state: "syncing", at: null });
    try {
      const cloud = await loadCloud(u.id);
      let localPlants = [];
      let localHistory = [];
      try {
        localPlants = JSON.parse(store(PLANTS_KEY) || "[]");
        localHistory = JSON.parse(store(HISTORY_KEY) || "[]");
      } catch {}
      const mp = mergePlants(localPlants, cloud?.plants || []);
      const mh = mergeHistory(localHistory, cloud?.history || []);
      setPlants(mp);
      store(PLANTS_KEY, JSON.stringify(mp));
      setHistory(mh);
      store(HISTORY_KEY, JSON.stringify(mh));
      const name = cloud?.display_name || u.name || "";
      setDisplayName(name);
      await saveCloud(u.id, { plants: mp, history: mh, display_name: name });
      syncedRef.current = true;
      setSync({ state: "saved", at: new Date() });
    } catch {
      setSync({ state: "error", at: null });
    }
  }

  async function pushCloud(extra = {}) {
    if (!user || !syncedRef.current) return;
    setSync((x) => ({ ...x, state: "syncing" }));
    try {
      await saveCloud(user.id, { plants, history, display_name: displayName, ...extra });
      setSync({ state: "saved", at: new Date() });
    } catch {
      setSync((x) => ({ ...x, state: "error" }));
    }
  }

  // Өзгеріс болса — 1,5 секундтан кейін бұлтқа сақтаймыз
  useEffect(() => {
    if (!user || !syncedRef.current) return;
    const id = setTimeout(() => pushCloud(), 1500);
    return () => clearTimeout(id);
  }, [plants, history, user]);

  async function login() {
    setAuthMsg("");
    try {
      await signInWithGoogle();
    } catch {
      setAuthMsg(t.profile.notReady);
    }
  }

  async function logout() {
    await signOut();
    syncedRef.current = false;
    setUser(null);
    setSync({ state: "idle", at: null });
  }

  async function wipeCloud() {
    if (!user || !window.confirm(t.profile.wipeConfirm)) return;
    try {
      await deleteCloud(user.id);
      await logout();
      setAuthMsg(t.profile.wiped);
    } catch {
      setSync((x) => ({ ...x, state: "error" }));
    }
  }

  async function renameUser(name) {
    const clean = name.trim().slice(0, 60);
    setDisplayName(clean);
    await pushCloud({ display_name: clean });
  }

  const dueCount = plants.filter((p) => (daysLeft(p.lastWatered, p.waterEvery) ?? 1) <= 0).length;

  const tabsRef = useRef(null);
  const [ind, setInd] = useState({ opacity: 0 });

  // Белсенді қойынды астындағы «таблетканы» жылжыту
  const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
  useIso(() => {
    function place() {
      const nav = tabsRef.current;
      const el = nav?.querySelector(`[data-tab="${tab}"]`);
      if (!el) return setInd((x) => ({ ...x, opacity: 0 }));
      setInd({ opacity: 1, width: el.offsetWidth, height: el.offsetHeight, transform: `translate(${el.offsetLeft}px, ${el.offsetTop}px)` });
    }
    place();
    window.addEventListener("resize", place);
    document.fonts?.ready?.then(place);
    return () => window.removeEventListener("resize", place);
  }, [tab, lang, dueCount]);

  // Сайт ашылғанда — күніне бір рет хабарландыру
  useEffect(() => {
    if (!dueCount || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const today = dateInput();
    if (store(NOTIFIED_KEY) === today) return;
    try {
      const names = plants
        .filter((p) => (daysLeft(p.lastWatered, p.waterEvery) ?? 1) <= 0)
        .map((p) => p.name)
        .join(", ");
      new Notification(t.notifyTitle, { body: names, tag: "osimdik-water" });
      store(NOTIFIED_KEY, today);
    } catch {}
  }, [dueCount]);

  function savePlants(list) {
    setPlants(list);
    store(PLANTS_KEY, JSON.stringify(list));
  }

  function addPlantFromEntry(entry) {
    const r = entry.result || {};
    const plant = {
      id: crypto.randomUUID?.() || String(Date.now()),
      name: r.plant_name || r.latin_name || "—",
      latin: r.latin_name || "",
      thumb: entry.thumb || null,
      waterEvery: Math.min(60, Math.max(1, r.watering_interval_days || 7)),
      fertEvery: Math.min(180, Math.max(0, r.fertilize_interval_days || 0)),
      lastWatered: todayISO(),
      log: [todayISO()],
      lastFert: todayISO(),
      note: r.care?.watering || "",
      diagKey: entry.key,
      createdAt: todayISO(),
    };
    savePlants([plant, ...plants]);
    patchEntry(entry.key, { plantId: plant.id });
    return plant;
  }

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

  async function pickFile(file, append = false) {
    if (!file || !file.type?.startsWith("image/")) return;
    setCurrent(null);
    setError("");
    try {
      const img = await compressImage(file);
      setImages((prev) => (append ? [...prev, img].slice(0, 3) : [img]));
    } catch {
      setError("Error reading image");
    }
  }

  function pickDataUrl(url, append = false) {
    setCurrent(null);
    setError("");
    setImages((prev) => (append ? [...prev, url].slice(0, 3) : [url]));
  }

  function removeImage(i) {
    setImages((prev) => prev.filter((_, k) => k !== i));
  }

  // Анықтамалықтан: өсімдікті қосу және кеңесшіге сұрақ
  function addPlantSimple({ name, latin, waterEvery, fertEvery = 0, note = "" }) {
    savePlants([
      {
        id: crypto.randomUUID?.() || String(Date.now()),
        name,
        latin: latin || "",
        thumb: null,
        waterEvery: Math.min(60, Math.max(1, waterEvery || 7)),
        fertEvery,
        lastWatered: todayISO(),
        log: [todayISO()],
        lastFert: todayISO(),
        note,
        createdAt: todayISO(),
      },
      ...plants,
    ]);
  }
  // Талдауды картаға белгілеу (браузер геолокациясы арқылы)
  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error(t.geoDenied));
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => reject(new Error(t.geoDenied)),
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
      );
    });
  }
  async function addToMap({ plant_name, latin_name, health_status, diagnosis, red_book }, chosen) {
    const pos = chosen || (await getPosition());
    await postJSON("/api/observations", {
      ...pos,
      plant_name,
      latin_name,
      health_status,
      diagnosis,
      red_book,
      clientId,
      lang,
    });
    return pos;
  }
  async function mapEntry(entry) {
    const r = entry.result || {};
    await addToMap({
      plant_name: r.plant_name || r.latin_name || "—",
      latin_name: r.latin_name || "",
      health_status: r.health_status,
      diagnosis: r.diagnosis,
      red_book: Boolean(r.red_book_kz),
    });
    patchEntry(entry.key, { mapped: true });
  }

  function askQuestion(q) {
    setChatKey(null);
    setPendingQ(q);
    setTab("chat");
    window.scrollTo({ top: 0 });
  }

  async function analyze() {
    if (!image) return;
    setLoading(true);
    setError("");
    setCurrent(null);
    try {
      const data = await postJSON("/api/diagnose", { images, lang, clientId });
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
    setImages([]);
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
      <Backdrop />
      <header className="topbar">
        <button className="brand" onClick={() => setTab("diagnose")}>
          <Logo size={44} />
          <span className="brand-name">{t.brand}</span>
        </button>
        <div className="top-actions">
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
          <button
            className={`acct-btn ${user ? "in" : ""} ${tab === "profile" ? "on" : ""}`}
            onClick={() => {
              setTab("profile");
              window.scrollTo({ top: 0 });
            }}
            aria-label={t.profile.title}
            title={t.profile.title}
          >
            {user ? (
              <Avatar user={user} name={displayName} size={34} />
            ) : (
              <>
                <Icon name="user" size={17} />
                <span className="acct-label">{t.login}</span>
              </>
            )}
          </button>
        </div>
      </header>

      <nav className="tabs" aria-label="Menu" ref={tabsRef}>
        <span className="tab-ind" style={ind} aria-hidden="true" />
        {TABS.map((k) => (
          <button
            key={k}
            data-tab={k}
            className={`tab ${tab === k ? "active" : ""}`}
            onClick={() => setTab(k)}
            aria-current={tab === k ? "page" : undefined}
          >
            <Icon name={k} size={19} />
            <span>{t.nav[k]}</span>
            {k === "history" && history.length > 0 && <span className="tab-count muted-count">{history.length}</span>}
            {k === "plants" && dueCount > 0 && <span className="tab-count">{dueCount}</span>}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === "diagnose" && (
          <Diagnose
            t={t}
            image={image}
            images={images}
            onRemove={removeImage}
            loading={loading}
            error={error}
            current={current}
            onPick={pickFile}
            onShot={pickDataUrl}
            onAnalyze={analyze}
            onPatch={patchEntry}
            onAsk={askAbout}
            onSavePlant={addPlantFromEntry}
            onMap={mapEntry}
            history={history}
            onOpenEntry={openEntry}
            onClearHistory={() => saveHistory([])}
            onOpenPlants={() => setTab("plants")}
          />
        )}
        {tab === "plants" && <MyPlants t={t} lang={lang} plants={plants} onSave={savePlants} />}
        {tab === "chat" && (
          <ChatPage
            t={t}
            lang={lang}
            userName={user ? (displayName || user.name || "").split(" ")[0] : ""}
            history={history}
            entry={chatEntry}
            onSelect={setChatKey}
            messages={chatEntry ? chatEntry.chat || [] : generalChat}
            initialQuestion={pendingQ}
            onConsumed={() => setPendingQ(null)}
            setMessages={(msgs) => {
              if (chatEntry) patchEntry(chatEntry.key, { chat: msgs });
              else {
                setGeneralChat(msgs);
                store(GENERAL_CHAT_KEY, JSON.stringify(msgs));
              }
            }}
          />
        )}
        {tab === "map" && <PlantMap t={t} lang={lang} history={history} onAdd={addToMap} />}
        {tab === "about" && (
          <Reference t={t} lang={lang} plants={plants} onAddPlant={addPlantSimple} onAsk={askQuestion} />
        )}

        {tab === "profile" && (
          <Profile
            t={t}
            lang={lang}
            theme={theme}
            user={user}
            authReady={authReady}
            authMsg={authMsg}
            displayName={displayName}
            sync={sync}
            plants={plants}
            history={history}
            onLogin={login}
            onLogout={logout}
            onWipe={wipeCloud}
            onRename={renameUser}
            onSyncNow={() => pushCloud()}
            onLang={changeLang}
            onTheme={toggleTheme}
            onGo={setTab}
          />
        )}

        {tab !== "chat" && <SiteFooter t={t} tab={tab} setTab={setTab} />}
      </main>
    </div>
  );
}

/* ───────────── Фон: гербарий торы ───────────── */
function Backdrop() {
  const leaf = "M12 2C6 6 4 12 6 20c1-4 3-7 6-9-2 3-3 6-3 10 7-3 10-9 9-15-1-2-3-3-6-4Z";
  return (
    <div className="backdrop" aria-hidden="true">
      <span className="sun" />

      {/* Сол жақ: жабайы дала қызғалдағы — сызылып, гүлдейді, тербеледі */}
      <svg className="tulip" viewBox="0 0 160 560">
        <defs>
          <linearGradient id="petal" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--tulip-1)" />
            <stop offset="1" stopColor="var(--tulip-2)" />
          </linearGradient>
          <linearGradient id="wingA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="wingB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <g className="tulip-sway">
          <path className="draw d1" pathLength="1" d="M80 560 C 82 470 74 380 82 250 C 86 190 80 160 82 140" />
          <path className="draw d2 leafline" pathLength="1" d="M80 520 C 34 470 18 380 30 300 C 48 380 66 450 80 500" />
          <path className="draw d3 leafline" pathLength="1" d="M82 470 C 126 430 146 350 136 280 C 118 350 98 410 82 440" />
          <path className="draw d4" pathLength="1" d="M60 560 C 58 530 52 510 44 495" />
          <path className="draw d4" pathLength="1" d="M100 560 C 104 532 112 515 122 505" />
          <g className="bloom">
            <path className="petal" d="M82 140 C 58 132 50 100 56 66 C 66 84 76 100 82 110 Z" />
            <path className="petal" d="M82 140 C 106 132 114 100 108 66 C 98 84 88 100 82 110 Z" />
            <path className="petal mid" d="M82 128 C 68 110 68 78 82 52 C 96 78 96 110 82 128 Z" />
          </g>
        </g>
        {/* Көбелек: гүлге қонып, айналып ұшады */}
        <g className="butterfly">
          <g>
            <animateMotion
              dur="18s"
              begin="3s"
              repeatCount="indefinite"
              keyTimes="0;0.3;1"
              keyPoints="0;0;1"
              calcMode="linear"
              path="M82 50 C 130 -10 158 40 140 105 C 122 170 40 185 14 125 C -2 80 40 18 82 50"
            />
            <g transform="scale(1.7)">
            <g className="wings">
              <animateTransform attributeName="transform" type="scale" values="1 1;0.2 1;1 1" dur="0.42s" repeatCount="indefinite" />
              <path d="M0 0 C -6 -14 -20 -16 -20 -6 C -20 2 -9 4 0 0 Z" fill="url(#wingA)" />
              <path d="M0 0 C 6 -14 20 -16 20 -6 C 20 2 9 4 0 0 Z" fill="url(#wingA)" />
              <path d="M0 1 C -4 10 -14 12 -14 6 C -14 2 -6 1 0 1 Z" fill="url(#wingB)" />
              <path d="M0 1 C 4 10 14 12 14 6 C 14 2 6 1 0 1 Z" fill="url(#wingB)" />
              <circle cx="-12" cy="-8" r="2" fill="#fff7e6" opacity="0.85" />
              <circle cx="12" cy="-8" r="2" fill="#fff7e6" opacity="0.85" />
            </g>
            <path d="M0 -6 L0 7" stroke="#3b2414" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M0 -6 C -2 -11 -4 -13 -6 -14 M0 -6 C 2 -11 4 -13 6 -14" stroke="#3b2414" strokeWidth="0.9" fill="none" />
            </g>
          </g>
        </g>

        {/* Қызыл қоңыз: сол жапырақпен жоғары өрмелейді */}
        <g className="ladybug">
          <animateMotion dur="28s" begin="2.5s" repeatCount="indefinite" rotate="auto" keyTimes="0;0.8;1" keyPoints="0;1;1" calcMode="linear" path="M78 540 C 64 515 48 495 40 470 C 30 430 22 380 30 300" />
          <g transform="scale(1.15)">
            <ellipse cx="0" cy="0" rx="9" ry="7" fill="#dc2626" />
            <path d="M-9 0 H9" stroke="#1f1f1f" strokeWidth="1.2" />
            <circle cx="9.5" cy="0" r="3.6" fill="#1f1f1f" />
            <circle cx="-4" cy="-3.6" r="1.6" fill="#1f1f1f" />
            <circle cx="-4" cy="3.6" r="1.6" fill="#1f1f1f" />
            <circle cx="2.5" cy="-3.2" r="1.4" fill="#1f1f1f" />
            <circle cx="2.5" cy="3.2" r="1.4" fill="#1f1f1f" />
            <ellipse cx="-2" cy="-3" rx="3" ry="1.3" fill="#fff" opacity="0.35" />
          </g>
        </g>
      </svg>

      {/* Оң жақ: тербелетін папоротник */}
      <svg className="frond" viewBox="0 0 400 600">
        <path d="M200 590 C 196 420 204 220 200 10" />
        {Array.from({ length: 11 }).map((_, i) => {
          const y = 540 - i * 48;
          const w = 170 - i * 12;
          return (
            <g key={i}>
              <path d={`M200 ${y} C ${200 - w * 0.5} ${y - 30} ${200 - w} ${y - 70} ${200 - w} ${y - 70} C ${200 - w * 0.7} ${y - 20} ${200 - w * 0.3} ${y - 4} 200 ${y}`} />
              <path d={`M200 ${y} C ${200 + w * 0.5} ${y - 30} ${200 + w} ${y - 70} ${200 + w} ${y - 70} C ${200 + w * 0.7} ${y - 20} ${200 + w * 0.3} ${y - 4} 200 ${y}`} />
            </g>
          );
        })}
      </svg>

      {/* Жарқырауық қоңыздар (қараңғыда) / тозаң (жарықта) */}
      <div className="fireflies">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <span key={i} className={`ff f${i}`} />
        ))}
      </div>

      {/* Өсіп шығатын кішкентай беде — логотиптегідей */}
      <svg className="sprout" viewBox="0 0 64 64">
        <path className="sprout-stem" d="M32 64 C 32 52 31 42 32 31" />
        <g className="sprout-head" transform="translate(32 28)">
          {[45, 135, 225, 315].map((a) => (
            <g key={a} transform={`rotate(${a}) translate(0 -1.6) scale(0.8 1)`}>
              <path d={CLOVER_LEAF} fill="var(--sprout)" />
            </g>
          ))}
        </g>
      </svg>

      {/* Баяу ұшып бара жатқан жапырақтар */}
      {[1, 2, 3].map((i) => (
        <svg key={i} className={`drift dr${i}`} viewBox="0 0 24 24">
          <path d={leaf} />
        </svg>
      ))}
    </div>
  );
}

/* ───────────── Веб-камера терезесі ───────────── */
function CameraModal({ t, onClose, onShot }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        setErr(t.camError);
      }
    }
    start();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  function shoot() {
    const v = videoRef.current;
    if (!v?.videoWidth) return;
    const max = 1024;
    const scale = Math.min(1, max / Math.max(v.videoWidth, v.videoHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    onShot(c.toDataURL("image/jpeg", 0.88));
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={t.camera} onClick={onClose}>
      <div className="cam glass" onClick={(e) => e.stopPropagation()}>
        <div className="cam-view">
          <video ref={videoRef} playsInline muted onLoadedData={() => setReady(true)} />
          {!err && <span className="cam-frame" aria-hidden="true" />}
          {!err && ready && <span className="cam-hint">{t.camHint}</span>}
          {err && <p className="cam-err">{err}</p>}
        </div>
        <div className="cam-bar">
          <button className="btn ghost" onClick={onClose}>
            {t.close}
          </button>
          <button className="shutter" onClick={shoot} disabled={!ready || !!err} aria-label={t.shoot}>
            <span />
          </button>
          <span className="cam-spacer" />
        </div>
      </div>
    </div>
  );
}

/* ───────────── Диагноз ───────────── */
function FileInputs({ fileRef, camRef, onPick }) {
  const handle = (e) => {
    onPick(e.target.files?.[0]);
    e.target.value = "";
  };
  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handle} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={handle} />
    </>
  );
}

function Diagnose({ t, image, images = [], onRemove, loading, error, current, onPick, onShot, onAnalyze, onPatch, onAsk, onSavePlant, onOpenPlants, onMap, history = [], onOpenEntry, onClearHistory }) {
  const fileRef = useRef(null);
  const camRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [webcam, setWebcam] = useState(false);
  const extraRef = useRef(null);

  // Телефонда — жүйелік камера (сапасы жақсы), ноутбукта — веб-камера терезесі
  function openCamera() {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch) camRef.current?.click();
    else setWebcam(true);
  }

  const today = new Date().toLocaleDateString();
  const showSheet = !current || image;

  return (
    <div className="page">
      <FileInputs fileRef={fileRef} camRef={camRef} onPick={onPick} />
      {webcam && (
        <CameraModal
          t={t}
          onClose={() => setWebcam(false)}
          onShot={(url) => {
            setWebcam(false);
            onShot(url, Boolean(image));
          }}
        />
      )}
      <input
        ref={extraRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onPick(e.target.files?.[0], true);
          e.target.value = "";
        }}
      />

      {showSheet && (
        <section className={`hero ${image ? "has-image" : ""}`}>
          <div className="hero-copy">
            <h1 className="hero-title" aria-label={t.heroTitle}>
              {t.heroTitle.split(" ").map((w, i) => (
                <span key={`${w}${i}`} className="hw" style={{ "--i": i }} aria-hidden="true">
                  {w}
                </span>
              ))}
            </h1>
            <p>{t.heroText}</p>
            <div className="hero-actions">
              {image ? (
                <>
                  <button className="btn primary big" onClick={onAnalyze} disabled={loading}>
                    {loading ? t.analyzing : t.analyze}
                  </button>
                  <button className="btn ghost" onClick={() => fileRef.current?.click()} disabled={loading}>
                    {t.change}
                  </button>
                  {images.length < 3 && (
                    <p className="photos-hint">
                      <Icon name="image" size={15} /> {t.photosHint}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <button className="btn primary big" onClick={() => fileRef.current?.click()}>
                    <Icon name="upload" size={19} /> {t.upload}
                  </button>
                  <button className="btn ghost" onClick={openCamera}>
                    <Icon name="camera" size={19} /> {t.camera}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Гербарий парағы — сурет жүктелетін орын */}
          <div
            className={`sheet ${drag ? "drag" : ""}`}
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
            <span className="crop tl" />
            <span className="crop tr" />
            <span className="crop bl" />
            <span className="crop br" />
            {image ? (
              <div className={`specimen ${loading ? "scanning" : ""}`}>
                <img src={image} alt="" />
                {loading && <span className="scan-line" aria-hidden="true" />}
                <div className="thumbs">
                  {images.map((src, i) => (
                    <span key={i} className={`thumb ${i === 0 ? "main" : ""}`}>
                      <img src={src} alt="" />
                      {!loading && (
                        <button onClick={() => onRemove(i)} aria-label={t.removePhoto}>
                          <Icon name="x" size={12} />
                        </button>
                      )}
                    </span>
                  ))}
                  {images.length < 3 && !loading && (
                    <button className="thumb add" onClick={() => extraRef.current?.click()} aria-label={t.addPhoto} title={t.photosHint}>
                      <Icon name="plus" size={18} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button className="sheet-empty" onClick={() => fileRef.current?.click()}>
                <svg className="sprig" viewBox="0 0 120 200" aria-hidden="true">
                  <path d="M60 196 C 58 150 62 90 60 14" />
                  {[0, 1, 2, 3, 4, 5].map((k) => {
                    const y = 170 - k * 26;
                    const w = 38 - k * 4;
                    return (
                      <g key={k}>
                        <path d={`M60 ${y} C ${60 - w * 0.6} ${y - 6} ${60 - w} ${y - 20} ${60 - w} ${y - 28} C ${60 - w * 0.5} ${y - 22} ${60 - w * 0.2} ${y - 10} 60 ${y}`} />
                        <path d={`M60 ${y - 12} C ${60 + w * 0.6} ${y - 18} ${60 + w} ${y - 32} ${60 + w} ${y - 40} C ${60 + w * 0.5} ${y - 34} ${60 + w * 0.2} ${y - 22} 60 ${y - 12}`} />
                      </g>
                    );
                  })}
                  <ellipse cx="60" cy="12" rx="5" ry="9" />
                </svg>
                <span>{t.uploadSub}</span>
              </button>
            )}
            <div className="tag">
              <span>
                <em>{t.sheetSpecies}</em> {loading ? "…" : t.sheetPending}
              </span>
              <span>
                <em>{t.sheetDate}</em> {today}
              </span>
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="alert" role="alert">
          <Icon name="alert" size={18} /> {error}
        </div>
      )}

      {!current && !image && <LatinTicker />}

      {!current && !image && (
        <section className="bento intro">
          <figure className="tile t-scan">
            <img
              src={photoUrl(SCENES.monsteraDrops, 1600)}
              srcSet={photoSet(SCENES.monsteraDrops)}
              sizes="(max-width: 860px) 100vw, 60vw"
              alt=""
              loading="lazy"
            />
            <span className="scan-line" aria-hidden="true" />
            <span className="scan-frame" aria-hidden="true"><i /><i /><i /><i /></span>
            <figcaption className="scan-card">
              <span className="scan-kicker"><Icon name="sparkle" size={14} /> {t.scanKicker}</span>
              <strong>{t.scanName}</strong>
              <em>Monstera deliciosa</em>
              <span className="scan-ok"><span className="dot" /> {t.scanStatus}</span>
              <span className="scan-tip"><Icon name="drop" size={14} /> {t.scanTip}</span>
            </figcaption>
          </figure>
          <div className="t-gallery">
            {t.gallery.map(([label, key]) => (
              <figure key={key} className="g-ph">
                <img src={photoUrl(PLANT_PHOTOS[key], 700, 700)} srcSet={`${photoUrl(PLANT_PHOTOS[key], 700, 700)} 1x, ${photoUrl(PLANT_PHOTOS[key], 1400, 1400)} 2x`} alt="" loading="lazy" />
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="tile t-shoot">
            <h3>{t.fShootTitle}</h3>
            <ul className="ticks">
              {t.tips.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="tile t-find">
            <h3>{t.fFindTitle}</h3>
            <ul className="find">
              {t.fFind.map((x, i) => (
                <li key={x}>
                  <Icon name={["leaf", "search", "sprout", "shield"][i]} size={18} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="tile t-priv">
            <Icon name="shield" size={26} />
            <h3>{t.fPrivTitle}</h3>
            <p>{t.fPrivText}</p>
          </div>
        </section>
      )}

      {!current && !image && history.length > 0 && (
        <RecentHistory t={t} history={history} onOpen={onOpenEntry} onClear={onClearHistory} />
      )}

      {current && (
        <>
          {!image && (
            <div className="result-top">
              <button className="btn ghost" onClick={() => fileRef.current?.click()}>
                <Icon name="plus" size={18} /> {t.upload}
              </button>
              <button className="btn ghost" onClick={openCamera}>
                <Icon name="camera" size={18} /> {t.camera}
              </button>
            </div>
          )}
          <Result t={t} entry={current} onAsk={onAsk} onPatch={onPatch} onSavePlant={onSavePlant} onOpenPlants={onOpenPlants} onMap={onMap} />
        </>
      )}
    </div>
  );
}

function Result({ t, entry, onAsk, onPatch, onSavePlant, onOpenPlants, onMap }) {
  const r = entry.result;
  if (r.is_plant === false) {
    return (
      <section className="tile">
        <h2 className="tile-title">{t.notPlant}</h2>
        {r.photo_tip && <p className="muted">{r.photo_tip}</p>}
      </section>
    );
  }
  const status = r.health_status || "unknown";
  const conf = Math.max(0, Math.min(100, r.confidence ?? 0));
  let i = 0;
  const n = () => ({ "--i": i++ });

  const care = [
    ["drop", t.watering, r.care?.watering],
    ["sun", t.light, r.care?.light],
    ["thermo", t.temperature, r.care?.temperature],
    ["sprout", t.soil, r.care?.soil_fertilizer],
  ].filter((c) => c[2]);

  return (
    <article className={`bento result s-${status}`} key={entry.key}>
      {/* Гербарий этикеткасы */}
      <header className="tile label" style={n()}>
        <div className="ring" style={{ "--p": conf }}>
          {entry.thumb ? <img src={entry.thumb} alt="" /> : <Icon name="leaf" size={30} />}
        </div>
        <div className="label-text">
          <p className="latin">{r.latin_name || r.plant_name || "—"}</p>
          {r.latin_name && <h2>{r.plant_name}</h2>}
          <p className="conf">
            {t.confidence} <strong>{conf}%</strong>
          </p>
        </div>
        <span className="stamp">{t.statuses[status]}</span>
      </header>

      <section className="tile diag" style={n()}>
        <h3>{t.diagnosis}</h3>
        <p>{r.diagnosis}</p>
        {conf < 60 && <small>{t.lowConf}</small>}
      </section>

      {r.treatment?.length > 0 && (
        <section className="tile treat" style={n()}>
          <h3 className="tile-title">{t.treatment}</h3>
          <ol className="steps">
            {r.treatment.map((x, k) => (
              <li key={k}>{x}</li>
            ))}
          </ol>
        </section>
      )}

      {r.symptoms?.length > 0 && (
        <section className="tile half" style={n()}>
          <h3 className="tile-title">{t.symptoms}</h3>
          <ul className="bullets">
            {r.symptoms.map((x, k) => (
              <li key={k}>{x}</li>
            ))}
          </ul>
        </section>
      )}
      {r.causes?.length > 0 && (
        <section className="tile half" style={n()}>
          <h3 className="tile-title">{t.causes}</h3>
          <ul className="bullets">
            {r.causes.map((x, k) => (
              <li key={k}>{x}</li>
            ))}
          </ul>
        </section>
      )}

      {care.map(([icon, k, v]) => (
        <section key={k} className="tile care" style={n()}>
          <span className="care-icon">
            <Icon name={icon} size={20} />
          </span>
          <h3>{k}</h3>
          <p>{v}</p>
        </section>
      ))}

      {r.products?.length > 0 && (
        <section className="tile wide products" style={n()}>
          <h3 className="tile-title">{t.products}</h3>
          <div className="prod-grid">
            {r.products.map((p, k) => (
              <div key={k} className="product">
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
                  className="kaspi"
                  href={`https://kaspi.kz/shop/search/?text=${encodeURIComponent(
                    p.search_query || p.active_ingredient || p.product_type
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.searchKaspi} <Icon name="arrow" size={16} />
                </a>
              </div>
            ))}
          </div>
          <p className="fine">{t.productsNote}</p>
        </section>
      )}

      {r.toxicity_note && (
        <p className="tile wide note warn" style={n()}>
          <Icon name="alert" size={18} /> {r.toxicity_note}
        </p>
      )}
      {r.photo_tip && (
        <p className="tile wide note" style={n()}>
          <Icon name="camera" size={18} /> {r.photo_tip}
        </p>
      )}

      {(status === "sick" || status === "needs_attention" || entry.followups?.length > 0) && (
        <Progress t={t} entry={entry} onPatch={onPatch} style={n()} />
      )}

      <MapButton t={t} entry={entry} onMap={onMap} style={n()} />

      {entry.plantId ? (
        <button className="tile save done" style={n()} onClick={onOpenPlants}>
          <Icon name="check" size={22} />
          <span>{t.savedToPlants}</span>
          <Icon name="arrow" size={20} />
        </button>
      ) : (
        <button className="tile save" style={n()} onClick={() => onSavePlant(entry)}>
          <Icon name="plants" size={24} />
          <span>{t.saveToPlants}</span>
          <Icon name="plus" size={20} />
        </button>
      )}
      <button className="tile ask" style={n()} onClick={() => onAsk(entry)}>
        <Icon name="chat" size={24} />
        <span>{t.askAbout}</span>
        <Icon name="arrow" size={20} />
      </button>
      <div className="tile fb" style={n()}>
        <Feedback t={t} entry={entry} onPatch={onPatch} />
      </div>
    </article>
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
    return <p className="fb-done">{t.thanks}</p>;
  }
  if (entry.feedback === "down") {
    return (
      <div className="fb-col">
        <label htmlFor="fb">{t.whatWrong}</label>
        <textarea id="fb" value={comment} onChange={(e) => setComment(e.target.value)} rows={2} maxLength={500} />
        <button className="btn primary" onClick={() => send("down", comment)}>
          {t.send}
        </button>
      </div>
    );
  }
  return (
    <div className="fb-row">
      <span>{t.helpful}</span>
      <div className="fb-btns">
        <button
          aria-label="Yes"
          onClick={() => {
            onPatch(entry.key, { feedback: "up" });
            send("up", "");
          }}
        >
          <Icon name="up" size={19} />
        </button>
        <button aria-label="No" onClick={() => onPatch(entry.key, { feedback: "down" })}>
          <Icon name="down" size={19} />
        </button>
      </div>
    </div>
  );
}

/* ───────────── Менің өсімдіктерім ───────────── */
function MyPlants({ t, lang, plants, onSave }) {
  const [editing, setEditing] = useState(null); // null | "new" | plant
  const [perm, setPerm] = useState("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") setPerm(Notification.permission);
    else setPerm("unsupported");
  }, []);

  async function askNotify() {
    try {
      const r = await Notification.requestPermission();
      setPerm(r);
      if (r === "granted") new Notification(t.notifyOn, { body: t.notifyHint });
    } catch {}
  }

  function update(id, patch) {
    onSave(plants.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  // Суару керегі бірінші тұрады
  const sorted = [...plants].sort(
    (a, b) => (daysLeft(a.lastWatered, a.waterEvery) ?? 99) - (daysLeft(b.lastWatered, b.waterEvery) ?? 99)
  );
  const due = sorted.filter((p) => (daysLeft(p.lastWatered, p.waterEvery) ?? 1) <= 0).length;
  const streak = calcStreak(plants);
  const [best, setBest] = useState(0);
  useEffect(() => {
    const prev = parseInt(store(BEST_KEY) || "0", 10) || 0;
    const b = Math.max(prev, streak);
    if (b !== prev) store(BEST_KEY, String(b));
    setBest(b);
  }, [streak]);
  const week = weekPlan(plants);

  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.plantsTitle}</h1>
        <button className="btn primary" onClick={() => setEditing("new")}>
          <Icon name="plus" size={18} /> {t.addPlant}
        </button>
      </header>

      <Weather t={t} lang={lang} />

      {editing && (
        <PlantForm
          t={t}
          plant={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSubmit={(p) => {
            if (editing === "new") onSave([p, ...plants]);
            else update(p.id, p);
            setEditing(null);
          }}
        />
      )}

        <section className="stats">
          <div className="stat">
            <Icon name="plants" size={20} />
            <strong>{plants.length}</strong>
            <span>{t.statPlants}</span>
          </div>
          <div className="stat">
            <Icon name="drop" size={20} />
            <strong>{t.nTimes(wateredThisWeek(plants))}</strong>
            <span>{t.statWeek}</span>
          </div>
          <div className={`stat streak ${streak > 0 ? "on" : ""}`} title={t.streakHint}>
            <Icon name="flame" size={20} />
            <strong>{t.nDays(streak)}</strong>
            <span>{t.statStreak}</span>
          </div>
          <div className="stat" title={t.streakHint}>
            <Icon name="trophy" size={20} />
            <strong>{t.nDays(best)}</strong>
            <span>{t.statBest}</span>
          </div>
        </section>
        <p className="streak-hint">{t.streakHint}</p>

        <section className="week">
          <h3>{t.weekTitle}</h3>
          <ol className="days">
            {week.map((d, i) => (
              <li key={i} className={`day ${i === 0 ? "today-day" : ""} ${d.items.length ? "busy" : ""}`}>
                <span className="dow">{d.date.toLocaleDateString(t.locale, { weekday: "short" })}</span>
                <span className="dnum">{d.date.getDate()}</span>
                <span className="dots">
                  {d.items.slice(0, 3).map(({ plant, late }) => (
                    <span key={plant.id} className={`dot ${late ? "late" : ""}`} title={plant.name}>
                      {plant.thumb ? <img src={plant.thumb} alt={plant.name} /> : plant.name.slice(0, 1)}
                    </span>
                  ))}
                  {d.items.length > 3 && <span className="dot more">+{d.items.length - 3}</span>}
                </span>
                <span className="dnames">
                  {d.items.length ? d.items.map((x) => x.plant.name).join(", ") : t.weekRest}
                </span>
              </li>
            ))}
          </ol>
        </section>

      {plants.length === 0 ? (
        <section className="empty quick">
          <Icon name="plants" size={36} />
          <p>{t.plantsEmpty}</p>
          <h3>{t.quickTitle}</h3>
          <div className="quick-grid">
            {t.quick.map(([name, latin, water, fert]) => (
              <button
                key={latin}
                className="quick-add"
                onClick={() =>
                  onSave([
                    ...plants,
                    {
                      id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
                      name,
                      latin,
                      thumb: null,
                      waterEvery: water,
                      fertEvery: fert,
                      lastWatered: todayISO(),
                      log: [todayISO()],
                      lastFert: todayISO(),
                      note: "",
                      createdAt: todayISO(),
                    },
                  ])
                }
              >
                {photoForLatin(latin) && (
                  <img className="qa-ph" src={photoUrl(photoForLatin(latin), 240, 240)} alt="" loading="lazy" />
                )}
                <span className="qa-name">{name}</span>
                <span className="qa-latin">{latin}</span>
                <span className="qa-meta">
                  <Icon name="drop" size={13} /> {t.everyN(water)}
                </span>
                <Icon name="plus" size={18} />
              </button>
            ))}
          </div>
          <button className="btn ghost" onClick={() => setEditing("new")}>
            <Icon name="edit" size={16} /> {t.addPlant}
          </button>
        </section>
      ) : (
        <>
          <section className={`today ${due ? "has-due" : ""}`}>
            <Icon name={due ? "drop" : "check"} size={26} />
            <p>{due ? t.summaryDue(due) : t.summaryOk}</p>
          </section>

          <ul className="plants">
            {sorted.map((p) => (
              <PlantCard
                key={p.id}
                t={t}
                plant={p}
                onWater={() => {
                  const now = todayISO();
                  update(p.id, { lastWatered: now, log: addToLog(p, now) });
                }}
                onFert={() => update(p.id, { lastFert: todayISO() })}
                onEdit={() => setEditing(p)}
                onDelete={() => onSave(plants.filter((x) => x.id !== p.id))}
              />
            ))}
          </ul>

          <section className="reminders">
            <h3>{t.remindersTitle}</h3>
            <div className="rem-row">
              <Icon name="calendar" size={22} />
              <p>{t.calendarHint}</p>
            </div>
            {perm !== "unsupported" && (
              <div className="rem-row">
                <Icon name="bell" size={22} />
                <p>{perm === "denied" ? t.notifyDenied : t.notifyHint}</p>
                {perm === "default" && (
                  <button className="btn ghost small" onClick={askNotify}>
                    {t.notify}
                  </button>
                )}
                {perm === "granted" && <span className="rem-on">{t.notifyOn}</span>}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function PlantCard({ t, plant, onWater, onFert, onEdit, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const left = daysLeft(plant.lastWatered, plant.waterEvery) ?? 0;
  const fertLeft = plant.fertEvery ? daysLeft(plant.lastFert, plant.fertEvery) : null;
  const state = left < 0 ? "late" : left === 0 ? "due" : "ok";
  // Сақина: келесі суаруға дейін өткен уақыт үлесі
  const progress = Math.round(Math.min(1, Math.max(0, 1 - left / plant.waterEvery)) * 100);
  const label = left < 0 ? t.overdue(-left) : left === 0 ? t.dueToday : t.dueIn(left);

  return (
    <li className={`plant p-${state}`}>
      <div className="plant-main">
        <div className="pring" style={{ "--p": progress }}>
          {plant.thumb ? <img src={plant.thumb} alt="" /> : photoForLatin(plant.latin) ? <img src={photoUrl(photoForLatin(plant.latin), 200, 200)} alt="" loading="lazy" /> : <span className="pring-in"><Icon name="plants" size={26} /></span>}
        </div>
        <div className="plant-text">
          <h3>{plant.name}</h3>
          {plant.latin && <p className="plant-latin">{plant.latin}</p>}
          <p className="plant-when">
            <Icon name="drop" size={15} /> {label}
          </p>
          <p className="plant-meta">
            {t.everyN(plant.waterEvery)} · {t.lastWatered}: {new Date(plant.lastWatered).toLocaleDateString()}
          </p>
          {fertLeft !== null && fertLeft <= 0 && (
            <p className="plant-fert">
              <Icon name="sprout" size={15} /> {t.fertDue}
            </p>
          )}
        </div>
      </div>

      {plant.note && <p className="plant-note">{plant.note}</p>}

      <div className="plant-actions">
        <button className={`btn ${state === "ok" ? "ghost" : "primary"} small`} onClick={onWater}>
          <Icon name="drop" size={16} /> {t.watered}
        </button>
        {fertLeft !== null && fertLeft <= 0 && (
          <button className="btn tonal small" onClick={onFert}>
            <Icon name="sprout" size={16} /> {t.fertilized}
          </button>
        )}
        <span className="spacer" />
        <button className="icon-btn sm" onClick={() => downloadICS(plant, t)} aria-label={t.calendar} title={t.calendar}>
          <Icon name="calendar" size={18} />
        </button>
        <button className="icon-btn sm" onClick={onEdit} aria-label={t.edit} title={t.edit}>
          <Icon name="edit" size={18} />
        </button>
        {confirm ? (
          <button className="btn danger small" onClick={onDelete}>
            {t.delConfirm}
          </button>
        ) : (
          <button className="icon-btn sm" onClick={() => setConfirm(true)} aria-label={t.del} title={t.del}>
            <Icon name="trash" size={18} />
          </button>
        )}
      </div>
    </li>
  );
}

function PlantForm({ t, plant, onCancel, onSubmit }) {
  const fileRef = useRef(null);
  const [f, setF] = useState(() => ({
    name: plant?.name || "",
    thumb: plant?.thumb || null,
    waterEvery: plant?.waterEvery || 7,
    fertEvery: plant?.fertEvery ?? 0,
    last: dateInput(plant?.lastWatered),
    note: plant?.note || "",
  }));
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const img = await compressImage(file, 600, 0.8);
      setF((x) => ({ ...x, thumb: null }));
      const th = await thumbnail(img);
      setF((x) => ({ ...x, thumb: th }));
    } catch {}
  }

  function submit(e) {
    e.preventDefault();
    const name = f.name.trim();
    if (!name) return;
    const lastISO = new Date(`${f.last}T12:00:00`).toISOString();
    onSubmit({
      ...(plant || {
        id: crypto.randomUUID?.() || String(Date.now()),
        latin: "",
        lastFert: todayISO(),
        createdAt: todayISO(),
      }),
      name,
      thumb: f.thumb,
      waterEvery: Math.min(60, Math.max(1, parseInt(f.waterEvery, 10) || 7)),
      fertEvery: Math.min(180, Math.max(0, parseInt(f.fertEvery, 10) || 0)),
      lastWatered: lastISO,
      log: plant ? addToLog(plant, lastISO) : [lastISO],
      note: f.note.trim(),
    });
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={plant ? t.edit : t.addPlant} onClick={onCancel}>
      <form className="sheet-form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <header className="form-head">
          <h2>{plant ? t.edit : t.addPlant}</h2>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label={t.cancel}>
            <Icon name="x" size={18} />
          </button>
        </header>

        <div className="form-photo">
          <button type="button" className="pring big" style={{ "--p": 100 }} onClick={() => fileRef.current?.click()}>
            {f.thumb ? <img src={f.thumb} alt="" /> : <Icon name="camera" size={26} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
          <label className="field grow">
            <span>{t.fName}</span>
            <input value={f.name} onChange={set("name")} required maxLength={60} autoFocus />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>{t.fWater}</span>
            <input type="number" inputMode="numeric" min={1} max={60} value={f.waterEvery} onChange={set("waterEvery")} />
          </label>
          <label className="field">
            <span>{t.fLast}</span>
            <input type="date" value={f.last} max={dateInput()} onChange={set("last")} />
          </label>
        </div>
        <label className="field">
          <span>{t.fFert}</span>
          <input type="number" inputMode="numeric" min={0} max={180} value={f.fertEvery} onChange={set("fertEvery")} />
        </label>
        <label className="field">
          <span>{t.fNote}</span>
          <textarea rows={2} value={f.note} onChange={set("note")} placeholder={t.fNotePh} maxLength={300} />
        </label>

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            {t.cancel}
          </button>
          <button type="submit" className="btn primary">
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───────────── Латын атаулары жолағы ───────────── */
const TICKER = [
  "Tulipa greigii", "Malus sieversii", "Monstera deliciosa", "Haloxylon aphyllum", "Ficus elastica",
  "Aloe vera", "Solanum lycopersicum", "Phalaenopsis", "Dracaena trifasciata", "Cucumis sativus",
  "Spathiphyllum wallisii", "Chlorophytum comosum", "Zamioculcas zamiifolia", "Trifolium repens",
];
function LatinTicker() {
  const row = (hidden) => (
    <div className="ticker-row" aria-hidden={hidden || undefined}>
      {TICKER.map((n) => (
        <span key={n} className="tk">
          <em>{n}</em>
          <Icon name="leaf" size={16} />
        </span>
      ))}
    </div>
  );
  return (
    <section className="ticker" aria-label="Latin plant names">
      <div className="ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}

/* ───────────── Футер ───────────── */
/* ───────────── Профиль / Профиль ───────────── */
function Avatar({ user, name, size = 40 }) {
  const [broken, setBroken] = useState(false);
  const letter = (name || user?.name || user?.email || "?").trim().charAt(0).toUpperCase();
  return (
    <span className="uav" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {user?.avatar && !broken ? (
        <img src={user.avatar} alt="" referrerPolicy="no-referrer" onError={() => setBroken(true)} />
      ) : (
        letter
      )}
    </span>
  );
}

const BADGES = [
  { id: "first", icon: "diagnose", test: (d) => d.diag >= 1 },
  { id: "five", icon: "plants", test: (d) => d.plants >= 5 },
  { id: "week", icon: "flame", test: (d) => d.best >= 7 },
  { id: "mapper", icon: "map", test: (d) => d.mapped >= 1 },
  { id: "healer", icon: "shield", test: (d) => d.healer },
  { id: "rare", icon: "book", test: (d) => d.rare },
];

function Profile({
  t, lang, theme, user, authReady, authMsg, displayName, sync, plants, history,
  onLogin, onLogout, onWipe, onRename, onSyncNow, onLang, onTheme, onGo,
}) {
  const p = t.profile;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const [busy, setBusy] = useState(false);
  useEffect(() => setDraft(displayName), [displayName]);

  const best = Math.max(Number(store(BEST_KEY) || 0), calcStreak(plants));
  const data = {
    plants: plants.length,
    diag: history.length,
    best,
    mapped: history.filter((h) => h.mapped).length,
    healer: history.some((h) => h.result?.health_status === "sick"),
    rare: history.some((h) => h.result?.red_book_kz),
  };
  const earned = BADGES.filter((b) => b.test(data)).length;
  const locale = lang === "kk" ? "kk-KZ" : "ru-RU";

  const badges = (
    <section className="tile badges-tile">
      <div className="badges-head">
        <h3>{p.badgesTitle}</h3>
        <span className="badge-count">
          {earned}/{BADGES.length}
        </span>
      </div>
      <div className="badges">
        {BADGES.map((b) => {
          const on = b.test(data);
          const [name, desc] = p.badges[b.id];
          return (
            <div key={b.id} className={`badge ${on ? "on" : ""}`} title={desc}>
              <span className="seal">
                <Icon name={b.icon} size={22} />
              </span>
              <strong>{name}</strong>
              <small>{desc}</small>
            </div>
          );
        })}
      </div>
    </section>
  );

  if (!user) {
    return (
      <div className="profile">
        <section className="auth-card">
          <div className="auth-copy">
            <span className="eyebrow">{p.title}</span>
            <h1>{p.guestTitle}</h1>
            <p className="auth-sub">{p.guestSub}</p>
            <ul className="perks">
              {p.perks.map(([icon, text]) => (
                <li key={text}>
                  <span><Icon name={icon} size={18} /></span>
                  {text}
                </li>
              ))}
            </ul>
            <button
              className="btn primary big google-btn"
              disabled={authReady === false || busy}
              onClick={async () => {
                setBusy(true);
                await onLogin();
                setTimeout(() => setBusy(false), 4000);
              }}
            >
              <Icon name="mail" size={20} />
              {p.google}
            </button>
            {authReady === false && <p className="auth-note warn">{p.notReady}</p>}
            {authMsg && <p className="auth-note warn">{authMsg}</p>}
            <p className="auth-note">{p.privacy}</p>
          </div>
          <div className="id-card ghosted" aria-hidden="true">
            <span className="tape a" />
            <span className="tape b" />
            <div className="id-top">
              <span className="uav empty" style={{ width: 72, height: 72 }}>
                <Icon name="user" size={30} />
              </span>
              <div>
                <span className="id-kicker">Herbarium Tamyr</span>
                <em className="id-latin">Hortulanus tamyrensis</em>
              </div>
            </div>
            <dl className="id-rows">
              <div><dt>{p.since}</dt><dd>— — —</dd></div>
              <div><dt>{p.stats.plants}</dt><dd>{data.plants}</dd></div>
              <div><dt>{p.stats.diag}</dt><dd>{data.diag}</dd></div>
            </dl>
            <Logo size={34} />
          </div>
        </section>
        {badges}
      </div>
    );
  }

  const sinceStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString(locale, { month: "long", year: "numeric" }) : "—";
  const timeStr = sync.at ? sync.at.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="profile">
      <div className="prof-top">
      <section className="id-card big">
        <span className="tape a" />
        <span className="tape b" />
        <div className="id-top">
          <Avatar user={user} name={displayName} size={88} />
          <div className="id-name">
            <span className="id-kicker">Herbarium Tamyr · {p.title}</span>
            {editing ? (
              <form
                className="name-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  onRename(draft);
                  setEditing(false);
                }}
              >
                <input value={draft} maxLength={60} onChange={(e) => setDraft(e.target.value)} autoFocus aria-label={p.editName} />
                <button className="btn primary small" type="submit">{p.save}</button>
              </form>
            ) : (
              <h1>
                {displayName || user.name}
                <button className="icon-btn mini" onClick={() => setEditing(true)} aria-label={p.editName} title={p.editName}>
                  <Icon name="edit" size={15} />
                </button>
              </h1>
            )}
            <em className="id-latin">Hortulanus tamyrensis</em>
          </div>
        </div>
        <dl className="id-rows">
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>{p.since}</dt><dd>{sinceStr}</dd></div>
          <div><dt>{p.badgesTitle}</dt><dd>{earned}/{BADGES.length}</dd></div>
        </dl>
        <span className="id-stamp" aria-hidden="true"><Logo size={46} /></span>
      </section>

      <div className="stats">
        <button className="stat as-btn" onClick={() => onGo("plants")}>
          <Icon name="plants" />
          <strong>{data.plants}</strong>
          <span>{p.stats.plants}</span>
        </button>
        <button className="stat as-btn" onClick={() => onGo("diagnose")}>
          <Icon name="diagnose" />
          <strong>{data.diag}</strong>
          <span>{p.stats.diag}</span>
        </button>
        <div className={`stat streak ${best >= 3 ? "on" : ""}`}>
          <Icon name="flame" />
          <strong>{best} <small>{p.days}</small></strong>
          <span>{p.stats.streak}</span>
        </div>
        <button className="stat as-btn" onClick={() => onGo("map")}>
          <Icon name="pin" />
          <strong>{data.mapped}</strong>
          <span>{p.stats.mapped}</span>
        </button>
      </div>
      </div>

      {badges}

      <div className="bento prof-grid">
        <section className={`tile sync-tile s-${sync.state}`}>
          <h3><Icon name="cloud" size={20} /> {p.syncTitle}</h3>
          <p className="sync-line">
            <span className="dot" />
            {sync.state === "syncing" && p.syncing}
            {sync.state === "saved" && `${p.synced} · ${timeStr}`}
            {sync.state === "error" && p.syncErr}
            {sync.state === "idle" && "—"}
          </p>
          <button className="btn tonal small" onClick={onSyncNow} disabled={sync.state === "syncing"}>
            <Icon name="refresh" size={16} /> {p.syncNow}
          </button>
        </section>

        <section className="tile set-tile">
          <h3>{p.settings}</h3>
          <div className="set-row">
            <span>{p.language}</span>
            <div className="seg">
              {["kk", "ru"].map((l) => (
                <button key={l} className={lang === l ? "on" : ""} onClick={() => onLang(l)}>
                  {l === "kk" ? "Қаз" : "Рус"}
                </button>
              ))}
            </div>
          </div>
          <div className="set-row">
            <span>{p.theme}</span>
            <div className="seg">
              <button className={theme === "light" ? "on" : ""} onClick={() => theme !== "light" && onTheme()}>{p.light}</button>
              <button className={theme !== "light" ? "on" : ""} onClick={() => theme === "light" && onTheme()}>{p.dark}</button>
            </div>
          </div>
        </section>

        <section className="tile out-tile">
          <button className="btn ghost" onClick={onLogout}>
            <Icon name="logout" size={18} /> {p.logout}
          </button>
          <button className="link-danger" onClick={onWipe}>
            <Icon name="trash" size={15} /> {p.wipe}
          </button>
        </section>
      </div>
    </div>
  );
}

function SiteFooter({ t, tab, setTab }) {
  return (
    <footer className="site-footer">
      <div className="sf-top">
        <div className="sf-brand">
          <Logo size={52} />
          <p>{t.footerTag}</p>
        </div>
        <nav className="sf-links" aria-label={t.footerSections}>
          <h3>{t.footerSections}</h3>
          {TABS.map((k) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => { setTab(k); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              {t.nav[k]}
            </button>
          ))}
        </nav>
        <button className="sf-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Icon name="arrow" size={18} /> {t.footerTop}
        </button>
      </div>
      <p className="sf-word" aria-hidden="true">Tamyr</p>
      <p className="sf-disc">{t.disclaimer}</p>
    </footer>
  );
}

/* ───────────── Емдеу барысы ───────────── */
function Progress({ t, entry, onPatch, style }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const list = entry.followups || [];
  const startDay = dayStart(new Date(entry.date));
  const lang = entry.lang || "kk";

  async function check(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const img = await compressImage(file);
      const days = Math.max(0, Math.round((dayStart() - startDay) / DAY));
      const data = await postJSON("/api/progress", { image: img, diagnosis: entry.result, days, lang });
      const item = { date: todayISO(), thumb: await thumbnail(img), ...data };
      onPatch(entry.key, { followups: [...list, item] });
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tile wide progress" style={style}>
      <div className="progress-head">
        <div>
          <h3 className="tile-title">{t.progressTitle}</h3>
          <p className="muted small">{t.progressHint}</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={check} />
        <button className="btn primary small" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Icon name="camera" size={16} /> {busy ? t.progressChecking : t.progressBtn}
        </button>
      </div>
      <ol className="timeline">
        <li className="tl s-start">
          {entry.thumb ? <img src={entry.thumb} alt="" /> : <span className="tl-dot" />}
          <div>
            <strong>{t.progressStart}</strong>
            <span className="muted small">{new Date(entry.date).toLocaleDateString()}</span>
            <p>{entry.result?.diagnosis}</p>
          </div>
        </li>
        {list.map((f, i) => {
          const d = Math.max(0, Math.round((dayStart(new Date(f.date)) - startDay) / DAY));
          return (
            <li key={i} className={`tl v-${f.verdict}`}>
              {f.thumb ? <img src={f.thumb} alt="" /> : <span className="tl-dot" />}
              <div>
                <strong>
                  <span className="verdict">{t.verdicts[f.verdict] || f.verdict}</span> · {t.dayN(d)}
                </strong>
                <p>{f.summary}</p>
                {f.next_steps?.length > 0 && (
                  <ul className="bullets small">
                    {f.next_steps.map((x, k) => (
                      <li key={k}>{x}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {err && (
        <p className="alert small">
          <Icon name="alert" size={16} /> {err}
        </p>
      )}
    </section>
  );
}

/* ───────────── Ауа райы ───────────── */
const CITY_KEY = "osimdik_city";
function weatherIcon(code) {
  if (code >= 71 && code <= 77) return "snow";
  if (code === 85 || code === 86) return "snow";
  if (code >= 51) return "rain";
  if (code >= 2) return "cloud";
  return "sun";
}
function weatherAlerts(d, t) {
  const out = [];
  const n = Math.min(3, d.time.length);
  const mins = d.temperature_2m_min.slice(0, n);
  const maxs = d.temperature_2m_max.slice(0, n);
  const rain = d.precipitation_sum.slice(0, n);
  const wind = d.wind_speed_10m_max.slice(0, n);
  const minT = Math.round(Math.min(...mins));
  const maxT = Math.round(Math.max(...maxs));
  if (minT <= 0) out.push({ level: "danger", icon: "snow", text: t.wFrost(minT) });
  else if (minT <= 4) out.push({ level: "warn", icon: "thermo", text: t.wCold(minT) });
  if (maxT >= 35) out.push({ level: "warn", icon: "sun", text: t.wHeat(maxT) });
  const maxRain = Math.max(...rain);
  if (maxRain >= 10) out.push({ level: "info", icon: "rain", text: t.wRain(Math.round(maxRain)) });
  const maxWind = Math.max(...wind);
  if (maxWind >= 40) out.push({ level: "warn", icon: "wind", text: t.wWind(Math.round(maxWind)) });
  const rain5 = d.precipitation_sum.slice(0, 5).reduce((a, b) => a + b, 0);
  if (rain5 < 1 && Math.max(...d.temperature_2m_max.slice(0, 5)) >= 28) out.push({ level: "info", icon: "drop", text: t.wDry });
  if (!out.length) out.push({ level: "ok", icon: "check", text: t.wOk });
  return out;
}

function Weather({ t, lang }) {
  const [city, setCity] = useState("almaty");
  const [geo, setGeo] = useState(null);
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    const saved = store(CITY_KEY);
    if (saved && CITIES.some((c) => c.id === saved)) setCity(saved);
  }, []);

  const place = city === "geo" && geo ? geo : CITIES.find((c) => c.id === city) || CITIES[0];

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
      "&current=temperature_2m,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max" +
      "&timezone=auto&forecast_days=6";
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (!cancelled) {
          setData(j);
          setState("ok");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [place.lat, place.lon]);

  function choose(v) {
    if (v === "geo") {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          setGeo({ lat: +pos.coords.latitude.toFixed(2), lon: +pos.coords.longitude.toFixed(2) });
          setCity("geo");
        },
        () => {}
      );
      return;
    }
    setCity(v);
    store(CITY_KEY, v);
  }

  const d = data?.daily;
  const alerts = d ? weatherAlerts(d, t) : [];

  return (
    <section className="weather">
      <header className="weather-head">
        <h3>{t.weatherTitle}</h3>
        <label className="ctx">
          <span className="sr-only">{t.weatherTitle}</span>
          <select value={city} onChange={(e) => choose(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c[lang] || c.ru}
              </option>
            ))}
            <option value="geo">{t.myLocation}</option>
          </select>
        </label>
      </header>

      {state === "loading" && <p className="muted">{t.weatherLoading}</p>}
      {state === "error" && <p className="muted">{t.weatherError}</p>}
      {state === "ok" && d && (
        <div className="weather-body">
          <div className="now">
            <Icon name={weatherIcon(data.current?.weather_code ?? d.weather_code[0])} size={40} />
            <strong>{Math.round(data.current?.temperature_2m ?? d.temperature_2m_max[0])}°</strong>
          </div>
          <ol className="forecast">
            {d.time.map((day, i) => (
              <li key={day}>
                <span className="f-dow">{new Date(day + "T12:00").toLocaleDateString(t.locale, { weekday: "short" })}</span>
                <Icon name={weatherIcon(d.weather_code[i])} size={20} />
                <span className="f-t">
                  {Math.round(d.temperature_2m_max[i])}° <em>{Math.round(d.temperature_2m_min[i])}°</em>
                </span>
              </li>
            ))}
          </ol>
          <ul className="alerts">
            {alerts.map((a, i) => (
              <li key={i} className={`al al-${a.level}`}>
                <Icon name={a.icon} size={18} />
                <span>{a.text}</span>
              </li>
            ))}
          </ul>
          <p className="w-src">{t.weatherSource}</p>
        </div>
      )}
    </section>
  );
}

/* ───────────── Анықтамалық ───────────── */
function Reference({ t, lang, plants, onAddPlant, onAsk }) {
  const [sub, setSub] = useState("enc");
  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.refTitle}</h1>
      </header>
      <div className="subtabs" role="tablist">
        {[
          ["enc", "book"],
          ["meds", "pill"],
          ["guide", "about"],
        ].map(([k, icon]) => (
          <button key={k} role="tab" aria-selected={sub === k} className={`subtab ${sub === k ? "on" : ""}`} onClick={() => setSub(k)}>
            <Icon name={icon} size={18} /> {t.refTabs[k]}
          </button>
        ))}
      </div>
      {sub === "enc" && <Encyclopedia t={t} lang={lang} plants={plants} onAddPlant={onAddPlant} onAsk={onAsk} />}
      {sub === "meds" && <Meds t={t} lang={lang} />}
      {sub === "guide" && <About t={t} embedded />}
    </div>
  );
}

const ENC_CACHE = "osimdik_enc_cache";
function fromStatic(p, lang) {
  const L = p[lang] || p.ru;
  return {
    id: p.id,
    name: L.name,
    latin: p.latin,
    family: p.family,
    type: L.type,
    light: p.light,
    water_min: p.water[0],
    water_max: p.water[1],
    temp_min: p.temp[0],
    temp_max: p.temp[1],
    difficulty: p.difficulty,
    tip: L.tip,
    fact: L.fact,
    toxic: L.toxic,
    kz: L.kz,
    group: p.group,
  };
}

function Encyclopedia({ t, lang, plants, onAddPlant, onAsk }) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [open, setOpen] = useState(null);
  const [aiState, setAiState] = useState("");
  const [aiErr, setAiErr] = useState("");

  const all = PLANTS.map((p) => fromStatic(p, lang));
  const needle = q.trim().toLowerCase();
  const list = all.filter(
    (p) =>
      (group === "all" || p.group === group) &&
      (!needle || p.name.toLowerCase().includes(needle) || p.latin.toLowerCase().includes(needle))
  );

  async function askAI() {
    const query = q.trim();
    if (!query) return;
    const key = `${lang}:${query.toLowerCase()}`;
    let cache = {};
    try {
      cache = JSON.parse(store(ENC_CACHE) || "{}");
    } catch {}
    if (cache[key]) return setOpen({ ...cache[key], ai: true });
    setAiState("loading");
    setAiErr("");
    try {
      const card = await postJSON("/api/plantinfo", { query, lang });
      if (card.found === false) {
        setAiErr(t.encNotFound);
      } else {
        cache[key] = card;
        const keys = Object.keys(cache);
        if (keys.length > 30) delete cache[keys[0]];
        store(ENC_CACHE, JSON.stringify(cache));
        setOpen({ ...card, ai: true });
      }
    } catch (e) {
      setAiErr(e.message);
    } finally {
      setAiState("");
    }
  }

  if (open) {
    return <PlantCardFull t={t} p={open} plants={plants} onBack={() => setOpen(null)} onAddPlant={onAddPlant} onAsk={onAsk} />;
  }

  return (
    <>
      <form
        className="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (!list.length) askAI();
        }}
      >
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.encSearch} aria-label={t.encSearch} />
      </form>
      <div className="chips">
        {Object.entries(t.encGroups).map(([k, label]) => (
          <button key={k} className={`chip ${group === k ? "on" : ""}`} onClick={() => setGroup(k)}>
            {label}
          </button>
        ))}
      </div>

      {needle && (
        <button className="ai-ask" onClick={askAI} disabled={aiState === "loading"}>
          <Icon name="bulb" size={20} />
          <span>{aiState === "loading" ? t.encLoading : t.encAskAI(q.trim())}</span>
          <Icon name="arrow" size={18} />
        </button>
      )}
      {aiErr && (
        <p className="alert small">
          <Icon name="alert" size={16} /> {aiErr}
        </p>
      )}

      <ul className="enc-grid">
        {list.map((p) => (
          <li key={p.id}>
            <button className={`enc-card g-${p.group} ${PLANT_PHOTOS[p.id] ? "has-ph" : ""}`} onClick={() => setOpen(p)}>
              {PLANT_PHOTOS[p.id] ? (
                <span className="enc-ph">
                  <img
                    src={photoUrl(PLANT_PHOTOS[p.id], 640, 480)}
                    srcSet={`${photoUrl(PLANT_PHOTOS[p.id], 640, 480)} 1x, ${photoUrl(PLANT_PHOTOS[p.id], 1280, 960)} 2x`}
                    alt={p.name}
                    loading="lazy"
                  />
                </span>
              ) : (
                <span className="enc-mark">
                  <Icon name={p.group === "garden" ? "sprout" : p.group === "kz" ? "shield" : "plants"} size={22} />
                </span>
              )}
              <strong>{p.name}</strong>
              <em>{p.latin}</em>
              <span className="enc-tags">
                <span>
                  <Icon name="sun" size={13} /> {t.lightLabels[p.light - 1]}
                </span>
                <span>
                  <Icon name="drop" size={13} /> {t.daysRange(p.water_min, p.water_max)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function PlantCardFull({ t, p, plants, onBack, onAddPlant, onAsk }) {
  const [added, setAdded] = useState(plants.some((x) => x.latin && x.latin === p.latin));
  const light = Math.min(3, Math.max(1, p.light || 2));
  const diff = Math.min(3, Math.max(1, p.difficulty || 2));
  return (
    <article className="enc-full">
      <button className="link back" onClick={onBack}>
        <Icon name="back" size={18} /> {t.encBack}
      </button>
      {PLANT_PHOTOS[p.id] && (
        <figure className="enc-hero">
          <img
            src={photoUrl(PLANT_PHOTOS[p.id], 1800, 900)}
            srcSet={`${photoUrl(PLANT_PHOTOS[p.id], 1200, 600)} 1200w, ${photoUrl(PLANT_PHOTOS[p.id], 2400, 1200)} 2400w, ${photoUrl(PLANT_PHOTOS[p.id], 3840, 1920)} 3840w`}
            sizes="100vw"
            alt={p.name}
          />
        </figure>
      )}
      <header className="tile enc-head">
        <div>
          <p className="latin">{p.latin}</p>
          <h2>{p.name}</h2>
          <p className="muted">
            {p.type}
            {p.family ? ` · ${p.family}` : ""}
          </p>
        </div>
        {p.ai && <span className="ai-badge">{t.encAIBadge}</span>}
      </header>

      <div className="bento">
        <section className="tile care">
          <span className="care-icon">
            <Icon name="sun" size={20} />
          </span>
          <h3>{t.fLightE}</h3>
          <p>{t.lightLabels[light - 1]}</p>
        </section>
        <section className="tile care">
          <span className="care-icon">
            <Icon name="drop" size={20} />
          </span>
          <h3>{t.fWaterE}</h3>
          <p>{t.daysRange(p.water_min, p.water_max)}</p>
        </section>
        <section className="tile care">
          <span className="care-icon">
            <Icon name="thermo" size={20} />
          </span>
          <h3>{t.fTempE}</h3>
          <p>
            {p.temp_min}…{p.temp_max} °C
          </p>
        </section>
        <section className="tile care">
          <span className="care-icon">
            <Icon name="sprout" size={20} />
          </span>
          <h3>{t.fDiffE}</h3>
          <p>
            <span className="meter" aria-hidden="true">
              {[1, 2, 3].map((k) => (
                <i key={k} className={k <= diff ? "on" : ""} />
              ))}
            </span>{" "}
            {t.diffLabels[diff - 1]}
          </p>
        </section>

        <section className="tile half">
          <h3 className="tile-title">{t.fTipE}</h3>
          <p>{p.tip}</p>
        </section>
        <section className="tile half fact-tile">
          <h3 className="tile-title">{t.fFactE}</h3>
          <p>{p.fact}</p>
        </section>
        {p.kz && (
          <section className="tile wide kz-tile">
            <Icon name="pin" size={20} />
            <div>
              <h3 className="tile-title">{t.fKzE}</h3>
              <p>{p.kz}</p>
            </div>
          </section>
        )}
        {p.toxic && (
          <p className="tile wide note warn">
            <Icon name="alert" size={18} /> <strong>{t.fToxicE}:</strong>&nbsp;{p.toxic}
          </p>
        )}
        <button
          className={`tile save ${added ? "done" : ""}`}
          onClick={() => {
            if (added) return;
            onAddPlant({
              name: p.name,
              latin: p.latin,
              waterEvery: Math.round(((p.water_min || 7) + (p.water_max || 7)) / 2),
              note: p.tip,
            });
            setAdded(true);
          }}
        >
          <Icon name={added ? "check" : "plants"} size={22} />
          <span>{added ? t.encAdded : t.encAdd}</span>
          <Icon name={added ? "check" : "plus"} size={20} />
        </button>
        <button className="tile ask" onClick={() => onAsk(t.encAskQ(p.name))}>
          <Icon name="chat" size={22} />
          <span>{t.encAsk}</span>
          <Icon name="arrow" size={20} />
        </button>
      </div>
    </article>
  );
}

function Meds({ t, lang }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const list = ACTIVES.filter((a) => {
    const L = a[lang] || a.ru;
    return (
      (cat === "all" || a.cat === cat) &&
      (!needle || [L.name, L.for, L.how, ...a.brands].join(" ").toLowerCase().includes(needle))
    );
  });
  return (
    <>
      <div className="meds-intro">
        <Icon name="shield" size={22} />
        <div>
          <p>{t.medsIntro}</p>
          <a href={REGISTRY_URL} target="_blank" rel="noopener noreferrer">
            {t.medsRegistry} <Icon name="arrow" size={15} />
          </a>
        </div>
      </div>
      <div className="search">
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.medsSearch} aria-label={t.medsSearch} />
      </div>
      <div className="chips">
        {Object.entries(t.medsCats).map(([k, label]) => (
          <button key={k} className={`chip ${cat === k ? "on" : ""}`} onClick={() => setCat(k)}>
            {label}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="empty">{t.medsEmpty}</p>
      ) : (
        <ul className="meds">
          {list.map((a) => {
            const L = a[lang] || a.ru;
            return (
              <li key={a.id} className={`med c-${a.cat}`}>
                <div className="med-head">
                  <span className="med-cat">{t.medsCats[a.cat]}</span>
                  <h3>{L.name}</h3>
                </div>
                <dl>
                  <div>
                    <dt>{t.medsFor}</dt>
                    <dd>{L.for}</dd>
                  </div>
                  <div>
                    <dt>{t.medsHow}</dt>
                    <dd>{L.how}</dd>
                  </div>
                </dl>
                <p className="p-safety">
                  <Icon name="alert" size={14} /> {L.safety}
                </p>
                {a.brands.length > 0 && (
                  <p className="p-line">
                    <span>{t.brands}</span> {a.brands.join(", ")}
                  </p>
                )}
                <a
                  className="kaspi"
                  href={`https://kaspi.kz/shop/search/?text=${encodeURIComponent(a.query)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.searchKaspi} <Icon name="arrow" size={16} />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ───────────── Өсімдіктер картасы ───────────── */
function loadLeaflet() {
  if (typeof window === "undefined") return Promise.reject();
  if (window.L) return Promise.resolve(window.L);
  if (window.__leafletP) return window.__leafletP;
  window.__leafletP = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const sc = document.createElement("script");
    sc.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    sc.onload = () => resolve(window.L);
    sc.onerror = () => {
      window.__leafletP = null;
      reject(new Error("leaflet"));
    };
    document.head.appendChild(sc);
  });
  return window.__leafletP;
}
const MARK_COLORS = { healthy: "#15803d", needs_attention: "#d97706", sick: "#c62828", unknown: "#6b7c72" };
// Бір нүктедегі белгілер бір-бірін жаппауы үшін кішкене ығысу (тек көрсету үшін)
function jitter(id, k) {
  let h = 0;
  for (const ch of String(id) + k) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((h % 1000) / 1000 - 0.5) * 0.003;
}

function MapButton({ t, entry, onMap, style }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (entry.result?.is_plant === false) return null;
  return (
    <section className={`tile wide mapbtn ${entry.mapped ? "done" : ""}`} style={style}>
      <span className="care-icon">
        <Icon name={entry.mapped ? "check" : "map"} size={20} />
      </span>
      <div className="mapbtn-text">
        <h3>{entry.mapped ? t.shownOnMap : t.showOnMap}</h3>
        <p className="muted small">{err || t.showOnMapHint}</p>
      </div>
      {!entry.mapped && (
        <button
          className="btn ghost small"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setErr("");
            try {
              await onMap(entry);
            } catch (e) {
              setErr(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Icon name="locate" size={16} /> {busy ? "…" : t.showOnMap}
        </button>
      )}
    </section>
  );
}

function PlantMap({ t, lang, history, onAdd }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [city, setCity] = useState("almaty");
  const [center, setCenter] = useState(null);
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [reload, setReload] = useState(0);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState(null);
  const [locErr, setLocErr] = useState("");
  const pickingRef = useRef(false);
  const tempRef = useRef(null);
  useEffect(() => {
    pickingRef.current = picking;
  }, [picking]);
  const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

  useEffect(() => {
    const saved = store(CITY_KEY);
    const c = CITIES.find((x) => x.id === saved) || CITIES[0];
    setCity(c.id);
    setCenter({ lat: c.lat, lon: c.lon });
  }, []);

  // Картаны бір рет құрамыз
  useEffect(() => {
    if (!center || mapRef.current) return;
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !boxRef.current) return;
        const map = L.map(boxRef.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView(
          [center.lat, center.lon],
          12
        );
        map.on("click", (e) => {
          if (pickingRef.current) {
            const pos = { lat: e.latlng.lat, lon: e.latlng.lng };
            tempRef.current?.remove();
            tempRef.current = L.circleMarker([pos.lat, pos.lon], { radius: 14, color: "#d97706", weight: 3, fillColor: "#f59e0b", fillOpacity: 0.5 }).addTo(map);
            setPicked(pos);
            setPicking(false);
            setAdding(true);
          } else {
            map.scrollWheelZoom.enable();
          }
        });
        map.on("mouseout", () => map.scrollWheelZoom.disable());
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        layerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setReload((x) => x + 1);
      })
      .catch(() => setState("error"));
    return () => {
      cancelled = true;
    };
  }, [center]);

  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
    },
    []
  );

  // Белгілерді жүктеу
  useEffect(() => {
    if (!center) return;
    let cancelled = false;
    setState((s) => (s === "error" ? s : "loading"));
    mapRef.current?.setView([center.lat, center.lon], mapRef.current.getZoom() < 11 ? 12 : mapRef.current.getZoom());
    fetch(`/api/observations?lat=${center.lat}&lon=${center.lon}&r=0.35`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(d.items || []);
        setState(d.configured === false ? "notcfg" : "ok");
      })
      .catch(() => !cancelled && setState("ok"));
    return () => {
      cancelled = true;
    };
  }, [center, reload]);

  const needle = q.trim().toLowerCase();
  const shown = items.filter(
    (it) =>
      (filter === "all" ||
        (filter === "sick" && (it.health_status === "sick" || it.health_status === "needs_attention")) ||
        (filter === "healthy" && it.health_status === "healthy") ||
        (filter === "protected" && it.protected)) &&
      (!needle || `${it.plant_name} ${it.latin_name || ""}`.toLowerCase().includes(needle))
  );

  // Белгілерді салу (мәтін DOM арқылы — HTML енгізілмейді)
  useEffect(() => {
    const L = typeof window !== "undefined" ? window.L : null;
    if (!L || !layerRef.current) return;
    layerRef.current.clearLayers();
    for (const it of shown) {
      const color = MARK_COLORS[it.health_status] || MARK_COLORS.unknown;
      const m = L.circleMarker([+it.lat + jitter(it.id, "a"), +it.lon + jitter(it.id, "b")], {
        radius: it.protected ? 18 : coarse ? 12 : 9,
        color: it.protected ? "#b45309" : "#ffffff",
        weight: it.protected ? 2 : 2,
        dashArray: it.protected ? "4 4" : null,
        fillColor: color,
        fillOpacity: it.protected ? 0.35 : 0.85,
      });
      const box = document.createElement("div");
      box.className = "pop";
      const b = document.createElement("strong");
      b.textContent = it.plant_name;
      box.appendChild(b);
      if (it.latin_name) {
        const i = document.createElement("em");
        i.textContent = it.latin_name;
        box.appendChild(i);
      }
      const st = document.createElement("span");
      st.className = "pop-st";
      st.style.color = color;
      st.textContent = (t.statuses[it.health_status] || "") + (it.protected ? ` · ${t.mapProtected}` : "");
      box.appendChild(st);
      if (it.diagnosis && it.health_status !== "healthy") {
        const d = document.createElement("span");
        d.textContent = it.diagnosis;
        box.appendChild(d);
      }
      const dt = document.createElement("time");
      dt.textContent = new Date(it.created_at).toLocaleDateString();
      box.appendChild(dt);
      m.bindPopup(box);
      m.addTo(layerRef.current);
    }
  }, [shown.length, filter, needle, items, reload]);

  function choose(v) {
    if (v === "geo") {
      navigator.geolocation?.getCurrentPosition(
        (p) => {
          setCity("geo");
          setCenter({ lat: +p.coords.latitude.toFixed(4), lon: +p.coords.longitude.toFixed(4) });
        },
        () => {}
      );
      return;
    }
    const c = CITIES.find((x) => x.id === v);
    if (!c) return;
    setCity(v);
    store(CITY_KEY, v);
    setCenter({ lat: c.lat, lon: c.lon });
  }

  // Статистика: ең жиі кездесетін мәселе
  const counts = {};
  for (const it of items) {
    if ((it.health_status === "sick" || it.health_status === "needs_attention") && it.diagnosis) {
      const k = it.diagnosis.toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    }
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>{t.mapTitle}</h1>
          <p className="muted page-sub">{t.mapSub}</p>
        </div>
      </header>

      {adding && (
        <MapAddForm
          t={t}
          history={history}
          pos={picked}
          onCancel={() => {
            setAdding(false);
            setPicked(null);
            tempRef.current?.remove();
          }}
          onSubmit={async (row) => {
            const pos = await onAdd(row, picked);
            setAdding(false);
            setPicked(null);
            tempRef.current?.remove();
            setCenter({ lat: +pos.lat.toFixed(4), lon: +pos.lon.toFixed(4) });
            setReload((x) => x + 1);
          }}
        />
      )}

      <div className="map-tools">
        <label className="ctx">
          <span className="sr-only">{t.mapTitle}</span>
          <select value={city} onChange={(e) => choose(e.target.value)}>
            {city === "geo" && <option value="geo">{t.myLocation}</option>}
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c[lang] || c.ru}
              </option>
            ))}
            {city !== "geo" && <option value="geo">{t.myLocation}</option>}
          </select>
        </label>
        <div className="search grow">
          <Icon name="search" size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.mapSearch} aria-label={t.mapSearch} />
        </div>
      </div>
      <div className="chips">
        {Object.entries(t.mapFilters).map(([k, label]) => (
          <button key={k} className={`chip ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>
            {label}
          </button>
        ))}
      </div>

      <section className="map-wrap">
        <div ref={boxRef} className={`map-box ${picking ? "picking" : ""}`} />

        <button
          className="map-locate"
          aria-label={t.mapLocate}
          title={t.mapLocate}
          onClick={() =>
            navigator.geolocation?.getCurrentPosition(
              (p) => {
                setLocErr("");
                setCity("geo");
                setCenter({ lat: +p.coords.latitude.toFixed(4), lon: +p.coords.longitude.toFixed(4) });
              },
              () => setLocErr(t.geoDenied)
            )
          }
        >
          <Icon name="locate" size={20} />
        </button>

        {picking ? (
          <div className="map-pickbar" role="status">
            <span>
              <Icon name="pin" size={18} /> {t.mapPickHint}
            </span>
            <div className="pickbar-actions">
              <button
                className="btn ghost small"
                onClick={() => {
                  setPicking(false);
                  setPicked(null);
                  setAdding(true);
                }}
              >
                <Icon name="locate" size={15} /> {t.myLocation}
              </button>
              <button className="btn ghost small" onClick={() => setPicking(false)}>
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button className="map-fab" onClick={() => setPicking(true)}>
            <Icon name="plus" size={22} /> <span>{t.mapAdd}</span>
          </button>
        )}
        {locErr && <div className="map-toast">{locErr}</div>}
        {state === "loading" && <div className="map-overlay">{t.mapLoading}</div>}
        {state === "error" && <div className="map-overlay">{t.mapError}</div>}
        {state === "notcfg" && <div className="map-overlay">{t.mapNotConfigured}</div>}
        {state === "ok" && items.length === 0 && <div className="map-overlay soft">{t.mapEmpty}</div>}
      </section>

      <section className="map-info">
        <div className="legend">
          {["healthy", "needs_attention", "sick"].map((k) => (
            <span key={k}>
              <i style={{ background: MARK_COLORS[k] }} /> {t.statuses[k]}
            </span>
          ))}
          <span>
            <i className="lg-protected" /> {t.mapProtected}
          </span>
        </div>
        <p className="map-stats">
          <strong>{t.mapCount(shown.length)}</strong>
          {top && <span> · {t.mapTopDisease(top[0])}</span>}
        </p>
        <p className="muted small">
          <Icon name="shield" size={14} /> {t.mapPrivacy}
        </p>
      </section>
    </div>
  );
}

function MapAddForm({ t, history, pos, onCancel, onSubmit }) {
  const [pick, setPick] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("healthy");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function onPick(key) {
    setPick(key);
    const h = history.find((x) => x.key === key);
    if (h) {
      setName(h.result?.plant_name || "");
      setStatus(h.result?.health_status || "unknown");
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const h = history.find((x) => x.key === pick);
    setBusy(true);
    setErr("");
    try {
      await onSubmit({
        plant_name: name.trim(),
        latin_name: h?.result?.latin_name || "",
        health_status: status,
        diagnosis: h?.result?.diagnosis || "",
        red_book: Boolean(h?.result?.red_book_kz),
      });
    } catch (e2) {
      setErr(e2.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={t.mapPickTitle} onClick={onCancel}>
      <form className="sheet-form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <header className="form-head">
          <h2>{t.mapPickTitle}</h2>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label={t.cancel}>
            <Icon name="x" size={18} />
          </button>
        </header>
        {history.length > 0 && (
          <label className="field">
            <span>{t.mapPickFromHistory}</span>
            <select value={pick} onChange={(e) => onPick(e.target.value)}>
              <option value="">{t.mapPickNone}</option>
              {history.map((h) => (
                <option key={h.key} value={h.key}>
                  {h.result?.plant_name || "—"} · {new Date(h.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="field">
          <span>{t.mapPickName}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
        </label>
        <label className="field">
          <span>{t.mapPickStatus}</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {["healthy", "needs_attention", "sick", "unknown"].map((k) => (
              <option key={k} value={k}>
                {t.statuses[k]}
              </option>
            ))}
          </select>
        </label>
        <p className="muted small">
          <Icon name={pos ? "pin" : "locate"} size={14} /> {pos ? t.mapPicked : t.mapHere} {t.mapPrivacy}
        </p>
        {err && (
          <p className="alert small">
            <Icon name="alert" size={16} /> {err}
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            {t.cancel}
          </button>
          <button type="submit" className="btn primary" disabled={busy}>
            <Icon name="map" size={16} /> {busy ? "…" : t.mapSave}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ───────────── Кеңесші (чат) ───────────── */
function ChatPage({ t, lang, userName, history, entry, onSelect, messages, setMessages, initialQuestion, onConsumed }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [photo, setPhoto] = useState(null); // { full, thumb }
  const [topic, setTopic] = useState("care");
  const [copied, setCopied] = useState(-1);
  const [tools, setTools] = useState(false);
  const [rated, setRated] = useState({});
  const [rec, setRec] = useState("idle"); // idle | recording | transcribing
  const [secs, setSecs] = useState(0);
  const recRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      recRef.current?.stream?.getTracks().forEach((tr) => tr.stop());
      clearInterval(timerRef.current);
    },
    []
  );

  async function startRec() {
    setErr("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setErr(t.voiceUnsupported);
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setErr(t.micDenied);
      return;
    }
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mr.onstop = async () => {
      stream.getTracks().forEach((tr) => tr.stop());
      clearInterval(timerRef.current);
      if (recRef.current?.cancelled) {
        setRec("idle");
        return;
      }
      setRec("transcribing");
      try {
        const audio = await blobToWavDataUrl(new Blob(chunks, { type: mr.mimeType || "audio/webm" }));
        const data = await postJSON("/api/transcribe", { audio, lang });
        const said = (data.text || "").trim();
        if (!said) setErr(t.noSpeech);
        else ask(said, true);
      } catch (e) {
        setErr(e.message);
      } finally {
        setRec("idle");
      }
    };
    recRef.current = { mr, stream, cancelled: false };
    mr.start();
    setSecs(0);
    setRec("recording");
    timerRef.current = setInterval(() => {
      setSecs((x) => {
        if (x + 1 >= 60) recRef.current?.mr.state === "recording" && recRef.current.mr.stop();
        return x + 1;
      });
    }, 1000);
  }
  function stopRec(cancel = false) {
    if (!recRef.current) return;
    recRef.current.cancelled = cancel;
    if (recRef.current.mr.state === "recording") recRef.current.mr.stop();
  }


  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  const dayIndex = Math.floor((dayStart() - dayStart(new Date(new Date().getFullYear(), 0, 1))) / DAY);
  const fact = t.facts[dayIndex % t.facts.length];

  useEffect(() => {
    if (messages.length || busy) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy]);

  useEffect(() => {
    setErr("");
  }, [entry?.key]);

  // Анықтамалықтан келген сұрақты бірден жібереміз
  useEffect(() => {
    if (initialQuestion) {
      onConsumed?.();
      ask(initialQuestion);
    }
  }, [initialQuestion]);

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type?.startsWith("image/")) return;
    try {
      const full = await compressImage(file, 1024, 0.82);
      setPhoto({ full, thumb: await thumbnail(full) });
      inputRef.current?.focus();
    } catch {}
  }

  async function send(list, image) {
    setBusy(true);
    setErr("");
    try {
      const data = await postJSON("/api/chat", {
        messages: list.map(({ role, text }) => ({ role, text })),
        image: image || null,
        diagnosis: entry?.result || null,
        diagnosisId: entry?.result?.id,
        lang,
      });
      setMessages([...list, { role: "assistant", text: data.reply }]);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function ask(q, voice = false) {
    const question = (q ?? text).trim() || (photo ? t.photoQuestion : "");
    if (!question || busy) return;
    const next = [...messages, { role: "user", text: question, thumb: photo?.thumb || null, voice }];
    const image = photo?.full || null;
    setMessages(next);
    setText("");
    setPhoto(null);
    send(next, image);
  }

  // Соңғы сұрақты қайта жіберу (қате болса немесе жаңа жауап керек болса)
  function retry() {
    const lastUser = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUser < 0 || busy) return;
    const list = messages.slice(0, lastUser + 1);
    setMessages(list);
    send(list, null);
  }

  async function copy(textToCopy, i) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(i);
      setTimeout(() => setCopied(-1), 1500);
    } catch {}
  }

  const current = t.topics.find((x) => x.id === topic) || t.topics[0];
  const lastIdx = messages.length - 1;
  const quick = entry ? t.chatSuggestPlant : t.topics.map((x) => x.qs[0]).slice(0, 4);

  async function share(textToShare) {
    try {
      if (navigator.share) await navigator.share({ title: "Tamyr", text: textToShare });
      else await navigator.clipboard.writeText(textToShare);
    } catch {}
  }

  const Orb = ({ size = "big" }) => (
    <span className={`orb orb-${size}`} aria-hidden="true">
      <span className="orb-core" />
      <span className="orb-shine" />
      <Icon name="sparkle" size={size === "big" ? 64 : 17} />
      {size === "big" && (
        <>
          <i className="spk s1" />
          <i className="spk s2" />
          <i className="spk s3" />
          <i className="spk s4" />
        </>
      )}
    </span>
  );

  return (
    <div className={`chat-page glass-chat ${messages.length === 0 && !busy ? "is-empty" : ""}`}>
      <header className="chat-head">
        <span className="ch-spacer" />
        <label className="ctx-pill">
          <span className="sr-only">{t.chatAbout}</span>
          <select value={entry?.key || ""} onChange={(e) => onSelect(e.target.value || null)}>
            <option value="">Tamyr · {t.chatGeneral}</option>
            {history.map((h) => (
              <option key={h.key} value={h.key}>
                {h.result?.plant_name || "—"} · {new Date(h.date).toLocaleDateString()}
              </option>
            ))}
          </select>
          <Icon name="chevron" size={16} />
        </label>
        <button
          className="round-btn"
          onClick={() => setMessages([])}
          disabled={busy || messages.length === 0}
          aria-label={t.aiNew}
          title={t.aiNew}
        >
          <Icon name="edit" size={19} />
        </button>
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
          <div className="ai-hero">
            <Orb />
            <h1 className="ai-greet">
              <span>{t.aiHi}{userName ? `, ${userName}` : ""},</span> {t.aiAsk}
            </h1>
            <p className="ai-sub">{t.chatEmpty}</p>
            <button className={`tools-chip ${tools ? "on" : ""}`} onClick={() => setTools((x) => !x)} aria-expanded={tools}>
              <Icon name="sparkle" size={17} /> {t.aiTools}
            </button>

            {!tools && (
              <div className="ai-quick">
                {quick.map((q) => (
                  <button key={q} className="aq" onClick={() => ask(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {tools && !entry && (
              <section className="topics glass-panel">
                <div className="topic-tabs" role="tablist">
                  {t.topics.map((x) => (
                    <button
                      key={x.id}
                      role="tab"
                      aria-selected={topic === x.id}
                      className={`topic-tab ${topic === x.id ? "on" : ""}`}
                      onClick={() => setTopic(x.id)}
                    >
                      <Icon name={x.icon} size={18} />
                      {x.title}
                    </button>
                  ))}
                </div>
                <div className="topic-qs" role="tabpanel">
                  {current.qs.map((q) => (
                    <button key={q} className="topic-q" onClick={() => ask(q)}>
                      <span>{q}</span>
                      <Icon name="arrow" size={16} />
                    </button>
                  ))}
                </div>
              </section>
            )}
            {tools && entry && (
              <div className="ai-quick">
                {t.chatSuggestPlant.map((q) => (
                  <button key={q} className="aq" onClick={() => ask(q)}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            <aside className="fact glass-panel">
              <span className="fact-icon">
                <Icon name="bulb" size={20} />
              </span>
              <div>
                <h3>{t.factTitle}</h3>
                <p>{fact}</p>
                <button className="fact-ask" onClick={() => ask(`${t.factAsk}: ${fact}`)}>
                  {t.factAsk} <Icon name="arrow" size={15} />
                </button>
              </div>
            </aside>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "assistant" ? (
            <div key={i} className="msg assistant">
              <Orb size="mini" />
              <div className="ai-body">
                <span className="ai-name">{t.aiName}</span>
                <div className="ai-text">
                  <RichText text={m.text} />
                </div>
                <div className="msg-tools">
                  <button onClick={() => copy(m.text, i)} aria-label={t.copy} title={copied === i ? t.copied : t.copy}>
                    <Icon name={copied === i ? "check" : "copy"} size={17} />
                  </button>
                  <button className={rated[i] === "up" ? "on" : ""} onClick={() => setRated((r) => ({ ...r, [i]: r[i] === "up" ? null : "up" }))} aria-label={t.good} title={t.good}>
                    <Icon name="thumbUp" size={17} />
                  </button>
                  <button className={rated[i] === "down" ? "on" : ""} onClick={() => setRated((r) => ({ ...r, [i]: r[i] === "down" ? null : "down" }))} aria-label={t.bad} title={t.bad}>
                    <Icon name="thumbDown" size={17} />
                  </button>
                  <button onClick={() => share(m.text)} aria-label={t.share} title={t.share}>
                    <Icon name="share" size={17} />
                  </button>
                  {i === lastIdx && (
                    <button onClick={retry} disabled={busy} aria-label={t.retry} title={t.retry}>
                      <Icon name="refresh" size={17} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div key={i} className="msg user">
              <div className="user-col">
                <div className="bubble">
                  {m.thumb && <img className="msg-photo" src={m.thumb} alt="" />}
                  {m.voice && <Icon name="mic" size={14} />} {m.text}
                </div>
                <div className="msg-tools end">
                  <button onClick={() => copy(m.text, i)} aria-label={t.copy} title={t.copy}>
                    <Icon name={copied === i ? "check" : "copy"} size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setText(m.text);
                      inputRef.current?.focus();
                    }}
                    aria-label={t.editQ}
                    title={t.editQ}
                  >
                    <Icon name="edit" size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        )}
        {busy && (
          <div className="msg assistant">
            <Orb size="mini" />
            <div className="ai-body">
              <span className="ai-name">{t.aiName}</span>
              <div className="typing">
                <span />
                <span />
                <span />
                <span className="sr-only">{t.thinking}</span>
              </div>
            </div>
          </div>
        )}
        {err && (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <span className="grow">{err}</span>
            <button className="btn ghost small" onClick={retry}>
              {t.retry}
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="composer glass-composer"
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
        <div className="gc-field">
          <button type="button" className="attach" onClick={() => fileRef.current?.click()} aria-label={t.attach} title={t.attach}>
            <Icon name="plusCircle" size={21} />
          </button>
          <div className="composer-body">
            {rec !== "idle" && (
              <div className={`rec-bar ${rec}`} role="status">
                {rec === "recording" ? (
                  <>
                    <span className="rec-dot" />
                    <span>
                      {t.listening} 0:{String(secs).padStart(2, "0")}
                    </span>
                    <button type="button" className="rec-cancel" onClick={() => stopRec(true)} aria-label={t.cancel}>
                      <Icon name="x" size={16} />
                    </button>
                  </>
                ) : (
                  <span>{t.transcribing}</span>
                )}
              </div>
            )}
            {photo && (
              <div className="attached">
                <img src={photo.thumb} alt="" />
                <button type="button" onClick={() => setPhoto(null)} aria-label={t.removePhoto}>
                  <Icon name="x" size={14} />
                </button>
              </div>
            )}
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
              placeholder={photo ? t.photoQuestion : t.chatPlaceholder}
              maxLength={1000}
              aria-label={t.chatPlaceholder}
            />
          </div>
          {rec === "recording" ? (
            <button type="button" className="mic-in rec" onClick={() => stopRec(false)} aria-label={t.voiceStop} title={t.voiceStop}>
              <Icon name="mic" size={20} />
            </button>
          ) : (
            <button
              type="button"
              className="mic-in"
              onClick={startRec}
              disabled={busy || rec !== "idle"}
              aria-label={t.voiceAsk}
              title={t.voiceAsk}
            >
              <Icon name="mic" size={20} />
            </button>
          )}
        </div>
        <button type="submit" className="send-orb" disabled={busy || (!text.trim() && !photo)} aria-label={t.send}>
          <Icon name="send" size={21} />
        </button>
      </form>

      <p className="composer-fine">{t.disclaimer}</p>
    </div>
  );
}

/* ───────────── Тарих ───────────── */
function RecentHistory({ t, history, onOpen, onClear }) {
  const [all, setAll] = useState(false);
  const list = all ? history : history.slice(0, 4);
  return (
    <section className="recent">
      <header className="recent-head">
        <h2>{t.recentTitle}</h2>
        <div className="recent-tools">
          {all && (
            <button className="btn ghost small" onClick={onClear}>
              {t.clear}
            </button>
          )}
          {history.length > 4 && (
            <button className="btn ghost small" onClick={() => setAll(!all)}>
              {all ? t.showLess : `${t.showAll} (${history.length})`}
            </button>
          )}
        </div>
      </header>
      <ul className="hist">
        {list.map((h) => {
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
    </section>
  );
}

/* ───────────── Туралы ───────────── */
function About({ t, embedded }) {
  const flow = (
    <ol className="flow">
      {t.about.map(([title, text]) => (
        <li key={title}>
          <h3>{title}</h3>
          <p>{text}</p>
        </li>
      ))}
    </ol>
  );
  if (embedded) return flow;
  return (
    <div className="page">
      <header className="page-head">
        <h1>{t.aboutTitle}</h1>
      </header>
      {flow}
    </div>
  );
}

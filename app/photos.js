// Өсімдік фотолары — Unsplash (тегін Unsplash License). Әрқайсысы көзбен тексерілген: түрі дұрыс, сапасы жоғары.
// Фото растений — Unsplash (бесплатная Unsplash License). Каждое проверено вручную.

const U = "https://images.unsplash.com/photo-";
const WIDTHS = [480, 800, 1200, 1800, 2600, 3840];

export function photoUrl(id, w = 1200, h) {
  return `${U}${id}?auto=format&fit=crop&q=80&w=${w}${h ? `&h=${h}` : ""}`;
}

// srcSet: 4K-ге дейін — браузер экранға сай өлшемді өзі таңдайды
export function photoSet(id, max = 3840) {
  return WIDTHS.filter((w) => w <= max)
    .map((w) => `${photoUrl(id, w)} ${w}w`)
    .join(", ");
}

// Түрлер бойынша (Энциклопедия, өсімдіктерім)
export const PLANT_PHOTOS = {
  monstera: "1776722091903-097d6dab0455",
  ficus: "1591656884447-8562e2373a66",
  aloe: "1569745358610-b01866003860",
  sansevieria: "1593482892290-f54927ae1bb6",
  spathiphyllum: "1593691509543-c55fb32d8de5",
  orchid: "1583846712268-a77d97b7fd68",
  zamioculcas: "1632207691143-643e2a9a9361",
  chlorophytum: "1572688484438-313a6e50c333",
  tomato: "1703365508981-cc87f60446cb",
  cucumber: "1725369865690-5a1a09f87e56",
  greigii: "1611276973481-9abf4c2c7784", // тұқымдас қызыл қызғалдақ
  sieversii: "1628486930972-c1db82d528da", // алма ағашы
};

// Латын атауы бойынша іздеу
const BY_LATIN = {
  "monstera deliciosa": "monstera",
  "ficus elastica": "ficus",
  "aloe vera": "aloe",
  "dracaena trifasciata": "sansevieria",
  "sansevieria trifasciata": "sansevieria",
  "spathiphyllum wallisii": "spathiphyllum",
  phalaenopsis: "orchid",
  "zamioculcas zamiifolia": "zamioculcas",
  "chlorophytum comosum": "chlorophytum",
  "solanum lycopersicum": "tomato",
  "cucumis sativus": "cucumber",
};
export function photoForLatin(latin) {
  const key = BY_LATIN[(latin || "").toLowerCase().trim()];
  return key ? PLANT_PHOTOS[key] : null;
}

// Сайт безендіруі
export const SCENES = {
  dew: "1614440083687-6233d9740772", // су тамшылы жапырақ
  monsteraDark: "1776722091903-097d6dab0455",
  monsteraDrops: "1759351483159-0cce0181da00",
  hands: "1542601906990-b4d3fb778b09", // қолдағы көшет
  greenhouse: "1569736957322-b5e515f249b0",
  tomato: "1703365508981-cc87f60446cb",
  orchid: "1617395001674-7d0a29a72946",
  apple: "1646598446598-a56acb9800fb", // алма гүлі
  steppe: "1752419258049-4b06ee325144", // Қазақстан даласы
};

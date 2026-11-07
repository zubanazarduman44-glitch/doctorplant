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
  // Қосымша түрлер (браузерде көзбен тексерілді)
  epipremnum: "1596724878582-76f1a8fdc24f",
  crassula: "1616189597001-9046fce2594d",
  dracaena: "1771654249968-cad93a1641e8",
  calathea: "1597306200021-f8e16b12fb45",
  pelargonium: "1709756748106-8483d9d7b609",
  saintpaulia: "1595609169861-8eedf5d26662",
  schlumbergera: "1769005342528-f4df9912038e",
  nephrolepis: "1610491536492-cee9f12c860f",
  kalanchoe: "1713028674793-bb667e09dc33",
  potato: "1593708697557-f2feca483132",
  pepper: "1604488943825-f95dc6796ca5",
  carrot: "1638402268441-9368026c1d45",
  onion: "1618512496248-a07fe83aa8cb",
  cabbage: "1680561218941-a14f10300c42",
  watermelon: "1735456686652-59414cf6fd8e",
  wheat: "1529511582893-2d7e684dd128",
  apple: "1722677094375-83ba3ffd1bd3",
  apricot: "1597663034228-e3efadddf134",
  grape: "1537640538966-79f369143f8f",
  strawberry: "1519180392711-496e450edf6a",
  raspberry: "1577069861033-55d04cec4ef5",
  cherry: "1621763668206-b9a47fc8727a",
  rose: "1783361768452-3c12fb1f40fd",
  peony: "1575178094668-132dc931ad35",
  petunia: "1558502187-d883ac019745",
  sunflower: "1627891374362-c6ca6c675cb3",
  lilac: "1621021096756-1fb74a35253d",
  picea: "1667391563437-03c7f930b171",
  stipa: "1685491455970-fcf003cba14d",
  artemisia: "1789930271725-c59e7622acd5",
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
  "epipremnum aureum": "epipremnum",
  "crassula ovata": "crassula",
  "dracaena marginata": "dracaena",
  "saintpaulia ionantha": "saintpaulia",
  "kalanchoe blossfeldiana": "kalanchoe",
  "solanum tuberosum": "potato",
  "capsicum annuum": "pepper",
  "allium cepa": "onion",
  "citrullus lanatus": "watermelon",
  "malus domestica": "apple",
  "prunus armeniaca": "apricot",
  "vitis vinifera": "grape",
  "rubus idaeus": "raspberry",
  "prunus cerasus": "cherry",
  "helianthus annuus": "sunflower",
  "syringa vulgaris": "lilac",
  "paeonia lactiflora": "peony",
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
  bgLight: "1759351483159-0cce0181da00", // ашық жасыл монстера, су тамшылары
  bgDark: "1776722091903-097d6dab0455", // қою жасыл монстера
};

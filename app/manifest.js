// Телефонға қолданба ретінде орнату (PWA)
export default function manifest() {
  return {
    name: "Tamyr — өсімдік дәрігері",
    short_name: "Tamyr",
    description: "Өсімдікті суретке түсіріңіз — ЖИ түрін, ауруын анықтап, күтім бойынша кеңес береді.",
    start_url: "/",
    display: "standalone",
    background_color: "#ecf7ef",
    theme_color: "#15803d",
    lang: "kk",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

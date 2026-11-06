import "./globals.css";

export const metadata = {
  title: "Өсімдік дәрігері — диагноз по фото",
  description:
    "Сфотографируйте растение — ИИ определит вид, состояние, болезнь и даст советы по уходу. Қазақша және орысша.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1610" },
    { media: "(prefers-color-scheme: light)", color: "#eef3ec" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="kk" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Raleway:wght@400;500;600;700&display=swap&subset=cyrillic,cyrillic-ext"
          rel="stylesheet"
        />
        {/* Тақырыпты бет жүктелмей тұрып қоямыз — жыпылықтамауы үшін */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('osimdik_theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

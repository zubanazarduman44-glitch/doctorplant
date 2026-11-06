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
    { media: "(prefers-color-scheme: dark)", color: "#121a16" },
    { media: "(prefers-color-scheme: light)", color: "#f3f6f2" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="kk" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap"
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

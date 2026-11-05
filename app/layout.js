import "./globals.css";

export const metadata = {
  title: "Өсімдік дәрігері — диагноз по фото",
  description:
    "Сфотографируйте растение — ИИ определит вид, состояние, болезнь и даст советы по уходу. Қазақша және орысша.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="kk">
      <body>{children}</body>
    </html>
  );
}

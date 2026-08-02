import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pixraise.com"),
  title: {
    template: "%s | PixRaise",
    default: "PixRaise — La marketplace créative algérienne",
  },
  description:
    "PixRaise est la marketplace créative algérienne : trouvez des freelances talentueux, commandez des services graphiques, vidéo, rédaction, et achetez des produits digitaux en toute confiance.",
  openGraph: {
    title: "PixRaise — La marketplace créative algérienne",
    description:
      "Trouvez des freelances talentueux et achetez des produits digitaux en Algérie.",
    url: "https://pixraise.com",
    siteName: "PixRaise",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PixRaise — La marketplace créative algérienne",
    description:
      "Trouvez des freelances talentueux et achetez des produits digitaux en Algérie.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}else if(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--white)] text-[var(--ink)] dark:bg-[var(--color-bg)] dark:text-[var(--ink)] transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}

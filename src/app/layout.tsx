import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import Script from "next/script";
import CustomCursor from "@/components/Common/CustomCursor";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Sai Events | Premium Event Management Platform",
  description: "Plan, book, and coordinate your perfect photography, catering, lighting, and decoration setups in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var localTheme = localStorage.getItem('theme');
                var isDark = false;
                if (localTheme) {
                  isDark = localTheme === 'dark';
                } else {
                  // Automatic theme based on IST timing (UTC + 5.30)
                  var utc = new Date().getTime();
                  var ist = new Date(utc + (5.5 * 60 * 60 * 1000));
                  var istHour = ist.getUTCHours();
                  var istMin = ist.getUTCMinutes();
                  var istTotalMin = (istHour * 60) + istMin;
                  
                  // 6:00 AM (360 min) to 6:00 PM (1080 min) is light
                  if (istTotalMin >= 360 && istTotalMin <= 1080) {
                    isDark = false;
                  } else {
                    isDark = true;
                  }
                }
                
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground selection:bg-[#D4AF37] selection:text-black">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}

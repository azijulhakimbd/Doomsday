import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doomsday Ready — MCU Rewatch Planner & Opening Night Watch Party',
  description: 'Plan your Marvel Cinematic Universe rewatch before Avengers: Doomsday and book opening-night bundle seats.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-doom-dark text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        {/* Subtle background cosmic radial glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-emerald-950/20 blur-[130px]" />
          <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-950/15 blur-[140px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-sky-950/15 blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.15]" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

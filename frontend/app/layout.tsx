// frontend/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { NavBar } from "../components/NavBar";
import { Providers } from "./providers";

export const metadata = {
  title:       "On-Chain Guard",
  description: "Interactive Web3 ✕ ML anomaly dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

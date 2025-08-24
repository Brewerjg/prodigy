import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../app/utils/providers";
import { TenantProvider } from "./hooks/useTenant.js";
import AuthGuard from "./components/auth/AuthGuard.jsx";
import Navbar from "../app/components/Navbar";
import TicketTicker from './components/TicketTicker';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ConnectWise Dashboard",
  description: "Dashboard for tracking ConnectWise Manage items",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <TenantProvider>
            <AuthGuard>
              <div className="min-h-screen bg-gray-100">
                <Navbar />
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <div className="flex">
                    {/* Main content area */}
                    <div className="flex-1 mr-80">
                      {children}
                    </div>
                    
                    {/* Sidebar with ticket ticker */}
                    <TicketTicker />
                  </div>
                </main>
              </div>
            </AuthGuard>
          </TenantProvider>
        </Providers>
      </body>
    </html>
  );
}

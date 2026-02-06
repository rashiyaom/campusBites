import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudentAuthProvider } from "@/contexts/StudentAuthContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { CafeteriaProvider } from "@/contexts/CafeteriaContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationPopup from "@/components/ui/NotificationPopup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusBite - Premium Campus Food Delivery Service",
  description: "Experience fast, premium food delivery across campus. Order from top cafeterias and restaurants, delivered fresh to your location in minutes. Available 24/7 for students.",
  keywords: "campus food delivery, student food service, university dining, fast delivery, premium meals, campus cafeteria",
  authors: [{ name: "CampusBite Team" }],
  openGraph: {
    title: "CampusBite - Premium Campus Food Delivery",
    description: "Fast, fresh, premium food delivered across campus",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <StudentAuthProvider>
            <CafeteriaProvider>
              <MenuProvider>
                <CartProvider>
                  <OrderProvider>
                    <InventoryProvider>
                      <AnalyticsProvider>
                        <NotificationProvider>
                          {children}
                          <NotificationPopup />
                        </NotificationProvider>
                      </AnalyticsProvider>
                    </InventoryProvider>
                  </OrderProvider>
                </CartProvider>
              </MenuProvider>
            </CafeteriaProvider>
          </StudentAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

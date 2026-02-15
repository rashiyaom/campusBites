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
// Multi-business support
import { BusinessProvider } from "@/contexts/BusinessContext";
import { ProductProvider } from "@/contexts/ProductContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusBite - Campus Commerce Platform",
  description: "Your one-stop campus platform for Food, Groceries, Stationery, and Daily Essentials. Order from top vendors, delivered fresh to your location in minutes.",
  keywords: "campus food delivery, student food service, university dining, groceries, stationery, daily essentials, campus shopping",
  authors: [{ name: "CampusBite Team" }],
  openGraph: {
    title: "CampusBite - Campus Commerce Platform",
    description: "Food, Groceries, Stationery & Essentials - All in one place",
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
            <BusinessProvider>
              <CafeteriaProvider>
                <ProductProvider>
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
                </ProductProvider>
              </CafeteriaProvider>
            </BusinessProvider>
          </StudentAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

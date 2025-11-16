import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales } from "@/i18n/config"
import "../globals.css"
import { Navbar } from "@/components/navigation/Navbar"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { ToastContainer } from "react-toastify"
import { CalendarBackgroundProcess } from "@/features/calendar/components/CalendarBackgroundProcess"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Jump",
  description: "Jump Description",
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <Navbar locale={locale} />
            <CalendarBackgroundProcess locale={locale} />
            {children}
            <ToastContainer position="bottom-right" />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

import { Inter } from 'next/font/google'
import Providers from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Quiz Management App',
  description: 'Create, manage, and analyze quizzes with real-time proctoring',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

'use client';

import Head from 'next/head';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/utils/theme';
import './globals.css';
import Layout from '@/components/Layout';
import { Web3Provider } from '@/hooks/useWeb3';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <title>Chef Stack</title>
        <meta name="description" content="stake and withdraw" />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <body id="__next" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Web3Provider>
          <ThemeProvider theme={theme}>
            <StyledEngineProvider injectFirst>
              <CssBaseline />

              <Layout>{children}</Layout>
            </StyledEngineProvider>
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  );
}

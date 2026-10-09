import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { NavigationLoading } from "@/components/layout/navigation-loading";
import { EmbeddedCadastroBridge } from "@/components/forms/embedded-cadastro-bridge";

import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export const metadata: Metadata = {
	metadataBase: new URL(defaultUrl),
	title: "Barber Chaplin",
	description: "Bem-vindo à Barber Chaplin!",
	openGraph: {
		title: "Barber Chaplin",
		description: "Bem-vindo à Barber Chaplin!",
		images: ["/opengraph-image.png"],
	},
};

const geistSans = Geist({
	variable: "--font-geist-sans",
	display: "swap",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
			<body className={`${geistSans.className} min-h-screen bg-white text-neutral-900 antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					forcedTheme="light"
					enableSystem={false}
					disableTransitionOnChange
				>
					<NavigationLoading />
					<Suspense fallback={null}><EmbeddedCadastroBridge /></Suspense>
					{children}
					<Toaster richColors position="top-right" closeButton />
				</ThemeProvider>
			</body>
		</html>
	);
}

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { NavigationLoading } from "@/components/layout/navigation-loading";

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
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.className} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<NavigationLoading />
					{children}
					<Toaster richColors position="top-right" closeButton />
				</ThemeProvider>
			</body>
		</html>
	);
}

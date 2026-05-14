import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
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
		images: [
			"https://lbiuoahiddvhryxtqdgy.supabase.co/storage/v1/object/public/Arquivos/346373102_1690131428116152_3489076833452730986_n.jpg",
		],
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
					{children}
					<Toaster richColors position="top-right" closeButton />
				</ThemeProvider>
			</body>
		</html>
	);
}

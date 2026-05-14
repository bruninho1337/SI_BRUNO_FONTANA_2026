"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type FormFeedbackProps = {
	params?: {
		success?: string;
		error?: string;
	};
};

export function FormFeedback({ params }: FormFeedbackProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (!params?.success && !params?.error) {
			return;
		}

		if (params.success) {
			toast.success(params.success);
		}

		if (params.error) {
			toast.error(params.error);
		}

		const nextParams = new URLSearchParams(searchParams.toString());
		nextParams.delete("success");
		nextParams.delete("error");

		const nextUrl = nextParams.toString()
			? `${pathname}?${nextParams.toString()}`
			: pathname;

		router.replace(nextUrl, { scroll: false });
	}, [params?.success, params?.error, pathname, router, searchParams]);

	return null;
}

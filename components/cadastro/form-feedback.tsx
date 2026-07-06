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

		const feedbackKey = `${pathname}:${searchParams.toString()}`;

		if (params.success) {
			toast.success(params.success, { id: feedbackKey });
		}

		if (params.error) {
			toast.error(params.error, { id: feedbackKey });
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

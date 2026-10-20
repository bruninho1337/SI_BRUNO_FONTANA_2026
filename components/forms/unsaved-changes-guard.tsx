"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { installUnsavedNavigationGuard, trackUnsavedForm } from "@/lib/forms/unsaved-changes";

export function UnsavedFormGuard({ identity }: { identity?: string }) {
	const marker = useRef<HTMLSpanElement>(null);
	const tracker = useRef<ReturnType<typeof trackUnsavedForm> | null>(null);
	const { pending } = useFormStatus();
	useLayoutEffect(() => {
		const form = marker.current?.closest("form");
		if (!form) return;
		tracker.current = trackUnsavedForm(form);
		return () => { tracker.current?.dispose(); tracker.current = null; };
	}, [identity]);
	useLayoutEffect(() => { tracker.current?.setPending(pending); }, [pending, identity]);
	return <span ref={marker} hidden />;
}

export function UnsavedNavigationGuard() {
	useEffect(() => installUnsavedNavigationGuard(), []);
	return null;
}

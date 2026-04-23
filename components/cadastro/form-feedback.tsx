type FormFeedbackProps = {
	params?: {
		success?: string;
		error?: string;
	};
};

export function FormFeedback({ params }: FormFeedbackProps) {
	return (
		<>
			{params?.success ? (
				<div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
					{params.success}
				</div>
			) : null}

			{params?.error ? (
				<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{params.error}
				</div>
			) : null}
		</>
	);
}

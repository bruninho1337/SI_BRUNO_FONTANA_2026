"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function sanitizeFileName(fileName: string) {
	return fileName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9.-]/g, "-")
		.replace(/-+/g, "-")
		.toLowerCase();
}

type StorageImageUploadProps = {
	name: string;
	label: string;
	folder: "produtos" | "servicos";
};

export function StorageImageUpload({
	name,
	label,
	folder,
}: StorageImageUploadProps) {
	const inputId = useId();
	const bucketName =
		process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "cadastros";
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [imageUrl, setImageUrl] = useState("");

	const previewUrl = useMemo(() => imageUrl || "", [imageUrl]);

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		setUploading(true);
		setError(null);

		try {
			const supabase = createClient();
			const safeName = sanitizeFileName(file.name);
			const filePath = `${folder}/${Date.now()}-${safeName}`;

			const { error: uploadError } = await supabase.storage
				.from(bucketName)
				.upload(filePath, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type || undefined,
				});

			if (uploadError) {
				throw uploadError;
			}

			const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
			setImageUrl(data.publicUrl);
		} catch (uploadError) {
			const message =
				uploadError instanceof Error
					? uploadError.message
					: "Nao foi possivel enviar a imagem.";
			setError(message);
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={inputId} className="text-sm text-neutral-800">
				{label}:
			</Label>
			<input type="hidden" name={name} value={imageUrl} readOnly />
			<label
				htmlFor={inputId}
				className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600 transition hover:bg-neutral-100"
			>
				{uploading
					? "Enviando imagem..."
					: imageUrl
						? "Imagem enviada. Clique para trocar."
						: "Clique para selecionar uma imagem do computador"}
			</label>
			<input
				id={inputId}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
			/>
			{previewUrl ? (
				<div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
					<Image
						src={previewUrl}
						alt="Preview da imagem enviada"
						width={800}
						height={320}
						className="h-40 w-full object-cover"
					/>
				</div>
			) : null}
			{error ? <p className="text-sm text-red-600">{error}</p> : null}
			{imageUrl ? (
				<p className="break-all text-xs text-neutral-500">{imageUrl}</p>
			) : (
				<p className="text-xs text-neutral-500">
					O upload usa o bucket `{bucketName}` no Supabase Storage.
				</p>
			)}
		</div>
	);
}

"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

import { Label } from "@/components/ui/label";

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
	const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "cadastros";
	const [error, setError] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");

	useEffect(() => {
		if (!selectedFile) {
			setPreviewUrl("");
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreviewUrl(objectUrl);

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [selectedFile]);

	async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];

		if (!file) {
			setSelectedFile(null);
			setError(null);
			return;
		}

		if (!file.type.startsWith("image/")) {
			setSelectedFile(null);
			setError("Selecione um arquivo de imagem válido.");
			event.target.value = "";
			return;
		}

		setSelectedFile(file);
		setError(null);
	}

	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={inputId} className="text-sm text-neutral-800">
				{label}:
			</Label>
			<label
				htmlFor={inputId}
				className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600 transition hover:bg-neutral-100"
			>
				{selectedFile
					? "Imagem pronta para envio. Clique para trocar."
					: "Clique para selecionar uma imagem do computador"}
			</label>
			<input
				id={inputId}
				type="file"
				name={name}
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
			<p className="text-xs text-neutral-500">
				A imagem sera enviada para o bucket `{bucketName}` apenas ao salvar o {folder === "produtos" ? "produto" : "serviço"}.
			</p>
		</div>
	);
}

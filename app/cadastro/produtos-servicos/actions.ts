"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function buildRedirect(path: string, type: "success" | "error", message: string) {
	const params = new URLSearchParams({
		[type]: message,
	});

	return `${path}?${params.toString()}`;
}

function parseDecimal(value: FormDataEntryValue | null) {
	const normalized = String(value ?? "")
		.trim()
		.replace(/\./g, "")
		.replace(",", ".");

	if (!normalized) {
		return 0;
	}

	return Number(normalized);
}

function sanitizeFileName(fileName: string) {
	return fileName
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-zA-Z0-9.-]/g, "-")
		.replace(/-+/g, "-")
		.toLowerCase();
}

async function uploadImageIfPresent(file: File | null, folder: "produtos" | "servicos") {
	if (!file || file.size === 0) {
		return null;
	}

	if (!file.type.startsWith("image/")) {
		throw new Error("Selecione um arquivo de imagem válido.");
	}

	const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "cadastros";
	const supabase = createAdminClient();
	const safeName = sanitizeFileName(file.name);
	const filePath = `${folder}/${Date.now()}-${safeName}`;
	const fileBuffer = Buffer.from(await file.arrayBuffer());

	const { error } = await supabase.storage.from(bucketName).upload(filePath, fileBuffer, {
		cacheControl: "3600",
		upsert: false,
		contentType: file.type || undefined,
	});

	if (error) {
		throw new Error(error.message);
	}

	const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);

	return {
		path: filePath,
		publicUrl: data.publicUrl,
		bucketName,
	};
}

export async function createProdutoAction(formData: FormData) {
	const nome = String(formData.get("nome") ?? "").trim();
	const codcategoriaValue = String(formData.get("codcategoria") ?? "").trim();
	const valor = parseDecimal(formData.get("valor"));
	const quantidadeEstoque = Number(String(formData.get("quantidade_estoque") ?? "").trim() || "0");
	const valorDesconto = parseDecimal(formData.get("valor_desconto"));
	const descricao = String(formData.get("descricao") ?? "").trim();
	const imagemArquivo = formData.get("imagem_arquivo");
	const ativo = String(formData.get("ativo") ?? "S").trim().toUpperCase() || "S";

	if (!nome) {
		redirect(buildRedirect("/cadastro/produtos-servicos/produtos", "error", "Informe o nome do produto."));
	}

	if (Number.isNaN(valor) || valor < 0) {
		redirect(buildRedirect("/cadastro/produtos-servicos/produtos", "error", "Informe um valor valido para o produto."));
	}

	if (Number.isNaN(quantidadeEstoque) || quantidadeEstoque < 0) {
		redirect(buildRedirect("/cadastro/produtos-servicos/produtos", "error", "Informe uma quantidade em estoque valida."));
	}

	if (Number.isNaN(valorDesconto) || valorDesconto < 0 || valorDesconto > valor) {
		redirect(buildRedirect("/cadastro/produtos-servicos/produtos", "error", "O desconto do produto precisa estar entre 0 e o valor informado."));
	}

	const supabase = await createClient();
	let uploadedImage: Awaited<ReturnType<typeof uploadImageIfPresent>> = null;

	try {
		uploadedImage = await uploadImageIfPresent(
			imagemArquivo instanceof File ? imagemArquivo : null,
			"produtos"
		);

	const { error } = await supabase.from("produtos").insert({
		nome,
		codcategoria: codcategoriaValue ? Number(codcategoriaValue) : null,
		valor,
		quantidade_estoque: quantidadeEstoque,
		valor_desconto: valorDesconto,
		descricao: descricao || null,
		imagem_url: uploadedImage?.publicUrl ?? null,
		ativo,
	});

		if (error) {
			if (uploadedImage) {
				const adminClient = createAdminClient();
				await adminClient.storage.from(uploadedImage.bucketName).remove([uploadedImage.path]);
			}

			redirect(buildRedirect("/cadastro/produtos-servicos/produtos", "error", error.message));
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Nao foi possivel salvar o produto.";
		redirect(buildRedirect("/cadastro/produtos-servicos/produtos", "error", message));
	}

	revalidatePath("/cadastro/produtos-servicos/produtos");
	redirect(buildRedirect("/cadastro/produtos-servicos/produtos", "success", "Produto salvo com sucesso."));
}

export async function createServicoAction(formData: FormData) {
	const nome = String(formData.get("nome") ?? "").trim();
	const codcategoriaValue = String(formData.get("codcategoria") ?? "").trim();
	const duracaoMinutos = Number(String(formData.get("duracao_minutos") ?? "").trim() || "0");
	const valor = parseDecimal(formData.get("valor"));
	const valorDesconto = parseDecimal(formData.get("valor_desconto"));
	const descricao = String(formData.get("descricao") ?? "").trim();
	const imagemArquivo = formData.get("imagem_arquivo");
	const ativo = String(formData.get("ativo") ?? "S").trim().toUpperCase() || "S";

	if (!nome) {
		redirect(buildRedirect("/cadastro/produtos-servicos/servicos", "error", "Informe o nome do servico."));
	}

	if (Number.isNaN(duracaoMinutos) || duracaoMinutos <= 0) {
		redirect(buildRedirect("/cadastro/produtos-servicos/servicos", "error", "Informe uma duracao valida em minutos."));
	}

	if (Number.isNaN(valor) || valor < 0) {
		redirect(buildRedirect("/cadastro/produtos-servicos/servicos", "error", "Informe um valor valido para o servico."));
	}

	if (Number.isNaN(valorDesconto) || valorDesconto < 0 || valorDesconto > valor) {
		redirect(buildRedirect("/cadastro/produtos-servicos/servicos", "error", "O desconto do servico precisa estar entre 0 e o valor informado."));
	}

	const supabase = await createClient();
	let uploadedImage: Awaited<ReturnType<typeof uploadImageIfPresent>> = null;

	try {
		uploadedImage = await uploadImageIfPresent(
			imagemArquivo instanceof File ? imagemArquivo : null,
			"servicos"
		);

	const { error } = await supabase.from("servicos").insert({
		nome,
		codcategoria: codcategoriaValue ? Number(codcategoriaValue) : null,
		duracao_minutos: duracaoMinutos,
		valor,
		valor_desconto: valorDesconto,
		descricao: descricao || null,
		imagem_url: uploadedImage?.publicUrl ?? null,
		ativo,
	});

		if (error) {
			if (uploadedImage) {
				const adminClient = createAdminClient();
				await adminClient.storage.from(uploadedImage.bucketName).remove([uploadedImage.path]);
			}

			redirect(buildRedirect("/cadastro/produtos-servicos/servicos", "error", error.message));
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Nao foi possivel salvar o servico.";
		redirect(buildRedirect("/cadastro/produtos-servicos/servicos", "error", message));
	}

	revalidatePath("/cadastro/produtos-servicos/servicos");
	redirect(buildRedirect("/cadastro/produtos-servicos/servicos", "success", "Servico salvo com sucesso."));
}

export async function createCategoriaAction(formData: FormData) {
	const nome = String(formData.get("nome") ?? "").trim();
	const descricao = String(formData.get("descricao") ?? "").trim();
	const tipo = String(formData.get("tipo") ?? "AMBOS").trim().toUpperCase() || "AMBOS";
	const ativo = String(formData.get("ativo") ?? "S").trim().toUpperCase() || "S";

	if (!nome) {
		redirect(buildRedirect("/cadastro/produtos-servicos/categorias", "error", "Informe o nome da categoria."));
	}

	if (!["PRODUTO", "SERVICO", "AMBOS"].includes(tipo)) {
		redirect(buildRedirect("/cadastro/produtos-servicos/categorias", "error", "Selecione um tipo valido para a categoria."));
	}

	const supabase = await createClient();
	const { error } = await supabase.from("categorias").insert({
		nome,
		descricao: descricao || null,
		tipo,
		ativo,
	});

	if (error) {
		redirect(buildRedirect("/cadastro/produtos-servicos/categorias", "error", error.message));
	}

	revalidatePath("/cadastro/produtos-servicos/categorias");
	revalidatePath("/cadastro/produtos-servicos/produtos");
	revalidatePath("/cadastro/produtos-servicos/servicos");
	redirect(buildRedirect("/cadastro/produtos-servicos/categorias", "success", "Categoria salva com sucesso."));
}

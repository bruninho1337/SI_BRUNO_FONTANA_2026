"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PRODUTOS_PATH = "/cadastro/produtos-servicos/produtos";
const SERVICOS_PATH = "/cadastro/produtos-servicos/servicos";
const CATEGORIAS_PATH = "/cadastro/produtos-servicos/categorias";

function buildRedirect(path: string, type: "success" | "error", message: string) {
	const params = new URLSearchParams({
		[type]: message,
	});

	return `${path}?${params.toString()}`;
}

function getText(formData: FormData, name: string) {
	return String(formData.get(name) ?? "").trim();
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
		throw new Error("Selecione um arquivo de imagem valido.");
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
	return saveProduto(formData);
}

export async function updateProdutoAction(formData: FormData) {
	const codproduto = Number(getText(formData, "codproduto"));

	if (Number.isNaN(codproduto)) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", "Produto invalido para edicao."));
	}

	return saveProduto(formData, codproduto);
}

export async function deleteProdutoAction(formData: FormData) {
	const codproduto = Number(getText(formData, "codproduto"));

	if (Number.isNaN(codproduto)) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", "Produto invalido para exclusao."));
	}

	const supabase = await createClient();
	const { error } = await supabase.from("produtos").delete().eq("codproduto", codproduto);

	if (error) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", error.message));
	}

	revalidatePath(PRODUTOS_PATH);
	redirect(buildRedirect(PRODUTOS_PATH, "success", "Produto excluido com sucesso."));
}

async function saveProduto(formData: FormData, codproduto?: number) {
	const nome = getText(formData, "nome");
	const codcategoriaValue = getText(formData, "codcategoria");
	const valor = parseDecimal(formData.get("valor"));
	const quantidadeEstoque = Number(getText(formData, "quantidade_estoque") || "0");
	const valorDesconto = parseDecimal(formData.get("valor_desconto"));
	const descricao = getText(formData, "descricao");
	const imagemArquivo = formData.get("imagem_arquivo");
	const imagemAtual = getText(formData, "imagem_url");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!nome) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", "Informe o nome do produto."));
	}

	if (Number.isNaN(valor) || valor < 0) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", "Informe um valor valido para o produto."));
	}

	if (Number.isNaN(quantidadeEstoque) || quantidadeEstoque < 0) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", "Informe uma quantidade em estoque valida."));
	}

	if (Number.isNaN(valorDesconto) || valorDesconto < 0 || valorDesconto > valor) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", "O desconto do produto precisa estar entre 0 e o valor informado."));
	}

	const supabase = await createClient();
	let uploadedImage: Awaited<ReturnType<typeof uploadImageIfPresent>> = null;

	try {
		uploadedImage = await uploadImageIfPresent(
			imagemArquivo instanceof File ? imagemArquivo : null,
			"produtos"
		);

		const payload = {
			nome,
			codcategoria: codcategoriaValue ? Number(codcategoriaValue) : null,
			valor,
			quantidade_estoque: quantidadeEstoque,
			valor_desconto: valorDesconto,
			descricao: descricao || null,
			imagem_url: uploadedImage?.publicUrl ?? (imagemAtual || null),
			ativo,
		};
		const { error } = codproduto
			? await supabase.from("produtos").update(payload).eq("codproduto", codproduto)
			: await supabase.from("produtos").insert(payload);

		if (error) {
			if (uploadedImage) {
				const adminClient = createAdminClient();
				await adminClient.storage.from(uploadedImage.bucketName).remove([uploadedImage.path]);
			}

			redirect(buildRedirect(PRODUTOS_PATH, "error", error.message));
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Nao foi possivel salvar o produto.";
		redirect(buildRedirect(PRODUTOS_PATH, "error", message));
	}

	revalidatePath(PRODUTOS_PATH);
	redirect(buildRedirect(PRODUTOS_PATH, "success", codproduto ? "Produto atualizado com sucesso." : "Produto salvo com sucesso."));
}

export async function createServicoAction(formData: FormData) {
	return saveServico(formData);
}

export async function updateServicoAction(formData: FormData) {
	const codservico = Number(getText(formData, "codservico"));

	if (Number.isNaN(codservico)) {
		redirect(buildRedirect(SERVICOS_PATH, "error", "Servico invalido para edicao."));
	}

	return saveServico(formData, codservico);
}

export async function deleteServicoAction(formData: FormData) {
	const codservico = Number(getText(formData, "codservico"));

	if (Number.isNaN(codservico)) {
		redirect(buildRedirect(SERVICOS_PATH, "error", "Servico invalido para exclusao."));
	}

	const supabase = await createClient();
	const { error } = await supabase.from("servicos").delete().eq("codservico", codservico);

	if (error) {
		redirect(buildRedirect(SERVICOS_PATH, "error", error.message));
	}

	revalidatePath(SERVICOS_PATH);
	redirect(buildRedirect(SERVICOS_PATH, "success", "Servico excluido com sucesso."));
}

async function saveServico(formData: FormData, codservico?: number) {
	const nome = getText(formData, "nome");
	const codcategoriaValue = getText(formData, "codcategoria");
	const duracaoMinutos = Number(getText(formData, "duracao_minutos") || "0");
	const valor = parseDecimal(formData.get("valor"));
	const valorDesconto = parseDecimal(formData.get("valor_desconto"));
	const descricao = getText(formData, "descricao");
	const imagemArquivo = formData.get("imagem_arquivo");
	const imagemAtual = getText(formData, "imagem_url");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!nome) {
		redirect(buildRedirect(SERVICOS_PATH, "error", "Informe o nome do servico."));
	}

	if (Number.isNaN(duracaoMinutos) || duracaoMinutos <= 0) {
		redirect(buildRedirect(SERVICOS_PATH, "error", "Informe uma duracao valida em minutos."));
	}

	if (Number.isNaN(valor) || valor < 0) {
		redirect(buildRedirect(SERVICOS_PATH, "error", "Informe um valor valido para o servico."));
	}

	if (Number.isNaN(valorDesconto) || valorDesconto < 0 || valorDesconto > valor) {
		redirect(buildRedirect(SERVICOS_PATH, "error", "O desconto do servico precisa estar entre 0 e o valor informado."));
	}

	const supabase = await createClient();
	let uploadedImage: Awaited<ReturnType<typeof uploadImageIfPresent>> = null;

	try {
		uploadedImage = await uploadImageIfPresent(
			imagemArquivo instanceof File ? imagemArquivo : null,
			"servicos"
		);

		const payload = {
			nome,
			codcategoria: codcategoriaValue ? Number(codcategoriaValue) : null,
			duracao_minutos: duracaoMinutos,
			valor,
			valor_desconto: valorDesconto,
			descricao: descricao || null,
			imagem_url: uploadedImage?.publicUrl ?? (imagemAtual || null),
			ativo,
		};
		const { error } = codservico
			? await supabase.from("servicos").update(payload).eq("codservico", codservico)
			: await supabase.from("servicos").insert(payload);

		if (error) {
			if (uploadedImage) {
				const adminClient = createAdminClient();
				await adminClient.storage.from(uploadedImage.bucketName).remove([uploadedImage.path]);
			}

			redirect(buildRedirect(SERVICOS_PATH, "error", error.message));
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Nao foi possivel salvar o servico.";
		redirect(buildRedirect(SERVICOS_PATH, "error", message));
	}

	revalidatePath(SERVICOS_PATH);
	redirect(buildRedirect(SERVICOS_PATH, "success", codservico ? "Servico atualizado com sucesso." : "Servico salvo com sucesso."));
}

export async function createCategoriaAction(formData: FormData) {
	return saveCategoria(formData);
}

export async function updateCategoriaAction(formData: FormData) {
	const codcategoria = Number(getText(formData, "codcategoria"));

	if (Number.isNaN(codcategoria)) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", "Categoria invalida para edicao."));
	}

	return saveCategoria(formData, codcategoria);
}

export async function deleteCategoriaAction(formData: FormData) {
	const codcategoria = Number(getText(formData, "codcategoria"));

	if (Number.isNaN(codcategoria)) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", "Categoria invalida para exclusao."));
	}

	const supabase = await createClient();
	const { error } = await supabase.from("categorias").delete().eq("codcategoria", codcategoria);

	if (error) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", error.message));
	}

	revalidatePath(CATEGORIAS_PATH);
	revalidatePath(PRODUTOS_PATH);
	revalidatePath(SERVICOS_PATH);
	redirect(buildRedirect(CATEGORIAS_PATH, "success", "Categoria excluida com sucesso."));
}

async function saveCategoria(formData: FormData, codcategoria?: number) {
	const nome = getText(formData, "nome");
	const descricao = getText(formData, "descricao");
	const tipo = getText(formData, "tipo").toUpperCase() || "AMBOS";
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!nome) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", "Informe o nome da categoria."));
	}

	if (!["PRODUTO", "SERVICO", "AMBOS"].includes(tipo)) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", "Selecione um tipo valido para a categoria."));
	}

	const supabase = await createClient();
	const payload = {
		nome,
		descricao: descricao || null,
		tipo,
		ativo,
	};
	const { error } = codcategoria
		? await supabase.from("categorias").update(payload).eq("codcategoria", codcategoria)
		: await supabase.from("categorias").insert(payload);

	if (error) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", error.message));
	}

	revalidatePath(CATEGORIAS_PATH);
	revalidatePath(PRODUTOS_PATH);
	revalidatePath(SERVICOS_PATH);
	redirect(buildRedirect(CATEGORIAS_PATH, "success", codcategoria ? "Categoria atualizada com sucesso." : "Categoria salva com sucesso."));
}

"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";

import { executeQuery } from "@/lib/database/db";

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

function isLengthBetween(value: string, min: number, max: number) {
	return value.length >= min && value.length <= max;
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

	const safeName = sanitizeFileName(file.name);
	const fileName = `${Date.now()}-${randomUUID()}-${safeName}`;
	const relativePath = path.posix.join("uploads", folder, fileName);
	const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
	const filePath = path.join(uploadDir, fileName);
	const fileBuffer = Buffer.from(await file.arrayBuffer());

	await mkdir(uploadDir, { recursive: true });
	await writeFile(filePath, fileBuffer);

	return {
		path: filePath,
		publicUrl: `/${relativePath}`,
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

	const { error } = await executeQuery("delete from public.produtos where codproduto = $1", [codproduto]);

	if (error) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", error.message));
	}

	revalidatePath(PRODUTOS_PATH);
	redirect(buildRedirect(PRODUTOS_PATH, "success", "Produto excluido com sucesso."));
}

async function saveProduto(formData: FormData, codproduto?: number) {
	const produto = getText(formData, "produto");
	const codcategoriaValue = getText(formData, "codcategoria");
	const codmarcaValue = getText(formData, "codmarca");
	const codunidadeMedidaValue = getText(formData, "codunidade_medida");
	const valor = parseDecimal(formData.get("valor"));
	const quantidadeEstoque = Number(getText(formData, "quantidade_estoque") || "0");
	const valorDesconto = parseDecimal(formData.get("valor_desconto"));
	const descricao = getText(formData, "descricao");
	const imagemArquivo = formData.get("imagem_arquivo");
	const imagemAtual = getText(formData, "imagem_url");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(produto, 2, 80)) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", "Produto deve ter entre 2 e 80 caracteres."));
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

	if (descricao.length > 255) {
		redirect(buildRedirect(PRODUTOS_PATH, "error", "Descricao deve ter no maximo 255 caracteres."));
	}

	let uploadedImage: Awaited<ReturnType<typeof uploadImageIfPresent>> = null;

	try {
		uploadedImage = await uploadImageIfPresent(
			imagemArquivo instanceof File ? imagemArquivo : null,
			"produtos"
		);

		const { error } = codproduto
			? await executeQuery(
				`update public.produtos
					set produto = $1, codcategoria = $2, codmarca = $3, codunidade_medida = $4,
						valor = $5, quantidade_estoque = $6, valor_desconto = $7, descricao = $8,
						imagem_url = $9, ativo = $10
					where codproduto = $11`,
					[
						produto,
						codcategoriaValue ? Number(codcategoriaValue) : null,
						codmarcaValue ? Number(codmarcaValue) : null,
						codunidadeMedidaValue ? Number(codunidadeMedidaValue) : null,
						valor,
						quantidadeEstoque,
						valorDesconto,
						descricao || null,
						uploadedImage?.publicUrl ?? (imagemAtual || null),
						ativo,
						codproduto,
					]
				)
			: await executeQuery(
					`insert into public.produtos (
						produto, codcategoria, codmarca, codunidade_medida, valor, quantidade_estoque,
						valor_desconto, descricao, imagem_url, ativo
					) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
					[
						produto,
						codcategoriaValue ? Number(codcategoriaValue) : null,
						codmarcaValue ? Number(codmarcaValue) : null,
						codunidadeMedidaValue ? Number(codunidadeMedidaValue) : null,
						valor,
						quantidadeEstoque,
						valorDesconto,
						descricao || null,
						uploadedImage?.publicUrl ?? (imagemAtual || null),
						ativo,
					]
				);

		if (error) {
			if (uploadedImage) {
				await unlink(uploadedImage.path).catch(() => undefined);
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

	const { error } = await executeQuery("delete from public.servicos where codservico = $1", [codservico]);

	if (error) {
		redirect(buildRedirect(SERVICOS_PATH, "error", error.message));
	}

	revalidatePath(SERVICOS_PATH);
	redirect(buildRedirect(SERVICOS_PATH, "success", "Servico excluido com sucesso."));
}

async function saveServico(formData: FormData, codservico?: number) {
	const servico = getText(formData, "servico");
	const codcategoriaValue = getText(formData, "codcategoria");
	const duracaoMinutos = Number(getText(formData, "duracao_minutos") || "0");
	const valor = parseDecimal(formData.get("valor"));
	const valorDesconto = parseDecimal(formData.get("valor_desconto"));
	const descricao = getText(formData, "descricao");
	const imagemArquivo = formData.get("imagem_arquivo");
	const imagemAtual = getText(formData, "imagem_url");
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(servico, 2, 80)) {
		redirect(buildRedirect(SERVICOS_PATH, "error", "Servico deve ter entre 2 e 80 caracteres."));
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

	if (descricao.length > 255) {
		redirect(buildRedirect(SERVICOS_PATH, "error", "Descricao deve ter no maximo 255 caracteres."));
	}

	let uploadedImage: Awaited<ReturnType<typeof uploadImageIfPresent>> = null;

	try {
		uploadedImage = await uploadImageIfPresent(
			imagemArquivo instanceof File ? imagemArquivo : null,
			"servicos"
		);

		const { error } = codservico
			? await executeQuery(
					`update public.servicos
					set servico = $1, codcategoria = $2, duracao_minutos = $3, valor = $4,
						valor_desconto = $5, descricao = $6, imagem_url = $7, ativo = $8
					where codservico = $9`,
					[
						servico,
						codcategoriaValue ? Number(codcategoriaValue) : null,
						duracaoMinutos,
						valor,
						valorDesconto,
						descricao || null,
						uploadedImage?.publicUrl ?? (imagemAtual || null),
						ativo,
						codservico,
					]
				)
			: await executeQuery(
					`insert into public.servicos (
						servico, codcategoria, duracao_minutos, valor, valor_desconto, descricao, imagem_url, ativo
					) values ($1, $2, $3, $4, $5, $6, $7, $8)`,
					[
						servico,
						codcategoriaValue ? Number(codcategoriaValue) : null,
						duracaoMinutos,
						valor,
						valorDesconto,
						descricao || null,
						uploadedImage?.publicUrl ?? (imagemAtual || null),
						ativo,
					]
				);

		if (error) {
			if (uploadedImage) {
				await unlink(uploadedImage.path).catch(() => undefined);
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

	const { error } = await executeQuery("delete from public.categorias where codcategoria = $1", [codcategoria]);

	if (error) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", error.message));
	}

	revalidatePath(CATEGORIAS_PATH);
	revalidatePath(PRODUTOS_PATH);
	revalidatePath(SERVICOS_PATH);
	redirect(buildRedirect(CATEGORIAS_PATH, "success", "Categoria excluida com sucesso."));
}

async function saveCategoria(formData: FormData, codcategoria?: number) {
	const categoria = getText(formData, "categoria");
	const descricao = getText(formData, "descricao");
	const tipo = getText(formData, "tipo").toUpperCase() || "AMBOS";
	const ativo = getText(formData, "ativo").toUpperCase() || "S";

	if (!isLengthBetween(categoria, 2, 50)) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", "Categoria deve ter entre 2 e 50 caracteres."));
	}

	if (!["PRODUTO", "SERVICO", "AMBOS"].includes(tipo)) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", "Selecione um tipo valido para a categoria."));
	}

	if (descricao.length > 255) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", "Descricao deve ter no maximo 255 caracteres."));
	}

	const { error } = codcategoria
		? await executeQuery(
				"update public.categorias set categoria = $1, descricao = $2, tipo = $3, ativo = $4 where codcategoria = $5",
				[categoria, descricao || null, tipo, ativo, codcategoria]
			)
		: await executeQuery(
				"insert into public.categorias (categoria, descricao, tipo, ativo) values ($1, $2, $3, $4)",
				[categoria, descricao || null, tipo, ativo]
			);

	if (error) {
		redirect(buildRedirect(CATEGORIAS_PATH, "error", error.message));
	}

	revalidatePath(CATEGORIAS_PATH);
	revalidatePath(PRODUTOS_PATH);
	revalidatePath(SERVICOS_PATH);
	redirect(buildRedirect(CATEGORIAS_PATH, "success", codcategoria ? "Categoria atualizada com sucesso." : "Categoria salva com sucesso."));
}

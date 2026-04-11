"use client";

import { useMemo, useState } from "react";
import { FileSearch, FileText, Package, Receipt, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NotaResumo = {
  nfe: number;
  serie: string;
  modelo: string;
  fornecedor: string;
  emissao: string;
  entrada: string;
  valorTotal: string;
  condicaoPagamento: string;
  transportadora: string;
  status: "Ativa" | "Pendente" | "Cancelada";
};

const notasRecentes: NotaResumo[] = [
  {
    nfe: 10458,
    serie: "1",
    modelo: "55",
    fornecedor: "Distribuidora Alpha LTDA",
    emissao: "2026-03-20",
    entrada: "2026-03-21",
    valorTotal: "R$ 12.480,90",
    condicaoPagamento: "30/60 dias",
    transportadora: "Log Express",
    status: "Ativa",
  },
  {
    nfe: 10459,
    serie: "1",
    modelo: "55",
    fornecedor: "Comercial Vale Norte",
    emissao: "2026-03-22",
    entrada: "2026-03-22",
    valorTotal: "R$ 3.190,00",
    condicaoPagamento: "A vista",
    transportadora: "Frota Sul",
    status: "Pendente",
  },
  {
    nfe: 10460,
    serie: "2",
    modelo: "55",
    fornecedor: "Industria Brasil Pack",
    emissao: "2026-03-25",
    entrada: "2026-03-26",
    valorTotal: "R$ 8.742,55",
    condicaoPagamento: "3 parcelas",
    transportadora: "TransMaq",
    status: "Ativa",
  },
  {
    nfe: 10461,
    serie: "1",
    modelo: "65",
    fornecedor: "Fornecedor Teste Oeste",
    emissao: "2026-03-26",
    entrada: "2026-03-26",
    valorTotal: "R$ 1.020,40",
    condicaoPagamento: "14 dias",
    transportadora: "Entrega Pro",
    status: "Cancelada",
  },
];

const itensExemplo = [
  {
    codigo: "P-001",
    descricao: "Shampoo Premium 500ml",
    ncm: "33051000",
    cfop: "1102",
    quantidade: "24,0000",
    valorUnitario: "18,9000",
    icms: "18%",
    ipi: "5%",
  },
  {
    codigo: "P-014",
    descricao: "Pomada Modeladora 120g",
    ncm: "33059000",
    cfop: "1102",
    quantidade: "12,0000",
    valorUnitario: "22,5000",
    icms: "18%",
    ipi: "0%",
  },
];

const parcelasExemplo = [
  { parcela: "001", vencimento: "2026-04-20", valor: "R$ 4.160,30" },
  { parcela: "002", vencimento: "2026-05-20", valor: "R$ 4.160,30" },
  { parcela: "003", vencimento: "2026-06-20", valor: "R$ 4.160,30" },
];

function badgeClass(status: NotaResumo["status"]) {
  if (status === "Ativa") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Pendente") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-rose-100 text-rose-700";
}

function Field({
  label,
  placeholder,
  type = "text",
  defaultValue,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-11 rounded-xl border-slate-200 bg-white"
      />
    </div>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default function NFeWorkspace() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("Todas");

  const notasFiltradas = useMemo(() => {
    return notasRecentes.filter((nota) => {
      const matchBusca =
        nota.fornecedor.toLowerCase().includes(busca.toLowerCase()) ||
        String(nota.nfe).includes(busca);

      const matchStatus = status === "Todas" || nota.status === status;

      return matchBusca && matchStatus;
    });
  }, [busca, status]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
        <section className="overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-xl">
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.6fr_1fr] md:px-10 md:py-10">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-200">
                Modulo NFe
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
                  Cadastro e consulta de notas fiscais eletronicas baseado no
                  seu schema relacional
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  A tela foi organizada pelos blocos principais do banco:
                  fornecedor, nota, logistica, itens e contas a pagar. Assim a
                  gente ja deixa a navegacao pronta para ligar no backend depois.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="h-11 rounded-xl bg-white px-5 text-slate-950 hover:bg-slate-200">
                  Nova NFe
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-white/20 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
                >
                  Exportar consulta
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="rounded-3xl border-white/10 bg-white/10 text-white shadow-none backdrop-blur">
                <CardHeader className="pb-3">
                  <CardDescription className="text-slate-300">
                    Notas processadas
                  </CardDescription>
                  <CardTitle className="text-3xl">128</CardTitle>
                </CardHeader>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-white/10 text-white shadow-none backdrop-blur">
                <CardHeader className="pb-3">
                  <CardDescription className="text-slate-300">
                    Pendentes hoje
                  </CardDescription>
                  <CardTitle className="text-3xl">07</CardTitle>
                </CardHeader>
              </Card>

              <Card className="rounded-3xl border-white/10 bg-white/10 text-white shadow-none backdrop-blur sm:col-span-2">
                <CardHeader className="pb-3">
                  <CardDescription className="text-slate-300">
                    Ultima sincronizacao
                  </CardDescription>
                  <CardTitle className="text-xl">
                    27/03/2026 as 22:10
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: FileText,
              title: "NFes ativas",
              value: "96",
              note: "Notas com entrada confirmada",
            },
            {
              icon: Package,
              title: "Itens vinculados",
              value: "412",
              note: "Produtos ligados em Produtos_NFes",
            },
            {
              icon: Truck,
              title: "Transportadoras",
              value: "18",
              note: "Cadastros com movimentacao no mes",
            },
            {
              icon: Receipt,
              title: "Contas a pagar",
              value: "31",
              note: "Parcelas abertas das ultimas NFes",
            },
          ].map((item) => (
            <Card key={item.title} className="rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">{item.title}</p>
                  <p className="text-3xl font-semibold text-slate-950">
                    {item.value}
                  </p>
                  <p className="text-sm text-slate-500">{item.note}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-950">
                Cadastro de NFe
              </CardTitle>
              <CardDescription>
                Formulario dividido pelos grupos principais do banco para
                facilitar a futura integracao com `NFes`, `Produtos_NFes` e
                `Contas_Pagar`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Dados da nota
                    </h2>
                    <p className="text-sm text-slate-500">
                      Chave primaria composta e dados de protocolo.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Tabela NFes
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Numero NFe" placeholder="10462" type="number" />
                  <Field label="Serie" placeholder="1" />
                  <Field label="Modelo" placeholder="55" />
                  <Field label="Pagina" placeholder="1" type="number" />
                  <Field label="Natureza da operacao" placeholder="Compra para revenda" />
                  <Field label="Protocolo de acesso" placeholder="143260000012345" />
                  <Field label="Data protocolo" type="date" />
                  <Field label="Hora protocolo" type="time" />
                  <div className="md:col-span-2 xl:col-span-4">
                    <Field
                      label="Chave de acesso"
                      placeholder="35260312345678000199550010000104621000010462"
                    />
                  </div>
                  <Field label="Data emissao" type="date" />
                  <Field label="Data entrada" type="date" />
                  <Field label="Hora entrada" type="time" />
                  <SelectField
                    label="Frete por conta"
                    options={[
                      "Selecione",
                      "0 - Emitente",
                      "1 - Destinatario",
                      "2 - Terceiros",
                      "9 - Sem frete",
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Fornecedor e pagamento
                    </h2>
                    <p className="text-sm text-slate-500">
                      Dados relacionados a `Fornecedores` e
                      `CondicoesPagamento`.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Fornecedor
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Codigo fornecedor" placeholder="15" type="number" />
                  <Field label="Fornecedor" placeholder="Distribuidora Alpha LTDA" />
                  <Field label="CNPJ" placeholder="12.345.678/0001-99" />
                  <Field label="Inscricao estadual" placeholder="123456789" />
                  <Field label="Email" placeholder="financeiro@alpha.com.br" type="email" />
                  <Field label="Telefone" placeholder="(11) 4002-8922" />
                  <Field label="CEP" placeholder="01000-000" />
                  <Field label="Cidade / codigo" placeholder="Sao Paulo - 3550308" />
                  <Field label="Codigo condicao pagamento" placeholder="3" type="number" />
                  <Field label="Condicao" placeholder="3 parcelas sem juros" />
                  <Field label="Qtd parcelas" placeholder="3" type="number" />
                  <Field label="Taxa juros / multa" placeholder="0,00 / 2,00" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Logistica e volumes
                    </h2>
                    <p className="text-sm text-slate-500">
                      Bloco ligado a `Transportadores` e `Veiculos`.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Transporte
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Codigo transportadora" placeholder="8" type="number" />
                  <Field label="Transportadora" placeholder="Log Express" />
                  <Field label="CPF/CNPJ transportadora" placeholder="44.555.666/0001-10" />
                  <Field label="Inscricao estadual transp." placeholder="5544332211" />
                  <Field label="Codigo veiculo" placeholder="4" type="number" />
                  <Field label="Placa" placeholder="ABC1D23" />
                  <Field label="UF veiculo" placeholder="SP" />
                  <Field label="Codigo ANTT" placeholder="ANTT998877" />
                  <Field label="Quantidade volumes" placeholder="12" type="number" />
                  <Field label="Especie" placeholder="Caixas" />
                  <Field label="Marca" placeholder="Linha Premium" />
                  <Field label="Peso bruto / liquido" placeholder="120,450 / 112,300" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Totais e informacoes complementares
                    </h2>
                    <p className="text-sm text-slate-500">
                      Campos financeiros vindos da capa da nota.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Totais
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Base calc. ICMS" placeholder="10.000,00" />
                  <Field label="Valor ICMS" placeholder="1.800,00" />
                  <Field label="Base calc. ICMS ST" placeholder="0,00" />
                  <Field label="Valor ICMS ST" placeholder="0,00" />
                  <Field label="Valor frete" placeholder="240,00" />
                  <Field label="Valor seguro" placeholder="0,00" />
                  <Field label="Desconto" placeholder="100,00" />
                  <Field label="Outras despesas" placeholder="15,90" />
                  <Field label="Valor IPI" placeholder="624,00" />
                </div>

                <div className="space-y-2">
                  <Label>Informacoes complementares</Label>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900"
                    placeholder="Observacoes fiscais, dados adicionais da mercadoria ou texto de auditoria."
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Itens da nota
                    </h2>
                    <p className="text-sm text-slate-500">
                      Estrutura espelhando `Produtos_NFes` com codigo do produto,
                      tributacao e quantidades.
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    Adicionar item
                  </Button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="px-3 py-2 font-medium">Produto</th>
                        <th className="px-3 py-2 font-medium">NCM</th>
                        <th className="px-3 py-2 font-medium">CFOP</th>
                        <th className="px-3 py-2 font-medium">Qtd</th>
                        <th className="px-3 py-2 font-medium">Valor unit.</th>
                        <th className="px-3 py-2 font-medium">ICMS</th>
                        <th className="px-3 py-2 font-medium">IPI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensExemplo.map((item) => (
                        <tr key={item.codigo} className="bg-white">
                          <td className="rounded-l-2xl px-3 py-3 text-slate-900">
                            <div className="font-medium">{item.descricao}</div>
                            <div className="text-xs text-slate-500">
                              Cod. {item.codigo}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-slate-700">{item.ncm}</td>
                          <td className="px-3 py-3 text-slate-700">{item.cfop}</td>
                          <td className="px-3 py-3 text-slate-700">
                            {item.quantidade}
                          </td>
                          <td className="px-3 py-3 text-slate-700">
                            {item.valorUnitario}
                          </td>
                          <td className="px-3 py-3 text-slate-700">{item.icms}</td>
                          <td className="rounded-r-2xl px-3 py-3 text-slate-700">
                            {item.ipi}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Contas a pagar
                    </h2>
                    <p className="text-sm text-slate-500">
                      Visualizacao das parcelas com vencimento e valor.
                    </p>
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    Gerar parcelas
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {parcelasExemplo.map((parcela) => (
                    <div
                      key={parcela.parcela}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Parcela {parcela.parcela}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-slate-950">
                        {parcela.valor}
                      </p>
                      <p className="text-sm text-slate-500">
                        Vencimento {parcela.vencimento}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <Button variant="outline" className="rounded-xl">
                  Salvar rascunho
                </Button>
                <Button className="rounded-xl bg-slate-950 hover:bg-slate-800">
                  Salvar cadastro
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                  <FileSearch className="h-5 w-5" />
                  Consulta de NFe
                </CardTitle>
                <CardDescription>
                  Filtros iniciais para busca por numero, fornecedor ou status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Buscar nota ou fornecedor</Label>
                  <Input
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    placeholder="Ex.: 10458 ou Distribuidora Alpha"
                    className="h-11 rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900"
                  >
                    <option>Todas</option>
                    <option>Ativa</option>
                    <option>Pendente</option>
                    <option>Cancelada</option>
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      setBusca("");
                      setStatus("Todas");
                    }}
                  >
                    Limpar filtros
                  </Button>
                  <Button className="rounded-xl bg-slate-950 hover:bg-slate-800">
                    Consultar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950">
                  Resultados da consulta
                </CardTitle>
                <CardDescription>
                  {notasFiltradas.length} nota(s) encontradas com base nos
                  filtros atuais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notasFiltradas.map((nota) => (
                  <div
                    key={`${nota.nfe}-${nota.serie}-${nota.modelo}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">
                          NFe {nota.nfe} / Serie {nota.serie}
                        </p>
                        <p className="text-sm text-slate-500">
                          {nota.fornecedor}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                          nota.status,
                        )}`}
                      >
                        {nota.status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <p>Modelo: {nota.modelo}</p>
                      <p>Emissao: {nota.emissao}</p>
                      <p>Entrada: {nota.entrada}</p>
                      <p>Pagamento: {nota.condicaoPagamento}</p>
                      <p>Transportadora: {nota.transportadora}</p>
                      <p className="font-semibold text-slate-900">
                        Total: {nota.valorTotal}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button size="sm" className="rounded-xl bg-slate-950 hover:bg-slate-800">
                        Ver detalhes
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950">
                  Mapeamento do banco
                </CardTitle>
                <CardDescription>
                  Blocos usados na tela para refletir seu schema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Cadastros base</p>
                  <p>Paises, Estados, Cidades, Usuarios e NCM_SH.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Operacao da nota</p>
                  <p>Fornecedores, NFes, Produtos_NFes e Contas_Pagar.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-medium text-slate-900">Apoio logistico</p>
                  <p>Transportadores, Veiculos e CondicoesPagamento.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

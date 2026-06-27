create table if not exists public.condicoes_pagamento_parcelas (
	codcondicao_pagamento integer not null,
	num_parcela integer not null check (num_parcela >= 1),
	dias_vencimento integer not null check (dias_vencimento >= 0),
	codforma_pagamento integer not null,
	percentual numeric(7,4) not null check (percentual > 0 and percentual <= 100),

	constraint condicoes_pagamento_parcelas_pkey
		primary key (codcondicao_pagamento, num_parcela),

	constraint condicoes_pagamento_parcelas_condicao_fkey
		foreign key (codcondicao_pagamento)
		references public.condicoes_pagamento(codcondicao_pagamento)
		on delete cascade,

	constraint condicoes_pagamento_parcelas_forma_fkey
		foreign key (codforma_pagamento)
		references public.formas_pagamento(codforma_pagamento)
);

create index if not exists condicoes_pagamento_parcelas_forma_idx
	on public.condicoes_pagamento_parcelas (codforma_pagamento);

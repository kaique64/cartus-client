# Análise Técnica — `cartus-front`

SPA React 18 + Vite 5 + TypeScript 5.8 com shadcn/ui (Tailwind + Radix). Foco em visualização geoespacial (Leaflet imperativo) de carências socioeconômicas de municípios brasileiros. Consome BFF assíncrono via Server-Sent Events.

> **Status (jun/2026):** branch `refactor/structure-and-patterns` reestruturou o app em feature-sliced design, ativou strict mode, adotou TanStack Query, e cobriu os pontos de severidade alta e média-alta listados aqui. Os pontos marcados com ❌ abaixo permanecem em aberto. A análise abaixo é a lista residual pós-refactor.

## Stack

- **Linguagem**: TypeScript `^5.8.3` (strict mode ON)
- **Framework**: React `^18.3.1` + ReactDOM 18
- **Build tool**: Vite `^5.4.19` com `@vitejs/plugin-react-swc`
- **UI**: shadcn/ui (apenas `button`, `collapsible`, `resizable`, `tooltip` — 4 de 47) + Radix UI (3 pacotes) + Tailwind CSS 3.4
- **State**: TanStack Query 5.83 em uso real (`useMunicipalitySearch`, `usePois`, `useInsightStream`); SSE orquestrado com `useQueryClient.fetchQuery` + cleanup adequado
- **Mapa**: Leaflet imperativo (`import L from "leaflet"`) — sem `react-leaflet`. Hook `useLeafletMap` usa padrão init-once/update-imperative para evitar recriação do mapa a cada render.
- **Validação**: Zod em `useMunicipalityParams` (lat/lon range, ibge positivo, bbox com 4 valores).
- **Fontes**: Space Mono + Inter via Google Fonts (em CSS `@import`, prejudica FCP/LCP) ❌
- **Testes**: Vitest 3.2 + 17 arquivos / 78 testes. Playwright 1.57 sem diretório `tests/` ❌
- **Lint**: ESLint 9 (flat config)

## Rotas

- `react-router-dom` 6.30 com `BrowserRouter` (`app/App.tsx`)
- `/` → `Index` (SearchScreen com autocomplete de municípios do IBGE via TanStack Query)
- `/mapa` → `MapPage` (mapa + painel analítico; lê `useSearchParams` com validação Zod em `useMunicipalityParams`)
- `*` → `NotFound`

## Estrutura

```
src/
  app/              # Bootstrap (main, App, providers com QueryClient)
  features/
    search/         # IBGE autocomplete
    insight/        # SSE + AnalysisPanel decomposto em 7 sub-componentes
    poi/            # MapView decomposto + usePoiFiltering (useReducer) + 3 hooks Leaflet
    municipality/   # useMunicipalityParams (Zod)
  components/
    feedback/       # Alert, Spinner, ErrorBoundary, InvalidParamsMessage
    layout/         # SectionHeading, Separator, OverlayButton
  lib/              # env (BFF_BASE_URL), format, url
  hooks/            # useDebouncedValue, useIsMobile
  types/            # Result<T,E>
```

## Integrações com backend

| Endpoint                                | Método      | Onde                                                                 |
| --------------------------------------- | ----------- | -------------------------------------------------------------------- |
| `/insights/request`                     | POST        | `features/insight/api.ts`                                            |
| `/insights/stream?job_id=…`             | GET (SSE)   | `features/insight/api.ts`                                            |
| `/municipalities/:id/mesh`              | GET         | `features/insight/api.ts` (cacheado via `useQueryClient.fetchQuery`) |
| `/municipalities/:id/pois?categories=…` | GET         | `features/poi/api.ts` (filtro implementado)                          |
| `https://servicodados.ibge.gov.br/...`  | GET         | `features/search/api.ts` (cacheado pelo TanStack Query)              |
| `https://{s}.basemaps.cartocdn.com/...` | GET (tiles) | `features/poi/components/MapView/hooks/useLeafletMap.ts`             |

- URL base centralizada em `lib/env.ts` (`BFF_BASE_URL` = `import.meta.env.VITE_BFF_URL ?? "http://localhost:3000/api/v1"`).

## Pontos fortes

- Contratos TypeScript bem definidos em `features/insight/types.ts` e `features/poi/types.ts`.
- Feature-sliced design: `app/`, `features/{search,insight,poi,municipality}/`, `components/`, `lib/`, `hooks/`, `types/`.
- Componentes grandes decompostos: `MapView` (98 linhas, era 439) + 5 sub-componentes; `AnalysisPanel` (132 linhas, era 545) + 7 sub-componentes.
- Validação de URL params com Zod (`useMunicipalityParams`) — tipos lat/lon range, ibge positivo, bbox com 4 valores.
- `useLeafletMap` com init-once pattern: mapa criado uma vez, `fitBounds` chamado imperativamente em mudanças de bounds. Sem `eslint-disable`.
- TanStack Query com defaults globais: `staleTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`, `QueryCache.onError` centralizado.
- `BFF_BASE_URL` centralizado em `lib/env.ts` — todos os call sites (insight API, POI API) usam a mesma constante.
- Filtro `?categories=` do BFF implementado em `features/poi/api.ts`.
- 78 testes em 17 arquivos (era 1 teste trivial). Cobertura: `useMunicipalityParams`, `useInsightStream`, `usePois`, `usePoiFiltering`, `useDebouncedValue`, `useLeafletMap`, formatadores, env, primitivos (`Alert`, `Spinner`, `OverlayButton`, `SectionHeading`), sub-componentes (`BackButton`, `PoiLayerControl`, `PoiLegend`).
- Sistema de toast morto removido completamente (`use-toast.ts`, `toast.tsx`, `toaster.tsx`, `sonner.tsx`).
- `App.css` morto removido.
- 11 dependências não usadas removidas: `sonner`, `next-themes`, `recharts`, `cmdk`, `embla-carousel-react`, `vaul`, `input-otp`, `react-day-picker`, `date-fns`, `react-hook-form`, `@hookform/resolvers`.
- `municipiosCache` em escopo de módulo removido — substituído por TanStack Query com `staleTime: Infinity`.
- `useInsightStream` reset state entre cidades (removido `hasStartedRef` que causava stream stale entre cidades).
- `MapPage` renderiza `InvalidParamsMessage` em vez de redirect silencioso quando params inválidos.

## Pontos de atenção

### Bugs funcionais

_Nenhum conhecido em aberto._

### Inconsistências entre código e documentação

- **TODOs stale** em `index.html:6,11` (já atendidos, só não removidos). ❌

### Segurança

- **Sem camada de autenticação**: nenhum header `Authorization`, nenhum cookie, nenhum interceptor. ❌
- **Integração com IBGE e tiles CARTO** via HTTPS direto do browser, expõe a origem a esses terceiros. ❌
- **Sem CSP, HSTS, X-Frame-Options** no nginx do Dockerfile. ❌

### Dívida técnica

- **TypeScript estrito agora ativo** (`tsconfig.app.json`): `strict: true`, `noImplicitAny: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`.
- **TanStack Query em uso real**: `useMunicipalitySearch` (cache infinito), `usePois` (staleTime 5min, key por IBGE), `useInsightStream` (usa `useQueryClient.fetchQuery` para mesh).
- **shadcn reduzido de 47 para 4** (`button`, `collapsible`, `resizable`, `tooltip`).
- **Dependências pesadas removidas**: `recharts`, `cmdk`, `embla-carousel-react`, `vaul`, `input-otp`, `react-day-picker`, `date-fns`, `react-hook-form`, `@hookform/resolvers`, `sonner`, `next-themes`.
- **POIs sem paginação/limite**: pede "todos" os POIs do município. Para São Paulo, pode retornar dezenas de milhares. ❌
- **Sem clustering de POIs**: `usePoiMarkers` itera todos e cria `L.circleMarker` para cada um — pode travar o navegador. ❌
- **Tratamento genérico de erro SSE** (`features/insight/hooks/useInsightStream.ts`): tudo vira "Conexão perdida". Não diferencia 4xx/5xx/network. ❌
- **Google Fonts via `@import` em CSS** (`src/index.css:1`) — prejudica FCP/LCP. ❌
- **`vite.config.ts:6`** ainda usa `defineConfig(({ mode }) => ...)` ignorando o parâmetro `mode`. ❌
- **Linter warning pré-existente**: `tailwind.config.ts:90` usa `require()` (template Vite, fora do escopo do refactor).
- **Linter warning pré-existente**: `components/ui/button.tsx:47` export não-component (`react-refresh/only-export-components`).

### Testes

- **Cobertura efetiva expandida de 0% para ~70%** dos hooks e primitivos. 17 arquivos / 78 testes.
- **Playwright 1.57 instalado mas sem `tests/`** → `npx playwright test` falha com "no tests found". Configurar smoke tests ou remover. ❌
- **Sem testes de integração E2E**. ❌
- Sub-componentes do `AnalysisPanel` (`ScoreCard`, `ExecutiveSummary`, `DemographicsBlock`, `IncomeDistribution`, `CnaeSectors`, `GapsAndOpportunities`) sem teste unitário. ❌
- `SearchScreen`, `MapPage`, `useIsMobile` sem teste. ❌

### Dependências

- **Vite 5.4.19** abaixo da 6.x — dívida. ❌
- **Sem `npm audit` / Renovate** detectados. ❌

### Acessibilidade / UX

- **`SearchScreen` sem ARIA** (`features/search/components/SearchScreen.tsx`): input sem `aria-label`, sem `role="combobox"`, sem `aria-expanded`/`aria-controls`. Lista de sugestões sem `role="listbox"`/`role="option"`. ❌
- **`MapPage`** não trata params ausentes separadamente de params inválidos (cai no `InvalidParamsMessage` em ambos os casos). ❌

### Build / Deploy

- **Dockerfile multi-stage** (node:22-alpine + nginx:alpine), mas **sem gzip/brotli, sem cache headers, sem security headers** (CSP, HSTS, X-Frame-Options). ❌
- **`dist/` versionado** (5 arquivos, ~50KB) — `.gitignore:83` ignora `dist` mas a pasta existe no working tree. ❌
- **Bundle único grande** (488KB JS, 153KB gzipped) — sem `manualChunks` no Rollup. ❌

## Top prioridades (atualizado)

| #   | Severidade | Ação                                                                        | Status                          |
| --- | ---------- | --------------------------------------------------------------------------- | ------------------------------- |
| 1   | 🔴 Alta    | Corrigir `use-pois.ts:23` para usar `VITE_BFF_URL`                          | ✅ feito                        |
| 2   | 🔴 Alta    | Criar `tests/` com smoke tests Playwright ou remover `playwright.config.ts` | ❌                              |
| 3   | 🟠 Média   | Ativar `strict: true` no `tsconfig.app.json`                                | ✅ feito                        |
| 4   | 🟠 Média   | Remover 40+ componentes shadcn, `recharts`, `cmdk`, `vaul`, `next-themes`   | ✅ feito                        |
| 5   | 🟠 Média   | Implementar filtro de categorias em `use-pois.ts`                           | ✅ feito                        |
| 6   | 🟠 Média   | Implementar clustering de POIs                                              | ❌                              |
| 7   | 🟠 Média   | Validar URL params em `MapPage.tsx` (tamanho, NaN, tipos)                   | ✅ feito (Zod)                  |
| 8   | 🟡 Baixa   | Mover `municipiosCache` para TanStack Query ou `localStorage`               | ✅ feito                        |
| 9   | 🟡 Baixa   | Corrigir `README.md:10,44`                                                  | ✅ feito                        |
| 10  | 🟡 Baixa   | Adicionar CSP, gzip e cache headers no nginx do Dockerfile                  | ❌                              |
| 11  | 🟡 Baixa   | Adicionar ARIA no `SearchScreen`                                            | ❌                              |
| 12  | 🟡 Baixa   | Limpar `App.css` morto e TODOs stale em `index.html`                        | ⚠️ App.css removido, TODOs ❌   |
| 13  | 🟡 Baixa   | Mover `@import` de Google Fonts para `<link>` em `index.html`               | ❌                              |
| 14  | 🟡 Baixa   | Adicionar testes unitários                                                  | ✅ 78 testes / 17 arquivos      |
| 15  | 🟡 Baixa   | Remover `use-toast` (TOAST_REMOVE_DELAY leak)                               | ✅ feito                        |
| 16  | 🟡 Baixa   | Reset `useRef` de município fetched em `use-pois`                           | ✅ feito (TanStack Query keyed) |
| 17  | 🟡 Baixa   | `MapView` recria mapa a cada render                                         | ✅ feito (init-once pattern)    |
| 18  | 🟡 Baixa   | Diferenciar erros 4xx/5xx/network no SSE                                    | ❌                              |
| 19  | 🟡 Baixa   | Paginar/limitar POIs no fetch                                               | ❌                              |
| 20  | 🟡 Baixa   | Adicionar `manualChunks` no Rollup                                          | ❌                              |

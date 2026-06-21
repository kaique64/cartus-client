# Cartus — Mapeando o Vazio

Este é o repositório Frontend do projeto **Cartus**, uma plataforma de inteligência de mercado focada em mapeamento demográfico, socioeconômico e identificação de gaps regionais. A aplicação utiliza dados estruturados do IBGE cruzados com inteligência artificial para gerar insights sobre oportunidades de negócios em municípios brasileiros.

## 🚀 Tecnologias Principais

- **Framework**: React 18 com TypeScript (strict mode)
- **Build & Dev**: Vite
- **Estilização**: Tailwind CSS + shadcn/ui (Radix UI) — apenas `button`, `collapsible`, `resizable`, `tooltip`
- **Mapas**: Leaflet (API imperativa, sem `react-leaflet`); hook `useLeafletMap` com padrão init-once
- **Comunicação**: Server-Sent Events (SSE) para streaming de dados em tempo real
- **Layout**: Painéis redimensionáveis (react-resizable-panels)
- **Estado / data fetching**: TanStack Query 5 (`useMunicipalitySearch`, `usePois`, `useInsightStream`)
- **Validação**: Zod (parsing de URL params em `useMunicipalityParams`)
- **Testes**: Vitest (78 testes em 17 arquivos) e Playwright (E2E — config pendente)

## 🏗 Arquitetura e Integração

O frontend do Cartus consome dados de um **Backend for Frontend (BFF)**. O fluxo principal consiste em:
1. O usuário pesquisa um município.
2. O frontend envia uma requisição para o BFF e recebe um `job_id`.
3. Uma conexão SSE (Server-Sent Events) é estabelecida usando o `job_id`.
4. Os dados chegam em etapas progressivas:
   - **`processed_data`**: Dados brutos do município (População, PIB, CNAE, Distribuição de Renda, etc.). O painel e o mapa são atualizados quase instantaneamente.
   - **`generated_insight`**: Análise gerada por IA (Gaps, Oportunidades, Riscos, Score). A UI apresenta as informações analíticas completas.

## ✨ Funcionalidades

- **Visualização Geoespacial**: Malhas do IBGE plotadas dinamicamente com Leaflet.
- **Painel Analítico Resiliente**: Layout em painéis redimensionáveis adaptável para Desktop e Mobile.
- **Indicadores Demográficos**: Gráficos de barras interativos para faixas etárias.
- **Perfil Econômico**: Distribuição de renda (A/B, C, D/E) e histórico de empresas por CNAE com sparklines e tooltips customizados.
- **Insights Gerados por IA**: Identificação automática de gaps de mercado e oportunidades de investimento por região.

## 💻 Como rodar o projeto

### Pré-requisitos
- Node.js (v18+)
- npm ou bun

### Passos

1. Clone o repositório e navegue até a pasta:
   ```bash
   cd cartus-front
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   bun install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com a URL do seu BFF:
   ```env
   VITE_BFF_URL=http://localhost:3000/api/v1
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   bun run dev
   ```

O servidor será iniciado, geralmente em `http://localhost:8080` (conforme configurado no `vite.config.ts`).

## 🛠 Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento.
- `npm run build`: Faz o build de produção na pasta `dist/`.
- `npm run lint`: Roda o ESLint para encontrar e corrigir problemas no código.
- `npm run test`: Roda os testes unitários via Vitest.
- `npm run preview`: Inicia um servidor web para visualizar o build final da pasta `dist/`.

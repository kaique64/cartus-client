# Cartus BFF - Guia de Integração para o Frontend

Este documento descreve detalhadamente como o Frontend deve se comunicar com o Backend for Frontend (BFF) do Cartus para solicitar insights regionais e consumir os resultados de forma reativa via Server-Sent Events (SSE).

---

## 1. Visão Geral da Arquitetura

O BFF opera sob um modelo assíncrono e orientado a eventos. O fluxo padrão que o Frontend deve implementar é:

1. **Solicitação:** O Frontend faz um `POST` solicitando o processamento de uma cidade e recebe um `job_id`.
2. **Conexão:** Imediatamente após, o Frontend abre uma conexão SSE (`GET`) filtrada por esse `job_id`.
3. **Escuta Reativa:** O Frontend fica escutando eventos de status vindos do SSE (`processed_data` e `generated_insight`).
4. **Encerramento:** Quando todos os dados necessários são recebidos, o Frontend fecha a conexão SSE ativamente.

---

## 2. API Endpoints

A URL base da API é: `http://localhost:3000/api/v1` *(ajuste a porta conforme o seu `.env`)*. O CORS está configurado para aceitar qualquer origem durante o desenvolvimento.

### 2.1. Iniciar Solicitação de Insight
Inicia o processo de raspagem e análise de dados no worker Python.

*   **Rota:** `POST /insights/request`
*   **Headers:** `Content-Type: application/json`
*   **Body:**
    ```json
    {
      "name": "Nome da Cidade" // Exemplo: "Paulínia"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "job_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "ACCEPTED",
      "message": "Solicitação de insight para \"Paulínia\" aceita. Acompanhe via SSE."
    }
    ```

> [!IMPORTANT]
> O `job_id` retornado é **obrigatório** para a próxima etapa. Guarde-o no estado do seu componente.

### 2.2. Conectar ao Stream de Eventos (SSE)
Abre um túnel reativo unidirecional onde o BFF enviará os dados prontos.

*   **Rota:** `GET /insights/stream?job_id=<SEU_JOB_ID>`
*   **Como Consumir (Javascript Nativo):**
    ```javascript
    const jobId = "550e8400-...";
    const BFF_URL = "http://localhost:3000/api/v1";

    const eventSource = new EventSource(`${BFF_URL}/insights/stream?job_id=${jobId}`);

    // Evento 1: Dados estatísticos processados
    eventSource.addEventListener('processed_data', async (event) => {
      const data = JSON.parse(event.data);
      console.log('Dados Demográficos:', data.payload);

      // O municipality_id já está disponível aqui — buscar a malha geográfica
      // imediatamente para renderizar o mapa enquanto o insight da IA ainda processa.
      try {
        const meshResponse = await fetch(
          `${BFF_URL}/municipalities/${data.municipality_id}/mesh`
        );
        const geoJson = await meshResponse.json();
        console.log('Malha GeoJSON:', geoJson);
        // Renderizar no mapa: L.geoJSON(geoJson).addTo(map);
      } catch (err) {
        console.error('Erro ao buscar malha:', err);
      }
    });

    // Evento 2: Insight gerado pela IA (geralmente chega depois)
    eventSource.addEventListener('generated_insight', (event) => {
      const data = JSON.parse(event.data);
      console.log('Insights e Oportunidades:', data.payload);
      
      // Este é o último evento esperado — fechar a conexão SSE.
      eventSource.close();
    });

    // Tratamento de erros de conexão
    eventSource.onerror = (error) => {
      console.error('Erro na conexão SSE:', error);
      eventSource.close();
    };
    ```

### 2.3. Buscar Malha Geográfica (GeoJSON)
Retorna o contorno geográfico (malha) de um município no formato GeoJSON, ideal para renderização em bibliotecas de mapas como Leaflet, Mapbox GL ou Google Maps.

*   **Rota:** `GET /municipalities/:id/mesh`
*   **Parâmetros de Rota:**
    | Parâmetro | Tipo     | Descrição                          | Exemplo   |
    |-----------|----------|------------------------------------|-----------|
    | `id`      | `number` | Código IBGE do município (7 dígitos) | `3550308` |

*   **Response (200 OK):** GeoJSON (`application/json`)
    ```json
    {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[-46.82, -23.68], [-46.36, -23.38], ...]]
          },
          "properties": {
            "codarea": "3550308",
            "name": "São Paulo"
          }
        }
      ]
    }
    ```

> [!TIP]
> O BFF retorna o header `Cache-Control: public, max-age=86400` (24 horas). Isso significa que o navegador irá cachear automaticamente a malha geográfica — não é necessário implementar cache manual no frontend para este endpoint.

*   **Como Consumir (Javascript):**
    ```javascript
    const municipalityId = 3550308; // Código IBGE de São Paulo

    const response = await fetch(
      `http://localhost:3000/api/v1/municipalities/${municipalityId}/mesh`
    );
    const geoJson = await response.json();

    // Exemplo com Leaflet:
    // L.geoJSON(geoJson).addTo(map);
    ```

> [!NOTE]
> O `municipality_id` necessário para esta chamada é retornado dentro do payload dos eventos SSE (`processed_data` e `generated_insight`). Você pode encadear: receber os dados via SSE → extrair o `municipality_id` → buscar a malha para desenhar o mapa.

---

## 3. Contratos de Dados (Payloads)

Os dados que chegam pelo `.addEventListener` possuem a seguinte estrutura base:

```typescript
interface SseEventBase {
  type: "PROCESSED_DATA" | "GENERATED_INSIGHT";
  job_id: string;
  municipality_id: number;
  municipality_name: string;
  payload: ProcessedDataPayload | GeneratedInsightPayload;
}
```

### 3.1. Payload de Dados Processados (`processed_data`)
Este evento traz as estatísticas frias (demografia, PIB, empresas). Geralmente chega primeiro.

```typescript
interface ProcessedDataPayload {
  municipality_id: number;
  municipality_name: string;
  uf: string;
  population: number;
  population_year: number;
  pib: number;
  pib_per_capita: number; // Ex: 579715.62
  population_density: number; // Ex: 840.73
  household_income: number;
  
  income_class_distribution: {
    ab_pct: number;
    c_pct: number;
    de_pct: number;
  };
  
  // Lista de Faixas Etárias
  age_groups: Array<{
    age_range: string;
    population: number;
    year: number;
  }>;
  dominant_age_segment: string; // Ex: "30-44"

  // 🌟 NOVO: Empresas agrupadas por Setor (Pronto para gráficos)
  companies_by_cnae: Record<string, {
    description: string;
    growth: {
      total_pct: number | null;        // Evolução de todo o período (Ex: 25.4)
      last_5_years_pct: number | null; // Evolução dos últimos 5 anos (Ex: 10.2)
    };
    history: Array<{
      year: number;
      count: number;
      per_1000_hab: number | null;
    }>;
  }>;
}
```

### 3.2. Payload de Insight Gerado (`generated_insight`)
Este evento traz o resultado textual e as recomendações interpretativas. Chega logo após ou em paralelo ao `processed_data`.

```typescript
interface GeneratedInsightPayload {
  data_analise: string; // Data ISO String (ex: "2026-05-02T19:58:17.770Z")
  resumo_executivo: string;
  
  perfil_socioeconomico: {
    classificacao: string; // Ex: "B"
    racional: string;
  };
  
  gaps_identificados: Array<{
    setor: string;
    cnae_referencia: string | null;
    severidade: string; // "alta", "media", "baixa"
    descricao: string;
    dado_que_suporta: string;
  }>;
  
  oportunidades: Array<{
    tipo_negocio: string;
    cnae_sugerido: string;
    perfil_investidor: string; // "Conservador", "Arrojado", etc
    capital_estimado: string; // "alto", "medio", "baixo"
    viabilidade: string; // "alta", "media", "baixa"
    racional: string;
  }>;
  
  riscos: Array<{
    fator: string;
    impacto: string; // "alto", "medio", "baixo"
    descricao: string;
  }>;
  
  score_oportunidade: {
    valor: number; // Ex: 88 (0 a 100)
    justificativa: string;
  };
  
  dimensoes_cruzadas: string[]; // Lista de descrições textuais
}
```

---

## 4. Recomendações Práticas para o Frontend

1. **Loader de Múltiplos Passos:** Ao clicar em "Buscar Insight", exiba um loader que indica progresso. Por exemplo: *"1. Solicitando dados (ok) -> 2. Processando estatísticas (ok) -> 3. Gerando insights usando IA (carregando)..."* O recebimento sequencial dos eventos via SSE permite atualizar esse feedback visual na tela.
2. **Gráficos de Linha:** Para o gráfico de empresas do CNAE, você pode iterar pelo `Object.keys(payload.companies_by_cnae)` e desenhar uma linha baseada no array `history` (`year` vs `count`).
3. **Métricas de Crescimento (Badges):** Use os campos `total_pct` e `last_5_years_pct` para renderizar crachás visuais ao lado do nome do setor, exibindo se está em alta (cor verde) ou em queda (cor vermelha).
4. **Timeouts:** Considere implementar um *timeout* no seu componente React/Vue caso a conexão SSE fique muito tempo (ex: mais de 60 segundos) sem receber o evento final, fechando o `EventSource` para não drenar a memória do navegador em caso de queda silenciosa do Worker Python.

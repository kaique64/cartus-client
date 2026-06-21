# Especificação Técnica: Serviço de POIs (Camada BFF)

Este documento detalha a arquitetura do Backend for Frontend (BFF) para o consumo de Pontos de Interesse (POIs). 

**Mudança Arquitetural:** A responsabilidade de buscar dados no OpenStreetMap (Overpass) e realizar a filtragem geográfica (Point-in-Polygon) foi transferida para o **Worker Python**. O BFF atua agora de forma super leve e **exclusivamente como uma API rápida de leitura (Read-Only)** conectada ao PostgreSQL.

---

## 1. Arquitetura e Fluxo de Dados

O serviço de POIs no BFF é **síncrono**, sem chamadas externas a APIs de terceiros, garantindo respostas na casa dos milissegundos.

1.  **Gatilho (Worker):** O Worker Python processa e insere os POIs calculados da cidade diretamente na tabela `pois` do banco e avisa o BFF via RabbitMQ que o processamento do município terminou.
2.  **Notificação:** O BFF repassa o aviso ao Frontend via SSE (`processed_data`).
3.  **Requisição:** O Frontend (sob demanda ou no carregamento do mapa) faz um `GET /municipalities/:id/pois?categories=hospital,pet`.
4.  **Consulta ao Banco (PostgreSQL):** O `PoisService` (no NestJS) executa uma consulta SQL na tabela `pois`. O filtro de categorias e o vínculo com a cidade ocorrem diretamente no banco (`WHERE municipality_id = X AND category IN ('hospital', 'pet')`).
5.  **Resposta:** O BFF empacota os dados no formato do DTO e retorna ao Frontend instantaneamente.

---

## 2. Especificação do Endpoint

### `GET /api/v1/municipalities/:id/pois`

Retorna os Pontos de Interesse geolocalizados para o município especificado.

**Parâmetros de Rota:**
*   `id` (Number): Código IBGE do Município (ex: 3550308).

**Query Parameters:**
*   `categories` (String, Opcional): Lista de categorias separadas por vírgula. Se omitido, retorna TODAS as categorias mapeadas na cidade.
    *   Exemplo: `?categories=hospital,pharmacy,pet`

**Response (`200 OK`):**
```json
{
  "municipality_id": 3550308,
  "total": 1547,
  "pois": [
    {
      "id": 12345678,
      "lat": -23.5505,
      "lon": -46.6333,
      "name": "Hospital das Clínicas",
      "category": "hospital"
    }
  ],
  "categories_summary": {
    "hospital": 342,
    "pet": 1205
  }
}
```

---

## 3. Contratos de Dados (DTOs - NestJS)

```typescript
export enum PoiCategory {
  HOSPITAL = 'hospital',
  PHARMACY = 'pharmacy',
  SCHOOL = 'school',
  RESTAURANT = 'restaurant',
  SUPERMARKET = 'supermarket',
  BANK = 'bank',
  FUEL = 'fuel',
  PET = 'pet', // Futuras customizações do usuário
}

export interface PoiItem {
  id: number;
  lat: number;
  lon: number;
  name: string;
  category: PoiCategory;
}

export class PoisResponseDto {
  municipality_id: number;
  total: number;
  pois: PoiItem[];
  categories_summary: Record<string, number>;
}
```

---

## 4. Persistência (PostgreSQL Shared)

O schema do banco de dados relacional deve ser acessado pelo BFF (Leitura) e pelo Worker (Escrita).

**Tabela: `pois`**
*   `id` (BigInt, PK) - ID original do OSM.
*   `municipality_id` (Integer, FK) - ID IBGE do município.
*   `lat` (Float)
*   `lon` (Float)
*   `name` (String)
*   `category` (String)

> **Regra de Ouro (Performance):** A tabela `pois` **DEVE** possuir um índice composto (B-Tree Index) nos campos `(municipality_id, category)` no PostgreSQL para garantir que a query de seleção ocorra em < 5ms mesmo se a tabela tiver dezenas de milhões de registros ao todo.

---

## 5. Impacto no Frontend

Ao adotar essa solução backend, o Frontend do Cartus limpa todo o peso e lógica complexa.
A integração resume-se a um simples Fetch que constrói a query via URL:

```typescript
// Exemplo de integração nativa e limpa no React
const params = new URLSearchParams();
if (selectedCategories.length > 0) {
  params.append('categories', selectedCategories.join(','));
}

const response = await fetch(`/api/v1/municipalities/${id}/pois?${params}`);
const data = await response.json();
setPois(data.pois);
```

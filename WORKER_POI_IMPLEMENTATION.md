# Especificação Técnica: Processamento de POIs no Worker Python

Este documento detalha o fluxo de extração e salvamento de Pontos de Interesse (POIs) utilizando o Worker Python no projeto Cartus.

---

## 1. Visão Geral

O Worker assume a tarefa pesada de lidar com dados geográficos e chamadas externas complexas.
Durante a esteira de processamento de um município, o Worker deve:
1.  **Baixar** o polígono (malha/BBox) da cidade.
2.  **Solicitar** todos os estabelecimentos geolocalizados usando a API do Overpass.
3.  **Filtrar** via algoritmos espaciais (Point-in-Polygon) para descartar pontos que caíram no *Bounding Box* mas estão fora da fronteira política do município.
4.  **Salvar** os resultados em massa no banco de dados (tabela `pois`), disponibilizando os dados quase que instantaneamente para a camada BFF.

---

## 2. Bibliotecas Recomendadas (Ecosistema Python)

Ao invés de reinventar a roda matemática como fizemos no MVP de Frontend, o Python possui ferramentas nativas super otimizadas (rodando em C++) para trabalhar com mapas.

*   `osmnx`: Fantástica para baixar dados do OpenStreetMap passando apenas o nome da cidade. Ela já entrega o resultado devidamente fatiado!
*   `geopandas`: Uma evolução do `pandas` para dados espaciais. Permite cruzamentos em poucas linhas de código.
*   `shapely`: Ferramenta para manipulação de coordenadas e polígonos.
*   `SQLAlchemy`: Para realizar a inserção rápida (Bulk Insert) no PostgreSQL.

---

## 3. Lógica e Fluxo de Execução

### Passo 1: Busca de TODOS os POIs (`osmnx`)
A grande sacada de trazer isso para o Worker é que você não precisa limitar as categorias. Você pode pedir para o `osmnx` baixar **absolutamente todos** os comércios e amenidades da cidade de uma vez só!

```python
import osmnx as ox

# Definir que queremos TODOS os tipos dentro dessas chaves principais
TAGS_GLOBAIS = {
    "amenity": True,    # Traz escolas, hospitais, restaurantes, bancos, estacionamentos...
    "shop": True,       # Traz supermercados, pet shops, padarias, açougues, shoppings...
    "leisure": True,    # Traz academias, parques, quadras...
    "office": True,     # Traz escritórios de advocacia, imobiliárias...
    "healthcare": True  # Traz laboratórios, clínicas...
}

def classificar_categoria_bruta(row):
    """
    Retorna a categoria original exata que veio do OSM.
    Ex: se for um pet shop, row['shop'] será 'pet'. A categoria será 'pet'.
    Se for hospital, row['amenity'] será 'hospital'. A categoria será 'hospital'.
    """
    for tag in TAGS_GLOBAIS.keys():
        if tag in row and not pd.isna(row[tag]):
            return row[tag] # Salva direto a string original (ex: 'pharmacy')
    return 'outros'

def extrair_pois_cidade(id_ibge: int, geojson_ibge: dict, db_session):
    from shapely.geometry import shape

    # 1. Converter o GeoJSON do IBGE para um polígono matemático do Shapely
    # O geojson_ibge geralmente vem como FeatureCollection ou Feature
    feature = geojson_ibge['features'][0] if 'features' in geojson_ibge else geojson_ibge
    poligono_cidade = shape(feature['geometry'])

    # 2. Baixar os POIs exatos que caem dentro da malha oficial do IBGE
    try:
        gdf_pois = ox.features_from_polygon(poligono_cidade, tags=TAGS_GLOBAIS)
    except Exception as e:
        print(f"Erro na API do Overpass: {e}")
        return # Tentar novamente com retry depois
        
    lista_insercao = []
    
    # O GDF (GeoDataFrame) pode retornar Pontos simples (Lojas) ou Polígonos Fechados (Shoppings, Escolas)
    for index, row in gdf_pois.iterrows():
        # Pegar apenas o ID original do Node (Para evitar duplicados)
        osm_id = index[1] if isinstance(index, tuple) else index
        
        # Pega a geometria (se for polígono, calculamos e pegamos apenas o centro exato)
        geom = row.geometry.centroid if row.geometry.geom_type != 'Point' else row.geometry
        
        lista_insercao.append({
            "id": osm_id,
            "municipality_id": id_ibge,
            "lat": geom.y,
            "lon": geom.x,
            "name": row.get('name', 'Estabelecimento sem nome'),
            "category": classificar_categoria_bruta(row)
        })

    salvar_no_banco(lista_insercao, id_ibge, db_session)
```

---

## 4. Estratégia de Inserção (Banco de Dados)

É **imprescindível** utilizar a técnica de `Bulk Insert`. Um loop `for` padrão do SQL inserindo uma linha por vez demoraria minutos. Uma inserção em massa insere 20.000 registros em 1 segundo.

```python
def salvar_no_banco(lista_insercao, id_ibge, db_session):
    # 1. Limpe os dados antigos daquele município (caso o Worker esteja rodando uma re-sincronização)
    db_session.execute("DELETE FROM pois WHERE municipality_id = :id", {"id": id_ibge})
    
    # 2. Insira as novas linhas formatadas de uma vez só
    # Exemplo utilizando SQLAlchemy:
    db_session.bulk_insert_mappings(PoiModel, lista_insercao)
    db_session.commit()
```

---

## 5. Resiliência (Tratamento de Erros)

1. **Rate Limits:** O servidor público do Overpass pode aplicar "bloqueios temporários" (HTTP 429) se você fizer buscas em massa.
2. O seu código do Worker deve conter ferramentas de Retry Automático (ex: a lib `tenacity` em Python) para aguardar 30 ou 60 segundos e refazer o *request* caso a conexão venha a falhar.
3. Se a busca dos POIs falhar completamente após N tentativas, o Worker deve conseguir enviar a mensagem de "Pronto" via RabbitMQ ignorando os pontos do mapa, permitindo que o usuário veja a *Análise de IA* e o texto no dashboard mesmo sem abrir o mapa.

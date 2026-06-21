export interface SearchResult {
  name: string;
  ibgeCode: number;
  center: [number, number];
  bbox?: [number, number, number, number];
}

export interface IBGEMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
        nome: string;
      };
    };
  };
}

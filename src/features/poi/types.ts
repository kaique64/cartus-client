export interface PoiItem {
  id: number;
  lat: number;
  lon: number;
  name: string;
  category: string;
  source_tag: string;
}

export interface SourceTagDetails {
  total: number;
  [category: string]: number;
}

export type CategoriesSummary = Record<string, SourceTagDetails>;

export function readTotal(details: SourceTagDetails): number {
  return details.total;
}

export function readCategoryCount(details: SourceTagDetails, category: string): number {
  return details[category];
}

export interface PoisResponse {
  municipality_id: number;
  total: number;
  pois: PoiItem[];
  categories_summary: CategoriesSummary;
}

export const SOURCE_TAG_CONFIG: Record<string, { label: string; color: string }> = {
  amenity: { label: "Serviços e Conveniências", color: "#3b82f6" }, // Blue
  shop: { label: "Comércio e Varejo", color: "#f97316" }, // Orange
  leisure: { label: "Lazer e Esportes", color: "#22c55e" }, // Green
  healthcare: { label: "Saúde", color: "#ef4444" }, // Red
  office: { label: "Escritórios e Empresas", color: "#8b5cf6" }, // Purple
  tourism: { label: "Turismo", color: "#ec4899" }, // Pink
};

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  hospital: "Hospital",
  clinic: "Clínica",
  pharmacy: "Farmácia",
  dentist: "Dentista",
  doctors: "Médicos",
  school: "Escola",
  college: "Faculdade",
  university: "Universidade",
  kindergarten: "Creche",
  restaurant: "Restaurante",
  fast_food: "Fast Food",
  cafe: "Café",
  bar: "Bar",
  pub: "Pub",
  bank: "Banco",
  atm: "Caixa Eletrônico",
  fuel: "Posto de Combustível",
  charging_station: "Ponto de Recarga",
  police: "Polícia / Segurança",
  fire_station: "Bombeiros",
  post_office: "Correios",
  cinema: "Cinema",
  theatre: "Teatro",
  library: "Biblioteca",
  parking: "Estacionamento",
  bus_station: "Rodoviária",
  supermarket: "Supermercado",
  bakery: "Padaria",
  mall: "Shopping",
  convenience: "Conveniência",
  wholesale: "Atacado",
  clothes: "Loja de Roupas",
  shoes: "Sapataria",
  jewelry: "Joalheria",
  beauty: "Beleza",
  hairdresser: "Cabeleireiro",
  pet: "Pet Shop",
  electronics: "Eletrônicos",
  computer: "Informática",
  mobile_phone: "Telefonia",
  car: "Concessionária",
  car_repair: "Oficina Mecânica",
  car_parts: "Autopeças",
  hardware: "Material de Construção",
  furniture: "Móveis",
  books: "Livraria",
  florist: "Floricultura",
  optician: "Ótica",
  park: "Parque",
  gym: "Academia",
  fitness_centre: "Centro de Fitness",
  sports_centre: "Centro Esportivo",
  stadium: "Estádio",
  swimming_pool: "Piscina",
  laboratory: "Laboratório",
  doctor: "Consultório",
  rehabilitation: "Reabilitação",
  company: "Empresa",
  estate_agent: "Imobiliária",
  lawyer: "Advocacia",
  insurance: "Seguradora",
  accountant: "Contabilidade",
  government: "Órgão Público",
  hotel: "Hotel",
  museum: "Museu",
  attraction: "Atração Turística",
  gallery: "Galeria de Arte",
  sambadrome: "Sambódromo",
  garden: "Jardim",
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_TRANSLATIONS[category] || category.charAt(0).toUpperCase() + category.slice(1);
}

export function getSourceTagColor(sourceTag: string): string {
  return SOURCE_TAG_CONFIG[sourceTag]?.color || "#94a3b8"; // Slate for unknown
}

export function getSourceTagLabel(sourceTag: string): string {
  return SOURCE_TAG_CONFIG[sourceTag]?.label || sourceTag.charAt(0).toUpperCase() + sourceTag.slice(1);
}

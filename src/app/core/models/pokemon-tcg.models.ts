/** Información mínima de una expansión Pokémon TCG. */
export interface PokemonTcgSet {
  /** Identificador único de la expansión. */
  id: string;
  /** Nombre público de la expansión. */
  name: string;
  /** Fecha de lanzamiento informada por la API. */
  releaseDate?: string;
}

/** Carta Pokémon preparada para mostrarse en el explorador TCG. */
export interface PokemonTcgCard {
  /** Identificador único de la carta. */
  id: string;
  /** Nombre de la carta. */
  name: string;
  /** Categoría principal, por ejemplo Pokémon, Entrenador o Energía. */
  supertype: string;
  /** Subtipos asociados a la carta. */
  subtypes?: string[];
  /** Puntos de salud cuando corresponda. */
  hp?: string;
  /** Tipos elementales de la carta. */
  types?: string[];
  /** Rareza informada por la expansión. */
  rarity?: string;
  /** Expansión a la que pertenece la carta. */
  set: PokemonTcgSet;
  /** Imágenes oficiales en dos resoluciones. */
  images: {
    small: string;
    large: string;
  };
}

/** Respuesta paginada entregada por Pokémon TCG API. */
export interface PokemonTcgResponse {
  /** Cartas incluidas en la página solicitada. */
  data: PokemonTcgCard[];
  /** Página actual de resultados. */
  page: number;
  /** Cantidad máxima solicitada por página. */
  pageSize: number;
  /** Cantidad de cartas incluidas en la respuesta actual. */
  count: number;
  /** Cantidad total de coincidencias. */
  totalCount: number;
}

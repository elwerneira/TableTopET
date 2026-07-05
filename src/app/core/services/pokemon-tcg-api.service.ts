import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { PokemonTcgCard, PokemonTcgResponse } from '../models/pokemon-tcg.models';

/** Consume el catálogo público de Pokémon TCG API sin exponer claves privadas. */
@Injectable({ providedIn: 'root' })
export class PokemonTcgApiService {
  /** Cliente utilizado para ejecutar solicitudes HTTP. */
  private readonly http = inject(HttpClient);

  /** Endpoint público de búsqueda de cartas. */
  private readonly cardsUrl = 'https://api.pokemontcg.io/v2/cards';

  /**
   * Obtiene una selección de cartas o busca coincidencias por nombre.
   *
   * @param searchText Nombre completo o parcial ingresado por el usuario.
   * @returns Observable con un máximo de doce cartas.
   */
  searchCards(searchText = ''): Observable<PokemonTcgCard[]> {
    const query = this.prepareQuery(searchText);
    let params = new HttpParams()
      .set('page', 1)
      .set('pageSize', 12)
      .set('orderBy', '-set.releaseDate,name')
      .set('select', 'id,name,supertype,subtypes,hp,types,rarity,set,images');

    if (query) {
      params = params.set('q', `name:${query}*`);
    }

    return this.http
      .get<PokemonTcgResponse>(this.cardsUrl, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Elimina caracteres reservados y prepara una consulta parcial segura.
   *
   * @param value Texto ingresado en el buscador.
   * @returns Término compatible con la sintaxis de búsqueda de la API.
   */
  private prepareQuery(value: string): string {
    return value
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .join('*');
  }
}

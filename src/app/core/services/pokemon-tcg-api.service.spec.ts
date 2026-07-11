import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PokemonTcgResponse } from '../models/pokemon-tcg.models';
import { PokemonTcgApiService } from './pokemon-tcg-api.service';

describe('PokemonTcgApiService', () => {
  let service: PokemonTcgApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PokemonTcgApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PokemonTcgApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe retornar cartas al simular una respuesta de la API', () => {
    const mockResponse: PokemonTcgResponse = {
      data: [
        {
          id: 'basep-1',
          name: 'Pikachu',
          supertype: 'Pokémon',
          subtypes: ['Basic'],
          hp: '60',
          types: ['Lightning'],
          rarity: 'Promo',
          set: {
            id: 'basep',
            name: 'Wizards Black Star Promos',
            releaseDate: '1999/07/01',
          },
          images: {
            small: 'https://images.pokemontcg.io/basep/1.png',
            large: 'https://images.pokemontcg.io/basep/1_hires.png',
          },
        },
      ],
      page: 1,
      pageSize: 12,
      count: 1,
      totalCount: 1,
    };

    service.searchCards('pikachu').subscribe(cards => {
      expect(cards.length).toBe(1);
      expect(cards[0].name).toBe('Pikachu');
      expect(cards[0].set.name).toBe('Wizards Black Star Promos');
      expect(cards[0].images.small).toContain('basep/1.png');
    });

    const request = httpMock.expectOne(req =>
      req.url === 'https://api.pokemontcg.io/v2/cards'
      && req.params.get('q') === 'name:pikachu*'
      && req.params.get('page') === '1'
      && req.params.get('pageSize') === '12'
      && req.params.get('select') === 'id,name,supertype,subtypes,hp,types,rarity,set,images'
    );

    expect(request.request.method).toBe('GET');

    request.flush(mockResponse);
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Product } from '../models/store.models';
import { ProductJsonServerService } from './product-json-server.service';

describe('ProductJsonServerService', () => {
  let service: ProductJsonServerService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 'catan',
    nombre: 'Catan',
    aliases: ['Catan'],
    precio: 33990,
    imagen: '/img/catan.png',
    categoria: 'Estrategia',
    stock: 10,
    estado: 'activo',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductJsonServerService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProductJsonServerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe retornar los productos al simular una respuesta GET', () => {
    service.getProducts().subscribe(products => {
      expect(products).toEqual([mockProduct]);
    });

    const request = httpMock.expectOne('http://localhost:3000/productos');
    expect(request.request.method).toBe('GET');

    request.flush([mockProduct]);
  });

  it('debe actualizar un producto mediante PUT con los datos recibidos', () => {
    const updatedProduct: Product = { ...mockProduct, precio: 29990, stock: 6 };

    service.updateProduct(mockProduct.id, updatedProduct).subscribe(product => {
      expect(product.precio).toBe(29990);
      expect(product.stock).toBe(6);
    });

    const request = httpMock.expectOne('http://localhost:3000/productos/catan');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(updatedProduct);

    request.flush(updatedProduct);
  });
});

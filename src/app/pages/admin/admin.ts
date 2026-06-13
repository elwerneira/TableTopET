import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Product, User } from '../../core/models/store.models';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';

type AdminView = 'resumen' | 'usuarios' | 'productos';

@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  readonly catalog = inject(CatalogService);
  readonly activeView = signal<AdminView>('resumen');
  readonly users = signal<User[]>([]);
  readonly userFeedback = signal('');
  readonly productFeedback = signal('');
  readonly editingProductId = signal<string | null>(null);

  private readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly productForm = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    categoria: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(1)]],
    precioOriginal: [0, Validators.min(0)],
    stock: [0, [Validators.required, Validators.min(0)]],
    estado: ['activo' as Product['estado'], Validators.required],
    imagen: ['', Validators.required],
    oferta: [''],
  });

  ngOnInit(): void {
    if (this.auth.session()?.rol !== 'admin') {
      void this.router.navigate(['/login']);
      return;
    }
    this.refreshUsers();
  }

  showView(view: AdminView): void {
    this.activeView.set(view);
    this.userFeedback.set('');
    this.productFeedback.set('');
  }

  activeUsers(): number {
    return this.users().filter(user => user.estado === 'activo').length;
  }

  totalStock(): number {
    return this.catalog.products().reduce((total, product) => total + product.stock, 0);
  }

  updateUser(user: User, rol: User['rol'], estado: User['estado']): void {
    const result = this.auth.updateUser(user.usuario, { rol, estado });
    this.userFeedback.set(result.message);
    this.refreshUsers();
  }

  editProduct(product: Product): void {
    this.editingProductId.set(product.id);
    this.productFeedback.set('');
    this.productForm.setValue({
      nombre: product.nombre,
      categoria: product.categoria,
      precio: product.precio,
      precioOriginal: product.precioOriginal ?? 0,
      stock: product.stock,
      estado: product.estado,
      imagen: product.imagen,
      oferta: product.oferta ?? '',
    });
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.productFeedback.set('Revisa los campos del producto antes de guardar.');
      return;
    }

    const value = this.productForm.getRawValue();
    const editingId = this.editingProductId();
    const product: Product = {
      id: editingId ?? this.createProductId(value.nombre),
      nombre: value.nombre.trim(),
      aliases: [value.nombre.trim()],
      precio: value.precio,
      imagen: this.normalizeImagePath(value.imagen),
      categoria: value.categoria,
      stock: value.stock,
      estado: value.estado,
      ...(value.precioOriginal > 0 ? { precioOriginal: value.precioOriginal } : {}),
      ...(value.oferta.trim() ? { oferta: value.oferta.trim() } : {}),
    };

    const products = editingId
      ? this.catalog.products().map(current => current.id === editingId ? product : current)
      : [...this.catalog.products(), product];

    this.catalog.save(products);
    this.productFeedback.set(editingId ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
    this.cancelEdit(false);
  }

  cancelEdit(clearFeedback = true): void {
    this.editingProductId.set(null);
    this.productForm.reset({
      nombre: '',
      categoria: '',
      precio: 0,
      precioOriginal: 0,
      stock: 0,
      estado: 'activo',
      imagen: '',
      oferta: '',
    });
    if (clearFeedback) {
      this.productFeedback.set('');
    }
  }

  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-CL')}`;
  }

  private refreshUsers(): void {
    this.users.set(this.auth.listUsers());
  }

  private createProductId(name: string): string {
    const base = name.trim().toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'producto';
    let id = base;
    let suffix = 2;
    while (this.catalog.products().some(product => product.id === id)) {
      id = `${base}-${suffix++}`;
    }
    return id;
  }

  private normalizeImagePath(path: string): string {
    const normalized = path.trim().replace(/\\/g, '/');
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }
}

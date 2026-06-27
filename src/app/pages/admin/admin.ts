import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Product, User } from '../../core/models/store.models';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';

/** Secciones disponibles dentro del panel administrativo. */
type AdminView = 'resumen' | 'usuarios' | 'productos';

/**
 * Panel administrativo para consultar indicadores, gestionar usuarios y editar productos.
 */
@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  /** Catálogo expuesto para mostrar y actualizar productos. */
  readonly catalog = inject(CatalogService);

  /** Sección visible actualmente dentro del panel. */
  readonly activeView = signal<AdminView>('resumen');

  /** Usuarios registrados que se presentan en la sección administrativa. */
  readonly users = signal<User[]>([]);

  /** Mensaje generado por las operaciones sobre usuarios. */
  readonly userFeedback = signal('');

  /** Mensaje generado por las operaciones sobre productos. */
  readonly productFeedback = signal('');

  /** Identificador del producto que se encuentra en edición. */
  readonly editingProductId = signal<string | null>(null);

  /** Servicio encargado de consultar y modificar usuarios. */
  private readonly auth = inject(AuthService);

  /** Constructor utilizado para definir el formulario reactivo. */
  private readonly formBuilder = inject(FormBuilder);

  /** Enrutador utilizado para proteger el acceso administrativo. */
  private readonly router = inject(Router);

  /** Formulario reactivo utilizado para crear o editar productos. */
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

  /** Comprueba el rol administrativo y carga los usuarios registrados. */
  ngOnInit(): void {
    if (this.auth.session()?.rol !== 'admin') {
      void this.router.navigate(['/login']);
      return;
    }
    this.refreshUsers();
  }

  /**
   * Cambia la sección visible y limpia los mensajes anteriores.
   *
   * @param view Sección administrativa que debe mostrarse.
   */
  showView(view: AdminView): void {
    this.activeView.set(view);
    this.userFeedback.set('');
    this.productFeedback.set('');
  }

  /**
   * Calcula la cantidad de cuentas que se encuentran activas.
   *
   * @returns Número de usuarios con estado activo.
   */
  activeUsers(): number {
    return this.users().filter(user => user.estado === 'activo').length;
  }

  /**
   * Suma las unidades disponibles de todos los productos.
   *
   * @returns Stock total del catálogo.
   */
  totalStock(): number {
    return this.catalog.products().reduce((total, product) => total + product.stock, 0);
  }

  /**
   * Actualiza el rol y estado de una cuenta registrada.
   *
   * @param user Usuario que debe modificarse.
   * @param rol Nuevo rol de la cuenta.
   * @param estado Nuevo estado de la cuenta.
   */
  updateUser(user: User, rol: User['rol'], estado: User['estado']): void {
    const result = this.auth.updateUser(user.usuario, { rol, estado });
    this.userFeedback.set(result.message);
    this.refreshUsers();
  }

  /**
   * Carga un producto existente dentro del formulario de edición.
   *
   * @param product Producto seleccionado desde el catálogo.
   */
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

  /** Valida y guarda un producto nuevo o los cambios de uno existente. */
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

  /**
   * Finaliza la edición y restablece el formulario de productos.
   *
   * @param clearFeedback Indica si también debe limpiarse el mensaje mostrado.
   */
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

  /**
   * Formatea un monto utilizando la configuración regional chilena.
   *
   * @param value Monto que debe formatearse.
   * @returns Precio preparado para la interfaz.
   */
  formatPrice(value: number): string {
    return `$${value.toLocaleString('es-CL')}`;
  }

  /** Vuelve a cargar desde autenticación la lista de usuarios registrados. */
  private refreshUsers(): void {
    this.users.set(this.auth.listUsers());
  }

  /**
   * Genera un identificador único y legible para un producto nuevo.
   *
   * @param name Nombre desde el cual se construirá el identificador.
   * @returns Identificador que no se repite dentro del catálogo.
   */
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

  /**
   * Normaliza una ruta de imagen y garantiza que comience con `/`.
   *
   * @param path Ruta ingresada en el formulario.
   * @returns Ruta preparada para utilizarse en la aplicación.
   */
  private normalizeImagePath(path: string): string {
    const normalized = path.trim().replace(/\\/g, '/');
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Campo de búsqueda reutilizable para filtrar productos de un catálogo.
 *
 * Recibe su configuración desde el componente padre y comunica cada cambio
 * mediante un evento. El valor del campo se enlaza utilizando `ngModel`.
 */
@Component({
  selector: 'app-catalog-filter',
  imports: [FormsModule],
  templateUrl: './catalog-filter.html',
  styleUrl: './catalog-filter.css',
})
export class CatalogFilter {
  /** Texto descriptivo que acompaña al campo de búsqueda. */
  @Input() label = 'Buscar producto';

  /** Texto de ayuda mostrado dentro del campo. */
  @Input() placeholder = 'Escribe un nombre';

  /** Evento emitido hacia el componente padre cuando cambia la búsqueda. */
  @Output() readonly queryChange = new EventEmitter<string>();

  /** Valor enlazado al campo mediante `ngModel`. */
  query = '';

  /**
   * Notifica al componente padre el nuevo término de búsqueda.
   *
   * @param value Texto ingresado por el usuario.
   */
  notifyChange(value: string): void {
    this.queryChange.emit(value.trim());
  }
}

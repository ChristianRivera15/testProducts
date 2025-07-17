import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopUpNewRegisterProductsComponent } from './pop-up-new-register-products/pop-up-new-register-products.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ConfirmModalComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})

export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  isLoading = false;
  searchTerm = '';
  itemsPerPage = 10;
  currentPage = 1;
  totalItems = this.filteredProducts.length;
  showDeleteModal: boolean = false;
  private unsuscribe$ = new Subject<void>();
  private apiUrl = 'http://localhost:3002/bp/products';
  productToDelete: any 
  
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private snackBar: MatSnackBar  
  ) {}
  
  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.unsuscribe$.next();
    this.unsuscribe$.complete();
  }
  
  loadProducts(): void {
    this.isLoading = true;
    this.http.get(this.apiUrl)
    .subscribe((res: any) => {
      this.products = res.data;
      this.filteredProducts = [...this.products];
      this.totalItems = this.products.length;
      this.isLoading = false;
    })
  }
  
  filterProducts(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        (product.name || '').toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term));
      }
      this.totalItems = this.filteredProducts.length;
      this.currentPage = 1;
  }
  
  get paginatedProducts(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  onEditProduct(product: any): void {
    this.onAddProduct(product, false);
  }
  
  onDeleteProduct(id: string){
    this.productToDelete = this.products.find(p => p.id === id);
    this.showDeleteModal = true;
  }
  
  deleteProduct() {
    if (this.productToDelete) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/${this.productToDelete.id}`)
      .pipe(takeUntil(this.unsuscribe$))
      .subscribe({
        next: () => {
          this.snackBar.open(
            'Producto eliminado exitosamente.',
            'Cerrar',
            { duration: 3000 });
            this.loadProducts();
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Error al eliminar el producto';
          
          if (error.status === 404) {
            errorMessage = 'No se encontró el producto a eliminar';
          }
          
          this.snackBar.open(
            errorMessage,
            'Cerrar',{ duration: 3000 });
          },
          complete: () => {
            this.showDeleteModal = false;
            this.productToDelete = null;
          }
        });
      }
  }
  
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }
  
  onAddProduct(data: any = {}, isNew: boolean) {
  let title = isNew ? 'Agregar' : 'Actualizar ' + data.name;
  let dialogRef: MatDialogRef<any> = this.dialog.open(
    PopUpNewRegisterProductsComponent,
    {
      width: '560px',
      disableClose: false,
      panelClass: 'custom-modalbox',
      data: {
        title: title,
        payload: data,
        isNew: isNew
      },
    });

  dialogRef.beforeClosed().subscribe((res) => {
    if (res) {

      if (isNew) {
        this.verifyProductId(res, isNew);
      } else {
        this.saveProduct(res, isNew);
      }
    }
  });
}

  verifyProductId(res: any, isNew: boolean){
    this.isLoading = true;
    this.http.get(`${this.apiUrl}/verification/${res.id}`)
    .pipe(takeUntil(this.unsuscribe$))
    .subscribe({
      next: (exists) => {
        this.isLoading = false;
        if (exists) {
          this.snackBar.open(`El producto con ID "${res.id}" ya existe.`, 'Cerrar', { duration: 3000 });
        } else {
          this.saveProduct(res, isNew);
        }
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al verificar el producto.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  saveProduct(res: any, isNew: boolean) {
  const obj = isNew
    ? this.http.post(`${this.apiUrl}`, res)
    : this.http.put(`${this.apiUrl}/${res.id}`, res);

  obj.pipe(takeUntil(this.unsuscribe$))
    .subscribe({
      next: () => {
        this.snackBar.open(
          isNew ? 'Producto registrado exitosamente.' : 'Producto actualizado exitosamente.',
          'Cerrar',
          { duration: 3000 }
        );
        this.loadProducts();
      },
      error: (error) => {
        this.snackBar.open(
          `Error al ${isNew ? 'registrar' : 'actualizar'} el producto.`,
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
}
}
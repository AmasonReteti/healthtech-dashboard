import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../services/product.service';
import { SupplierService, Supplier } from '../services/supplier.service';
import { toFriendlyMessage } from '../utils/http-error.util';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  products = signal<Product[]>([]);
  suppliers = signal<Supplier[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  submitting = signal<boolean>(false);
  showForm = signal<boolean>(false);

  // Maps product id -> a data URL image of its QR code, generated 
  // once each product list loads
  qrCodes = signal<{ [productId: number]: string }>({});

  name: string = '';
  sku: string = '';
  category: string = 'MEDICATION';
  unitPrice: number = 0;
  reorderLevel: number = 10;
  isControlledSubstance: boolean = false;
  selectedSupplierId: number | null = null;

  constructor(
    private productService: ProductService,
    private supplierService: SupplierService
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => this.suppliers.set(data)
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
        this.generateQrCodes(data);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(toFriendlyMessage(err));
      }
    });
  }

  // Encodes just the product's id as plain text inside the QR code - 
  // simple and unambiguous, since scanning just needs to recover 
  // this one number to look the product up again
  private generateQrCodes(products: Product[]): void {
    products.forEach((product) => {
      QRCode.toDataURL(`PRODUCT:${product.id}`, { width: 150 }).then((dataUrl) => {
        this.qrCodes.update((current) => ({ ...current, [product.id]: dataUrl }));
      });
    });
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.selectedSupplierId) {
      this.errorMessage.set('Please select a supplier.');
      return;
    }

    this.submitting.set(true);

    this.productService.createProduct({
      name: this.name,
      sku: this.sku,
      category: this.category,
      unitPrice: this.unitPrice,
      reorderLevel: this.reorderLevel,
      isControlledSubstance: this.isControlledSubstance,
      supplier: { id: this.selectedSupplierId }
    }).subscribe({
      next: (newProduct) => {
        this.submitting.set(false);
        this.successMessage.set(`${newProduct.name} added successfully.`);
        this.products.update((current) => [...current, newProduct]);
        this.generateQrCodes([newProduct]);

        this.name = '';
        this.sku = '';
        this.category = 'MEDICATION';
        this.unitPrice = 0;
        this.reorderLevel = 10;
        this.isControlledSubstance = false;
        this.selectedSupplierId = null;
        this.showForm.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(toFriendlyMessage(err));
      }
    });
  }
}

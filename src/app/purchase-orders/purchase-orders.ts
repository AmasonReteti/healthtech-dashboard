import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderService, PurchaseOrder } from '../services/purchase-order.service';
import { toFriendlyMessage } from '../utils/http-error.util';

@Component({
  selector: 'app-purchase-orders',
  imports: [CommonModule],
  templateUrl: './purchase-orders.html',
  styleUrl: './purchase-orders.css'
})
export class PurchaseOrders implements OnInit {

  orders = signal<PurchaseOrder[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  generating = signal<boolean>(false);
  processingId = signal<number | null>(null);

  constructor(private purchaseOrderService: PurchaseOrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.purchaseOrderService.getAll().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(toFriendlyMessage(err));
      }
    });
  }

  generate(): void {
    this.generating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.purchaseOrderService.generate().subscribe({
      next: () => {
        this.generating.set(false);
        this.successMessage.set('Checked all products against their reorder levels.');
        this.loadOrders();
      },
      error: (err) => {
        this.generating.set(false);
        this.errorMessage.set(toFriendlyMessage(err));
      }
    });
  }

  submit(id: number): void {
    this.processingId.set(id);
    this.errorMessage.set('');

    this.purchaseOrderService.submit(id).subscribe({
      next: (updated) => {
        this.processingId.set(null);
        this.orders.update((current) =>
          current.map((o) => (o.id === updated.id ? updated : o))
        );
      },
      error: (err) => {
        this.processingId.set(null);
        this.errorMessage.set(toFriendlyMessage(err));
      }
    });
  }
}

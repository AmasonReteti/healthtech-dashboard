import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphqlService, ProductWithStock } from '../services/graphql.service';
import { toFriendlyMessage } from '../utils/http-error.util';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // ONE list now holds everything - products AND their stock arrive 
  // together, in a single request, instead of being fetched and 
  // merged separately like before
  products = signal<ProductWithStock[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  constructor(private graphqlService: GraphqlService) {}

  ngOnInit(): void {
    this.graphqlService.getProductsWithStock().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(toFriendlyMessage(err));
      }
    });
  }

  getStockColor(product: ProductWithStock): string {
    if (product.currentStock <= product.reorderLevel) return 'text-red-600';
    if (product.currentStock <= product.reorderLevel * 1.5) return 'text-yellow-600';
    return 'text-green-600';
  }

  isLowStock(product: ProductWithStock): boolean {
    return product.currentStock <= product.reorderLevel;
  }
}

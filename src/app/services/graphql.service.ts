import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ProductWithStock {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currency: string;
  reorderLevel: number;
  isControlledSubstance: boolean;
  currentStock: number;
  supplier: { name: string };
}

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {

  private apiUrl = environment.apiUrl + '/graphql';

  constructor(private http: HttpClient) {}

  getProductsWithStock(): Observable<ProductWithStock[]> {
    const query = `
      {
        products {
          id
          name
          sku
          category
          unitPrice
          currency
          reorderLevel
          isControlledSubstance
          currentStock
          supplier { name }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query }).pipe(
      map(response => response.data.products)
    );
  }
}

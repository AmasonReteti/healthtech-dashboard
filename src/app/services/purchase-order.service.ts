import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PurchaseOrder {
  id: number;
  quantity: number;
  status: string;
  reason: string;
  product: { name: string; sku: string };
  supplier: { name: string; email: string; phone: string };
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  private apiUrl = `${environment.apiUrl}/api/purchase-orders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.apiUrl);
  }

  generate(): Observable<PurchaseOrder[]> {
    return this.http.post<PurchaseOrder[]>(`${this.apiUrl}/generate`, {});
  }

  submit(id: number): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${id}/submit`, {});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReorderPrediction {
  productId: number;
  productName: string;
  currentStock: number;
  dataSufficient: boolean;
  note: string;
  averageDailyUsage: number | null;
  daysOfStockRemaining: number | null;
  predictedStockoutDate: string | null;
  suggestedReorderQuantity: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReorderPredictionService {

  private apiUrl = `${environment.apiUrl}/api/reorder-predictions`;

  constructor(private http: HttpClient) {}

  getAllPredictions(): Observable<ReorderPrediction[]> {
    return this.http.get<ReorderPrediction[]>(this.apiUrl);
  }
}

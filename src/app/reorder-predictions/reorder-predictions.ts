import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReorderPredictionService, ReorderPrediction } from '../services/reorder-prediction.service';
import { toFriendlyMessage } from '../utils/http-error.util';

@Component({
  selector: 'app-reorder-predictions',
  imports: [CommonModule],
  templateUrl: './reorder-predictions.html',
  styleUrl: './reorder-predictions.css'
})
export class ReorderPredictions implements OnInit {

  predictions = signal<ReorderPrediction[]>([]);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  constructor(private reorderPredictionService: ReorderPredictionService) {}

  ngOnInit(): void {
    this.reorderPredictionService.getAllPredictions().subscribe({
      next: (data) => {
        this.predictions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(toFriendlyMessage(err));
      }
    });
  }

  // Red if stock runs out within a week, yellow within a month, 
  // green otherwise - only meaningful when data is actually sufficient
  getUrgencyColor(prediction: ReorderPrediction): string {
    if (!prediction.dataSufficient || prediction.daysOfStockRemaining === null) {
      return 'bg-gray-100 text-gray-600';
    }
    if (prediction.daysOfStockRemaining <= 7) return 'bg-red-100 text-red-700';
    if (prediction.daysOfStockRemaining <= 30) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }
}

import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../services/product.service';
import { UserService } from '../services/user.service';
import { DepartmentService, Department } from '../services/department.service';
import { BatchService, Batch } from '../services/batch.service';
import { StockMovementService } from '../services/stock-movement.service';
import { toFriendlyMessage } from '../utils/http-error.util';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-stock-movement',
  imports: [FormsModule, CommonModule],
  templateUrl: './stock-movement.html',
  styleUrl: './stock-movement.css'
})
export class StockMovement implements OnInit {

  products = signal<Product[]>([]);
  departments = signal<Department[]>([]);
  allBatches = signal<Batch[]>([]);
  movementTypes = ['IN', 'DISPENSED', 'TRANSFER', 'DAMAGE', 'EXPIRED', 'ADJUSTMENT'];

  selectedProductId: number | null = null;
  selectedType: string = 'IN';
  selectedDepartmentId: number | null = null;
  selectedBatchId: number | null = null;
  quantity: number = 1;
  reason: string = '';
  currentUserId: number | null = null;

  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  submitting = signal<boolean>(false);

  // Controls whether the camera view is currently showing
  scanning = signal<boolean>(false);
  private scanner: Html5Qrcode | null = null;

  batchesForSelectedProduct = computed(() => {
    const productId = this.selectedProductId;
    if (!productId) return [];
    return this.allBatches().filter(b => b.product.id === productId);
  });

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private departmentService: DepartmentService,
    private batchService: BatchService,
    private stockMovementService: StockMovementService
  ) {}

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => this.products.set(data)
    });

    this.departmentService.getAllDepartments().subscribe({
      next: (data) => this.departments.set(data)
    });

    this.batchService.getAllBatches().subscribe({
      next: (data) => this.allBatches.set(data)
    });

    this.userService.getCurrentUser().subscribe({
      next: (user) => this.currentUserId = user.id
    });
  }

  // Starts the device camera and watches for a QR code. "qr-reader" 
  // refers to a specific <div> id in the template that html5-qrcode 
  // takes over to display the live camera feed
  startScan(): void {
    this.errorMessage.set('');
    this.scanning.set(true);
    this.scanner = new Html5Qrcode('qr-reader');

    this.scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 200 },
      (decodedText) => {
        // Our QR codes encode "PRODUCT:<id>" - this extracts just 
        // the numeric part and matches it against our real product list
        const match = decodedText.match(/^PRODUCT:(\d+)$/);
        if (match) {
          const productId = Number(match[1]);
          const found = this.products().find(p => p.id === productId);
          if (found) {
            this.selectedProductId = productId;
            this.stopScan();
          }
        }
      },
      () => {
        // Called continuously while no code is detected yet - 
        // intentionally empty, this is normal and expected while 
        // the camera is just looking
      }
    ).catch(() => {
      this.errorMessage.set('Could not access the camera. Check camera permissions and try again.');
      this.scanning.set(false);
    });
  }

  stopScan(): void {
    if (this.scanner) {
      this.scanner.stop().then(() => this.scanner?.clear());
    }
    this.scanning.set(false);
  }

  onSubmit(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.selectedProductId || !this.currentUserId) {
      this.errorMessage.set('Please select a product and wait for your account to load.');
      return;
    }

    if (this.selectedType === 'TRANSFER' && !this.selectedDepartmentId) {
      this.errorMessage.set('Please select a destination department for this transfer.');
      return;
    }

    if (!this.reason || this.reason.trim().length === 0) {
      this.errorMessage.set('Please provide a reason for this movement.');
      return;
    }

    this.submitting.set(true);

    const payload: any = {
      product: { id: this.selectedProductId },
      type: this.selectedType,
      quantity: this.quantity,
      reason: this.reason,
      performedBy: { id: this.currentUserId }
    };

    if (this.selectedType === 'TRANSFER' && this.selectedDepartmentId) {
      payload.department = { id: this.selectedDepartmentId };
    }

    if (this.selectedType === 'IN' && this.selectedBatchId) {
      payload.batch = { id: this.selectedBatchId };
    }

    this.stockMovementService.recordMovement(payload).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.successMessage.set(`Movement recorded successfully. Status: ${response.status}`);
        this.quantity = 1;
        this.reason = '';
        this.selectedDepartmentId = null;
        this.selectedBatchId = null;
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(toFriendlyMessage(err));
      }
    });
  }
}

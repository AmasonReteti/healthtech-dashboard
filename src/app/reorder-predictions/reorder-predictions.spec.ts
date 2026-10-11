import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReorderPredictions } from './reorder-predictions';

describe('ReorderPredictions', () => {
  let component: ReorderPredictions;
  let fixture: ComponentFixture<ReorderPredictions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReorderPredictions],
    }).compileComponents();

    fixture = TestBed.createComponent(ReorderPredictions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

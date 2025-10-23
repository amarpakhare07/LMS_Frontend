import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizResultsComponent } from './quiz-result';

describe('QuizResultsComponent', () => {
  let component: QuizResultsComponent;
  let fixture: ComponentFixture<QuizResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizResultsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

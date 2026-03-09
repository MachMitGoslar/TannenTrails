import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { QuestionCardComponent } from './question-card.component';
import { MultipleChoiceQuestion } from '../../../core/models/questions.model';

/** Minimal valid MultipleChoiceQuestion used across tests */
function makeQuestion(): MultipleChoiceQuestion {
  return new MultipleChoiceQuestion('test-q1', {
    questionText: 'Was frisst ein Buntspecht?',
    options: ['Holz', 'Eicheln', 'Rinde', 'Borkenkäfer-Larven'],
    correctOptionIndex: 3,
  });
}

describe('QuestionCardComponent', () => {
  let component: QuestionCardComponent;
  let fixture: ComponentFixture<QuestionCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QuestionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionCardComponent);
    component = fixture.componentInstance;

    // Provide the required @Input before the first detectChanges call
    component.question = makeQuestion();
    component.showCard = true;
    component.inRadius = false;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the question text', () => {
    const questionTextEl: HTMLElement = fixture.debugElement.query(
      By.css('.question-text')
    )?.nativeElement;

    expect(questionTextEl).toBeTruthy();
    expect(questionTextEl.textContent).toContain('Was frisst ein Buntspecht?');
  });

  describe('when showCard is false', () => {
    it('should not render the card', () => {
      component.showCard = false;
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.css('ion-card'));
      expect(card).toBeNull();
    });
  });

  describe('when inRadius is true', () => {
    it('should not render the card (GPS proximity guard)', () => {
      component.inRadius = true;
      fixture.detectChanges();

      const card = fixture.debugElement.query(By.css('ion-card'));
      expect(card).toBeNull();
    });
  });

  describe('getQuestionOptions()', () => {
    it('should return the options array for a MultipleChoiceQuestion', () => {
      const options = component.getQuestionOptions();
      expect(options).toEqual(['Holz', 'Eicheln', 'Rinde', 'Borkenkäfer-Larven']);
    });
  });

  describe('getCorrectOptionIndex()', () => {
    it('should return the correct index for a MultipleChoiceQuestion', () => {
      expect(component.getCorrectOptionIndex()).toBe(3);
    });
  });

  describe('canSubmitAnswer()', () => {
    it('should return false when no answer is selected', () => {
      component.selectedAnswer = null;
      expect(component.canSubmitAnswer()).toBeFalse();
    });

    it('should return true when an answer is selected', () => {
      component.selectedAnswer = 2;
      expect(component.canSubmitAnswer()).toBeTrue();
    });
  });

  describe('submitAnswer()', () => {
    it('should emit answerSubmitted with isCorrect true when the correct option is chosen', () => {
      const emittedAnswers: unknown[] = [];
      component.answerSubmitted.subscribe(a => emittedAnswers.push(a));

      component.selectedAnswer = 3; // correctOptionIndex
      component.submitAnswer();

      expect(emittedAnswers.length).toBe(1);
      const answer = emittedAnswers[0] as { isCorrect: boolean };
      expect(answer.isCorrect).toBeTrue();
    });

    it('should emit answerSubmitted with isCorrect false when a wrong option is chosen', () => {
      const emittedAnswers: unknown[] = [];
      component.answerSubmitted.subscribe(a => emittedAnswers.push(a));

      component.selectedAnswer = 0; // wrong option
      component.submitAnswer();

      const answer = emittedAnswers[0] as { isCorrect: boolean };
      expect(answer.isCorrect).toBeFalse();
    });

    it('should set isAnswered to true after submission', () => {
      component.selectedAnswer = 1;
      component.submitAnswer();

      expect(component.isAnswered).toBeTrue();
    });

    it('should set showResult to true only when the answer is correct', () => {
      component.selectedAnswer = 3; // correct
      component.submitAnswer();

      expect(component.showResult).toBeTrue();
    });

    it('should set showResult to false when the answer is wrong', () => {
      component.selectedAnswer = 1; // wrong
      component.submitAnswer();

      expect(component.showResult).toBeFalse();
    });

    it('should not emit when no answer is selected', () => {
      const emittedAnswers: unknown[] = [];
      component.answerSubmitted.subscribe(a => emittedAnswers.push(a));

      component.selectedAnswer = null;
      component.submitAnswer();

      expect(emittedAnswers.length).toBe(0);
    });
  });

  describe('retry counter', () => {
    it('should start with attemptsUsed of 0', () => {
      expect(component.attemptsUsed).toBe(0);
    });

    it('should increment attemptsUsed after each submission', () => {
      component.selectedAnswer = 0;
      component.submitAnswer();

      expect(component.attemptsUsed).toBe(1);
    });

    it('should mark question as completed after 3 wrong attempts', () => {
      for (let i = 0; i < 3; i++) {
        component.isAnswered = false;
        component.isQuestionCompleted = false;
        component.selectedAnswer = 0; // always wrong
        component.submitAnswer();
      }

      expect(component.isQuestionCompleted).toBeTrue();
    });

    it('should mark question as completed immediately on a correct answer', () => {
      component.selectedAnswer = 3; // correct
      component.submitAnswer();

      expect(component.isQuestionCompleted).toBeTrue();
    });
  });

  describe('retriesLeft getter', () => {
    it('should equal maxRetries at the start', () => {
      expect(component.retriesLeft).toBe(component.maxRetries);
    });

    it('should decrease after each wrong submission', () => {
      component.selectedAnswer = 0; // wrong
      component.submitAnswer();

      expect(component.retriesLeft).toBe(component.maxRetries - 1);
    });
  });
});

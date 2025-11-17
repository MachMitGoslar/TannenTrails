import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonRadioGroup,
  IonRadio,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from '@ionic/angular/standalone';
import {
  Question,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  EstimationQuestion,
} from '../../../core/models/questions.model';

export interface QuestionAnswer {
  questionId: string;
  answerValue: any;
  isCorrect: boolean;
}

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonRadioGroup,
    IonRadio,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
  ],
})
export class QuestionCardComponent implements OnInit, OnChanges {
  @Input() question!: Question;
  @Input() inRadius: boolean = false;
  @Input() showCard: boolean = true;
  @Output() answerSubmitted = new EventEmitter<QuestionAnswer>();

  selectedAnswer: any = null;
  estimationInput: number | null = null;
  isAnswered: boolean = false;
  showResult: boolean = false;

  // Retry counter properties
  readonly maxRetries: number = 3;
  attemptsUsed: number = 0;
  isQuestionCompleted: boolean = false;

  constructor() {
    // Icons are now preloaded in AppComponent
  }

  ngOnInit() {
    this.resetAnswer();
  }

  ngOnChanges() {
    if (this.question) {
      this.resetAnswer();
    }
  }

  getQuestionOptions(): string[] {
    if (this.question instanceof MultipleChoiceQuestion) {
      return this.question.options;
    }
    return [];
  }

  getCorrectOptionIndex(): number {
    if (this.question instanceof MultipleChoiceQuestion) {
      return this.question.correctOptionIndex;
    }
    return -1;
  }

  getCorrectAnswer(): boolean {
    if (this.question instanceof TrueFalseQuestion) {
      return this.question.correctAnswer;
    }
    return false;
  }

  getCorrectValue(): number {
    if (this.question instanceof EstimationQuestion) {
      return this.question.correctValue;
    }
    return 0;
  }

  getMarginOfError(): number {
    if (this.question instanceof EstimationQuestion) {
      return this.question.marginOfError;
    }
    return 0;
  }

  canSubmitAnswer(): boolean {
    switch (this.question.type) {
      case 'multiple-choice':
      case 'true-false':
        return this.selectedAnswer !== null && this.selectedAnswer !== undefined;
      case 'estimation':
        return this.estimationInput !== null && this.estimationInput !== undefined;
      default:
        return false;
    }
  }

  submitAnswer() {
    if (!this.canSubmitAnswer() || this.isQuestionCompleted) {
      return;
    }

    const answer = this.getAnswerValue();
    const isCorrect = this.checkAnswer(answer);

    // Increment attempts used
    this.attemptsUsed++;

    const questionAnswer: QuestionAnswer = {
      questionId: this.question.id,
      answerValue: answer,
      isCorrect: isCorrect,
    };

    this.isAnswered = true;
    this.showResult = isCorrect;

    // If answer is correct or max attempts reached, mark as completed
    if (isCorrect || this.attemptsUsed >= this.maxRetries) {
      this.isQuestionCompleted = true;
    }

    this.answerSubmitted.emit(questionAnswer);
  }

  finishExternalTask() {
    this.answerSubmitted.emit({
      questionId: this.question.id,
      answerValue: null,
      isCorrect: true,
    });
  }

  private getAnswerValue(): any {
    switch (this.question.type) {
      case 'multiple-choice':
        return this.selectedAnswer;
      case 'true-false':
        return this.selectedAnswer;
      case 'estimation':
        return this.estimationInput;
      default:
        return null;
    }
  }

  private checkAnswer(answer: any): boolean {
    switch (this.question.type) {
      case 'multiple-choice':
        const mcQuestion = this.question as MultipleChoiceQuestion;
        return answer === mcQuestion.correctOptionIndex;

      case 'true-false':
        const tfQuestion = this.question as TrueFalseQuestion;
        return answer === tfQuestion.correctAnswer;

      case 'estimation':
        const estQuestion = this.question as EstimationQuestion;
        if (answer === null || answer === undefined) return false;
        const difference = Math.abs(answer - estQuestion.correctValue);
        return difference <= estQuestion.marginOfError;

      default:
        return false;
    }
  }

  private resetAnswer() {
    this.selectedAnswer = null;
    this.estimationInput = null;
    this.isAnswered = false;
    this.showResult = false;
    // Reset retry counter when question changes
    if (!this.question || this.attemptsUsed === 0) {
      this.attemptsUsed = 0;
      this.isQuestionCompleted = false;
    }
  }

  resetQuestion() {
    // Only allow reset if not completed and still have attempts
    if (!this.isQuestionCompleted && this.attemptsUsed < this.maxRetries) {
      this.selectedAnswer = null;
      this.estimationInput = null;
      this.isAnswered = false;
      this.showResult = false;
    }
  }

  // Getter methods for template use
  get retriesLeft(): number {
    return Math.max(0, this.maxRetries - this.attemptsUsed);
  }

  get canRetry(): boolean {
    return (
      !this.isQuestionCompleted &&
      this.attemptsUsed < this.maxRetries &&
      this.isAnswered &&
      !this.showResult
    );
  }

  get isLastAttempt(): boolean {
    return this.attemptsUsed === this.maxRetries - 1;
  }

  // Helper method to generate array for *ngFor in template
  getRetryArray(count: number): number[] {
    return Array(count)
      .fill(0)
      .map((x, i) => i);
  }

  // Button state methods for template
  getSubmitButtonColor(): string {
    if (this.isQuestionCompleted) {
      return this.showResult ? 'success' : 'danger';
    }
    if (this.isAnswered) {
      return this.showResult ? 'success' : 'danger';
    }
    return this.isLastAttempt ? 'warning' : 'primary';
  }

  getSubmitButtonIcon(): string {
    if (this.isQuestionCompleted) {
      return this.showResult ? 'checkmark-circle' : 'close-circle';
    }
    if (this.isAnswered) {
      return this.showResult ? 'checkmark-circle' : 'close-circle';
    }
    return this.isLastAttempt ? 'warning' : 'checkmark-circle-outline';
  }

  getSubmitButtonText(): string {
    if (this.isQuestionCompleted) {
      if (this.showResult) {
        return 'Richtig beantwortet!';
      } else {
        return 'Frage beendet';
      }
    }

    if (this.isAnswered) {
      if (this.showResult) {
        return 'Richtig! Gut gemacht!';
      } else {
        if (this.retriesLeft > 0) {
          return `Falsch! Noch ${this.retriesLeft} ${this.retriesLeft === 1 ? 'Versuch' : 'Versuche'} übrig.`;
        } else {
          return 'Leider falsch. Keine Versuche mehr.';
        }
      }
    }

    if (this.isLastAttempt) {
      return 'Letzter Versuch - Antwort prüfen';
    }

    return 'Antwort überprüfen';
  }
}

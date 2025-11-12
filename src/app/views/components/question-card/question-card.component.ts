import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  IonButton
} from '@ionic/angular/standalone';
import { Question, MultipleChoiceQuestion, TrueFalseQuestion, EstimationQuestion } from '../../../core/models/questions.model';

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
    IonButton
  ]
})
export class QuestionCardComponent implements OnInit {
  @Input() question!: Question;
  @Input() inRadius: boolean = false;
  @Input() showCard: boolean = true;
  @Output() answerSubmitted = new EventEmitter<QuestionAnswer>();

  selectedAnswer: any = null;
  estimationInput: number | null = null;
  isAnswered: boolean = false;
  showResult: boolean = false;

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
    if (!this.canSubmitAnswer()) {
      return;
    }

    const answer = this.getAnswerValue();
    const isCorrect = this.checkAnswer(answer);
    
    const questionAnswer: QuestionAnswer = {
      questionId: this.question.id,
      answerValue: answer,
      isCorrect: isCorrect
    };

    this.isAnswered = true;
    this.showResult = isCorrect;
    this.answerSubmitted.emit(questionAnswer);
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
  }

  resetQuestion() {
    this.resetAnswer();
  }
}

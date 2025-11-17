import { documentId } from '@angular/fire/firestore';

export enum QuestionType {
  MultipleChoice = 'multiple-choice',
  TrueFalse = 'true-false',
  Estimation = 'estimation',
}

export class Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'estimation' | 'external' = 'multiple-choice';
  questionText: string = '';

  constructor(id: string, init?: Partial<Question>) {
    this.id = id;
    Object.assign(this, init);
  }
}

export class MultipleChoiceQuestion extends Question {
  options: string[] = [];
  correctOptionIndex: number = 0;
  ptype: QuestionType = QuestionType.MultipleChoice;

  constructor(id: string, init?: Partial<MultipleChoiceQuestion>) {
    super(id, init);
    Object.assign(this, init);
  }
}

export class TrueFalseQuestion extends Question {
  correctAnswer: boolean = true;

  constructor(id: string, init?: Partial<TrueFalseQuestion>) {
    super(id, init);
    Object.assign(this, init);
  }
}

export class EstimationQuestion extends Question {
  correctValue: number = 0;
  marginOfError: number = 0;

  constructor(id: string, init?: Partial<EstimationQuestion>) {
    super(id, init);
    Object.assign(this, init);
  }
}

export class ExternalQuestion extends Question {
  constructor(id: string, init?: Partial<ExternalQuestion>) {
    super(id, init);
    this.type = 'external';
    Object.assign(this, init);
  }
}

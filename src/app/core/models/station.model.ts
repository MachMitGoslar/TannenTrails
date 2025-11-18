import { documentId } from '@angular/fire/firestore';
import { MultipleChoiceQuestion, Question } from './questions.model';

export class Station {
  id: string;
  title: string = '';
  description: string = '';
  imageUrl: string = '';

  positionLat: number = 0;
  positionLng: number = 0;
  radius: number = 50;

  question?: Question = new MultipleChoiceQuestion('test');
  nextStationId?: string = '';

  constructor(id: string, init?: Partial<Station>) {
    this.id = id;
    Object.assign(this, init);
  }
}

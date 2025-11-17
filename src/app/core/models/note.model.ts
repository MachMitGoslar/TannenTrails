export class Note {
  id: string;
  content: string = '';
  createdAt: Date = new Date();
  writtenBy: string = '';
  public: boolean = false;

  constructor(id: string, init?: Partial<Note>) {
    this.id = id;
    Object.assign(this, init);
  }
}

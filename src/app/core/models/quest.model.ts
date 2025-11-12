import { documentId } from '@angular/fire/firestore'
import { Station } from './station.model'
import { Note } from './note.model'

export class Quest {
  id: string
  title: string = ''
  description: string = ''
  imageUrl: string = ''
  stations: Station[] = []
  notes: Note[] = []
  createdAt: Date = new Date()
  updatedAt: Date = new Date()
  publicFrom: Date = new Date()
  publicTo: Date = new Date( 2099, 11, 31 )

  constructor(id: string, init?: Partial<Quest>) {
    this.id = id
    Object.assign(this, init)
  }
}

export class Diary {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date

  constructor(id: string, title: string, content: string, createdAt: Date, updatedAt: Date) {
    this.id = id
    this.title = title
    this.content = content
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  isValid(): boolean {
    return this.id !== '' && !isNaN(this.createdAt.getTime())
  }

  getDate(): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tokyo',
    }
    const formatter = new Intl.DateTimeFormat('ja-JP', options)
    return formatter.format(this.createdAt)
  }

  getPage(): string {
    return `/diary/entry/${this.id}`
  }
}


export type GetAllDiaries = () => Promise<Diary[]>

export type GetDiaryByID = (id: string) => Promise<Diary | null>

export type PutDiary = (diary: Diary) => Promise<Diary>

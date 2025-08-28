export class Diary {
  title: string
  createdAt: Date

  constructor(title: string, createdAt: Date) {
    this.title = title
    this.createdAt = createdAt
  }

  isValid(): boolean {
    return !isNaN(this.createdAt.getTime())
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
}


export type GetAllDiaries = () => Promise<Diary[]>

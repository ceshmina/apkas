export type Diary = {
  title: string,
  createdAt: Date,
}

export type GetAllDiaries = () => Promise<Diary[]>

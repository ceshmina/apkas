import { Diary } from '@apkas/diary/model/entry'
import type { GetAllDiaries, GetDiaryByID } from '@apkas/diary/model/entry'
import { getAllDiariesFromDynamoDB, getDiaryByIDFromDynamoDB } from '@apkas/diary/store/entry'


export const getAllDiaries: GetAllDiaries = async () => {
  return await getAllDiariesFromDynamoDB()
}

export const getDiaryByID: GetDiaryByID = async (id: string) => {
  return await getDiaryByIDFromDynamoDB(id)
}


export const formatDiaryTitle = (diary: Diary) => {
  return diary.getDate() + (diary.title ? `: ${diary.title}` : '')
}

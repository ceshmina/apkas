import { Diary } from '@/model/diary'
import type { GetAllDiaries, GetDiaryByID } from '@/model/diary'
import { getAllDiariesFromDynamoDB, getDiaryByIDFromDynamoDB } from '@/store/diary'


export const getAllDiaries: GetAllDiaries = async () => {
  return await getAllDiariesFromDynamoDB()
}

export const getDiaryByID: GetDiaryByID = async (id: string) => {
  return await getDiaryByIDFromDynamoDB(id)
}


export const formatDiaryTitle = (diary: Diary) => {
  return diary.getDate() + (diary.title ? `: ${diary.title}` : '')
}

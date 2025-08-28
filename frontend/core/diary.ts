import { Diary } from '@/model/diary'
import type { GetAllDiaries } from '@/model/diary'
import { getAllDiariesFromDynamoDB } from '@/store/diary'


export const getAllDiaries: GetAllDiaries = async () => {
  return await getAllDiariesFromDynamoDB()
}


export const formatDiaryTitle = (diary: Diary) => {
  return diary.getDate() + (diary.title ? `: ${diary.title}` : '')
}

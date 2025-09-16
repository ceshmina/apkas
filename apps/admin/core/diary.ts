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


export const formatDateForInput = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo',
  }
  const formatter = new Intl.DateTimeFormat('sv-SE', options)
  return formatter.format(date)
}

export const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  }
  const formatter = new Intl.DateTimeFormat('ja-JP', options)
  return formatter.format(date)
}

import type { GetAllDiaries } from '@/model/diary'
import { getAllDiariesFromDynamoDB } from '@/store/diary'


export const getAllDiaries: GetAllDiaries = async () => {
  return await getAllDiariesFromDynamoDB()
}

import { getDiaryByID } from '@/core/diary'
import Editor from './editor'


export default async function Page({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params
  const diary = await getDiaryByID(id)
  if (!diary) {
    return null
  }
  return (<div>
    <Editor initialTitle={diary.title} initialContent={diary.content} createdAt={diary.createdAt} />
  </div>)
}

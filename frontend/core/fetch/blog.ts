import { parse } from 'date-fns'
import type { Blog, GetAllBlogs, GetAllTags, GetBlogById, GetTagById, Tag } from '@/core/model/blog'

type TagResponse = {
  tag_id: number,
  name: string,
  created_at: string,
  updated_at: string | null,
}

type BlogResponse = {
  blog_id: number,
  title: string,
  content: string,
  created_at: string,
  updated_at: string | null,
  tags: TagResponse[],
}

export const parseTimeIgnoreSubSecond = (time: string): Date => {
  return parse(time.substring(0, 19), "yyyy-MM-dd'T'HH:mm:ss", new Date())
}

export const parseNullableTime = (time: string | null): Date | null => {
  return time ? parseTimeIgnoreSubSecond(time) : null
}

export const transformTagResponse = (tag: TagResponse): Tag => ({
  tag_id: tag.tag_id,
  name: tag.name,
})

export const transformBlogResponse = (blog: BlogResponse): Blog => ({
  blog_id: blog.blog_id,
  title: blog.title,
  content: blog.content,
  created_at: parseTimeIgnoreSubSecond(blog.created_at),
  updated_at: parseNullableTime(blog.updated_at),
  tags: blog.tags.map(transformTagResponse),
})

export const getAllBlogs: GetAllBlogs = async () => {
  const res = await fetch(`${process.env.API_HOST}/v1/blog/all`)
  const json = await res.json()
  return json.blogs.map((blog: BlogResponse) => transformBlogResponse(blog))
}

export const getBlogById: GetBlogById = async (blog_id) => {
  const res = await fetch(`${process.env.API_HOST}/v1/blog/entry/${blog_id}`)
  const json = await res.json()
  return transformBlogResponse(json.blog)
}

export const getAllTags: GetAllTags = async () => {
  const res = await fetch(`${process.env.API_HOST}/v1/tag/all`)
  const json = await res.json()
  return json.tags.map((tag: TagResponse) => transformTagResponse(tag))
}

export const getTagById: GetTagById = async (tag_id) => {
  const res = await fetch(`${process.env.API_HOST}/v1/tag/entry/${tag_id}`)
  const json = await res.json()
  return transformTagResponse(json.tag)
}

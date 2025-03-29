export type Tag = {
  tag_id: number,
  name: string,
}

export type Blog = {
  blog_id: number,
  title: string,
  content: string,
  created_at: Date,
  updated_at: Date | null,
  tags: Tag[],
}

export type GetAllBlogs = () => Promise<Blog[]>
export type GetBlogById = (blog_id: number) => Promise<Blog | null>
export type GetAllTags = () => Promise<Tag[]>
export type GetTagById = (tag_id: number) => Promise<Tag | null>

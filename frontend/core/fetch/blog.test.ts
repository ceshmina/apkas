import { test, expect } from 'bun:test'
import {
  parseNullableTime,
  parseTimeIgnoreSubSecond,
  transformBlogResponse,
  transformTagResponse
} from '@/core/fetch/blog'

test('parseTimeIgnoreSubSecond', () => {
  expect(parseTimeIgnoreSubSecond('2025-01-01T00:00:00')).toEqual(new Date('2025-01-01 00:00:00'))
  expect(parseTimeIgnoreSubSecond('2025-01-01T00:00:00.123456')).toEqual(new Date('2025-01-01 00:00:00'))
})

test('parseNullableTime', () => {
  expect(parseNullableTime('2025-01-01T00:00:00')).toEqual(new Date('2025-01-01 00:00:00'))
  expect(parseNullableTime('2025-01-01T00:00:00.123456')).toEqual(new Date('2025-01-01 00:00:00'))
  expect(parseNullableTime(null)).toEqual(null)
})

test('transformTagResponse', () => {
  const res = {
    tag_id: 1,
    name: 'tag',
    created_at: '2025-01-01T00:00:00',
    updated_at: null,
  }
  expect(transformTagResponse(res)).toEqual({
    tag_id: 1,
    name: 'tag',
  })
})

test('transformBlogResponse', () => {
  const res = {
    blog_id: 1,
    title: 'title',
    content: 'content',
    created_at: '2025-01-01T00:00:00',
    updated_at: null,
    tags: [
      {
        tag_id: 1,
        name: 'tag',
        created_at: '2025-01-01T00:00:00',
        updated_at: null,
      },
    ],
  }
  expect(transformBlogResponse(res)).toEqual({
    blog_id: 1,
    title: 'title',
    content: 'content',
    created_at: new Date('2025-01-01T00:00:00'),
    updated_at: null,
    tags: [
      {
        tag_id: 1,
        name: 'tag',
      },
    ],
  })
})

import { test, expect } from 'bun:test'
import { add } from '@/core/sample'

test('add', () => {
  expect(add(1, 2)).toBe(3)
})

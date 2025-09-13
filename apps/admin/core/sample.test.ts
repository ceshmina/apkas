import { expect, test } from 'bun:test'

import { add } from './sample'


test('サンプルテスト', () => {
  expect(add(1, 2)).toBe(3)
})

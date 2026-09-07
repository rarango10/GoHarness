import { act, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'

beforeEach(() => {
  document.body.innerHTML = '<div id="root"></div>'
})

test('main.tsx monta App en el elemento root real', async () => {
  await act(async () => {
    await import('./main')
  })

  expect(
    screen.getByRole('textbox', { name: 'Primer número' }),
  ).toBeInTheDocument()
})

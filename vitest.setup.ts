import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Mock lucide-react icons
import { vi } from 'vitest'

vi.mock('lucide-react', () => ({
  Loader2: () => React.createElement('div', { 'data-testid': 'loader-icon' }, 'Loader'),
  CircleQuestionMark: () => React.createElement('div', { 'data-testid': 'question-icon' }, '?'),
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})

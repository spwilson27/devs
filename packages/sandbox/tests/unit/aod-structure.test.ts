import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('AOD structure', () => {
  const agentDir = path.resolve(__dirname, '../../.agent')
  const files = [
    'CONTEXT.md',
    'DECISIONS.md',
    'CONSTRAINTS.md',
    'DEPENDENCIES.md',
    'PROGRESS.md',
  ].map(f => path.join(agentDir, f))

  it('has .agent directory and AOD files with headings', () => {
    expect(fs.existsSync(agentDir)).toBe(true)
    for (const file of files) {
      expect(fs.existsSync(file)).toBe(true)
      const content = fs.readFileSync(file, 'utf8')
      expect(content.trim().length).toBeGreaterThan(0)
      expect(/(^|\n)#\s+/.test(content)).toBe(true)
      expect(/(^|\n)##\s+/.test(content)).toBe(true)
    }
  })
})

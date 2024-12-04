import { runCommand } from '@oclif/test'
import { expect } from 'chai'

describe('encode', () => {
  it('provides error if no args', async () => {
    const { error } = await runCommand('encode', undefined, { print: true })
    expect(error?.message).to.contain('Missing 1 required arg')
  })

  it('runs encode test/test-image.png', async () => {
    const { stdout, error } = await runCommand('encode test/test-image.png')
    expect(stdout).to.contain('LDLn$38|NE}@^4=tR5N^v}ozEh-o')
  })

  it('runs encode with optional flags', async () => {
    const { stdout } = await runCommand('encode test/test-image.png -r -y 5 -x 5')
    expect(stdout).to.contain('eDLn$38|NE}@}r^4=tR5N^Fyv}ozEh-oIpn4Nf%fR5xYZ%tQkWxFaf')
  })
})

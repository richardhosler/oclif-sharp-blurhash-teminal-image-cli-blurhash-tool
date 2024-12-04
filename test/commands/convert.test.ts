import { runCommand } from '@oclif/test'
import { expect } from 'chai'
import sharp from 'sharp'

describe('convert', () => {
  it('provides error if no args', async () => {
    const { error } = await runCommand('convert')
    expect(error?.message).to.contain('Missing 2 required args')
  })

  it('provides the expected output', async () => {
    const { error } = await runCommand('convert test/test-image.png test/output.png -c 5-5 -d 10-10')
    const testImage = await sharp('test/test-output.png').toArray();
    const outputImage = await sharp('test/output.png').toArray();
    const testPixels = testImage.toString();
    const outputPixels = outputImage.toString();

    expect(testPixels).to.equal(outputPixels);
  });
})

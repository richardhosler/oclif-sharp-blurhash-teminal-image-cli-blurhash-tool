import { Args, Command, Flags } from '@oclif/core'
import { readFileSync } from 'fs'
import { encode, decode } from 'blurhash'
import sharp from 'sharp'
import { displayTable } from '../table.js'

export default class Convert extends Command {
  static override args = {
    input: Args.string({ description: 'file to read', required: true }),
    output: Args.string({ description: 'file to output', required: true })
  }

  static override description = 'convert an image file to a blurred image file'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    components: Flags.string({ char: 'c', description: 'components to use x*y eg. [componentX-componentY]' }),
    dimensions: Flags.string({ char: 'd', description: 'dimensions of output file [width-height]' }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Convert)

    const [componentX, componentY] = flags.components ? flags.components.split('-') : ['4', '3'];
    const [widthString, heightString] = flags.dimensions ? flags.dimensions.split('-') : ['40', '30'];
    const height = parseInt(heightString);
    const width = parseInt(widthString);

    const imageData = readFileSync(args.input);
    const { data, info } = await sharp(imageData)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });
    const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, parseInt(componentX), parseInt(componentY));

    const pixels = decode(blurhash, width, height);
    const buffer = Buffer.from(pixels);
    const sharpImage = sharp(buffer, { raw: { channels: 4, height, width } });
    sharpImage.toFile(args.output);

    displayTable({
      boldHeading: true,
      data: {
        headers: ['Input file', 'Output file', 'Components', 'Dimensions'],
        values: [[args.input, args.output, `${componentX}-${componentY}`, `${width}-${height}`]]
      }
    })
  }
}

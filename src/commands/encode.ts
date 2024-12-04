import { Args, Command, Flags } from '@oclif/core';
import { encode } from 'blurhash';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

import { displayTable } from '../table.js';
import { stdout } from 'node:process';

export default class Encode extends Command {
  static override args = {
    file: Args.string({ description: 'file to read', required: true }),
  };

  static override description = 'Encode a given image to its blurhash.';

  static override flags = {
    componentX: Flags.integer({ char: 'x' }),
    componentY: Flags.integer({ char: 'y' }),
    raw: Flags.boolean({ char: 'r' }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Encode);

    const componentX = flags.componentX ?? 4;
    const componentY = flags.componentY ?? 3;
    const { raw } = flags;

    const imageData = readFileSync(args.file);
    const { data, info } = await sharp(imageData)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });
    const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, componentX, componentY);
    if (raw) {
      stdout.write(`${blurhash}\n`);
    } else {
      displayTable(
        {
          boldHeading: true, data: {
            headers: ['File', 'BlurHash', 'ComponentX', 'ComponentY'],
            values: [[args.file, blurhash, componentX.toString(), componentY.toString()]],
          }
        }
      )
    }
  }
}
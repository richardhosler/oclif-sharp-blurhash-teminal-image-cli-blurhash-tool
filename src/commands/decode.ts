import { Args, Command, Flags } from "@oclif/core";
import { decode } from "blurhash";
import sharp from "sharp";
import terminalImage from "terminal-image";
import { stdout } from "node:process";

import { displayTable } from "../table.js";

export default class Decode extends Command {
  static override args = {
    blurhash: Args.string({ description: "Blurhash to decode", required: true }),
  };

  static override description = "Decode a given blurhash to an image.";

  static override flags = {
    file: Flags.string({
      char: "f",
      description: "output file path"
    }),
    height: Flags.integer({
      char: "h",
      description: "height of the decoded image"
    }),
    preview: Flags.boolean({
      char: "p",
      description: "preview the image in terminal"
    }),
    width: Flags.integer({ char: "w", description: "width of the decoded image" })
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Decode);

    const { blurhash } = args;
    const height = flags.height ?? 30;
    const width = flags.width ?? 40;
    const { preview, file } = flags;

    const pixels = decode(blurhash, width, height);
    const buffer = Buffer.from(pixels);
    const sharpImage = sharp(buffer, { raw: { channels: 4, height, width } });

    if (file) {
      sharpImage.toFile(file);
      displayTable({
        boldHeading: true,
        data: {
          headers: ["BlurHash", "Width", "Height", "Output file"],
          values: [[blurhash, width?.toString() ?? "8", height?.toString() ?? "8", file]],
        },
      });
    } else {
      displayTable({
        boldHeading: true,
        data: {
          headers: ["BlurHash", "Width", "Height"],
          values: [[blurhash, width?.toString() ?? "8", height?.toString() ?? "8"]],
        },
      });
    }

    if (preview) {
      stdout.write("\nImage preview:\n")
      const imageBuffer = await sharpImage.png().toBuffer();
      const renderedImage = await terminalImage.buffer(imageBuffer, { height, width, });
      stdout.write(`${renderedImage}\n`);
    }
  }
}
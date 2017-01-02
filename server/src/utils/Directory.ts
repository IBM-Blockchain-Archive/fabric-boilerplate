import * as fs from 'fs';
import * as path from 'path';

export class Directory {
  public constructor(private directoryPath: string) { }

  public getDirectChildDirectories(): string[] {
    return this.getOnlyDirectories(fs.readdirSync(this.directoryPath));
  }

  private getOnlyDirectories(directoryAndFilenames: string[]): string[] {
    let directories = [];
    for (let directoryOrFilename of directoryAndFilenames) {
      let fullDirectoryOrFilename = path.join(this.directoryPath, directoryOrFilename);
      if (fs.lstatSync(fullDirectoryOrFilename).isDirectory()) {
        directories.push(fullDirectoryOrFilename);
      }
    }

    return directories;
  }
}
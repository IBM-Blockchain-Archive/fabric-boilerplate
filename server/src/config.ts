'use strict';

import * as path from 'path';

export class Config {
  public getSecret(): string {
    return 'sUp4hS3cr37kE9c0D3';
  }

  public static getServerDirectory(): string {
    return path.join(process.cwd(), 'dist');
  }
}
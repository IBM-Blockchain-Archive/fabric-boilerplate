import * as crypto from 'crypto';

export class Password {
  public constructor(private password: string, private salt: string) { }

  public toHash(): string {
    return crypto.pbkdf2Sync(this.password, this.salt, 1000, 64, 'sha256').toString('hex');
  }
}
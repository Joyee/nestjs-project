import { Injectable } from '@nestjs/common';
import { CosService } from './common/shared-service/cos.service';

@Injectable()
export class AppService {
  constructor(private readonly cosService: CosService) {}

  async upload(file) {
    const existFile = await this.cosService.getFile(file.filename, file.path);
    if (existFile.url) {
      return existFile;
    }
    return await this.cosService.uploadFile(file.filename, file.path);
  }
}

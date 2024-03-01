import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { HttpException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const COS = require('cos-nodejs-sdk-v5');

export interface UploadFileRo {
  filename?: string;
  url: string;
}

@Injectable()
export class CosService {
  private cosPath: string;
  private urlPrefix: string;

  async uploadFile(cosName: string, localPath: string): Promise<UploadFileRo> {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: process.env.Bucket,
        Region: process.env.Region,
        Key: this.cosPath + cosName,
        FilePath: localPath, // 本地文件地址，需自行替换
        SliceSize: 1024 * 1024 * 5, // 触发分块上传的阈值，超过5MB使用分块上传，非必须
      };
      COS.uploadFile(
        {
          ...params,
          onFileFinish: (err, data, options) => {
            console.log(options.Key + '上传' + (err ? '失败' : '完成'));
          },
        },
        (err, data) => {
          fs.unlinkSync(localPath);
          if (err) {
            throw new HttpException(err, 401);
          }
          resolve({
            url: 'https://' + data.Location,
            filename: cosName,
          });
        },
      );
    });
  }

  async getFile(filename: string, localPath: string): Promise<UploadFileRo> {
    return new Promise((resolve, reject) => {
      COS.getBucket(
        {
          Bucket: process.env.Bucket,
          Region: process.env.Region,
          Prefix: this.cosPath + filename,
        },
        (err, data) => {
          fs.unlinkSync(localPath);
          if (err) {
            reject(err);
            throw new HttpException(err, 401);
          }
          if (data.Contents && data.Contents.length > 0) {
            resolve({ url: this.urlPrefix + this.cosPath + filename });
          } else {
            resolve({ url: '' });
          }
        },
      );
    });
  }
}

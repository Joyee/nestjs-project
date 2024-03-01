import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import multer from 'multer';
import * as fs from 'fs';
import crypto from 'crypto';

function getMd5File(file) {
  const buffer = Buffer.from(JSON.stringify(file), 'utf-8');
  const md5File = crypto
    .createHash('md5')
    .update(JSON.stringify(buffer))
    .digest('hex');
  return md5File;
}

const image = ['gif', 'png', 'jpg', 'jpeg', 'bmp', 'webp'];
const video = ['mp4', 'webm'];
const audio = ['mp3', 'wav', 'ogg'];
const config = {
  fileTempPath: '',
};

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      // 对文件的名字以及后缀名进行一下处理
      storage: multer.diskStorage({
        // 配置上传后文件存储位置
        destination: (req, file, cb) => {
          // 根据上传的文件类型将图片视频音频和其他类型的文件分别存储到对应英文文件夹
          const mimeType = file.mimetype.split('/')[1];
          let temp = 'other';
          image.filter((item) => item === mimeType).length > 0
            ? (temp = 'image')
            : '';
          video.filter((item) => item === mimeType).length > 0
            ? (temp = 'video')
            : '';
          audio.filter((item) => item === mimeType).length > 0
            ? (temp = 'audio')
            : '';
          const filePath = `${config.fileTempPath}${temp}`;
          if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
          }
          return cb(null, `${filePath}`);
        },
        // 配置文件名称
        filename: async (req, file, cb) => {
          const index = file.originalname.lastIndexOf('.');
          const md5File = getMd5File(file);
          const ext = file.originalname.substring(index); // 后缀
          cb(null, md5File + ext);
        },
      }),
    }),
  )
  async updateFile(@UploadedFile('file') file: Express.Multer.File) {
    return await this.appService.upload(file);
  }
}

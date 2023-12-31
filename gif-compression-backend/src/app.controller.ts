import {
  BadRequestException,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, readFileSync } from 'fs';
import * as sharp from 'sharp';
import { Response } from 'express';
import { fileTypeFromBuffer } from 'file-type';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    return file.path;
  }

  @Get('compression')
  async compression(
    @Query('path') filePath: string,
    @Query('color', ParseIntPipe) color: number,
    @Query('level') level: number,
    @Query('')
    @Res() res: Response,
  ) {
    console.log('filePath:', filePath);
    if (!existsSync(filePath)) {
      throw new BadRequestException('文件不存在');
    }
    const buffer = readFileSync(filePath);
    const fileType = await fileTypeFromBuffer(buffer);
    console.log(fileType);

    const data = await sharp(filePath, {
      animated: true,
      limitInputPixels: false,
    })
      .gif({ colors: color })
      // .png({ compressionLevel: level })
      .toBuffer();

    res.set('Content-Disposition', 'attachment; filename="dest.gif"');
    res.send(data);

    return 'success';
  }
}

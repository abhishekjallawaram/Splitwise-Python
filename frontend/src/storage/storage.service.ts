import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { diskStorage } from 'multer';
import e from 'express';
import { writeFile } from 'fs';
import { promisify } from 'util';
import { extname } from 'path';

@Injectable()
export class StorageService {
  constructor() {}

  async uploadFile(file: Express.Multer.File) {
    const writeFileAsync = promisify(writeFile);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extname(file.originalname)}`;
    const filePath = `./uploads/${filename}`;

    await writeFileAsync(filePath, file.buffer);

    return {
      originalName: file.originalname,
      filename: file.filename,
      path: filePath,
      size: file.size,
    };
  }
}

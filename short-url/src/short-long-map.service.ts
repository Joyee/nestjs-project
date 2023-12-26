import { InjectEntityManager } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { UniqueCodeService } from './unique-code.service';
import { UniqueCode } from './entities/UniqueCode';
import { ShortLongMap } from './entities/ShortLongMap';

@Injectable()
export class ShortLongMapService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(UniqueCodeService)
  private uniqueCodeService: UniqueCodeService;

  // 生成短链接
  async generate(longUrl: string) {
    let uniqueCode = await this.entityManager.findOneBy(UniqueCode, {
      status: 0,
    });

    if (!uniqueCode) {
      uniqueCode = await this.uniqueCodeService.generateCode();
    }
    const map = new ShortLongMap();
    map.shortUrl = uniqueCode.code;
    map.longUrl = longUrl;

    await this.entityManager.insert(ShortLongMap, map);
    await this.entityManager.update(
      UniqueCode,
      { id: uniqueCode.id },
      { status: 1 },
    );

    return uniqueCode.code;
  }

  // 查询长链接
  async gentLongUrl(shortCode: string) {
    const map = await this.entityManager.findOneBy(ShortLongMap, {
      shortUrl: shortCode,
    });
    if (!map) {
      return null;
    }
    return map.longUrl;
  }
}

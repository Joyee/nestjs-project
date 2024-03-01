import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
  ) {}

  async findByIds(ids: string[]) {
    return await this.tagRepository.findBy({ id: In(ids) });
  }
}

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CategoryService } from '../category/category.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TagService } from '../tag/tag.service';
import { PostInfoDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
  ) {}

  async create(user, post: CreatePostDto) {
    const { title } = post;
    if (!title) {
      throw new HttpException('文章标题不能为空', HttpStatus.BAD_REQUEST);
    }
    const foundPost = await this.postsRepository.findOne({
      where: { title },
    });
    if (foundPost) {
      throw new HttpException('文章已经存在', HttpStatus.BAD_REQUEST);
    }

    const { category = 0, tag, isRecommend, status } = post;

    // 根据分类id获取分类集合
    const categories = await this.categoryService.findById(category);
    const tags = await this.tagService.findByIds((tag + '').split(','));
    const postParam: Partial<Post> = {
      ...post,
      isRecommend: isRecommend ? 1 : 0,
      category: categories,
      tags,
      author: user,
    };
    if (status === 'publish') {
      Object.assign(postParam, { publishTime: new Date() });
    }
    const newPost: Post = await this.postsRepository.create({ ...postParam });
    const created = await this.postsRepository.save(newPost);

    return created.id;
  }

  async findAll(query) {
    const qb = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.author', 'user')
      .orderBy('post.updateTime', 'DESC');
    qb.where('1=1');
    qb.orderBy('post.create_time', 'DESC');

    const count = await qb.getCount();
    const { pageNum = 1, pageSize = 10, ...params } = query;
    qb.limit(pageSize);
    qb.offset(pageSize * (pageNum - 1));

    const posts = await qb.getMany();
    const result: PostInfoDto[] = posts.map((post) => post.toResponseObject());

    return { list: result, count };
  }

  async findById(id: string): Promise<any> {
    const qb = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.author', 'user')
      .where('post.id=:id')
      .setParameter('id', id);

    const result = await qb.getOne();
    if (!result) {
      throw new HttpException(`id为${id}的文章不存在`, HttpStatus.BAD_REQUEST);
    }
    // 临时解决方式
    await this.postsRepository.update(id, { count: result.count + 1 });

    return result.toResponseObject();
  }
}

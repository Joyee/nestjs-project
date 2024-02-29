import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { Exclude } from 'class-transformer';
import { Tag } from '../../tag/entities/tag.entity';

@Entity('post')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ type: 'mediumtext', default: null })
  content: string;

  @Column({
    type: 'mediumtext',
    default: null,
    name: 'content_html',
    comment: 'markdown转html,自动生成',
  })
  contentHtml: string;

  @Column({ type: 'text', default: null, comment: '摘要' })
  summary: string;

  @Column({ default: null, comment: '封面图' })
  coverUrl: string;

  @Column({ type: 'int', default: 0, comment: '阅读数量' })
  count: number;

  @Column({ type: 'int', default: 0, comment: '点赞数量', name: 'like_count' })
  likeCount: number;

  @Column({
    type: 'tinyint',
    default: 0,
    name: 'is_recommend',
    comment: '推荐显示',
  })
  isRecommend: boolean;

  @Column('simple-enum', { enum: ['draft', 'publish'], comment: '文章状态' })
  status: string;

  @ManyToOne(() => User, (user) => user.nickName)
  author: User;

  @Exclude()
  @ManyToOne(() => Category, (category) => category.posts)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: 'post_tag',
    joinColumns: [{ name: 'post_id' }],
    inverseJoinColumns: [{ name: 'tag_id' }],
  })
  tags: Tag[];

  @Column({ type: 'timestamp', default: null, name: 'publish_time' })
  publishTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;
}

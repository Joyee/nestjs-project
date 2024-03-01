import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题' })
  @IsNotEmpty({ message: '标题不能为空' })
  readonly title: string;

  @ApiPropertyOptional({ description: '内容' })
  readonly content: string;

  @ApiPropertyOptional({ description: '文章封面' })
  readonly coverUrl: string;

  @ApiPropertyOptional({ description: '文章状态' })
  readonly status: string;

  @ApiProperty({ description: '文章分类id' })
  @IsNumber()
  readonly category: number;

  @ApiPropertyOptional({ description: '是否推荐' })
  readonly isRecommend: boolean;

  @ApiPropertyOptional({ description: '文章标签' })
  readonly tag: string;
}

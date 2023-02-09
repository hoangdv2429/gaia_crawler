import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import BlocksService from './blocks.service';
import { BlocksEntity } from './blocks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlocksEntity])],
  exports: [BlocksService],
  providers: [BlocksService],
})
export class BlocksModule {}

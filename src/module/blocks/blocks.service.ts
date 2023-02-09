import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlocksEntity } from './blocks.entity';

@Injectable()
class BlocksService {
  constructor(
    @InjectRepository(BlocksEntity)
    private blocksRepository: Repository<BlocksEntity>,
  ) {}

  findOne(blockHeight: string): Promise<BlocksEntity> {
    return this.blocksRepository.findOneBy({
      blockHeight,
    });
  }

  // @Cron(CronExpression.EVERY_SECOND)
  async testDb() {
    const res = await this.findOne('5201055');
    console.log(res);
  }
}

export default BlocksService;

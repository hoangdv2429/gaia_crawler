import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventAttributesEntity } from './event.attributes.entity';

@Injectable()
class EventAttributesService {
  constructor(
    @InjectRepository(EventAttributesEntity)
    private repository: Repository<EventAttributesEntity>,
  ) {}

  findOne(blockHeight: number, txId: string): Promise<EventAttributesEntity> {
    return this.repository.findOneBy({
      blockHeight: blockHeight,
      txId: txId,
    });
  }

  @Cron(CronExpression.EVERY_SECOND)
  async testDb() {
    const res = await this.findOne(
      5368249,
      'da75d456b9d66dd7befefa67523ba5c0d9205742a3bbc21b74b1a0e1e68ff26c',
    );
    console.log(res);
  }
}

export default EventAttributesService;

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import TransactionEntity from './transaction.entity';
import { Injectable } from '@nestjs/common';
import {Cron, CronExpression} from "@nestjs/schedule";

@Injectable()
class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}

  public countTransaction(): Promise<number> {
    return this.transactionRepository.count();
  }

  findOne(txId: string): Promise<TransactionEntity> {
    return this.transactionRepository.findOneBy({
      txId: txId,
    });
  }

  // @Cron(CronExpression.EVERY_SECOND)
  async testDb() {
    const res = await this.findOne('04a7f145d3530040025e99ef9203864015565e69e616ac0ec9b3ec18e2e7c655');
    console.log(res);
  }

}

export default TransactionService;
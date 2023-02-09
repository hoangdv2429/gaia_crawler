import { TypeOrmModule } from '@nestjs/typeorm';
import TransactionEntity from './transaction.entity';
import TransactionService from './transaction.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  exports: [TransactionService],
  providers: [TransactionService],
})
export class TransactionModule {}

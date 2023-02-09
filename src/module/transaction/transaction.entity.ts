import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'cosmos_transactions' })
class TransactionEntity {
  @Column({ name: 'block_height', type: 'varchar' })
  blockHeight: string;

  @Column({ name: 'chain_id', type: 'varchar' })
  chainId: string;

  @PrimaryColumn({ type: 'varchar', name: 'tx_id' })
  txId: string;

  @Column({ name: 'tx_status', type: 'varchar' })
  txStatus: string;

  @Column({ name: 'fee', type: 'varchar' })
  fee: string;

  @Column({ name: 'tx_code', type: 'integer' })
  tx_code: number;

  @Column({ name: 'tx_index', type: 'integer' })
  tx_index: number;

  @Column({ name: 'gas_used', type: 'integer' })
  gas_used: number;

  @Column({ name: 'gas_wanted', type: 'integer' })
  gas_wanted: number;

  @Column({ name: 'ingestion_timestamp', type: 'timestamp' })
  ingestionTimestamp: Date;
}

export default TransactionEntity;

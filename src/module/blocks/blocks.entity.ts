import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cosmos_blocks' })
export class BlocksEntity {
  @PrimaryColumn({ type: 'varchar', name: 'block_height' })
  blockHeight: string;

  @Column({ name: 'block_timestamp', type: 'timestamp' })
  blockTimestamp: Date;

  @Column({ name: 'chain_id', type: 'varchar' })
  chainId: string;

  @Column({ name: 'proposer_address', type: 'varchar' })
  proposerAddress: string;

  @Column({ name: 'validators_hash', type: 'varchar' })
  validatorsHash: string;
}

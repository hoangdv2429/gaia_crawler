import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'cosmos_event_attributes' })
export class EventAttributesEntity {
  @PrimaryColumn({ name: 'block_height', type: 'integer' })
  blockHeight: number;

  @Column({ name: 'chain_id', type: 'varchar' })
  chainId: string;

  @PrimaryColumn({ name: 'tx_id', type: 'varchar' })
  txId: string;

  @Column({ name: 'event_index', type: 'integer' })
  eventIndex: number;

  @Column({ name: 'event_type', type: 'varchar' })
  eventType: string;

  @Column({ name: 'attribute_key', type: 'varchar' })
  attributeKey: string;

  @Column({ name: 'attribute_value', type: 'varchar' })
  attributeValue: string;

  @Column({ name: 'attribute_index', type: 'integer' })
  attributeIndex: number;

  @Column({ name: 'ingestion_timestamp', type: 'timestamp' })
  ingestionTimestamp: Date;
}

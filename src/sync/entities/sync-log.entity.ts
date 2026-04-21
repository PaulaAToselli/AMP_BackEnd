import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SyncEntity {
  PATIENTS = 'PATIENTS',
  PROVIDERS = 'PROVIDERS',
  AUTHORIZATIONS = 'AUTHORIZATIONS',
  SERVICES = 'SERVICES',
}

export enum SyncStatus {
  SUCCESS = 'SUCCESS',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
}

@Entity('sync_logs')
export class SyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SyncEntity })
  entity: SyncEntity;

  @Column({ type: 'enum', enum: SyncStatus })
  status: SyncStatus;

  @Column({ name: 'records_processed', type: 'int', default: 0 })
  recordsProcessed: number;

  @Column({ name: 'records_created', type: 'int', default: 0 })
  recordsCreated: number;

  @Column({ name: 'records_updated', type: 'int', default: 0 })
  recordsUpdated: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'triggered_by', default: 'CRON' })
  triggeredBy: string;

  @CreateDateColumn({ name: 'executed_at' })
  executedAt: Date;
}

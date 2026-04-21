import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Specialty } from '../enums/specialty.enum';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'intersoftic_id', type: 'varchar', nullable: true, unique: true })
  intersofticId: string | null;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: Specialty })
  specialty: Specialty;

  @Column({ name: 'coverage_zone', type: 'varchar', nullable: true })
  coverageZone: string | null;

  @Column({ name: 'distance_to_patient', type: 'float', nullable: true })
  distanceToPatient: number | null;

  @Column({ type: 'varchar', nullable: true })
  availability: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'current_workload', type: 'int', nullable: true })
  currentWorkload: number | null;

  @Column({ name: 'compliance_rate', type: 'float', nullable: true })
  complianceRate: number | null;

  @Column({ name: 'had_prior_relationship', type: 'boolean', nullable: true })
  hadPriorRelationship: boolean | null;

  @Column({ name: 'agreed_fee', type: 'float', nullable: true })
  agreedFee: number | null;

  @Column({ name: 'os_value', type: 'float', nullable: true })
  osValue: number | null;

  @Column({ name: 'profitability', type: 'float', nullable: true })
  profitability: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

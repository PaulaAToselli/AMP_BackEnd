import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Complexity } from '../enums/complexity.enum';
import { IntakeChannel } from '../../common/enums/intake-channel.enum';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'intersoftic_id', type: 'varchar', nullable: true, unique: true })
  intersofticId: string | null;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  dni: string;

  @Column({ name: 'affiliate_number' })
  affiliateNumber: string;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', nullable: true })
  locality: string | null;

  @Column({ name: 'geo_location', type: 'varchar', nullable: true })
  geoLocation: string | null;

  @Column({ name: 'obra_social', type: 'varchar', nullable: true })
  obraSocial: string | null;

  @Column({ name: 'cie_diagnosis', type: 'varchar', nullable: true })
  cieDiagnosis: string | null;

  @Column({ type: 'enum', enum: Complexity, nullable: true })
  complexity: Complexity | null;

  @Column({ name: 'family_contact', type: 'varchar', nullable: true })
  familyContact: string | null;

  @Column({ name: 'treating_doctor', type: 'varchar', nullable: true })
  treatingDoctor: string | null;

  @Column({
    name: 'intake_channel',
    type: 'enum',
    enum: IntakeChannel,
    default: IntakeChannel.INTERSOFTIC,
  })
  intakeChannel: IntakeChannel;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

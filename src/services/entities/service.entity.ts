import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { Authorization } from '../../authorizations/entities/authorization.entity';
import { ServiceStatus } from '../enums/service-status.enum';
import { PrestationType } from '../enums/prestion-type.enum';
import { TerminationReason } from '../enums/termination-reason.enum';
import { IntakeChannel } from '../../common/enums/intake-channel.enum';
import { RequestOrigin } from '../enums/request-origin.enum';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'intersoftic_id', type: 'varchar', nullable: true })
  intersofticId: string | null;

  @Column({ name: 'prstation_number', type: 'varchar', nullable: true })
  prestationNumber: string | null;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'provider_id' })
  providerId: string;

  @ManyToOne(() => Provider, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'authorization_id', type: 'varchar', nullable: true })
  authorizationId: string | null;

  @ManyToOne(() => Authorization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'authorization_id' })
  authorization: Authorization | null;

  @Column({ name: 'service_date', type: 'date' })
  serviceDate: Date;

  @Column({ name: 'prstation_type', type: 'enum', enum: PrestationType, nullable: true })
  prestationType: PrestationType | null;

  @Column({ name: 'assigned_specialty', type: 'varchar', nullable: true })
  assignedSpecialty: string | null;

  @Column({ type: 'varchar', nullable: true })
  shift: string | null;

  @Column({ type: 'enum', enum: ServiceStatus, default: ServiceStatus.PENDIENTE })
  status: ServiceStatus;

  @Column({ name: 'termination_reason', type: 'enum', enum: TerminationReason, nullable: true })
  terminationReason: TerminationReason | null;

  @Column({ default: false })
  billable: boolean;

  @Column({ name: 'app_checked_in', default: false })
  appCheckedIn: boolean;

  @Column({ name: 'checkin_time', type: 'timestamp', nullable: true })
  checkinTime: Date | null;

  @Column({ name: 'checkout_time', type: 'timestamp', nullable: true })
  checkoutTime: Date | null;

  @Column({ name: 'coordinator_checked_in', default: false })
  coordinatorCheckedIn: boolean;

  @Column({ name: 'intake_channel', type: 'enum', enum: IntakeChannel, default: IntakeChannel.INTERSOFTIC })
  intakeChannel: IntakeChannel;

  @Column({ name: 'request_origin', type: 'enum', enum: RequestOrigin, nullable: true })
  requestOrigin: RequestOrigin | null;

  @Column({ name: 'non_compliance_reason', type: 'text', nullable: true })
  nonComplianceReason: string | null;

  @Column({ name: 'coordinator_action', type: 'text', nullable: true })
  coordinatorAction: string | null;

  @Column({ name: 'geo_location', type: 'varchar', nullable: true })
  geoLocation: string | null;

  @Column({ name: 'evidence_photo', default: false })
  evidencePhoto: boolean;

  @Column({ name: 'checkin_latency_hours', type: 'float', nullable: true })
  checkinLatencyHours: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

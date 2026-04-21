import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';

@Entity('authorizations')
export class Authorization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'intersoftic_id', type: 'varchar', nullable: true, unique: true })
  intersofticId: string | null;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'authorization_number' })
  authorizationNumber: string;

  @Column({ name: 'obra_social', type: 'varchar', nullable: true })
  obraSocial: string | null;

  @Column({ name: 'os_delegacion', type: 'varchar', nullable: true })
  osDelegacion: string | null;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'expiration_date', type: 'date' })
  expirationDate: Date;

  @Column({ name: 'auto_cancel', default: false })
  autoCancel: boolean;

  @Column({ name: 'monthly_limit', type: 'int', nullable: true })
  monthlyLimit: number | null;

  @Column({ name: 'payment_condition', type: 'varchar', nullable: true })
  paymentCondition: string | null;

  @Column({ name: 'pdf_url', type: 'varchar', nullable: true })
  pdfUrl: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

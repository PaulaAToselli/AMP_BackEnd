import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Stub client for Intersoftic external API.
 * Replace method bodies with real HTTP calls once API docs are available.
 */
@Injectable()
export class IntersofticClient {
  private readonly logger = new Logger(IntersofticClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.get<string>('INTERSOFTIC_API_URL') ?? '';
    this.apiKey = configService.get<string>('INTERSOFTIC_API_KEY') ?? '';
  }

  async getPatients(): Promise<IntersofticPatient[]> {
    this.logger.debug('getPatients() — stub, returning []');
    return [];
  }

  async getProviders(): Promise<IntersofticProvider[]> {
    this.logger.debug('getProviders() — stub, returning []');
    return [];
  }

  async getAuthorizations(): Promise<IntersofticAuthorization[]> {
    this.logger.debug('getAuthorizations() — stub, returning []');
    return [];
  }

  async getServices(): Promise<IntersofticService[]> {
    this.logger.debug('getServices() — stub, returning []');
    return [];
  }
}

// --- Stub type shapes — fill in once real API is documented ---

export interface IntersofticPatient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  affiliateNumber: string;
  birthDate?: string;
  address?: string;
  locality?: string;
  geoLocation?: string;
  obraSocial?: string;
  cieDiagnosis?: string;
  complexity?: string;
  familyContact?: string;
  treatingDoctor?: string;
}

export interface IntersofticProvider {
  id: string;
  fullName: string;
  phone?: string;
  specialty: string;
  coverageZone?: string;
  distanceToPatient?: number;
  complianceRate?: number;
  currentWorkload?: number;
}

export interface IntersofticAuthorization {
  id: string;
  patientIntersofticId: string;
  authorizationNumber: string;
  obraSocial?: string;
  osDelegacion?: string;
  startDate: string;
  expirationDate: string;
  autoCancel?: boolean;
  monthlyLimit?: number;
}

export interface IntersofticService {
  id: string;
  prestationNumber: string;
  patientIntersofticId: string;
  providerIntersofticId: string;
  authorizationIntersofticId?: string;
  serviceDate: string;
  prestationType?: string;
  assignedSpecialty?: string;
  shift?: string;
  status?: string;
}

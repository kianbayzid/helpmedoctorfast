// PatientService - Removed (moved to .bak file)
// This is a placeholder to prevent import errors

class PatientService {
  private readonly basePath = '/patients';

  // All methods removed - patient functionality disabled
  async create(): Promise<never> {
    throw new Error('Patient service disabled - Doctor portal only');
  }

  async findAll(): Promise<never[]> {
    throw new Error('Patient service disabled - Doctor portal only');
  }

  async findOne(): Promise<never> {
    throw new Error('Patient service disabled - Doctor portal only');
  }

  async update(): Promise<never> {
    throw new Error('Patient service disabled - Doctor portal only');
  }

  async delete(): Promise<never> {
    throw new Error('Patient service disabled - Doctor portal only');
  }

  async search(): Promise<never[]> {
    throw new Error('Patient service disabled - Doctor portal only');
  }

  async findByPhone(): Promise<null> {
    throw new Error('Patient service disabled - Doctor portal only');
  }
}

export const patientService = new PatientService();
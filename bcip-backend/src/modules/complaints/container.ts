import { SubmitComplaintUseCase } from './application/use-cases/submit-complaint.use-case';
import { PythonAiAdapter } from './infrastructure/ai/python-ai.adapter';
import { PrismaComplaintRepository } from './infrastructure/repositories/prisma-complaint.repository';

export function createComplaintContainer(): SubmitComplaintUseCase {
    const complaintRepository = new PrismaComplaintRepository();
    const analyticsPort = new PythonAiAdapter(
        process.env.AI_SERVICE_URL || 'http://localhost:8000',
    );

    return new SubmitComplaintUseCase(complaintRepository, analyticsPort);
}

export const submitComplaintUseCase = createComplaintContainer();
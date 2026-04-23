import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    private stripe;
    constructor(prisma: PrismaService);
    createCheckoutSession(body: {
        appointmentId: string;
        amount: number;
    }): Promise<{
        url: any;
    }>;
}

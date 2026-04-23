"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    logger = new common_1.Logger(PaymentsService_1.name);
    stripe = null;
    constructor(prisma) {
        this.prisma = prisma;
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            this.logger.warn('Payments are disabled because STRIPE_SECRET_KEY is not configured.');
            return;
        }
        const StripeConstructor = require('stripe');
        this.stripe = new StripeConstructor(stripeSecretKey, {
            apiVersion: '2024-06-20',
        });
    }
    async createCheckoutSession(body) {
        if (!this.stripe) {
            throw new common_1.ServiceUnavailableException('Payments are disabled for this deployment');
        }
        if (!body?.appointmentId || !body?.amount || body.amount <= 0) {
            throw new common_1.BadRequestException('appointmentId and positive amount are required');
        }
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: body.appointmentId },
            select: { id: true },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Service Booking' },
                        unit_amount: Math.round(body.amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000/booking',
            metadata: { appointmentId: body.appointmentId },
        });
        await this.prisma.appointment.update({
            where: { id: body.appointmentId },
            data: { paymentStatus: 'pending' },
        });
        return { url: session.url };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
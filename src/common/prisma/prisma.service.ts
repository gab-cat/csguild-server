import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';
import { LoggerService } from '../logger/logger.service';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: LoggerService) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    this.logger.logDatabaseConnection();
    await this.$connect();
    this.logger.logDatabaseConnected();
  }

  async onModuleDestroy() {
    this.logger.logDatabaseDisconnection();
    await this.$disconnect();
    this.logger.logDatabaseDisconnected();
  }

  enableShutdownHooks(): void {
    process.on('beforeExit', () => {
      this.logger.logDatabaseDisconnection();
      void this.$disconnect();
    });
  }
}

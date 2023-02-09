import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from './module/transaction/transaction.module';
import { DatabaseModule } from './database.module';
import * as Joi from '@hapi/joi';
import { AppCronJobModule } from './gaia-cron/app.cron.job.module';
import { EventAttributesModule } from './module/event_attributes/event.attributes.module';
import { BlocksModule } from './module/blocks/blocks.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
      }),
    }),
    DatabaseModule,
    TransactionModule,
    AppCronJobModule,
    EventAttributesModule,
    BlocksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('start app module');
  }
}

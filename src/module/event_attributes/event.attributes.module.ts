import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import EventAttributesService from './event.attributes.service';
import { EventAttributesEntity } from './event.attributes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventAttributesEntity])],
  exports: [EventAttributesService],
  providers: [EventAttributesService],
})
export class EventAttributesModule {}

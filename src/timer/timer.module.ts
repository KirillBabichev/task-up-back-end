import { Module } from '@nestjs/common';
import { TimerController } from './timer.controller';
import { PrismaService } from 'src/prisma.service';
import { TimerService } from './timer.service';

@Module({
  controllers: [TimerController],
  providers: [TimerService, PrismaService],
  exports: [TimerService],
})
export class TimerModule { }

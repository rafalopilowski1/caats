import { Module } from '@nestjs/common'
import { SupervisorService } from './supervisor.service'
import { SupervisorResolver } from './supervisor.resolver'
import { PrismaModule } from '../prisma/prisma.module'
import { ParserModule } from './parser/parser.module'
import { AuthModule } from '../auth/auth.module'
import { PubsubModule } from '../pubsub/pubsub.module'
// import { EmitterModule } from '../emitter/emitter.module'

@Module({
  providers: [SupervisorService, SupervisorResolver],
  imports: [PrismaModule, ParserModule, AuthModule, PubsubModule],
})
export class SupervisorModule {}

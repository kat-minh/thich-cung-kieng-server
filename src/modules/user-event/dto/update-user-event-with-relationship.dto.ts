import { PartialType } from '@nestjs/swagger';
import { CreateUserEventWithRelationshipDto } from './create-user-event-with-relationship.dto';
export class UpdateUserEventWithRelationshipDto extends PartialType(
  CreateUserEventWithRelationshipDto,
) {}

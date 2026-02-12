import { PartialType } from '@nestjs/mapped-types';
import { CreateUserFavoriteRitualDto } from './create-user-favorite-ritual.dto';

export class UpdateUserFavoriteRitualDto extends PartialType(CreateUserFavoriteRitualDto) {}

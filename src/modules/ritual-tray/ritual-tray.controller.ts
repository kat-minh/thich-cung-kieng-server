import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RitualTrayService } from './ritual-tray.service';
import { CreateRitualTrayDto } from './dto/create-ritual-tray.dto';
import { UpdateRitualTrayDto } from './dto/update-ritual-tray.dto';

@Controller('ritual-tray')
export class RitualTrayController {
  constructor(private readonly ritualTrayService: RitualTrayService) {}
}

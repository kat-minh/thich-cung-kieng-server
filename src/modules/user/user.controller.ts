import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user.enum';
import { UserService } from './user.service';
import { BaseFilterDto } from 'src/common/base/dto/base-filter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized - Invalid or missing JWT token',
})
@ApiForbiddenResponse({
  description: 'Forbidden - Insufficient permissions',
})
@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user. Admin only.',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieve list of all users in the system with pagination and filtering. Admin only.',
  })
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
  })
  async findAll(@Query() filter: BaseFilterDto) {
    return this.usersService.findAll(filter, ['userSubscriptions', 'userSubscriptions.subscriptionPlan'], []);
  }

  @Get('me')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Get the profile information of the currently authenticated user',
  })
  @ApiOkResponse({
    description: 'Current user profile retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async getMe(@Req() req: Request & { user: { email: string } }) {
    const user = await this.usersService.findOneByOptions({
      email: req.user.email,
    }, ['userSubscriptions', 'userSubscriptions.subscriptionPlan', 'favoriteRituals', 'favoriteRituals.ritual', 'chatSession']);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Find user by ID',
    description:
      'Find a specific user by their unique ID. Admin and Staff only.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: 'c2adc0a6-7af6-4484-8ae0-72349d78e769',
  })
  @ApiOkResponse({
    description: 'User found successfully',
  })
  @ApiNotFoundResponse({
    description: 'User with specified ID not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update user information',
    description: 'Update user profile information. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: 'c2adc0a6-7af6-4484-8ae0-72349d78e769',
  })
  @ApiOkResponse({
    description: 'User updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or UUID format',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update user information',
    description: 'Update user profile information. Admin only.',
  })
  @ApiBody({ type: UpdateProfileUserDto })
  @ApiOkResponse({
    description: 'User updated successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or UUID format',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async updateProfile(
    @GetUser('id') id: string,
    @Body() updateUserDto: UpdateProfileUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Deactivate user',
    description: 'Deactivate a user account (soft delete). Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: 'c2adc0a6-7af6-4484-8ae0-72349d78e769',
  })
  @ApiOkResponse({
    description: 'User deactivated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deactivated successfully' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format or user is already deactivated',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Restore user',
    description: 'Restore a deactivated user account. Admin only.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: 'c2adc0a6-7af6-4484-8ae0-72349d78e769',
  })
  @ApiOkResponse({
    description: 'User restored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User restored successfully' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format or user is already active',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.softRemove(id);
  }
}

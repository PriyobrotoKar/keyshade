import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common'
import { UserService } from '../service/user.service'
import { CurrentUser } from '../../decorators/user.decorator'
import { Authority, User } from '@prisma/client'
import { UpdateUserDto } from '../dto/update.user/update.user'
import { AdminGuard } from '../../auth/guard/admin/admin.guard'
import { CreateUserDto } from '../dto/create.user/create.user'
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags
} from '@nestjs/swagger'
import { BypassOnboarding } from '../../decorators/bypass-onboarding.decorator'
import { RequiredApiKeyAuthorities } from '../../decorators/required-api-key-authorities.decorator'
import { ForbidApiKey } from '../../decorators/forbid-api-key.decorator'

@ApiTags('User Controller')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @BypassOnboarding()
  @RequiredApiKeyAuthorities(Authority.READ_SELF)
  async getCurrentUser(@CurrentUser() user: User) {
    return this.userService.getSelf(user)
  }

  @Put()
  @BypassOnboarding()
  @RequiredApiKeyAuthorities(Authority.UPDATE_SELF)
  async updateSelf(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return await this.userService.updateSelf(user, dto)
  }

  @Delete()
  @ApiNoContentResponse()
  @HttpCode(204)
  @ForbidApiKey()
  async deleteSelf(@CurrentUser() user: User) {
    await this.userService.deleteSelf(user)
  }

  @Delete(':userId')
  @UseGuards(AdminGuard)
  @ApiNoContentResponse()
  @HttpCode(204)
  async deleteUser(@Param('userId') userId: string) {
    await this.userService.deleteUser(userId)
  }

  @Put(':userId')
  @UseGuards(AdminGuard)
  async updateUser(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto
  ) {
    return await this.userService.updateUser(userId, dto)
  }

  @Get(':userId')
  @UseGuards(AdminGuard)
  async getUserById(@Param('userId') userId: string) {
    return await this.userService.getUserById(userId)
  }

  @Get('all')
  @UseGuards(AdminGuard)
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('sort') sort: string = 'name',
    @Query('order') order: string = 'asc',
    @Query('search') search: string = ''
  ) {
    return await this.userService.getAllUsers(page, limit, sort, order, search)
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiCreatedResponse()
  async createUser(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto)
  }
}

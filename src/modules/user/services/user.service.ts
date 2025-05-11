import { Injectable, OnModuleInit } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';

import {
  OffsetPaginated,
  OffsetPaginationBo,
} from 'common/bos/offset-pagination.bo';

import { HashService } from 'providers/hash/services/hash.service';

import { CreateUserBo } from '../bos/user.bo';
import { UserEntity } from '../entities/user.entity';
import { UserNotFoundException } from '../exceptions/user.exception';
import { UserRepository } from '../repositories/user.repository';
import { UserEmailService } from './user-email.service';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private readonly hashService: HashService,
    private readonly userRepository: UserRepository,
    private readonly userEmailService: UserEmailService,
  ) {}

  async onModuleInit() {
    const email = process.env.INITIAL_USER_EMAIL;
    const password = process.env.INITIAL_USER_PASSWORD;

    if (!email || !password) {
      throw new Error('Initial user email or password not set');
    }

    try {
      await this.create({
        email,
        password,
      });
    } catch {
      //
    }
  }

  public async create({
    email,
    password,
    ...rest
  }: CreateUserBo): Promise<UserEntity> {
    await this.userEmailService.validate({ email });
    const user = await this.userRepository.create({
      ...rest,
      email,
      password: await this.hashService.hashify(password),
    });
    return user;
  }

  public async read(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userRepository.find({
      data,
    });
    if (!user) {
      throw new UserNotFoundException(data.id || data.email);
    }
    return user;
  }

  public async readAll({
    limit,
    page,
  }: OffsetPaginationBo): Promise<OffsetPaginated<UserEntity>> {
    const users = await this.userRepository.findMany({
      data: {},
      pagination: {
        limit,
        page,
      },
    });

    return users;
  }

  public async save(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }
}

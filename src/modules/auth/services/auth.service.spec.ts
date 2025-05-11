import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserFakeRepository } from 'modules/user/repositories/user-fake.repository';
import { UserTokenRepository } from 'modules/user/repositories/user-token.repository';
import { UserRepository } from 'modules/user/repositories/user.repository';
import { UserTokenService } from 'modules/user/services/user-token.service';
import { UserService } from 'modules/user/services/user.service';

import { HashFakeService } from 'providers/hash/services/hash-fake.service';
import { HashService } from 'providers/hash/services/hash.service';
import { JwtFakeService } from 'providers/jwt/services/jwt-fake.service';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  let hashService: HashService;
  let jwtService: JwtService;
  let userRepository: UserRepository;
  let userTokenRepository: UserTokenRepository;
  let userService: UserService;
  let userTokenService: UserTokenService;

  beforeEach(async () => {
    hashService = new HashFakeService();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- this fake just mock used functions and does not implement all methods of the real service
    // @ts-ignore
    jwtService = new JwtFakeService();
    userRepository = new UserFakeRepository();
    userTokenRepository = new UserTokenRepository();
    userService = new UserService(hashService, userRepository);
    userTokenService = new UserTokenService(jwtService, userTokenRepository);

    service = new AuthService(hashService, userService, userTokenService);
  });

  it('should sign user in', async () => {
    await userService.create({
      email: 'john.doe@gmail.com',
      password: 'password',
    });
    const result = await service.signIn({
      email: 'john.doe@gmail.com',
      password: 'password',
    });
    expect(result.token).toBeDefined();
  });

  it('should throw unauthorized exception when trying to sign user in with invalid password', async () => {
    await userService.create({
      email: 'john.doe@gmail.com',
      password: 'password_xxx',
    });
    await expect(async () => {
      await service.signIn({
        email: 'john.doe@gmail.com',
        password: 'password',
      });
    }).rejects.toThrow(UnauthorizedException);
  });
});

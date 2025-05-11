import { HashFakeService } from 'providers/hash/services/hash-fake.service';
import { HashService } from 'providers/hash/services/hash.service';

import {
  UserEmailConflictException,
  UserNotFoundException,
} from '../exceptions/user.exception';
import { UserFakeRepository } from '../repositories/user-fake.repository';
import { UserRepository } from '../repositories/user.repository';
import { UserEmailService } from './user-email.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let hashService: HashService;
  let userRepository: UserRepository;
  let userEmailService: UserEmailService;

  beforeEach(async () => {
    hashService = new HashFakeService();
    userRepository = new UserFakeRepository();
    userEmailService = new UserEmailService(userRepository);

    service = new UserService(hashService, userRepository, userEmailService);
  });

  it('should create a default user on module init', async () => {
    const spy = jest.spyOn(userRepository, 'create');
    await service.onModuleInit();
    expect(spy).toHaveBeenCalled();
  });

  it('should create an user', async () => {
    const user = await service.create({
      email: 'john.doe@example.com',
      password: 'password',
    });
    expect(user).toBeDefined();
  });

  it('should throw a conflict exception when trying to create an user with an email that is already in use', async () => {
    await userRepository.create({
      email: 'john.doe@example.com',
      password: 'password',
    });
    await expect(async () => {
      await service.create({
        email: 'john.doe@example.com',
        password: 'password',
      });
    }).rejects.toThrow(UserEmailConflictException);
  });

  it('should read an user', async () => {
    const createdUser = await userRepository.create({
      email: 'john.doe@example.com',
      password: 'password',
    });
    const readUser = await service.read({
      email: 'john.doe@example.com',
    });
    expect(createdUser).toMatchObject(readUser);
  });

  it('should throw a not found exception when trying to read a user that does not exist', async () => {
    await expect(async () => {
      await service.read({
        email: 'john.doe@example.com',
      });
    }).rejects.toThrow(UserNotFoundException);
  });

  it('should read all users', async () => {
    await userRepository.create({
      email: 'john.doe@example.com',
      password: 'password',
    });
    await userRepository.create({
      email: 'jane.doe@example.com',
      password: 'password',
    });
    const users = await service.readAll({
      limit: 2,
      page: 1,
    });
    expect(users.total).toBe(2);
  });
});

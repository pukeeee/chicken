/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file Юніт-тести для userRepository
 * @description Тести перевіряють, що функції репозиторію правильно викликають
 * відповідні методи клієнта Prisma з правильними параметрами.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Мокаємо клієнт Prisma. Фабрика буде викликана до всіх імпортів.
vi.mock('~~/server/database/client', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
    },
  },
}));

// Імпортуємо функції репозиторію ПІСЛЯ мокінгу
import {
  getUserByEmail,
  getUserById,
  getUserByPhone,
  setToken,
  removeToken,
  createUser,
  updateUserById,
  getUsersOrderByUserId
} from '~~/server/repositories/user.repository'

// Динамічно імпортуємо мокнутий клієнт, щоб отримати доступ до моків
const prismaMock = (await import('~~/server/database/client')).default;

describe('userRepository - Репозиторій користувача', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getUserByEmail - має викликати prisma.user.findUnique з правильним email', async () => {
    // Arrange
    const email = 'test@example.com';
    const mockUser = { id: 1, email, name: 'Test User' };
    (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);

    // Act
    const result = await getUserByEmail(email);

    // Assert
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockUser);
  });

  it('getUserByEmail - має повернути null, якщо користувача не знайдено', async () => {
    // Arrange
    const email = 'nonexistent@example.com';
    (prismaMock.user.findUnique as any).mockResolvedValue(null);

    // Act
    const result = await getUserByEmail(email);

    // Assert
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    expect(result).toBeNull();
  });

  it('getUserByEmail - має прокинути помилку, якщо сталася помилка Prisma', async () => {
    // Arrange
    const email = 'test@example.com';
    const errorMessage = 'Database connection error';
    (prismaMock.user.findUnique as any).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(getUserByEmail(email)).rejects.toThrow(errorMessage);
  });

  it('getUserById - має викликати prisma.user.findUnique з правильним ID', async () => {
    // Arrange
    const id = 1;
    const mockUser = { id, email: 'test@example.com', name: 'Test User' };
    (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);

    // Act
    const result = await getUserById(id);

    // Assert
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id } });
    expect(result).toEqual(mockUser);
  });

  it('getUserById - має повернути null, якщо користувача не знайдено', async () => {
    // Arrange
    const id = 999;
    (prismaMock.user.findUnique as any).mockResolvedValue(null);

    // Act
    const result = await getUserById(id);

    // Assert
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id } });
    expect(result).toBeNull();
  });

  it('getUserById - має прокинути помилку, якщо сталася помилка Prisma', async () => {
    // Arrange
    const id = 1;
    const errorMessage = 'Database connection error';
    (prismaMock.user.findUnique as any).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(getUserById(id)).rejects.toThrow(errorMessage);
  });

  it('getUserByPhone - має викликати prisma.user.findUnique з правильним телефоном', async () => {
    // Arrange
    const phone = '1234567890';
    const mockUser = { id: 1, phone, name: 'Test User' };
    (prismaMock.user.findUnique as any).mockResolvedValue(mockUser);

    // Act
    const result = await getUserByPhone(phone);

    // Assert
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { phone } });
    expect(result).toEqual(mockUser);
  });

  it('getUserByPhone - має повернути null, якщо користувача не знайдено', async () => {
    // Arrange
    const phone = '0987654321';
    (prismaMock.user.findUnique as any).mockResolvedValue(null);

    // Act
    const result = await getUserByPhone(phone);

    // Assert
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { phone } });
    expect(result).toBeNull();
  });

  it('getUserByPhone - має прокинути помилку, якщо сталася помилка Prisma', async () => {
    // Arrange
    const phone = '1234567890';
    const errorMessage = 'Database connection error';
    (prismaMock.user.findUnique as any).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(getUserByPhone(phone)).rejects.toThrow(errorMessage);
  });

  it('createUser - має викликати prisma.user.create з правильними даними', async () => {
    // Arrange
    const phone = '1234567890';
    const mockUser = { id: 1, phone, name: null, email: null, token: null };
    (prismaMock.user.create as any).mockResolvedValue(mockUser);

    // Act
    const result = await createUser(phone);

    // Assert
    expect(prismaMock.user.create).toHaveBeenCalledWith({ data: { phone } });
    expect(result).toEqual(mockUser);
  });

  it('createUser - має прокинути помилку, якщо сталася помилка Prisma', async () => {
    // Arrange
    const phone = '1234567890';
    const errorMessage = 'Database connection error';
    (prismaMock.user.create as any).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(createUser(phone)).rejects.toThrow(errorMessage);
  });

  it('updateUserById - має викликати prisma.user.update з правильними даними', async () => {
    // Arrange
    const id = 1;
    const data = { name: 'New Name' };
    const mockUser = { id, phone: '1234567890', name: 'New Name', email: null, token: null };
    (prismaMock.user.update as any).mockResolvedValue(mockUser);

    // Act
    const result = await updateUserById(id, data);

    // Assert
    expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id }, data });
    expect(result).toEqual(mockUser);
  });

  it('updateUserById - має прокинути помилку, якщо сталася помилка Prisma', async () => {
    // Arrange
    const id = 1;
    const data = { name: 'New Name' };
    const errorMessage = 'Database connection error';
    (prismaMock.user.update as any).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(updateUserById(id, data)).rejects.toThrow(errorMessage);
  });

  it('setToken - має викликати prisma.user.update для встановлення токена', async () => {
    // Arrange
    const id = 1;
    const token = 'new-token';
    const mockUser = { id, phone: '1234567890', name: null, email: null, token };
    (prismaMock.user.update as any).mockResolvedValue(mockUser);

    // Act
    const result = await setToken(id, token);

    // Assert
    expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id }, data: { token } });
    expect(result).toEqual(mockUser);
  });

  it('setToken - має прокинути помилку, якщо сталася помилка Prisma', async () => {
    // Arrange
    const id = 1;
    const token = 'new-token';
    const errorMessage = 'Database connection error';
    (prismaMock.user.update as any).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(setToken(id, token)).rejects.toThrow(errorMessage);
  });

  it('removeToken - має викликати prisma.user.update для видалення токена', async () => {
    // Arrange
    const id = 1;
    const mockUser = { id, phone: '1234567890', name: null, email: null, token: null };
    (prismaMock.user.update as any).mockResolvedValue(mockUser);

    // Act
    const result = await removeToken(id);

    // Assert
    expect(prismaMock.user.update).toHaveBeenCalledWith({ where: { id }, data: { token: null } });
    expect(result).toEqual(mockUser);
  });

  it('removeToken - має прокинути помилку, якщо сталася помилка Prisma', async () => {
    // Arrange
    const id = 1;
    const errorMessage = 'Database connection error';
    (prismaMock.user.update as any).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(removeToken(id)).rejects.toThrow(errorMessage);
  });

  it('getUsersOrderByUserId - має викликати prisma.order.findMany з правильними параметрами', async () => {
    // Arrange
    const userId = 1;
    const mockOrders = [
      { id: 1, userId, total: 100, items: [] },
      { id: 2, userId, total: 200, items: [] }
    ];
    (prismaMock.order.findMany as any).mockResolvedValue(mockOrders);

    // Act
    const result = await getUsersOrderByUserId(userId);

    // Assert
    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    expect(result).toEqual(mockOrders);
  });

  it('getUsersOrderByUserId - має прокинути помилку, якщо сталася помилка Prisma', async () => {
    // Arrange
    const userId = 1;
    const errorMessage = 'Database connection error';
    (prismaMock.order.findMany as any).mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(getUsersOrderByUserId(userId)).rejects.toThrow(errorMessage);
  });
});
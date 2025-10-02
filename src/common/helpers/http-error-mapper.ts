import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export function throwHttpByStatus(error: any, fallbackMessage: string): never {
  const status: number = error?.response?.status ?? error?.status;
  const rawMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data ||
    error?.message ||
    fallbackMessage;

  switch (status) {
    case 400:
      throw new BadRequestException(rawMessage);
    case 401:
      throw new UnauthorizedException(rawMessage);
    case 403:
      throw new ForbiddenException(rawMessage);
    case 404:
      throw new NotFoundException(rawMessage);
    case 409:
      throw new ConflictException(rawMessage);
    case 500:
      throw new InternalServerErrorException(rawMessage);
    default:
      if (typeof status === 'number') {
        throw new HttpException(rawMessage, status);
      }
      throw new InternalServerErrorException(fallbackMessage);
  }
}

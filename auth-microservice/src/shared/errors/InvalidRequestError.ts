import { BadRequestException } from '@nestjs/common';

export class InvalidRequestError extends BadRequestException {}

import * as Joi from 'joi';
import { InternalError } from '../../../errors/InternalError';

export const TokenPayloadSchema = Joi.object({
  email: Joi.string()
    .required()
    .email()
    .error(
      new InternalError('There is an error while checking token payload!'),
    ),
});

import { enumType } from 'nexus';
import { RequestStatus } from '@/core/enums/database';

export const RequestStatusEnum = enumType({
  name: 'RequestStatus',
  members: RequestStatus,
});

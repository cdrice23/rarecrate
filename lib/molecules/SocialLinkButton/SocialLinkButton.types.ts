import { SocialPlatform } from '@/core/enums/database';

export interface SocialLinkButtonProps {
  socialLinks: [{ platform: SocialPlatform; username: string }];
}

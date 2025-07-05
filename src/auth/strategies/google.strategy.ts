import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service';
import { SignupMethod } from '../../users/dto/create-user.request';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: configService.getOrThrow('GOOGLE_AUTH_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_AUTH_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_AUTH_REDIRECT_URI'),
      scope: ['profile', 'email'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    const email = profile.emails?.[0]?.value;
    const firstName = profile.name?.givenName || '';
    const lastName = profile.name?.familyName || '';
    const imageUrl = profile.photos?.[0]?.value || '';

    if (!email) {
      throw new Error('Email not provided by Google OAuth');
    }

    return this.usersService.getOrCreateUser({
      email,
      username: '', // Will be auto-generated in getOrCreateUser
      password: '', // Will be auto-generated for OAuth users
      firstName,
      lastName,
      imageUrl,
      signupMethod: SignupMethod.GOOGLE,
      // Optional fields - set to empty initially as requested
      birthdate: undefined,
      course: '',
      rfidId: undefined,
    });
  }
}

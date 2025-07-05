import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LoggerService, LogEntry } from './logger.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../../auth/auth.service';
import { TokenPayload } from '../../auth/token-payload.interface';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LogGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000; // Keep last 1000 logs

  constructor(
    private readonly loggerService: LoggerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  onModuleInit() {
    // Set this gateway as the log emitter for the logger service
    this.loggerService.setLogEmitter(this);
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.authenticateSocket(client);

      this.loggerService.info(
        `→ Log viewer client connected: ${client.id} [${user.email}]`,
        undefined,
        'LogGateway',
      );

      // Send existing logs to the authenticated client
      client.emit('initial-logs', this.logs);
    } catch (error) {
      this.loggerService.warn(
        `Unauthorized log viewer connection attempt: ${client.id}`,
        { error: error.message },
        'LogGateway',
      );

      // Send authentication challenge
      client.emit('auth-required', {
        type: 'basic',
        realm: 'Log Viewer Access',
        message: 'Authentication required to access log viewer',
      });

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.loggerService.info(
      `← Log viewer client disconnected: ${client.id}`,
      undefined,
      'LogGateway',
    );
  }

  emit(event: string, data: LogEntry) {
    // Store the log entry
    this.logs.push(data);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Broadcast to all connected clients
    this.server.emit(event, data);
  }

  private async authenticateSocket(client: Socket): Promise<any> {
    // First, try to authenticate using JWT from cookies
    const cookies = this.parseCookies(client.handshake.headers.cookie);
    const accessToken = cookies['Authentication'];

    if (accessToken) {
      try {
        const payload = this.jwtService.verify(accessToken, {
          secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        }) as TokenPayload;

        const user = await this.usersService.getUser({ id: payload.userId });
        return user;
      } catch (error) {
        this.loggerService.debug(
          'JWT authentication failed, trying basic auth',
          { error: error.message },
          'LogGateway',
        );
      }
    }

    // Fallback to HTTP Basic Authentication
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Basic ')) {
      const credentials = Buffer.from(authHeader.slice(6), 'base64').toString(
        'utf-8',
      );
      const [email, password] = credentials.split(':');

      if (email && password) {
        try {
          const user = await this.authService.verifyUser(email, password);
          return user;
        } catch (error) {
          this.loggerService.debug(
            'Basic authentication failed',
            { email, error: error.message },
            'LogGateway',
          );
        }
      }
    }

    throw new UnauthorizedException(
      'Invalid credentials or no authentication provided',
    );
  }

  private parseCookies(cookieHeader?: string): Record<string, string> {
    if (!cookieHeader) return {};

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach((cookie) => {
      const [key, ...value] = cookie.trim().split('=');
      if (key && value.length > 0) {
        cookies[key] = decodeURIComponent(value.join('='));
      }
    });

    return cookies;
  }
}

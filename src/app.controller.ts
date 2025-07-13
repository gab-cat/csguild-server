import { Controller, Get, Headers } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  /**
   * Returns the health status of the server including IP, timestamp, and version information.
   * @param forwardedFor - The x-forwarded-for header value for client IP detection
   * @returns Health status object with server information
   */
  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({
    status: 200,
    description: 'Server is running',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        ip: { type: 'string' },
      },
    },
  })
  getHealth(@Headers('x-forwarded-for') forwardedFor: string): {
    status: string;
    timestamp: string;
    version: string;
    ip: string;
  } {
    const version = process.env.npm_package_version || 'unknown';
    return {
      status: 'OK',
      ip: forwardedFor || 'unknown',
      timestamp: new Date().toISOString(),
      version,
    };
  }
}

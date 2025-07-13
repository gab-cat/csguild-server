import { Controller, Get, Headers } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({
    status: 200,
    description: 'Server is running',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
      },
    },
  })
  getHealth(@Headers('x-forwarded-for') forwardedFor: string): {
    status: string;
    timestamp: string;
    version: string;
    ip: string | undefined;
  } {
    return {
      status: 'OK',
      ip: forwardedFor || 'unknown',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}

import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { join } from 'path';

@ApiTags('App')
@Controller('logs')
export class LogsController {
  @Get()
  @ApiOperation({
    summary: 'Log viewer interface',
    description:
      'Displays a tabbed interface for viewing service and route logs in real-time',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the log viewer HTML interface',
  })
  getLogViewer(@Res() res: Response) {
    const htmlPath = join(process.cwd(), 'public', 'log-viewer.html');
    res.sendFile(htmlPath);
  }
}

import { ReviewApplicationDto } from '../../dto';

export class ReviewApplicationCommand {
  constructor(
    public readonly reviewDto: ReviewApplicationDto,
    public readonly reviewerId: string,
  ) {}
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  /**
   * Converts a string to a slug format.
   * @param str The string to convert.
   * @returns The slugified string.
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}

import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { VALID_CATEGORIES_BY_SOFTWARE, CATEGORY_LABELS } from '../common/category-software-map';

@Controller('issue-categories')
export class CategoriesController {
  @Get()
  getCategories(@Query('software') software: string) {
    const categories = VALID_CATEGORIES_BY_SOFTWARE[software];
    if (!categories) {
      throw new BadRequestException('software must be TMS or FINMAN');
    }

    return categories.map((code) => ({
      value: code,
      label: CATEGORY_LABELS[code] ?? code,
      requires_description: code === 'OTHER',
    }));
  }
}
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { VALID_CATEGORIES_BY_SOFTWARE } from '../common/category-software-map';

@Controller('issue-categories')
export class CategoriesController {
  @Get()
  getCategories(@Query('software') software: string) {
    const categories = VALID_CATEGORIES_BY_SOFTWARE[software];
    if (!categories) {
      throw new BadRequestException('software must be TMS or FINMAN');
    }
    return categories;
  }
}
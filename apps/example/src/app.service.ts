import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getPaginatedData(page: string) {
    return {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      totalItems: 100,
      itemCount: 2,
      itemsPerPage: 10,
      totalPages: 10,
      currentPage: parseInt(page) || 1,
    };
  }
}

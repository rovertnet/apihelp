import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedCategories();
  }

  async seedCategories() {
    const count = await this.prisma.category.count();
    if (count === 0) {
      const categories = [
        { name: 'Plomberie', icon: 'wrench' },
        { name: 'Électricité', icon: 'bolt' },
        { name: 'Ménage', icon: 'home' },
        { name: 'Jardinage', icon: 'leaf' },
        { name: 'Déménagement', icon: 'truck' },
        { name: 'Peinture', icon: 'paint-brush' },
        { name: 'Informatique', icon: 'desktop' },
        { name: 'Cours particuliers', icon: 'book' },
      ];

      for (const category of categories) {
        await this.prisma.category.create({ data: category });
      }
      console.log('Categories seeded');
    }
  }

  findAll() {
    return this.prisma.category.findMany();
  }
}

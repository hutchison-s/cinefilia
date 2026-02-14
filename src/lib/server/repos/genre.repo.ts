import { asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { genre } from '../db/schema';

export class GenreRepo {
  static list() {
    return db
      .select({
        id: genre.id,
        name: genre.name,
        backdropPath: genre.backdropPath
      })
      .from(genre)
      .orderBy(asc(genre.name));
  }

  static async findById(id: number) {
    const [item] = await db
      .select({
        id: genre.id,
        name: genre.name,
        backdropPath: genre.backdropPath
      })
      .from(genre)
      .where(eq(genre.id, id))
      .limit(1);

    return item ?? null;
  }
}

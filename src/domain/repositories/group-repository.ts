import type { Group } from '../entities/group.ts';

export interface GroupRepository {
  findByTitle(query: string): Group[];
  save(group: Pick<Group, 'id' | 'title'>): void;
  delete(id: number): void;
}

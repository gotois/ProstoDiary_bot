import type { Group } from '../entities/group.ts';
import type { GroupRepository } from '../repositories/group-repository.ts';

export class RegisterGroup {
  groups: GroupRepository;

  constructor(groups: GroupRepository) {
    this.groups = groups;
  }

  async execute(input: Pick<Group, 'id' | 'title'>): Promise<void> {
    await this.groups.save(input);
  }
}

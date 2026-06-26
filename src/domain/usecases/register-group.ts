import type { Group } from '../entities/group.ts';
import type { GroupRepository } from '../repositories/group-repository.ts';

export class SecretaryGroup {
  groups: GroupRepository;

  constructor(groups: GroupRepository) {
    this.groups = groups;
  }

  save(input: Pick<Group, 'id' | 'title'>): void {
    return this.groups.save(input);
  }

  delete(input: { groupId: number }): void {
    return this.groups.delete(input.groupId);
  }
}

import type { GroupRepository } from '../repositories/group-repository.ts';

export class RemoveGroup {
  groups: GroupRepository;

  constructor(groups: GroupRepository) {
    this.groups = groups;
  }

  async execute(input: { groupId: number }): Promise<void> {
    return this.groups.delete(input.groupId);
  }
}

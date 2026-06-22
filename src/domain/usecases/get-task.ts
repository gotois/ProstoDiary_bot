import type { TaskGateway } from '../repositories/task-gateway.ts';

export class GetTask {
  tasks: TaskGateway;

  constructor(tasks: TaskGateway) {
    this.tasks = tasks;
  }

  async execute(input: { taskId: string; accessToken: string }): Promise<{ status: number; data?: unknown }> {
    return this.tasks.getTask(input);
  }
}

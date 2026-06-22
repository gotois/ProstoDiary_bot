export interface TaskGateway {
  getTask(input: { taskId: string; accessToken: string }): Promise<{ status: number; data?: unknown }>;
  call(input: {
    method: string;
    params: Record<string, unknown>;
    accessToken?: string | null;
    geolocation?: string | null;
    timezone?: string | null;
  }): Promise<{ result?: any; error?: { message?: string } }>;
}

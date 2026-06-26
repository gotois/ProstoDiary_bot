export type ApprovalType = 'accept' | 'reject';

/**
 * @description Extracts a numeric task id from an id or task URL.
 * @param taskReference - Numeric task id or task URL.
 * @returns Numeric task id.
 */
export function getTaskIdFromReference(taskReference: string): number {
  return Number(taskReference.split('/').pop());
}

/**
 * @description Extracts approval type and task id from a Telegram callback.
 * @param data - Telegram callback data.
 * @returns Parsed approval data.
 */
export function parseApprovalCallback(data: string): { type: ApprovalType; taskId: number } {
  const separatorIndex = data.indexOf(':');
  const type = data.slice(0, separatorIndex) as ApprovalType;
  const taskReference = data.slice(separatorIndex + 1);

  if (!['accept', 'reject'].includes(type)) {
    throw new Error('Некорректный ответ на приглашение');
  }

  return {
    type,
    taskId: getTaskIdFromReference(taskReference),
  };
}

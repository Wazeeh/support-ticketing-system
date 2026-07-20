export type AuditAction =
  | 'CREATED' | 'PRIORITY_SET' | 'ASSIGNED' | 'REASSIGNED'
  | 'ROUTED_TO_ADMIN' | 'STATUS_CHANGED' | 'REPLY_ADDED'
  | 'CLOSED' | 'REOPENED' | 'ATTACHMENT_ADDED';

export interface AuditEvent {
  id: number;
  action: AuditAction;
  actor_name: string | null;
  actor_role: UserRoleOrSystem;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  timestamp: string;
}

type UserRoleOrSystem = 'ADMIN' | 'DEVELOPER' | 'CLIENT_PORTAL' | 'SYSTEM';

export interface TimelineResponse {
  ticket_id: number;
  tracking_number: string;
  events: AuditEvent[];
  duration_summary: {
    total_hours_open: number;
    time_in_status: Record<string, number>;
  };
}
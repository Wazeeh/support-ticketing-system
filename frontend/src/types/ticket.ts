export type SoftwareType = 'TMS' | 'FINMAN';

export type TicketStatus =
  | 'SUBMITTED' | 'ACCEPTED' | 'ASSIGNED'
  | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED' | 'REOPENED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Ticket {
  id: number;
  tracking_number: string;
  piu_id: number;
  ti_id: number;
  software: SoftwareType;
  issue_category: string;
  other_description: string | null;
  submitter_name: string;
  submitter_email: string;
  submitter_phone?: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority | null;
  assigned_to_user_id: number | null;
  created_at: string;
  completed_at: string | null;
  closed_at: string | null;
}

export interface TicketListResponse {
  data: Ticket[];
  pagination: { page: number; page_size: number; total: number };
}
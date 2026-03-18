import { EmailTemplate } from './EmailTemplate';

export interface EmailEvent {
  to: string;
  subject: string;
  template: EmailTemplate;
  payload: Record<string, unknown>;
  createdAt: Date;
}

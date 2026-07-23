export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  organization: string;
  avatar?: string;
}

export interface Organization {
  _id: string;
  name: string;
  logo?: string;
  website?: string;
  industry?: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
}

export interface Attribute {
  k: string;
  v_str?: string;
  v_num?: number;
  v_date?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phoneNo?: string;
  tags?: string[];
  emailStatus: 'active' | 'bounced' | 'unsubscribed' | 'complained';
  allowBroadcast: boolean;
  attributes: Attribute[];
  belongsTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list' | 'is_set' | 'is_not_set';
  value: string | number;
}

export interface Segment {
  _id: string;
  name: string;
  description?: string;
  conditions: Condition[];
  organization: string;
  calculatedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlockItem {
  id: string;
  type: string;
  content: any;
  styles?: Record<string, any>;
}

export interface EmailTemplate {
  _id: string;
  name: string;
  subject?: string;
  htmlContent: string;
  jsonData?: {
    blocks: BlockItem[];
    globalStyles?: Record<string, any>;
  };
  thumbnail?: string;
  organization: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  total: number;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export interface Campaign {
  _id: string;
  name: string;
  subject: string;
  template?: EmailTemplate | string;
  audienceType: 'all' | 'segment' | 'static';
  segment?: Segment | string;
  staticList?: string[];
  fromName?: string;
  fromEmail?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  stats: CampaignStats;
  organization: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  organization: string;
  createdAt: string;
}

export interface ABTestVariant {
  label: string;
  subject: string;
  template?: string;
  samplePercentage: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
}

export interface ABTest {
  _id: string;
  name: string;
  organization: string;
  segment?: string;
  status: 'draft' | 'running' | 'completed';
  winnerCriteria: 'open_rate' | 'click_rate';
  testDurationHours: number;
  winningVariant?: string;
  variants: ABTestVariant[];
  createdAt: string;
}

export interface CustomField {
  _id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'date';
  organization: string;
}

export interface OrgSettings {
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  apiKey?: string;
  provider?: string;
}

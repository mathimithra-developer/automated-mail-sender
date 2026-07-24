export interface HeadingBlockData {
  id: string;
  type: 'heading';
  content: {
    text: string;
    tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    fontSize: number;
    fontWeight: '400' | '500' | '600' | '700' | '800' | '900';
    color: string;
    align: 'left' | 'center' | 'right';
    letterSpacing: number;
    lineHeight: number;
  };
}

export interface ParagraphBlockData {
  id: string;
  type: 'paragraph';
  content: {
    text: string;
    fontSize: number;
    color: string;
    align: 'left' | 'center' | 'right';
    lineHeight: number;
  };
}

export interface ButtonBlockData {
  id: string;
  type: 'button';
  content: {
    label: string;
    url: string;
    backgroundColor: string;
    color: string;
    borderRadius: number;
    align: 'left' | 'center' | 'right';
    paddingX: number;
    paddingY: number;
    shadow: boolean;
  };
}

export interface ImageBlockData {
  id: string;
  type: 'image';
  content: {
    url: string;
    alt: string;
    linkUrl: string;
    borderRadius: number;
    align: 'left' | 'center' | 'right';
  };
}

export interface DividerBlockData {
  id: string;
  type: 'divider';
  content: {
    style: 'solid' | 'dashed' | 'dotted';
    thickness: number;
    color: string;
    paddingTop: number;
    paddingBottom: number;
  };
}

export interface SpacerBlockData {
  id: string;
  type: 'spacer';
  content: {
    height: number;
  };
}

export interface VideoBlockData {
  id: string;
  type: 'video';
  content: {
    thumbnailUrl: string;
    videoUrl: string;
    alt: string;
    borderRadius: number;
  };
}

export interface SocialLinkItem {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'whatsapp' | 'telegram';
  url: string;
}

export interface SocialBlockData {
  id: string;
  type: 'social';
  content: {
    iconSize: number;
    align: 'left' | 'center' | 'right';
    iconColor: string;
    links: SocialLinkItem[];
  };
}

export interface HtmlBlockData {
  id: string;
  type: 'html';
  content: {
    html: string;
  };
}

export interface MenuLinkItem {
  label: string;
  url: string;
}

export interface MenuBlockData {
  id: string;
  type: 'menu';
  content: {
    align: 'left' | 'center' | 'right';
    color: string;
    fontSize: number;
    separator: string;
    links: MenuLinkItem[];
  };
}

export interface TableBlockData {
  id: string;
  type: 'table';
  content: {
    headerBg: string;
    headerTextColor: string;
    stripedRows: boolean;
    borderColor: string;
    headers: string[];
    rows: string[][];
  };
}

export interface IconItem {
  name: 'star' | 'heart' | 'check-circle' | 'mail' | 'phone' | 'gift' | 'truck' | 'shield' | 'clock' | 'thumbs-up';
  url?: string;
}

export interface IconsBlockData {
  id: string;
  type: 'icons';
  content: {
    iconSize: number;
    align: 'left' | 'center' | 'right';
    iconColor: string;
    icons: IconItem[];
  };
}

export interface RatingBlockData {
  id: string;
  type: 'rating';
  content: {
    maxStars: number;
    ratingValue: number;
    url: string;
    color: string;
    size: number;
    align: 'left' | 'center' | 'right';
  };
}

export interface ProductCardBlockData {
  id: string;
  type: 'productCard';
  content: {
    imageUrl: string;
    title: string;
    price: string;
    oldPrice: string;
    description: string;
    ctaLabel: string;
    ctaUrl: string;
    ctaColor: string;
    borderRadius: number;
  };
}

export interface ProductGridItem {
  imageUrl: string;
  title: string;
  price: string;
  linkUrl: string;
}

export interface ProductGridBlockData {
  id: string;
  type: 'productGrid';
  content: {
    columns: number;
    products: ProductGridItem[];
  };
}

export interface CouponBlockData {
  id: string;
  type: 'coupon';
  content: {
    headline: string;
    headlineColor: string;
    discount: string;
    code: string;
    subtext: string;
    backgroundColor: string;
    borderColor: string;
  };
}

export interface CountdownBlockData {
  id: string;
  type: 'countdown';
  content: {
    deadline: string;
    label: string;
    backgroundColor: string;
    accentColor: string;
  };
}

export interface QrCodeBlockData {
  id: string;
  type: 'qrCode';
  content: {
    url: string;
    size: number;
    caption: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface PollOptionItem {
  emoji: string;
  label: string;
  url: string;
}

export interface PollBlockData {
  id: string;
  type: 'poll';
  content: {
    question: string;
    align: 'left' | 'center' | 'right';
    options: PollOptionItem[];
  };
}

export interface ConditionalBlockData {
  id: string;
  type: 'conditional';
  content: {
    condition: string;
    ifTrueContent: string;
    ifFalseContent: string;
  };
}

export type BuilderBlock =
  | HeadingBlockData
  | ParagraphBlockData
  | ButtonBlockData
  | ImageBlockData
  | DividerBlockData
  | SpacerBlockData
  | VideoBlockData
  | SocialBlockData
  | HtmlBlockData
  | MenuBlockData
  | TableBlockData
  | IconsBlockData
  | RatingBlockData
  | ProductCardBlockData
  | ProductGridBlockData
  | CouponBlockData
  | CountdownBlockData
  | QrCodeBlockData
  | PollBlockData
  | ConditionalBlockData;

// ── SECTION & COLUMN LAYOUT SYSTEM TYPES ────────────────────────────────────

export interface GlobalTheme {
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  buttonColor: string;

  // Page Background (Entire Workspace)
  pageBackgroundColor?: string;
  pageBackgroundImage?: string;
  pageBackgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  pageBackgroundSize?: 'cover' | 'contain' | 'auto';
  pageBackgroundPosition?: string;
  pageBackgroundOpacity?: number;

  // Email Body Canvas
  bodyBackgroundColor?: string;
  bodyBackgroundImage?: string;
  bodyWidth?: number;
  bodyPadding?: number;
  bodyBorderRadius?: number;
  bodyShadow?: string;
}

export interface ColumnData {
  id: string;
  width?: string;
  styles?: {
    padding?: string;
    backgroundColor?: string;
    verticalAlign?: 'top' | 'middle' | 'bottom';
  };
  components: BuilderBlock[];
}

export interface SectionData {
  id: string;
  background?: string;
  padding?: string;
  columns: ColumnData[];
  visibility?: 'all' | 'desktop' | 'mobile';
}

export interface TemplateData {
  _id?: string;
  name: string;
  version: string;
  globalTheme: GlobalTheme;
  variables: { name: string; fallback: string }[];
  sections: SectionData[];
  tracking: { openTracking: boolean; clickTracking: boolean };
  metadata: { aiPrompt: string; category: string; subject: string; preheader: string };
}

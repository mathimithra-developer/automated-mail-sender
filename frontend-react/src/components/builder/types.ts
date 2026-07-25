// ── EXISTING & NEW BUILDER BLOCK INTERFACES ──────────────────────────────────

export interface HeadingBlockData {
  id: string;
  type: 'heading';
  isLocked?: boolean;
  content: {
    text: string;
    tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    fontSize: number;
    fontWeight: '400' | '500' | '600' | '700' | '800' | '900';
    color: string;
    align: 'left' | 'center' | 'right';
    letterSpacing: number;
    lineHeight: number;
    fontFamily?: string;
  };
}

export interface TextBlockData {
  id: string;
  type: 'text';
  isLocked?: boolean;
  content: {
    text: string;
    fontSize?: number;
    color?: string;
    align?: 'left' | 'center' | 'right';
    fontFamily?: string;
    fontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
    lineHeight?: number;
  };
}

export interface ParagraphBlockData {
  id: string;
  type: 'paragraph';
  isLocked?: boolean;
  content: {
    text: string;
    fontSize: number;
    color: string;
    align: 'left' | 'center' | 'right';
    lineHeight: number;
    fontFamily?: string;
    fontWeight?: string;
  };
}

export interface ButtonBlockData {
  id: string;
  type: 'button';
  isLocked?: boolean;
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
    size?: 'small' | 'medium' | 'large';
    variant?: 'solid' | 'outline' | 'gradient';
    icon?: string;
  };
}

export interface ImageBlockData {
  id: string;
  type: 'image';
  isLocked?: boolean;
  content: {
    url: string;
    alt: string;
    linkUrl: string;
    borderRadius: number;
    align: 'left' | 'center' | 'right';
    caption?: string;
    shadow?: boolean;
    fullWidth?: boolean;
  };
}

export interface DividerBlockData {
  id: string;
  type: 'divider';
  isLocked?: boolean;
  content: {
    style: 'solid' | 'dashed' | 'dotted' | 'gradient';
    thickness: number;
    color: string;
    paddingTop: number;
    paddingBottom: number;
  };
}

export interface SpacerBlockData {
  id: string;
  type: 'spacer';
  isLocked?: boolean;
  content: {
    height: number;
  };
}

export interface VideoBlockData {
  id: string;
  type: 'video';
  isLocked?: boolean;
  content: {
    thumbnailUrl: string;
    videoUrl: string;
    alt: string;
    borderRadius: number;
  };
}

export interface SocialLinkItem {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'youtube' | 'whatsapp' | 'telegram' | 'github';
  url: string;
}

export interface SocialBlockData {
  id: string;
  type: 'social';
  isLocked?: boolean;
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
  isLocked?: boolean;
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
  isLocked?: boolean;
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
  isLocked?: boolean;
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
  name: 'star' | 'heart' | 'check-circle' | 'mail' | 'phone' | 'gift' | 'truck' | 'shield' | 'clock' | 'thumbs-up' | 'zap' | 'sparkles' | 'award';
  url?: string;
}

export interface IconsBlockData {
  id: string;
  type: 'icons';
  isLocked?: boolean;
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
  isLocked?: boolean;
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
  isLocked?: boolean;
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
  isLocked?: boolean;
  content: {
    columns: number;
    products: ProductGridItem[];
  };
}

export interface CouponBlockData {
  id: string;
  type: 'coupon';
  isLocked?: boolean;
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
  isLocked?: boolean;
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
  isLocked?: boolean;
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
  isLocked?: boolean;
  content: {
    question: string;
    align: 'left' | 'center' | 'right';
    options: PollOptionItem[];
  };
}

export interface ConditionalBlockData {
  id: string;
  type: 'conditional';
  isLocked?: boolean;
  content: {
    condition: string;
    ifTrueContent: string;
    ifFalseContent: string;
  };
}

// ── NEW MODULAR BUILDER BLOCK INTERFACES ─────────────────────────────────────

export interface LogoBlockData {
  id: string;
  type: 'logo';
  isLocked?: boolean;
  content: {
    url: string;
    alt: string;
    linkUrl: string;
    maxWidth: number;
    align: 'left' | 'center' | 'right';
    paddingY: number;
  };
}

export interface GreetingBlockData {
  id: string;
  type: 'greeting';
  isLocked?: boolean;
  content: {
    greeting: string;
    variable: string;
    emoji: string;
    fontSize: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface HeroBannerBlockData {
  id: string;
  type: 'heroBanner';
  isLocked?: boolean;
  content: {
    imageUrl: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaUrl: string;
    ctaColor: string;
    overlayColor: string;
    align: 'left' | 'center' | 'right';
    height: number;
  };
}

export interface EmojiRowBlockData {
  id: string;
  type: 'emojiRow';
  isLocked?: boolean;
  content: {
    emoji?: string;
    emojis?: string[];
    text?: string;
    isParagraph?: boolean;
    size: number;
    align: 'left' | 'center' | 'right';
  };
}

export interface CalloutBlockData {
  id: string;
  type: 'callout';
  isLocked?: boolean;
  content: {
    icon: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaUrl: string;
    bgColor: string;
    borderColor: string;
    accentColor: string;
  };
}

export interface InfoCardBlockData {
  id: string;
  type: 'infoCard';
  isLocked?: boolean;
  content: {
    icon: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
    bgColor: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface FeatureCardItem {
  icon: string;
  title: string;
  description: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface FeatureCardBlockData {
  id: string;
  type: 'featureCard';
  isLocked?: boolean;
  content: {
    icon: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaUrl: string;
    bgColor: string;
    borderColor: string;
  };
}

export interface MultiFeatureBlockData {
  id: string;
  type: 'multiFeature';
  isLocked?: boolean;
  content: {
    columns: number;
    items: FeatureCardItem[];
  };
}

export interface BenefitsListBlockData {
  id: string;
  type: 'benefitsList';
  isLocked?: boolean;
  content: {
    icon: string;
    iconColor: string;
    items: string[];
    fontSize: number;
  };
}

export interface BulletListBlockData {
  id: string;
  type: 'bulletList';
  isLocked?: boolean;
  content: {
    bulletStyle: 'check' | 'arrow' | 'star' | 'dot';
    bulletColor: string;
    items: string[];
    fontSize: number;
  };
}

export interface StepItem {
  stepNumber: number;
  title: string;
  description: string;
}

export interface NumberedStepsBlockData {
  id: string;
  type: 'numberedSteps';
  isLocked?: boolean;
  content: {
    steps: StepItem[];
    accentColor: string;
  };
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface TimelineBlockData {
  id: string;
  type: 'timeline';
  isLocked?: boolean;
  content: {
    events: TimelineEvent[];
    accentColor: string;
  };
}

export interface QuoteBlockData {
  id: string;
  type: 'quote';
  isLocked?: boolean;
  content: {
    quote: string;
    author: string;
    role: string;
    avatarUrl: string;
    bgColor: string;
    accentColor: string;
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionBlockData {
  id: string;
  type: 'faqAccordion';
  isLocked?: boolean;
  content: {
    items: FaqItem[];
    bgColor: string;
    borderColor: string;
  };
}

export interface DualButtonBlockData {
  id: string;
  type: 'dualButton';
  isLocked?: boolean;
  content: {
    primaryLabel: string;
    primaryUrl: string;
    primaryBg: string;
    primaryColor: string;
    secondaryLabel: string;
    secondaryUrl: string;
    secondaryBg: string;
    secondaryColor: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface FooterBlockData {
  id: string;
  type: 'footer';
  isLocked?: boolean;
  content: {
    companyName: string;
    address: string;
    unsubscribeUrl: string;
    privacyUrl: string;
    copyrightText: string;
    textColor: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface SignatureBlockData {
  id: string;
  type: 'signature';
  isLocked?: boolean;
  content: {
    name: string;
    role: string;
    company: string;
    email: string;
    phone: string;
    avatarUrl: string;
    accentColor: string;
  };
}

export interface PricingCardBlockData {
  id: string;
  type: 'pricingCard';
  isLocked?: boolean;
  content: {
    planName: string;
    price: string;
    period: string;
    features: string[];
    ctaLabel: string;
    ctaUrl: string;
    isPopular: boolean;
    bgColor: string;
    accentColor: string;
  };
}

export interface ContainerBlockData {
  id: string;
  type: 'container';
  isLocked?: boolean;
  content: {
    title: string;
    description: string;
    bgColor: string;
    borderColor: string;
    borderRadius: number;
    padding: number;
  };
}

export interface AlertBoxBlockData {
  id: string;
  type: 'alertBox';
  isLocked?: boolean;
  content: {
    variant: 'success' | 'info' | 'warning' | 'danger';
    title: string;
    message: string;
  };
}

export interface CodeBlockData {
  id: string;
  type: 'code';
  isLocked?: boolean;
  content: {
    code: string;
    language: string;
    bgColor: string;
    textColor: string;
  };
}

export interface VariableBlockData {
  id: string;
  type: 'variable';
  isLocked?: boolean;
  content: {
    variableName: string;
    fallback: string;
    label: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface ButtonCardBlockData {
  id: string;
  type: 'buttonCard';
  isLocked?: boolean;
  content: {
    icon: string;
    heading: string;
    description: string;
    ctaLabel: string;
    ctaUrl: string;
    bgColor: string;
    accentColor: string;
  };
}

export interface HighlightBoxBlockData {
  id: string;
  type: 'highlightBox';
  isLocked?: boolean;
  content: {
    icon: string;
    heading: string;
    text: string;
    ctaLabel: string;
    ctaUrl: string;
    bgColor: string;
    textColor: string;
  };
}

export interface ChecklistItem {
  text: string;
  checked: boolean;
}

export interface ChecklistBlockData {
  id: string;
  type: 'checklist';
  isLocked?: boolean;
  content: {
    title: string;
    items: ChecklistItem[];
    checkColor: string;
  };
}

export interface IconTextBlockData {
  id: string;
  type: 'iconText';
  isLocked?: boolean;
  content: {
    icon: string;
    iconColor: string;
    heading: string;
    description: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface BadgeBlockData {
  id: string;
  type: 'badge';
  isLocked?: boolean;
  content: {
    text: string;
    bgColor: string;
    textColor: string;
    size: 'small' | 'medium' | 'large';
    align: 'left' | 'center' | 'right';
  };
}

export interface StatItem {
  label: string;
  value: string;
  subtext?: string;
}

export interface StatisticsBlockData {
  id: string;
  type: 'statistics';
  isLocked?: boolean;
  content: {
    stats: StatItem[];
    bgColor: string;
    accentColor: string;
  };
}

export interface NewsletterHeaderBlockData {
  id: string;
  type: 'newsletterHeader';
  isLocked?: boolean;
  content: {
    logoUrl: string;
    title: string;
    subtitle: string;
    issueDate: string;
    bgColor: string;
    accentColor: string;
  };
}

export interface BannerCtaBlockData {
  id: string;
  type: 'bannerCta';
  isLocked?: boolean;
  content: {
    headline: string;
    subheadline: string;
    ctaLabel: string;
    ctaUrl: string;
    imageUrl: string;
    bgColor: string;
  };
}

export type BuilderBlock =
  | HeadingBlockData
  | TextBlockData
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
  | ConditionalBlockData
  | LogoBlockData
  | GreetingBlockData
  | HeroBannerBlockData
  | EmojiRowBlockData
  | CalloutBlockData
  | InfoCardBlockData
  | FeatureCardBlockData
  | MultiFeatureBlockData
  | BenefitsListBlockData
  | BulletListBlockData
  | NumberedStepsBlockData
  | TimelineBlockData
  | QuoteBlockData
  | FaqAccordionBlockData
  | DualButtonBlockData
  | FooterBlockData
  | SignatureBlockData
  | PricingCardBlockData
  | ContainerBlockData
  | AlertBoxBlockData
  | CodeBlockData
  | VariableBlockData
  | ButtonCardBlockData
  | HighlightBoxBlockData
  | ChecklistBlockData
  | IconTextBlockData
  | BadgeBlockData
  | StatisticsBlockData
  | NewsletterHeaderBlockData
  | BannerCtaBlockData;

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

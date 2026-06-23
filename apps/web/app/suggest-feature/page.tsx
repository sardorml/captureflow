import '../marketing.css';
import type { Metadata } from 'next';
import { I18nProvider } from '@/components/marketing/i18n-provider';
import { MarketingShell } from '@/components/marketing/marketing-shell';
import { SuggestFeatureClient } from './suggest-feature-client';

export const metadata: Metadata = {
  title: 'Suggest a feature',
  description:
    'Share your ideas to improve CaptureFlow. Submit feature requests and help shape the open-source macOS screen recorder’s roadmap.',
  alternates: { canonical: '/suggest-feature' },
};

export default function SuggestFeaturePage() {
  return (
    <I18nProvider>
      <MarketingShell>
        <SuggestFeatureClient />
      </MarketingShell>
    </I18nProvider>
  );
}

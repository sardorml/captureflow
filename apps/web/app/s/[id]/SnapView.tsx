import { ContentByline, ViewerNav } from '../../_components/snap';
import type { ViewerNavViewer } from '../../_components/snap';
import { PoweredBy } from '../../_components/powered-by';
import { APP_SITE_URL, MARKETING_SITE_URL, PRODUCT_NAME } from '@/lib/site';
import { ThemeToggle, type Theme } from '@captureflow/ui';
import { AuthSync } from './AuthSync';
import { AuthPrompt } from './AuthPrompt';
import { SnapActions } from './SnapActions';
import { ViewerUserMenu } from './ViewerUserMenu';
import { ZoomableSnapImage } from './ZoomableSnapImage';

type Props = {
  id: string;
  title: string | null;
  imageUrl: string;
  width: number;
  height: number;
  createdAt: number;
  viewCount: number;
  ownerName: string | null;
  viewer?: ViewerNavViewer | null;
  viewerUserId?: string | null;
  viewerImageUrl?: string | null;
  isOwner: boolean;
  visibility: 'public' | 'workspace' | 'private';
  workspaceName: string | null;
  allowPublicLinks: boolean;
  snapUrl: string;
  editUrl: string;
  theme: Theme;
  loginUrl: string;
};

export function SnapView({
  id,
  title,
  imageUrl,
  width,
  height,
  createdAt,
  viewCount,
  ownerName,
  viewer,
  viewerUserId,
  viewerImageUrl,
  isOwner,
  visibility,
  workspaceName,
  allowPublicLinks,
  snapUrl,
  editUrl,
  theme,
  loginUrl,
}: Props) {
  const headline = title?.trim() || `${PRODUCT_NAME} snap`;
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg">
      <AuthSync initialUserId={viewerUserId ?? null} />
      <ViewerNav
        homeUrl={APP_SITE_URL}
        productName={PRODUCT_NAME}
        viewCount={viewCount}
        viewer={viewer ?? null}
        themeToggle={<ThemeToggle initialTheme={theme} />}
        actions={
          <SnapActions
            snapId={id}
            snapUrl={snapUrl}
            editUrl={editUrl}
            initialVisibility={visibility}
            isOwner={isOwner}
            workspaceName={workspaceName}
            allowPublicLinks={allowPublicLinks}
            signedIn={!!viewer}
          />
        }
        userMenu={
          viewer ? (
            <ViewerUserMenu
              userId={viewerUserId ?? ''}
              name={viewer.name}
              email={viewer.email}
              imageUrl={viewerImageUrl ?? null}
              appWebUrl={APP_SITE_URL}
            />
          ) : (
            <AuthPrompt marketingUrl={MARKETING_SITE_URL} loginUrl={loginUrl} />
          )
        }
      />
      <main className="flex flex-1 flex-col gap-8 px-6 py-10 sm:px-10 sm:py-12">
        <header className="mx-auto w-full max-w-6xl">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
            {headline}
          </h1>
          <ContentByline ownerName={ownerName} createdAt={createdAt} />
        </header>
        <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center">
          <div
            className="overflow-hidden rounded-2xl"
            style={{ aspectRatio: `${width} / ${height}`, maxWidth: width }}
          >
            <ZoomableSnapImage
              src={imageUrl}
              alt={headline}
              width={width}
              height={height}
            />
          </div>
        </div>
        <footer className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 text-sm text-neutral-500">
          <a
            href={MARKETING_SITE_URL}
            className="transition-colors hover:text-neutral-200"
            rel="noopener noreferrer"
          >
            Made with {PRODUCT_NAME}
          </a>
          <PoweredBy />
          <span className="font-mono text-xs text-neutral-600">{id}</span>
        </footer>
      </main>
    </div>
  );
}

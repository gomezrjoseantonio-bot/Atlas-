
import { Page } from '../components/layout/Page';
import { Card, CardContent } from '../components/ui/Card';
import { Icon, IconName } from '../components/Icon';

interface PlaceholderPageProps {
  title: string;
  icon: IconName;
  hito?: string;
  description?: string;
}

export function PlaceholderPage({ title, icon, hito, description }: PlaceholderPageProps) {
  const placeholderTitle = hito ? `${title} — pendiente ${hito}` : `Placeholder — ${title}`;
  
  return (
    <Page title={placeholderTitle}>
      <Card>
        <CardContent className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Icon name={icon} size="xl" state="inactive" />
          </div>
          <h2 className="text-lg font-medium text-ink mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-text-secondary mb-4">
              {description}
            </p>
          )}
          <p className="text-sm text-text-secondary">
            {hito ? `Funcionalidad pendiente de implementar en ${hito}` : 'Página en desarrollo'}
          </p>
        </CardContent>
      </Card>
    </Page>
  );
}
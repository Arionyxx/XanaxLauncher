import { Settings, Library, Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onAddSource: () => void
}

export function EmptyState({ onAddSource }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-24 h-24 bg-muted rounded-2xl flex items-center justify-center">
            <Library className="w-12 h-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              No sources configured
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Get started by adding media sources in Settings. Sources provide a
              catalog of items you can browse and download.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="text-center">
          <Button size="lg" onClick={onAddSource} className="w-full sm:w-auto">
            <Settings className="w-4 h-4 mr-2" />
            Go to Settings
          </Button>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Add Sources</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Library className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Browse Catalog</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Download</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { motion } from 'framer-motion'
import { Download, Link, Monitor, HardDrive } from 'lucide-react'
import { GameEntry } from '@/hooks/useGames'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface GameCardProps {
  game: GameEntry
  onClick: () => void
  onDownload: (game: GameEntry) => void
  viewMode: 'grid' | 'list'
}

export function GameCard({
  game,
  onClick,
  onDownload,
  viewMode,
}: GameCardProps) {
  const coverImage = game.meta?.coverImage as string | undefined
  const size = game.meta?.size as string | undefined
  const platform = game.meta?.platform as string | undefined

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full"
      >
        <Card
          className="cursor-pointer hover:shadow-md hover:shadow-primary/10 transition-all duration-200 group"
          onClick={onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <Monitor className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {game.sourceName}
                      </Badge>
                      {platform && (
                        <Badge variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      )}
                      {size && (
                        <Badge variant="outline" className="text-xs">
                          <HardDrive className="w-3 h-3 mr-1" />
                          {size}
                        </Badge>
                      )}
                      {game.links.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          <Link className="w-3 h-3 mr-1" />
                          {game.links.length} links
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDownload(game)
                    }}
                    className="shrink-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full"
    >
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 h-full group"
        onClick={onClick}
      >
        {/* Cover Image */}
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={game.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Monitor className="w-16 h-16 text-muted-foreground/50" />
            </div>
          )}

          {/* Overlay with source badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-black/50 text-white border-0"
            >
              {game.sourceName}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardHeader className="p-4 pb-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {game.title}
          </h3>
        </CardHeader>

        <CardContent className="p-4 pt-0 pb-2">
          <div className="flex flex-wrap gap-1">
            {platform && (
              <Badge variant="outline" className="text-xs">
                {platform}
              </Badge>
            )}
            {size && (
              <Badge variant="outline" className="text-xs">
                <HardDrive className="w-3 h-3 mr-1" />
                {size}
              </Badge>
            )}
            {game.links.length > 1 && (
              <Badge variant="outline" className="text-xs">
                <Link className="w-3 h-3 mr-1" />
                {game.links.length}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              onDownload(game)
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

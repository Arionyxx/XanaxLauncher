import { Card, CardBody, Button, Chip } from '@nextui-org/react'
import { motion } from 'framer-motion'
import { GameEntry } from '@/hooks/useGames'

interface GameCardProps {
  game: GameEntry
  onClick: () => void
}

export function GameCard({ game, onClick }: GameCardProps) {
  const coverImage = game.meta?.coverImage as string | undefined
  const size = game.meta?.size as string | undefined
  const platform = game.meta?.platform as string | undefined

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        isPressable
        onPress={onClick}
        className="bg-surface0 border-surface1 hover:border-blue transition-all h-full"
      >
        <CardBody className="p-0 flex flex-col">
          {/* Cover Image */}
          <div className="aspect-[3/4] bg-surface1 flex items-center justify-center overflow-hidden relative">
            {coverImage ? (
              <img
                src={coverImage}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl">🎮</span>
            )}
            {/* Source Badge */}
            <div className="absolute top-2 right-2">
              <Chip
                size="sm"
                className="bg-mantle/90 text-text font-medium"
                variant="flat"
              >
                {game.sourceName}
              </Chip>
            </div>
          </div>

          {/* Game Info */}
          <div className="p-4 flex flex-col gap-2">
            <h3 className="font-semibold text-text line-clamp-2 min-h-[2.5rem]">
              {game.title}
            </h3>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-1">
              {platform && (
                <Chip size="sm" color="primary" variant="flat">
                  {platform}
                </Chip>
              )}
              {size && (
                <Chip size="sm" color="secondary" variant="flat">
                  {size}
                </Chip>
              )}
              {game.links.length > 1 && (
                <Chip size="sm" color="warning" variant="flat">
                  {game.links.length} links
                </Chip>
              )}
            </div>

            {/* Download Button */}
            <Button
              color="primary"
              size="sm"
              className="w-full mt-2"
              onPress={onClick}
            >
              Download
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}

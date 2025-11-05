import { motion } from 'framer-motion'
import { FiDownload, FiLink } from 'react-icons/fi'
import { GameEntry } from '@/hooks/useGames'

interface GameCardProps {
  game: GameEntry
  onClick: () => void
  onDownload: (game: GameEntry) => void
}

export function GameCard({ game, onClick, onDownload }: GameCardProps) {
  const coverImage = game.meta?.coverImage as string | undefined
  const size = game.meta?.size as string | undefined
  const platform = game.meta?.platform as string | undefined

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full"
    >
      <div
        className="card bg-base-200 shadow-xl hover:shadow-2xl hover:shadow-primary/20 transition-all h-full cursor-pointer"
        onClick={onClick}
      >
        <figure className="aspect-[3/4] bg-base-300 relative overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={game.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-6xl opacity-40">🎮</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <div className="badge badge-neutral badge-sm">{game.sourceName}</div>
          </div>
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title text-base line-clamp-2 min-h-[3rem]">
            {game.title}
          </h2>
          <div className="flex flex-wrap gap-1 mt-2">
            {platform && (
              <div className="badge badge-primary badge-sm">{platform}</div>
            )}
            {size && <div className="badge badge-secondary badge-sm">{size}</div>}
            {game.links.length > 1 && (
              <div className="badge badge-accent badge-sm">
                <FiLink className="mr-1" />
                {game.links.length}
              </div>
            )}
          </div>
          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary btn-sm w-full"
              onClick={(e) => {
                e.stopPropagation()
                onDownload(game)
              }}
            >
              <FiDownload />
              Download
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

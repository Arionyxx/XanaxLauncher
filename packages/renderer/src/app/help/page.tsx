'use client'

import { AppLayout } from '@/components/AppLayout'
import { FiBook, FiInfo, FiKey } from 'react-icons/fi'

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Help & About</h1>
          <p className="text-base-content/70 mt-1">
            Learn more about XanaxLauncher
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <FiKey />
                Keyboard Shortcuts
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <kbd className="kbd">Ctrl/Cmd</kbd> +{' '}
                  <kbd className="kbd">H</kbd>
                  <span>Home</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="kbd">Ctrl/Cmd</kbd> +{' '}
                  <kbd className="kbd">J</kbd>
                  <span>Downloads</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="kbd">Ctrl/Cmd</kbd> +{' '}
                  <kbd className="kbd">,</kbd>
                  <span>Settings</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="kbd">Ctrl/Cmd</kbd> +{' '}
                  <kbd className="kbd">F</kbd>
                  <span>Search</span>
                </div>
                <div className="flex justify-between">
                  <kbd className="kbd">Esc</kbd>
                  <span>Close Modal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">
                <FiInfo />
                About
              </h2>
              <div className="space-y-2">
                <p>
                  <strong>Version:</strong> 1.0.0
                </p>
                <p>
                  <strong>Framework:</strong> Electron + Next.js
                </p>
                <p>
                  <strong>UI Library:</strong> DaisyUI
                </p>
                <p className="text-sm text-base-content/70 mt-4">
                  XanaxLauncher is a modern media management application built
                  with Electron, Next.js, and DaisyUI.
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl lg:col-span-2">
            <div className="card-body">
              <h2 className="card-title">
                <FiBook />
                Getting Started
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Configure Settings</h3>
                  <p className="text-sm text-base-content/70">
                    Start by configuring your download directories and
                    integrations in the Settings page.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Add Sources</h3>
                  <p className="text-sm text-base-content/70">
                    Add media sources to populate your catalog with content.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Browse & Download</h3>
                  <p className="text-sm text-base-content/70">
                    Browse the catalog, select items, and start downloading!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

// Shown on Store Admin pages (Branches/Products/Categories/Employees) when the admin
// hasn't created their store yet — those pages can't do anything meaningful without one.
const NoStoreBanner = ({ action = 'do this' }) => (
  <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
    <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
    <div className="text-sm text-amber-800 dark:text-amber-300">
      <p className="font-semibold">No store yet</p>
      <p className="mt-0.5">
        You need to{' '}
        <Link to="/store/stores" className="underline font-medium">
          create your store
        </Link>{' '}
        before you can {action}.
      </p>
    </div>
  </div>
)

export default NoStoreBanner

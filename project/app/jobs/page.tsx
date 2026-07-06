'use client';

import { PublicNavbar } from '@/components/public-navbar';
import { PublicFooter } from '@/components/public-footer';
import { JobSearchView } from '@/components/job-search-view';

export default function JobSearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Find Your Next Job</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse live openings from SCN Jobs recruiters.
          </p>
        </div>
        <JobSearchView />
      </main>
      <PublicFooter />
    </div>
  );
}

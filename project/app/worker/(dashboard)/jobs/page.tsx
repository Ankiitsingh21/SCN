'use client';

import { PageHeader } from '@/components/page-header';
import { JobSearchView } from '@/components/job-search-view';

export default function WorkerJobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Jobs"
        description="Discover opportunities that match your skills and preferences"
      />
      <JobSearchView />
    </div>
  );
}

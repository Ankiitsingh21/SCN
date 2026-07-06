'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Briefcase, Calendar, FileText, Plus, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatCard } from '@/components/stat-card';
import { PageHeader } from '@/components/page-header';
import { applicationsApi, jobsApi, JobWithMeta } from '@/lib/scn-api';
import { Application } from '@/lib/types';
import { getInitials } from '@/lib/format';

export default function RecruiterDashboardPage() {
  const jobsQuery = useQuery({ queryKey: ['recruiter-jobs'], queryFn: jobsApi.list });
  const applicationsQuery = useQuery({ queryKey: ['recruiter-applications'], queryFn: applicationsApi.recruiterList });
  const jobs: JobWithMeta[] = jobsQuery.data ?? [];
  const applications: Application[] = applicationsQuery.data ?? [];
  const activeJobs = jobs.filter((job) => job.status === 'published').length;
  const draftJobs = jobs.filter((job) => job.status === 'draft').length;
  const closedJobs = jobs.filter((job) => job.status === 'closed').length;
  const interviews = applications.filter((app) => app.status === 'interview_scheduled').length;
  const hired = applications.filter((app) => app.status === 'hired').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your live hiring overview."
        action={<Button asChild><Link href="/recruiter/jobs/new"><Plus className="mr-2 h-4 w-4" />Post a Job</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jobs Posted" value={jobs.length} icon={Briefcase} color="primary" delay={0} />
        <StatCard label="Total Applications" value={applications.length} icon={FileText} color="accent" delay={0.05} />
        <StatCard label="Interviews" value={interviews} icon={Calendar} color="warning" delay={0.1} />
        <StatCard label="Hired" value={hired} icon={UserCheck} color="success" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="font-semibold">Job Status</h3>
          <p className="text-sm text-muted-foreground">Current job postings</p>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Active Jobs', value: activeJobs, color: 'bg-success' },
              { label: 'Draft Jobs', value: draftJobs, color: 'bg-warning' },
              { label: 'Closed Jobs', value: closedJobs, color: 'bg-muted-foreground' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-6 w-full" asChild>
            <Link href="/recruiter/jobs">Manage Jobs</Link>
          </Button>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent Applications</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/recruiter/applications">View all<ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 6).map((app) => (
              <Link key={app.id} href="/recruiter/applications" className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">{getInitials(app.workerName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{app.workerName}</p>
                  <p className="truncate text-xs text-muted-foreground">{app.job.title}</p>
                </div>
                <Badge variant="outline" className="capitalize text-xs">{app.status.replace('_', ' ')}</Badge>
              </Link>
            ))}
            {!applications.length && <p className="text-sm text-muted-foreground">Applications will appear here once workers apply.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Clock,
  FileText,
  Search,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { JobCard } from '@/components/job-card';
import { EmptyState } from '@/components/empty-state';
import { Application, Job } from '@/lib/types';
import { applicationsApi, jobsApi, workerApi, WorkerWithMeta } from '@/lib/scn-api';
import { useAuth } from '@/lib/auth-context';

const quickActions = [
  { label: 'Search Jobs', href: '/worker/jobs', icon: Search, color: 'bg-primary/10 text-primary' },
  { label: 'My Applications', href: '/worker/applications', icon: FileText, color: 'bg-accent/10 text-accent' },
  { label: 'Edit Profile', href: '/worker/profile', icon: User, color: 'bg-success/10 text-success' },
  { label: 'Saved Jobs', href: '/worker/jobs', icon: Bookmark, color: 'bg-warning/10 text-warning' },
];

const statusColors: Record<string, string> = {
  applied: 'bg-muted text-muted-foreground',
  shortlisted: 'bg-primary/10 text-primary',
  interview_scheduled: 'bg-accent/10 text-accent',
  rejected: 'bg-destructive/10 text-destructive',
  hired: 'bg-success/10 text-success',
};

export default function WorkerDashboardPage() {
  const { user } = useAuth();
  const jobsQuery = useQuery({ queryKey: ['jobs'], queryFn: jobsApi.list });
  const applicationsQuery = useQuery({ queryKey: ['worker-applications'], queryFn: applicationsApi.workerList });
  const profileQuery = useQuery({ queryKey: ['worker-profile'], queryFn: workerApi.profile, retry: false });

  const jobs: Job[] = jobsQuery.data ?? [];
  const applications: Application[] = applicationsQuery.data ?? [];
  const profile = profileQuery.data as WorkerWithMeta | undefined;
  const recommendedJobs = jobs.slice(0, 3);
  const recentApplications = applications.slice(0, 3);
  const completion = profile?.profileCompletion ?? 0;
  const statusCount = (status: string) => applications.filter((app) => app.status === status).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good day, {profile?.fullName || user?.name || 'Worker'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here is your live job search overview.</p>
        </div>
        <Button asChild>
          <Link href="/worker/jobs"><Search className="mr-2 h-4 w-4" />Find Jobs</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="flex flex-col items-center gap-2 p-4 transition-all hover:border-primary/30 hover:shadow-card">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Profile Completion</h3>
                <p className="mt-1 text-sm text-muted-foreground">Complete your profile to increase visibility</p>
              </div>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">{completion}%</Badge>
            </div>
            <Progress value={completion} className="mt-4" />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {completion < 100 ? 'Add more details to reach 100%' : 'Your profile is complete.'}
              </p>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/worker/profile">Complete Profile<ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </Card>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Recommended Jobs</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/worker/jobs">View all<ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            {recommendedJobs.length ? (
              <div className="space-y-4">
                {recommendedJobs.map((job) => <JobCard key={job.id} job={job} variant="compact" />)}
              </div>
            ) : (
              <EmptyState icon={Briefcase} title="No jobs yet" description="Published jobs will appear here." />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Application Status</h3>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Applied', count: statusCount('applied'), color: 'text-muted-foreground' },
                { label: 'Shortlisted', count: statusCount('shortlisted'), color: 'text-primary' },
                { label: 'Interview', count: statusCount('interview_scheduled'), color: 'text-accent' },
                { label: 'Hired', count: statusCount('hired'), color: 'text-success' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className={`text-sm font-semibold ${stat.color}`}>{stat.count}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/worker/applications">View Applications</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Recent Applications</h3>
            </div>
            <div className="mt-4 space-y-3">
              {recentApplications.length ? recentApplications.map((app) => (
                <Link key={app.id} href="/worker/applications" className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium">{app.job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{app.job.companyName}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[app.status] || 'bg-muted'}>
                    {app.status.replace('_', ' ')}
                  </Badge>
                </Link>
              )) : (
                <p className="text-sm text-muted-foreground">No applications yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

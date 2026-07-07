'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import { PublicNavbar } from '@/components/public-navbar';
import { PublicFooter } from '@/components/public-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { JobCard } from '@/components/job-card';
import { JobListSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/empty-state';
import { JobWithMeta, applicationsApi, jobsApi } from '@/lib/scn-api';
import { formatSalary, timeAgo } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Application } from '@/lib/types';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const id = String(params.id);
  const [saved, setSaved] = useState(false);

  const jobQuery = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.get(id),
  });
  const job = jobQuery.data as JobWithMeta | undefined;
  const { isLoading } = jobQuery;

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
  });
  const jobs = useMemo<JobWithMeta[]>(() => jobsQuery.data ?? [], [jobsQuery.data]);

  // Check if current worker has already applied
  const applicationsQuery = useQuery({
    queryKey: ['worker-applications'],
    queryFn: applicationsApi.workerList,
    enabled: isAuthenticated && user?.role === 'worker',
  });
  const workerApplications: Application[] = applicationsQuery.data ?? [];
  const hasApplied = workerApplications.some((app) => app.jobId === id);
  const existingApplication = workerApplications.find((app) => app.jobId === id);

  const relatedJobs = useMemo(
    () => jobs.filter((item) => item.id !== id).slice(0, 3),
    [id, jobs],
  );

  const applyMutation = useMutation({
    mutationFn: () => applicationsApi.apply(id),
    onSuccess: () => {
      toast.success('Application submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['worker-applications'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not submit application')),
  });

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'worker') {
      toast.error('Only worker accounts can apply to jobs');
      return;
    }
    if (hasApplied) {
      toast.info('You have already applied to this job');
      return;
    }
    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <JobListSkeleton />
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState icon={Briefcase} title="Job not found" description="This opening is no longer available." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>

        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 rounded-xl border border-border">
                  <AvatarImage src={job.companyLogo} alt={job.companyName} />
                  <AvatarFallback className="rounded-xl">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
                  <p className="mt-1 text-lg text-muted-foreground">{job.companyName}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" />{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.experienceMin}-{job.experienceMax} yrs</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{timeAgo(job.postedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setSaved((value) => !value)}>
                  <Bookmark className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Link copied to clipboard');
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">{job.workType}</Badge>
              <Badge variant="outline" className="capitalize">{job.jobType}</Badge>
              <Badge variant="outline" className="capitalize">{job.shift} shift</Badge>
              <Badge variant="outline">{job.openings} openings</Badge>
              {job.isFresherFriendly && (
                <Badge variant="outline" className="border-success/20 bg-success/5 text-success">
                  Fresher Friendly
                </Badge>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Job Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {job.description}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold">Responsibilities</h2>
              <ul className="mt-3 space-y-2">
                {job.responsibilities.map((responsibility) => (
                  <li key={responsibility} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {responsibility}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold">Requirements</h2>
              <ul className="mt-3 space-y-2">
                {job.requirements.length ? job.requirements.map((requirement) => (
                  <li key={requirement} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {requirement}
                  </li>
                )) : (
                  <li className="text-sm text-muted-foreground">Recruiter will share detailed requirements during screening.</li>
                )}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold">Benefits</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.benefits.length ? job.benefits.map((benefit) => (
                  <Badge key={benefit} variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    {benefit}
                  </Badge>
                )) : (
                  <span className="text-sm text-muted-foreground">Benefits will be shared by the recruiter.</span>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold">Required Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.length ? job.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                    {skill}
                  </Badge>
                )) : <span className="text-sm text-muted-foreground">No skills listed.</span>}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="sticky top-24 p-6">
              {hasApplied ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <h3 className="font-semibold text-success">Application Submitted</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You have already applied to this job. Status: <span className="font-medium capitalize">{existingApplication?.status?.replace('_', ' ')}</span>
                  </p>
                  <Button variant="outline" className="mt-4 w-full" asChild>
                    <Link href="/worker/applications">View My Applications</Link>
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold">Apply for this job</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isAuthenticated && user?.role === 'worker'
                      ? 'Quick apply with your worker profile.'
                      : 'Sign in as a worker to apply.'}
                  </p>
                  <Button
                    className="mt-4 w-full"
                    size="lg"
                    onClick={handleApply}
                    disabled={applyMutation.isPending}
                  >
                    {applyMutation.isPending
                      ? 'Submitting...'
                      : !isAuthenticated
                      ? 'Sign In to Apply'
                      : 'Apply Now'}
                  </Button>
                </>
              )}
              <Button variant="outline" className="mt-2 w-full" onClick={() => setSaved((value) => !value)}>
                <Bookmark className={`mr-2 h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`} />
                {saved ? 'Saved' : 'Save Job'}
              </Button>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{job.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Openings</span>
                  <span className="flex items-center gap-1 font-medium"><Users className="h-3 w-3" />{job.openings}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {relatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight">Related Jobs</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedJobs.map((relatedJob) => (
                <JobCard key={relatedJob.id} job={relatedJob} variant="compact" />
              ))}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

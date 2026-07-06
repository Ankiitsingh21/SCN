'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Briefcase, MoreHorizontal, Trash2, Eye, Users, Clock, MapPin, Rocket, Archive } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { JobWithMeta, jobsApi } from '@/lib/scn-api';
import { timeAgo, formatSalary } from '@/lib/format';
import { getApiErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-warning/10 text-warning border-warning/20' },
  published: { label: 'Published', color: 'bg-success/10 text-success border-success/20' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground border-border' },
};

export default function RecruiterJobsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const jobsQuery = useQuery({ queryKey: ['recruiter-jobs'], queryFn: jobsApi.list });
  const jobs: JobWithMeta[] = jobsQuery.data ?? [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobWithMeta['status'] }) => jobsApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Job status updated');
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not update job')),
  });

  const deleteMutation = useMutation({
    mutationFn: jobsApi.remove,
    onSuccess: () => {
      toast.success('Job deleted');
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Only draft jobs can be deleted')),
  });

  const filteredJobs = jobs.filter((job) => activeTab === 'all' || job.status === activeTab);
  const counts = {
    all: jobs.length,
    draft: jobs.filter((job) => job.status === 'draft').length,
    published: jobs.filter((job) => job.status === 'published').length,
    closed: jobs.filter((job) => job.status === 'closed').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Management"
        description="Create, edit, and manage your job postings"
        action={
          <Button asChild>
            <Link href="/recruiter/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Link>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto flex-wrap gap-1 bg-card p-1">
          <TabsTrigger value="all" className="gap-1.5">All Jobs<Badge variant="secondary" className="text-xs">{counts.all}</Badge></TabsTrigger>
          <TabsTrigger value="published" className="gap-1.5">Published<Badge variant="secondary" className="text-xs">{counts.published}</Badge></TabsTrigger>
          <TabsTrigger value="draft" className="gap-1.5">Drafts<Badge variant="secondary" className="text-xs">{counts.draft}</Badge></TabsTrigger>
          <TabsTrigger value="closed" className="gap-1.5">Closed<Badge variant="secondary" className="text-xs">{counts.closed}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found"
              description="Create your first job posting to start receiving applications."
              action={<Button asChild><Link href="/recruiter/jobs/new"><Plus className="mr-2 h-4 w-4" />Create Job</Link></Button>}
            />
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Briefcase className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge variant="outline" className={cn('text-xs', statusConfig[job.status].color)}>
                            {statusConfig[job.status].label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job.openings} openings</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(job.postedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold">{job.applicationsCount}</p>
                        <p className="text-xs text-muted-foreground">applications</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/jobs/${job.id}`}><Eye className="mr-2 h-4 w-4" />View Job</Link>
                          </DropdownMenuItem>
                          {job.status === 'draft' && (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: job.id, status: 'published' })}>
                              <Rocket className="mr-2 h-4 w-4" />Publish
                            </DropdownMenuItem>
                          )}
                          {job.status === 'published' && (
                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: job.id, status: 'closed' })}>
                              <Archive className="mr-2 h-4 w-4" />Close
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(job.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete Draft
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

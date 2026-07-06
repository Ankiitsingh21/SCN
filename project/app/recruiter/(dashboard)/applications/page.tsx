'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, CheckCircle2, XCircle, Calendar, UserCheck, FileText, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Application, ApplicationStatus } from '@/lib/types';
import { formatDate, getInitials } from '@/lib/format';
import { applicationsApi } from '@/lib/scn-api';
import { getApiErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'bg-muted text-muted-foreground' },
  shortlisted: { label: 'Shortlisted', color: 'bg-primary/10 text-primary' },
  interview_scheduled: { label: 'Interview', color: 'bg-accent/10 text-accent' },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive' },
  hired: { label: 'Hired', color: 'bg-success/10 text-success' },
  withdrawn: { label: 'Withdrawn', color: 'bg-muted text-muted-foreground' },
};

export default function RecruiterApplicationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const applicationsQuery = useQuery({ queryKey: ['recruiter-applications'], queryFn: applicationsApi.recruiterList });
  const applications = useMemo<Application[]>(() => applicationsQuery.data ?? [], [applicationsQuery.data]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) => applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Application status updated');
      queryClient.invalidateQueries({ queryKey: ['recruiter-applications'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not update application')),
  });

  const filteredApps = useMemo(() => applications.filter((app) => {
    if (activeTab !== 'all' && app.status !== activeTab) return false;
    if (search && !app.workerName.toLowerCase().includes(search.toLowerCase()) && !app.job.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [activeTab, applications, search]);

  const update = (app: Application, status: ApplicationStatus) => {
    statusMutation.mutate({ id: app.id, status });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="Review and manage candidate applications" />

      <div className="flex max-w-md items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by candidate or job..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="border-0 bg-transparent px-0 focus-visible:ring-0"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto flex-wrap gap-1 bg-card p-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
          <TabsTrigger value="interview_scheduled">Interview</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredApps.length === 0 ? (
            <EmptyState icon={FileText} title="No applications found" description="Applications will appear here when candidates apply." />
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <Card key={app.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={app.workerAvatar} alt={app.workerName} />
                        <AvatarFallback>{getInitials(app.workerName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{app.workerName}</h3>
                          <Badge variant="outline" className={cn('text-xs', statusConfig[app.status].color)}>
                            {statusConfig[app.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{app.job.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Applied on {formatDate(app.appliedAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader><DialogTitle>Candidate Application</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={app.workerAvatar} alt={app.workerName} />
                                <AvatarFallback className="text-lg">{getInitials(app.workerName)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold">{app.workerName}</h3>
                                <p className="text-sm text-muted-foreground">{app.job.title}</p>
                              </div>
                            </div>
                            <Separator />
                            {app.coverLetter && <p className="text-sm text-muted-foreground">{app.coverLetter}</p>}
                            <div>
                              <p className="mb-2 text-sm font-medium">Timeline</p>
                              <div className="space-y-2">
                                {app.timeline.map((event) => (
                                  <div key={event.id} className="rounded-lg border border-border p-3 text-sm">
                                    <p className="font-medium capitalize">{event.label}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)} by {event.actor}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {app.resumeUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer"><Download className="mr-1.5 h-3.5 w-3.5" />Resume</a>
                        </Button>
                      )}

                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => update(app, 'shortlisted')}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={() => update(app, 'interview_scheduled')}>
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => update(app, 'hired')}>
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => update(app, 'rejected')}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
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

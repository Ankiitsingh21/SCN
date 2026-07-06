'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Mail, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { getInitials } from '@/lib/format';
import { adminApi, masterDataApi, MasterRawItem, RecruiterView } from '@/lib/scn-api';
import { getApiErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminRecruitersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', industryIds: [] as number[] });
  const recruitersQuery = useQuery({ queryKey: ['admin-recruiters'], queryFn: adminApi.recruiters });
  const industriesQuery = useQuery({ queryKey: ['master', 'industries'], queryFn: () => masterDataApi.raw('industries') });
  const recruiters = useMemo<RecruiterView[]>(() => recruitersQuery.data ?? [], [recruitersQuery.data]);
  const industries = useMemo<MasterRawItem[]>(() => industriesQuery.data ?? [], [industriesQuery.data]);

  const createMutation = useMutation({
    mutationFn: () => adminApi.createRecruiter(form),
    onSuccess: () => {
      toast.success('Recruiter created successfully');
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', industryIds: [] });
      queryClient.invalidateQueries({ queryKey: ['admin-recruiters'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not create recruiter')),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => adminApi.setRecruiterStatus(id, active),
    onSuccess: () => {
      toast.success('Recruiter status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-recruiters'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not update status')),
  });

  const filtered = useMemo(() => recruiters.filter((recruiter) =>
    recruiter.name.toLowerCase().includes(search.toLowerCase()) ||
    recruiter.email.toLowerCase().includes(search.toLowerCase()) ||
    recruiter.company.toLowerCase().includes(search.toLowerCase())
  ), [recruiters, search]);

  const toggleIndustry = (id: number) => {
    setForm((current) => ({
      ...current,
      industryIds: current.industryIds.includes(id)
        ? current.industryIds.filter((item) => item !== id)
        : [...current.industryIds, id],
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruiter Management"
        description="Create, manage, and oversee recruiter accounts"
        action={<Button onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />Add Recruiter</Button>}
      />

      <div className="flex max-w-md items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search recruiters..." value={search} onChange={(event) => setSearch(event.target.value)} className="border-0 bg-transparent px-0 focus-visible:ring-0" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((recruiter) => (
          <Card key={recruiter.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(recruiter.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{recruiter.name}</h3>
                  <p className="text-sm text-muted-foreground">{recruiter.designation}</p>
                  <Badge variant="outline" className={cn('mt-1', recruiter.status === 'active' ? 'border-success/20 bg-success/5 text-success' : 'bg-muted text-muted-foreground')}>
                    {recruiter.status}
                  </Badge>
                </div>
              </div>
              <Switch
                checked={recruiter.status === 'active'}
                onCheckedChange={(active) => statusMutation.mutate({ id: recruiter.id, active })}
              />
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /><span className="truncate">{recruiter.email}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /><span>{recruiter.phone || 'Not provided'}</span></div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {recruiter.industries.map((industry) => <Badge key={industry} variant="outline" className="text-xs">{industry}</Badge>)}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">Jobs Posted</p>
              <p className="text-lg font-semibold">{recruiter.jobsPosted}</p>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Recruiter</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" placeholder="john@company.com" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Temporary Password</Label>
                <Input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" placeholder="Minimum 6 characters" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned Industries</Label>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <button key={industry.id} type="button" onClick={() => toggleIndustry(industry.id)}>
                    <Badge variant={form.industryIds.includes(industry.id) ? 'default' : 'outline'}>
                      {'name' in industry ? industry.name : industry.id}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Recruiter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

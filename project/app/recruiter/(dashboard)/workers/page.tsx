'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, Eye, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { getInitials } from '@/lib/format';
import { workerApi, WorkerWithMeta } from '@/lib/scn-api';

export default function RecruiterWorkerSearchPage() {
  const [search, setSearch] = useState('');
  const workersQuery = useQuery({
    queryKey: ['workers', search],
    queryFn: () => workerApi.search({ q: search || undefined }),
  });
  const workers = useMemo<WorkerWithMeta[]>(() => workersQuery.data ?? [], [workersQuery.data]);

  const filteredWorkers = useMemo(() => {
    if (!search) return workers;
    const q = search.toLowerCase();
    return workers.filter((worker) => worker.fullName.toLowerCase().includes(q) || worker.skills.some((skill) => skill.toLowerCase().includes(q)));
  }, [search, workers]);

  return (
    <div className="space-y-6">
      <PageHeader title="Worker Search" description="Find candidates that match your assigned industries" />

      <div className="flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or skill..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="border-0 bg-transparent px-0 focus-visible:ring-0"
        />
      </div>

      <p className="text-sm text-muted-foreground">{filteredWorkers.length} candidates found</p>

      {filteredWorkers.length === 0 ? (
        <EmptyState icon={Search} title="No candidates found" description="Try searching by another skill or complete worker profiles first." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={worker.avatarUrl} alt={worker.fullName} />
                  <AvatarFallback>{getInitials(worker.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{worker.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{worker.headline}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{worker.experienceYears} yrs exp</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{worker.city || worker.preferredLocations[0] || 'N/A'}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {worker.skills.slice(0, 4).map((skill) => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}
                {worker.skills.length > 4 && <Badge variant="outline" className="text-xs">+{worker.skills.length - 4}</Badge>}
              </div>
              <div className="mt-4 flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader><DialogTitle>{worker.fullName}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={worker.avatarUrl} alt={worker.fullName} />
                          <AvatarFallback className="text-lg">{getInitials(worker.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{worker.fullName}</h3>
                          <p className="text-sm text-muted-foreground">{worker.headline}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-muted-foreground">Experience</p><p className="font-medium">{worker.experienceYears} years</p></div>
                        <div><p className="text-muted-foreground">Expected Salary</p><p className="font-medium">₹{(worker.expectedSalaryMin / 100000).toFixed(0)}L - ₹{(worker.expectedSalaryMax / 100000).toFixed(0)}L</p></div>
                        <div><p className="text-muted-foreground">Availability</p><p className="font-medium capitalize">{worker.availability.replace('-', ' ')}</p></div>
                        <div><p className="text-muted-foreground">Location</p><p className="font-medium">{worker.city || worker.preferredLocations[0] || 'N/A'}</p></div>
                      </div>
                      <Separator />
                      <div>
                        <p className="mb-2 text-sm font-medium">Skills</p>
                        <div className="flex flex-wrap gap-2">{worker.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {worker.resumeUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={worker.resumeUrl} target="_blank" rel="noreferrer"><Download className="h-3.5 w-3.5" /></a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

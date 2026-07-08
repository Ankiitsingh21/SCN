'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Filter, SlidersHorizontal, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { JobCard } from '@/components/job-card';
import { JobListSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/empty-state';
import { JobWithMeta, jobsApi, applicationsApi } from '@/lib/scn-api';
import { Application } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'latest', label: 'Latest First' },
  { value: 'salary_high', label: 'Highest Salary' },
  { value: 'salary_low', label: 'Lowest Salary' },
];

export function JobSearchView() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('loc') || '');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [freshers, setFreshers] = useState(false);
  const [workFromHome, setWorkFromHome] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.list,
  });
  
  const { user } = useAuth();
  const applicationsQuery = useQuery({
    queryKey: ['worker-applications'],
    queryFn: applicationsApi.workerList,
    enabled: user?.role === 'worker',
  });
  
  const appliedJobIds = useMemo(() => {
    if (!applicationsQuery.data) return new Set<string>();
    return new Set(applicationsQuery.data.map((app: Application) => app.jobId));
  }, [applicationsQuery.data]);

  const jobs = useMemo<JobWithMeta[]>(() => jobsQuery.data ?? [], [jobsQuery.data]);
  const { isLoading, refetch } = jobsQuery;

  const industries = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.industry))).filter((value): value is string => Boolean(value)),
    [jobs],
  );

  const jobTypes = useMemo(
    () =>
      Array.from(new Set(jobs.map((job) => job.jobType))).filter(
        (value): value is JobWithMeta['jobType'] => Boolean(value),
      ),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(kw) ||
          job.companyName.toLowerCase().includes(kw) ||
          job.skills.some((skill) => skill.toLowerCase().includes(kw)),
      );
    }
    if (location) {
      const loc = location.toLowerCase();
      result = result.filter(
        (job) =>
          job.location.toLowerCase().includes(loc) ||
          job.locality?.toLowerCase().includes(loc),
      );
    }
    if (selectedIndustries.length) {
      result = result.filter((job) => selectedIndustries.includes(job.industry));
    }
    if (selectedJobTypes.length) {
      result = result.filter((job) => selectedJobTypes.includes(job.jobType));
    }
    if (freshers) result = result.filter((job) => job.isFresherFriendly);
    if (workFromHome) result = result.filter((job) => job.workType === 'remote');
    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }
    if (sortBy === 'salary_high') result.sort((a, b) => b.salaryMax - a.salaryMax);
    if (sortBy === 'salary_low') result.sort((a, b) => a.salaryMin - b.salaryMin);
    return result;
  }, [freshers, jobs, keyword, location, selectedIndustries, selectedJobTypes, sortBy, workFromHome]);

  const activeFilterCount =
    selectedIndustries.length + selectedJobTypes.length + (freshers ? 1 : 0) + (workFromHome ? 1 : 0);

  const clearFilters = () => {
    setSelectedIndustries([]);
    setSelectedJobTypes([]);
    setFreshers(false);
    setWorkFromHome(false);
  };

  const toggleArrayFilter = (
    value: string,
    setter: (values: string[]) => void,
    current: string[],
  ) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Quick Filters</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="freshers" checked={freshers} onCheckedChange={(value) => setFreshers(!!value)} />
            <Label htmlFor="freshers" className="text-sm font-normal">Fresher Friendly</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="wfh" checked={workFromHome} onCheckedChange={(value) => setWorkFromHome(!!value)} />
            <Label htmlFor="wfh" className="text-sm font-normal">Work From Home</Label>
          </div>
        </div>
      </div>

      {industries.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Industry</Label>
          <div className="space-y-2">
            {industries.map((industry) => (
              <div key={industry} className="flex items-center gap-2">
                <Checkbox
                  id={`industry-${industry}`}
                  checked={selectedIndustries.includes(industry)}
                  onCheckedChange={() => toggleArrayFilter(industry, setSelectedIndustries, selectedIndustries)}
                />
                <Label htmlFor={`industry-${industry}`} className="text-sm font-normal">{industry}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {jobTypes.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Job Type</Label>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedJobTypes.includes(type)}
                  onCheckedChange={() => toggleArrayFilter(type, setSelectedJobTypes, selectedJobTypes)}
                />
                <Label htmlFor={`type-${type}`} className="text-sm font-normal capitalize">{type}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-card transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 sm:flex-row sm:items-center">
        <div className="flex min-h-12 w-full flex-1 items-center gap-3 rounded-xl px-3 sm:w-auto">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Job title, skill, or company"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
            aria-label="Job title, skill, or company"
          />
        </div>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <div className="flex min-h-12 w-full flex-1 items-center gap-3 rounded-xl border-t border-border px-3 pt-2 sm:w-auto sm:border-t-0 sm:pt-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <MapPin className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
            aria-label="Location"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Button className="h-12 w-full rounded-xl px-8 sm:w-auto" onClick={() => refetch()}>Search</Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                  <Button className="mt-6 w-full" onClick={() => setShowMobileFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">{filteredJobs.length} jobs found</p>

          {isLoading ? (
            <JobListSkeleton />
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs found"
              description="Try adjusting your filters or search terms."
              action={<Button variant="outline" onClick={() => refetch()}>Refresh jobs</Button>}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={{ ...job, hasApplied: appliedJobIds.has(job.id) }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

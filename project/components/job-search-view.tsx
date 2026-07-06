'use client';

import { useMemo, useState } from 'react';
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
import { JobWithMeta, jobsApi } from '@/lib/scn-api';

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'latest', label: 'Latest First' },
  { value: 'salary_high', label: 'Highest Salary' },
  { value: 'salary_low', label: 'Lowest Salary' },
];

export function JobSearchView() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Job title, skill, or company"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="border-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="border-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-semibold">Filters</span>
              {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
            </div>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6"><FilterContent /></div>
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
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

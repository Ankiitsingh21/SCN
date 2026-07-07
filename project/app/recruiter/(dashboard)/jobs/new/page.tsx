'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  Eye,
  FileText,
  IndianRupee,
  MapPin,
  Rocket,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api';
import { MasterRawItem, jobsApi, masterDataApi } from '@/lib/scn-api';

const steps = [
  { id: 1, title: 'Basic Details', icon: Briefcase },
  { id: 2, title: 'Location & Industry', icon: MapPin },
  { id: 3, title: 'Skills & Qualifications', icon: Code },
  { id: 4, title: 'Salary & Shift', icon: IndianRupee },
  { id: 5, title: 'Description', icon: FileText },
  { id: 6, title: 'Preview', icon: Eye },
];

const schema = z.object({
  title: z.string().min(2, 'Job title is required'),
  industryId: z.string().min(1, 'Industry is required'),
  locationId: z.string().min(1, 'Location is required'),
  jobRoleId: z.string().optional(),
  skillIds: z.array(z.string()).default([]),
  qualificationIds: z.array(z.string()).default([]),
  wageMin: z.coerce.number().min(0),
  wageMax: z.coerce.number().min(0),
  shiftType: z.enum(['day', 'night', 'rotational']),
  jobType: z.enum(['full-time', 'part-time', 'contract']),
  headcountRequired: z.coerce.number().min(1),
  minExperienceYears: z.coerce.number().min(0),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  responsibilities: z.string().min(2, 'Add at least one responsibility'),
  requirements: z.string().min(2, 'Add at least one requirement'),
  benefits: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const splitLines = (value?: string) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

export default function CreateJobPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const industriesQuery = useQuery({ queryKey: ['master', 'industries'], queryFn: () => masterDataApi.raw('industries') });
  const locationsQuery = useQuery({ queryKey: ['master', 'locations'], queryFn: () => masterDataApi.raw('locations') });
  const jobRolesQuery = useQuery({ queryKey: ['master', 'job-roles'], queryFn: () => masterDataApi.raw('job-roles') });
  const skillsQuery = useQuery({ queryKey: ['master', 'skills'], queryFn: () => masterDataApi.raw('skills') });
  const qualificationsQuery = useQuery({ queryKey: ['master', 'qualifications'], queryFn: () => masterDataApi.raw('qualifications') });
  const industries: MasterRawItem[] = industriesQuery.data ?? [];
  const locations: MasterRawItem[] = locationsQuery.data ?? [];
  const jobRoles: MasterRawItem[] = jobRolesQuery.data ?? [];
  const skills: MasterRawItem[] = skillsQuery.data ?? [];
  const qualifications: MasterRawItem[] = qualificationsQuery.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      skillIds: [],
      qualificationIds: [],
      headcountRequired: 1,
      minExperienceYears: 0,
      shiftType: 'day',
      jobType: 'full-time',
      responsibilities: 'Own day-to-day responsibilities for the role',
      requirements: 'Relevant experience or qualification for the role',
      benefits: '',
    },
  });

  const formData = watch();
  const selectedSkillIds = formData.skillIds || [];
  const selectedQualificationIds = formData.qualificationIds || [];

  const publishMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const job = await jobsApi.create({
        title: data.title,
        description: data.description,
        industryId: Number(data.industryId),
        locationId: Number(data.locationId),
        jobRoleId: data.jobRoleId ? Number(data.jobRoleId) : undefined,
        skillIds: data.skillIds.map(Number),
        qualificationIds: data.qualificationIds.map(Number),
        wageMin: data.wageMin,
        wageMax: data.wageMax,
        shiftType: data.shiftType,
        jobType: data.jobType,
        headcountRequired: data.headcountRequired,
        minExperienceMonths: data.minExperienceYears * 12,
        responsibilities: splitLines(data.responsibilities),
        requirements: splitLines(data.requirements),
        benefits: splitLines(data.benefits),
      });
      return jobsApi.updateStatus(job.id, 'published');
    },
    onSuccess: () => {
      toast.success('Job published successfully');
      router.push('/recruiter/jobs');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to publish job')),
  });

  const toggleId = (field: 'skillIds' | 'qualificationIds', id: string) => {
    const current = field === 'skillIds' ? selectedSkillIds : selectedQualificationIds;
    setValue(field, current.includes(id) ? current.filter((item) => item !== id) : [...current, id], {
      shouldValidate: true,
    });
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ['title', 'headcountRequired'];
    if (currentStep === 2) fieldsToValidate = ['industryId', 'locationId'];
    if (currentStep === 4) fieldsToValidate = ['wageMin', 'wageMax'];
    if (currentStep === 5) fieldsToValidate = ['description', 'responsibilities', 'requirements'];

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any);
      if (!isValid) {
        toast.error('Please fill all required fields correctly before proceeding.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="space-y-6">
      <PageHeader title="Create New Job" description="Fill in the details to post a new job opening" />

      <div className="flex overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors', currentStep === step.id ? 'bg-primary text-primary-foreground' : currentStep > step.id ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
              {i < steps.length - 1 && <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => publishMutation.mutate(data))}>
        <Card className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Details</h2>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input id="title" placeholder="e.g. Senior Frontend Engineer" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Job Role</Label>
                  <Select onValueChange={(value) => setValue('jobRoleId', value)}>
                    <SelectTrigger><SelectValue placeholder="Select job role" /></SelectTrigger>
                    <SelectContent>
                      {jobRoles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>{'name' in role ? role.name : String(role.id)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headcountRequired">Headcount *</Label>
                  <Input id="headcountRequired" type="number" min={1} {...register('headcountRequired')} />
                  {errors.headcountRequired && <p className="text-xs text-destructive">{errors.headcountRequired.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minExperienceYears">Minimum Experience</Label>
                  <Input id="minExperienceYears" type="number" min={0} {...register('minExperienceYears')} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Location & Industry</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Industry *</Label>
                  <Select onValueChange={(value) => setValue('industryId', value, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={String(industry.id)}>{'name' in industry ? industry.name : String(industry.id)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industryId && <p className="text-xs text-destructive">{errors.industryId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select onValueChange={(value) => setValue('locationId', value, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={String(location.id)}>
                          {'city' in location ? `${location.city} - ${location.locality}` : String(location.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.locationId && <p className="text-xs text-destructive">{errors.locationId.message}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Skills & Qualifications</h2>
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => {
                    const id = String(skill.id);
                    return (
                      <button key={id} type="button" onClick={() => toggleId('skillIds', id)}>
                        <Badge variant={selectedSkillIds.includes(id) ? 'default' : 'secondary'}>
                          {'name' in skill ? skill.name : id}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Qualifications</Label>
                <div className="flex flex-wrap gap-2">
                  {qualifications.map((qualification) => {
                    const id = String(qualification.id);
                    return (
                      <button key={id} type="button" onClick={() => toggleId('qualificationIds', id)}>
                        <Badge variant={selectedQualificationIds.includes(id) ? 'default' : 'outline'}>
                          {'name' in qualification ? qualification.name : id}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Salary & Shift</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wageMin">Minimum Salary</Label>
                  <Input id="wageMin" type="number" placeholder="500000" {...register('wageMin')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wageMax">Maximum Salary</Label>
                  <Input id="wageMax" type="number" placeholder="1500000" {...register('wageMax')} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Shift *</Label>
                  <Select defaultValue="day" onValueChange={(value: 'day' | 'night' | 'rotational') => setValue('shiftType', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day Shift</SelectItem>
                      <SelectItem value="night">Night Shift</SelectItem>
                      <SelectItem value="rotational">Rotational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Job Type *</Label>
                  <Select defaultValue="full-time" onValueChange={(value: 'full-time' | 'part-time' | 'contract') => setValue('jobType', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Job Detail Sections</h2>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" rows={5} placeholder="Describe the role..." {...register('description')} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities *</Label>
                  <Textarea id="responsibilities" rows={6} placeholder="One responsibility per line" {...register('responsibilities')} />
                  {errors.responsibilities && <p className="text-xs text-destructive">{errors.responsibilities.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements *</Label>
                  <Textarea id="requirements" rows={6} placeholder="One requirement per line" {...register('requirements')} />
                  {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea id="benefits" rows={6} placeholder="One benefit per line" {...register('benefits')} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Preview & Publish</h2>
              <div className="rounded-xl border border-border p-6">
                <h3 className="text-xl font-bold">{formData.title || 'Job Title'}</h3>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />Location selected</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-4 w-4" />₹{formData.wageMin || 0} - ₹{formData.wageMax || 0}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formData.shiftType}</span>
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{formData.headcountRequired || 1} openings</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{formData.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedSkillIds.length > 0 && <Badge variant="secondary">{selectedSkillIds.length} skills selected</Badge>}
                  {selectedQualificationIds.length > 0 && <Badge variant="outline">{selectedQualificationIds.length} qualifications selected</Badge>}
                  {splitLines(formData.benefits).map((benefit) => <Badge key={benefit} variant="secondary">{benefit}</Badge>)}
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          {currentStep < steps.length ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={publishMutation.isPending}>
              <Rocket className="mr-2 h-4 w-4" />
              {publishMutation.isPending ? 'Publishing...' : 'Publish Job'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

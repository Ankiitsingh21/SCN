'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  Briefcase,
  Check,
  Edit,
  GraduationCap,
  Languages,
  Plus,
  Upload,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { getInitials } from '@/lib/format';
import { workerApi, WorkerWithMeta } from '@/lib/scn-api';
import { getApiErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export default function WorkerProfilePage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const profileQuery = useQuery({ queryKey: ['worker-profile'], queryFn: workerApi.profile, retry: false });
  const profile = profileQuery.data as WorkerWithMeta | undefined;
  const [form, setForm] = useState({
    name: '',
    phone: '',
    headline: '',
    summary: '',
    totalExperienceMonths: 0,
    expectedSalaryMin: 0,
    expectedSalaryMax: 0,
    resumeUrl: '',
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.fullName,
      phone: profile.phone,
      headline: profile.headline,
      summary: profile.bio,
      totalExperienceMonths: profile.experienceYears * 12,
      expectedSalaryMin: profile.expectedSalaryMin,
      expectedSalaryMax: profile.expectedSalaryMax,
      resumeUrl: profile.resumeUrl || '',
    });
  }, [profile]);

  const createMutation = useMutation({
    mutationFn: workerApi.createProfile,
    onSuccess: () => {
      toast.success('Profile created');
      queryClient.invalidateQueries({ queryKey: ['worker-profile'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not create profile')),
  });

  const updateMutation = useMutation({
    mutationFn: () => workerApi.updateProfile(form),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ['worker-profile'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Could not update profile')),
  });

  if (!profile && !profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" description="Create your worker profile to start applying" />
        <Card className="p-8 text-center">
          <User className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No profile found</h2>
          <p className="mt-2 text-sm text-muted-foreground">Create your profile and then add resume, skills, education, and experience.</p>
          <Button className="mt-6" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Profile'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your professional information and preferences"
        action={
          <Button variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Resume URL supported
          </Button>
        }
      />

      {profile && (
        <>
          <Card className="overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
            <div className="px-6 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <Avatar className="-mt-12 h-24 w-24 border-4 border-card">
                    <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                    <AvatarFallback className="text-2xl">{getInitials(profile.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="pb-2">
                    <h2 className="text-xl font-bold">{profile.fullName}</h2>
                    <p className="text-sm text-muted-foreground">{profile.headline}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Profile Strength</p>
                  <p className="text-2xl font-bold text-primary">{profile.profileCompletion}%</p>
                </div>
              </div>
              <Progress value={profile.profileCompletion} className="mt-4" />
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Personal Information</h3>
                <Button variant="ghost" size="sm" onClick={() => setEditing((value) => !value)}>
                  <Edit className="mr-1 h-3.5 w-3.5" />
                  {editing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  {editing ? <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /> : <p className="text-sm font-medium">{profile.fullName}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">{profile.email || 'Not available'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  {editing ? <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /> : <p className="text-sm font-medium">{profile.phone || 'Not available'}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Experience</Label>
                  {editing ? <Input type="number" value={form.totalExperienceMonths} onChange={(event) => setForm({ ...form, totalExperienceMonths: Number(event.target.value) })} /> : <p className="text-sm font-medium">{profile.experienceYears} years</p>}
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Headline</Label>
                {editing ? <Input value={form.headline} onChange={(event) => setForm({ ...form, headline: event.target.value })} /> : <p className="text-sm">{profile.headline}</p>}
              </div>
              <div className="mt-4 space-y-1">
                <Label className="text-xs text-muted-foreground">Bio</Label>
                {editing ? <Textarea value={form.summary} rows={3} onChange={(event) => setForm({ ...form, summary: event.target.value })} /> : <p className="text-sm text-muted-foreground">{profile.bio || 'No bio added yet.'}</p>}
              </div>
              <div className="mt-4 space-y-1">
                <Label className="text-xs text-muted-foreground">Resume URL</Label>
                {editing ? <Input value={form.resumeUrl} onChange={(event) => setForm({ ...form, resumeUrl: event.target.value })} /> : <p className="text-sm text-muted-foreground">{profile.resumeUrl || 'No resume URL added.'}</p>}
              </div>
              {editing && (
                <Button className="mt-4" size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  <Check className="mr-1 h-4 w-4" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold">Job Preferences</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Expected Salary</p>
                  <p className="text-sm font-medium">₹{(profile.expectedSalaryMin / 100000).toFixed(0)}L - ₹{(profile.expectedSalaryMax / 100000).toFixed(0)}L</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <Badge variant="secondary" className="mt-1 capitalize">{profile.availability.replace('-', ' ')}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preferred Industries</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">{profile.preferredIndustries.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preferred Locations</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">{profile.preferredLocations.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.length ? profile.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>) : <span className="text-sm text-muted-foreground">No skills added yet.</span>}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Work Experience</h3>
              <Button variant="ghost" size="sm" disabled><Plus className="mr-1 h-3.5 w-3.5" />Add Experience</Button>
            </div>
            <div className="space-y-4">
              {profile.experience.length ? profile.experience.map((exp) => (
                <div key={exp.id} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Briefcase className="h-5 w-5" /></div>
                  <div><p className="font-medium">{exp.designation}</p><p className="text-sm text-muted-foreground">{exp.company}</p><p className="mt-2 text-sm text-muted-foreground">{exp.description}</p></div>
                </div>
              )) : <span className="text-sm text-muted-foreground">No experience added yet.</span>}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Education</h3>
            <div className="space-y-4">
              {profile.education.length ? profile.education.map((edu) => (
                <div key={edu.id} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"><GraduationCap className="h-5 w-5" /></div>
                  <div><p className="font-medium">{edu.degree}</p><p className="text-sm text-muted-foreground">{edu.institution}</p></div>
                </div>
              )) : <span className="text-sm text-muted-foreground">No education added yet.</span>}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages.length ? profile.languages.map((lang) => <Badge key={lang} variant="secondary" className="gap-1"><Languages className="h-3 w-3" />{lang}</Badge>) : <span className="text-sm text-muted-foreground">No languages added yet.</span>}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

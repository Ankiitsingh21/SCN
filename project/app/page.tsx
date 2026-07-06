'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  ArrowRight,
  Code,
  CreditCard,
  HeartPulse,
  ShoppingCart,
  GraduationCap,
  Factory,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
  FileText,
  UserCheck,
  Bell,
  Star,
  Download,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PublicNavbar } from '@/components/public-navbar';
import { PublicFooter } from '@/components/public-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { JobCard } from '@/components/job-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { trustedCompanies, topIndustries, popularLocations, testimonials, faqs } from '@/lib/marketing-data';
import { JobWithMeta, jobsApi } from '@/lib/scn-api';

const iconMap: Record<string, typeof Code> = {
  Code, CreditCard, HeartPulse, ShoppingCart, GraduationCap, Factory,
};

const stats = [
  { label: 'Active Jobs', value: '12,000+' },
  { label: 'Companies Hiring', value: '3,500+' },
  { label: 'Job Seekers', value: '1.2M+' },
  { label: 'Success Rate', value: '94%' },
];

const howItWorks = [
  { icon: UserCheck, title: 'Create Your Profile', description: 'Sign up in minutes and build a profile that stands out to recruiters.' },
  { icon: Search, title: 'Discover Jobs', description: 'Search and filter through thousands of jobs that match your skills and preferences.' },
  { icon: FileText, title: 'Apply with One Click', description: 'Apply to jobs instantly and track your application status in real-time.' },
  { icon: Bell, title: 'Get Hired', description: 'Receive interview invites and offers, all managed in one beautiful dashboard.' },
];

export default function LandingPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const jobsQuery = useQuery({ queryKey: ['jobs'], queryFn: jobsApi.list });
  const featuredJobs: JobWithMeta[] = jobsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-0 top-40 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/5 text-primary">
              <Star className="mr-1 h-3 w-3" />
              Trusted by 3,500+ companies
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find your next{' '}
              <span className="gradient-text">opportunity</span>
              <br />
              faster than ever
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              The modern job portal connecting talent with opportunity. Search thousands of jobs, track applications, and get hired — all in one place.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-10 max-w-4xl"
          >
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-card sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-2">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Job title, skill, or company"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="border-0 bg-transparent px-0 focus-visible:ring-0"
                />
              </div>
              <div className="hidden h-8 w-px bg-border sm:block" />
              <div className="flex flex-1 items-center gap-2 px-2">
                <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="border-0 bg-transparent px-0 focus-visible:ring-0"
                />
              </div>
              <Button size="lg" className="sm:px-8" asChild>
                <Link href="/jobs">
                  Search Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Popular:</span>
              {['Frontend Developer', 'Product Designer', 'Remote', 'Fresher'].map((tag) => (
                <Link
                  key={tag}
                  href="/jobs"
                  className="rounded-full border border-border bg-card px-3 py-1 transition-colors hover:border-primary hover:text-primary"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="border-y border-border bg-card/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Trusted by leading companies worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {trustedCompanies.map((company) => (
              <div
                key={company.name}
                className="flex h-12 min-w-28 items-center justify-center grayscale transition-all hover:grayscale-0"
              >
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{company.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Jobs</h2>
              <p className="mt-2 text-muted-foreground">
                Hand-picked opportunities from top companies
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/jobs">
                View all jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Industries */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Explore by Industry</h2>
            <p className="mt-2 text-muted-foreground">
              Find opportunities in the industry that matches your passion
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {topIndustries.map((industry) => {
              const Icon = iconMap[industry.icon] || Code;
              return (
                <Link
                  key={industry.name}
                  href="/jobs"
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-card"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ${industry.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{industry.name}</p>
                    <p className="text-xs text-muted-foreground">{industry.jobs} jobs</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Popular Locations</h2>
            <p className="mt-2 text-muted-foreground">
              Discover jobs in top cities across India
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {popularLocations.map((loc) => (
              <Link
                key={loc.name}
                href="/jobs"
                className="group flex items-center justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{loc.jobs} jobs</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Get hired in four simple steps
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="absolute right-0 top-0 text-5xl font-bold text-muted-foreground/10">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 lg:p-12">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl font-bold tracking-tight gradient-text lg:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Loved by Workers & Recruiters</h2>
            <p className="mt-2 text-muted-foreground">
              Don&apos;t just take our word for it
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-border bg-card p-8 lg:flex-row lg:p-12">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight">
                Take Hireflow with you
              </h2>
              <p className="mt-3 text-muted-foreground">
                Get instant job alerts, track applications, and never miss an opportunity. Download our mobile app today.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" className="gap-2">
                  <Download className="h-4 w-4" />
                  App Store
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Google Play
                </Button>
              </div>
            </div>
            <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
              <Download className="h-20 w-20 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-2 text-muted-foreground">
              Everything you need to know about Hireflow
            </p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border bg-card px-5"
              >
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center lg:px-16">
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground lg:text-4xl">
              Ready to find your next opportunity?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join millions of workers and recruiters on Hireflow. It&apos;s free to get started.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/worker/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                asChild
              >
                <Link href="/login">I&apos;m Hiring</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

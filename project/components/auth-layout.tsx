'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  backLink?: string;
  backLabel?: string;
  sideImage?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  backLink = '/',
  backLabel = 'Back to home',
  sideImage,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - form */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Hireflow</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-md">
            <Link
              href={backLink}
              className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      {/* Right side - visual */}
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />
        <div className="absolute inset-0">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        </div>
        <div className="relative flex h-full flex-col justify-center p-12">
          <div className="max-w-md text-primary-foreground">
            <h2 className="text-4xl font-bold leading-tight">
              Your next career move starts here
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Join thousands of professionals who found their dream jobs through Hireflow.
            </p>
            <div className="mt-12 space-y-4">
              {[
                '12,000+ active job listings',
                'Real-time application tracking',
                'AI-powered job recommendations',
                'Direct communication with recruiters',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-primary-foreground/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

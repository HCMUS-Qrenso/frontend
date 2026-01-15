export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Simple layout without sidebar for onboarding flow
  return <div className="bg-background min-h-screen">{children}</div>
}

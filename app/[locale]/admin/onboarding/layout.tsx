export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple layout without sidebar for onboarding flow
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}

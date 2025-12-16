"use server"

type ContactFormData = {
  fullName: string
  email: string
  phone: string
  restaurantName: string
  city: string
  branches: string
  needs: string
  notes: string
  honeypot: string
}

export async function submitContactForm(data: ContactFormData) {
  // Honeypot check
  if (data.honeypot) {
    console.log("Spam detected via honeypot")
    return { success: false, error: "Invalid submission" }
  }

  // Rate limiting would go here in production
  // You could use Redis or a database to track submissions by IP

  try {
    // In production, you would:
    // 1. Save to database
    // 2. Send email notification to sales team
    // 3. Send confirmation email to customer
    // 4. Add to CRM (HubSpot, Salesforce, etc.)

    console.log("Contact form submission:", {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      restaurantName: data.restaurantName,
      city: data.city,
      branches: data.branches,
      needs: data.needs,
      notes: data.notes,
      submittedAt: new Date().toISOString(),
    })

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return { success: false, error: "Failed to submit form" }
  }
}

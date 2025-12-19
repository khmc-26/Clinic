// lib/email.ts
import nodemailer from 'nodemailer'
import {prisma} from './prisma'
// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Test transporter
export async function sendAppointmentConfirmationEmail(
  appointment: any,
  meetLink?: string | null,
  doctorEmail?: string,
  patientName?: string
) {
  try {
    const appointmentDate = new Date(appointment.appointmentDate)
    const formattedDate = appointmentDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    })

    // Get doctor name
    const doctorName = appointment.doctor?.user?.name || 'Dr. Kavitha Thomas'
    
    // FIXED: Use original patient name for "Someone Else" bookings
    let displayPatientName = ''
    
    // Check for original patient name (for "Someone Else" bookings)
    if (appointment.originalPatientName) {
      displayPatientName = appointment.originalPatientName
    } 
    // Check for family member
    else if (appointment.familyMemberId) {
      try {
        const familyMemberInfo = await prisma.familyMember.findUnique({
          where: { id: appointment.familyMemberId },
          select: { name: true }
        })
        displayPatientName = familyMemberInfo?.name || 'Family Member'
      } catch (error) {
        console.error('Error fetching family member:', error)
        displayPatientName = 'Family Member'
      }
    }
    // Use provided patientName or fallback to patient user name
    else {
      displayPatientName = patientName || appointment.patient?.user?.name || 'Patient'
    }

    // Get family member info if applicable
    let familyMemberInfo = null
    if (appointment.familyMemberId) {
      try {
        familyMemberInfo = await prisma.familyMember.findUnique({
          where: { id: appointment.familyMemberId },
          select: { name: true, relationship: true, email: true }
        })
      } catch (error) {
        console.error('Error fetching family member:', error)
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0E7C7B 0%, #2A5C82 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #0E7C7B; }
          .button { display: inline-block; background: #0E7C7B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 14px; }
          .meet-link { background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .notice { background: #e8f4fd; border: 1px solid #b3d9ff; border-radius: 8px; padding: 15px; margin: 20px 0; color: #0066cc; }
          .family-member-badge { display: inline-block; background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px; }
          .someone-else-badge { display: inline-block; background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Appointment Confirmation!</h1>
          <p>Dr. Kavitha Thomas Homoeopathic Clinic</p>
        </div>
        
        <div class="content">
          <p>Dear ${displayPatientName},</p>
          
          ${familyMemberInfo ? 
            `<p style="color: #059669; font-weight: 600;">
              This appointment was booked for you by a family member.
            </p>` 
            : ''
          }
          
          ${appointment.originalPatientName && !familyMemberInfo ? 
            `<p style="color: #8b5cf6; font-weight: 600;">
              This appointment was booked on your behalf.
            </p>`
            : ''
          }
          
          <p>Your appointment has been successfully booked. Here are your appointment details:</p>
          
          <div class="appointment-details">
            <h3>Appointment Details</h3>
            <p><strong>Patient:</strong> ${displayPatientName}
            ${familyMemberInfo ? ' <span class="family-member-badge">Family Member</span>' : ''}
            ${appointment.originalPatientName && !familyMemberInfo ? ' <span class="someone-else-badge">Someone Else</span>' : ''}
            </p>
            <p><strong>Date & Time:</strong> ${formattedDate}</p>
            <p><strong>Appointment Type:</strong> ${appointment.appointmentType === 'ONLINE' ? 'Online Consultation' : 'In-Person Visit'}</p>
            <p><strong>Service:</strong> ${appointment.serviceType.replace(/_/g, ' ')}</p>
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
          </div>
          
          ${meetLink ? `
            <div class="meet-link">
              <h4>Join Online Consultation</h4>
              <p>Click the link below to join your video consultation:</p>
              <a href="${meetLink}" class="button">Join Google Meet</a>
              <p><small>Meeting Link: ${meetLink}</small></p>
            </div>
          ` : ''}
          
          <div class="notice">
            <p><strong>📞 Need to reschedule?</strong><br>
            Please contact us at least 24 hours before your appointment if you need to reschedule or cancel.</p>
          </div>
          
          <h4>Important Instructions:</h4>
          <ul>
            ${appointment.appointmentType === 'IN_PERSON' ? `
              <li>Please arrive 10 minutes before your appointment time</li>
              <li>Bring any previous medical records/reports</li>
              <li>Carry your previous medication details if any</li>
            ` : `
              <li>Ensure you have a stable internet connection</li>
              <li>Join the meeting 5 minutes before scheduled time</li>
              <li>Keep your medical reports ready for reference</li>
            `}
            <li>For any queries, call us at ${process.env.CLINIC_PHONE}</li>
          </ul>
          
          ${appointment.appointmentType === 'IN_PERSON' ? `
            <p><strong>Clinic Address:</strong><br>
            ${process.env.CLINIC_ADDRESS}</p>
          ` : ''}
          
          <a href="${process.env.NEXTAUTH_URL}/portal" class="button">View in Patient Portal</a>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Dr. Kavitha Thomas Homoeopathic Clinic<br>
            ${process.env.CLINIC_ADDRESS ? process.env.CLINIC_ADDRESS + '<br>' : ''}
            Phone: ${process.env.CLINIC_PHONE} | Email: ${process.env.CLINIC_EMAIL}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Prepare BCC recipients
    const bccRecipients = [
      process.env.CLINIC_EMAIL,
      doctorEmail
    ].filter((email): email is string => email !== undefined && email !== null)

    // FIXED: Determine recipient email - priority order
    let recipientEmail = ''
    
    // 1. Check for original patient email (for "Someone Else" bookings)
    if (appointment.originalPatientEmail) {
      recipientEmail = appointment.originalPatientEmail
    }
    // 2. Check for family member email
    else if (familyMemberInfo?.email) {
      recipientEmail = familyMemberInfo.email
    }
    // 3. Default to patient email
    else {
  recipientEmail = appointment.patient?.user?.email || ''
  }

    if (!recipientEmail) {
      console.error('No recipient email found for appointment:', appointment.id)
      return false
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      bcc: bccRecipients.join(','),
      subject: `Appointment Confirmation - Dr. Kavitha Thomas Homoeopathic Clinic`,
      html: html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Appointment confirmation email sent:', {
      to: recipientEmail,
      patientName: displayPatientName,
      messageId: info.messageId
    })
    return true
  } catch (error) {
    console.error('Failed to send appointment confirmation email:', error)
    return false
  }
}

// Helper function to get family member email
async function getFamilyMemberEmail(familyMemberId: string): Promise<string | null> {
  try {
    const familyMember = await prisma.familyMember.findUnique({
      where: { id: familyMemberId },
      select: { email: true }
    })
    return familyMember?.email || null
  } catch (error) {
    console.error('Error fetching family member email:', error)
    return null
  }
}

// Send magic link email
export async function sendMagicLinkEmail(email: string, token: string) {
  try {
    const magicLink = `${process.env.NEXTAUTH_URL}/auth/magic?token=${token}&email=${encodeURIComponent(email)}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0E7C7B;">Sign in to Patient Portal</h2>
        <p>Click the link below to sign in to your patient portal:</p>
        <a href="${magicLink}" style="display: inline-block; background: #0E7C7B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Sign in to Portal
        </a>
        <p style="margin-top: 20px; color: #666;">
          If you didn't request this, please ignore this email.
        </p>
        <p style="color: #666;">
          This link will expire in 24 hours.
        </p>
      </div>
    `

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Sign in to Dr. Kavitha Thomas Patient Portal',
      html: html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Magic link email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send magic link email:', error)
    return false
  }
}

// Add to lib/email.ts
export async function sendDoctorInvitationEmail(
  email: string, 
  invitationUrl: string, 
  specialization: string,
  role: string
) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Doctor Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0E7C7B 0%, #2A5C82 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0E7C7B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; margin: 10px 0; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; color: #856404; }
          .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Doctor Invitation</h1>
          <p>Dr. Kavitha Thomas Homoeopathic Clinic</p>
        </div>
        
        <div class="content">
          <p>Dear Doctor,</p>
          
          <p>You have been invited to join Dr. Kavitha Thomas Homoeopathic Clinic as a ${role === 'ADMIN' ? 'Admin Doctor' : 'Regular Doctor'}.</p>
          
          <p><strong>Specialization:</strong> ${specialization}</p>
          
          <div class="alert">
            <strong>⚠️ Important:</strong> This invitation link will expire in 2 hours.
          </div>
          
          <a href="${invitationUrl}" class="button">
            Accept Invitation & Set Up Account
          </a>
          
          <p>After accepting, you'll be able to:</p>
          <ul>
            <li>Set up your password</li>
            <li>Complete your doctor profile</li>
            <li>Set your availability schedule</li>
            <li>Start seeing patients</li>
          </ul>
          
          <p>If you didn't expect this invitation, please ignore this email.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Dr. Kavitha Thomas Homoeopathic Clinic<br>
            Phone: ${process.env.CLINIC_PHONE} | Email: ${process.env.CLINIC_EMAIL}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Invitation to Join Dr. Kavitha Thomas Clinic as ${role === 'ADMIN' ? 'Admin Doctor' : 'Doctor'}`,
      html: html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Doctor invitation email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send doctor invitation email:', error)
    return false
  }
}

export async function sendEmail({ to, subject, html }: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
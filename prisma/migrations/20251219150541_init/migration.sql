-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PATIENT',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "lastBookingAttemptAt" TIMESTAMP(3),
    "bookingAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "bookingLimitResetAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "address" TEXT,
    "medicalHistory" TEXT,
    "allergies" TEXT,
    "emergencyContact" TEXT,
    "bloodGroup" TEXT,
    "primaryFamilyMemberId" TEXT,
    "isPrimaryFamilyMember" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "relationship" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "medicalNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL DEFAULT 'Homoeopathy',
    "qualifications" TEXT[],
    "experience" INTEGER NOT NULL DEFAULT 15,
    "consultationFee" INTEGER NOT NULL DEFAULT 300,
    "bio" TEXT,
    "achievements" TEXT[],
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "disabledAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "colorCode" TEXT NOT NULL DEFAULT '#3B82F6',
    "canBookAsPatient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentType" TEXT NOT NULL DEFAULT 'IN_PERSON',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "serviceType" TEXT NOT NULL DEFAULT 'GENERAL_CONSULTATION',
    "symptoms" TEXT,
    "previousTreatment" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "googleMeetLink" TEXT,
    "googleEventId" TEXT,
    "diagnosis" TEXT,
    "treatmentPlan" TEXT,
    "recommendations" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookedByUserId" TEXT,
    "bookedByPatientId" TEXT,
    "familyMemberId" TEXT,
    "originalPatientName" TEXT,
    "originalPatientEmail" TEXT,
    "originalPatientPhone" TEXT,
    "requiresMerge" BOOLEAN NOT NULL DEFAULT false,
    "mergeResolvedAt" TIMESTAMP(3),
    "mergedToPatientId" TEXT,
    "mergedToFamilyMemberId" TEXT,
    "mergeNotes" TEXT,
    "bookingMethod" TEXT NOT NULL DEFAULT 'DIRECT',
    "source" TEXT,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorAvailability" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "maxPatients" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorCredentials" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "saltRounds" INTEGER NOT NULL DEFAULT 12,
    "lastPasswordChange" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorCredentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginLog" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "doctorId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "attemptType" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DOCTOR',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDoctorAssignment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "endedAt" TIMESTAMP(3),
    "endedBy" TEXT,
    "endedReason" TEXT,
    "referredFromDoctorId" TEXT,
    "referredAt" TIMESTAMP(3),

    CONSTRAINT "PatientDoctorAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientReferral" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "fromDoctorId" TEXT NOT NULL,
    "toDoctorId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientMedicalEvent" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "transferredFromDoctorId" TEXT,
    "transferredAt" TIMESTAMP(3),
    "isTransferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientMedicalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "userId" TEXT,
    "userEmail" TEXT,
    "userRole" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestPath" TEXT,
    "requestMethod" TEXT,
    "metadata" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_lastBookingAttemptAt_idx" ON "User"("lastBookingAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- CreateIndex
CREATE INDEX "Patient_userId_idx" ON "Patient"("userId");

-- CreateIndex
CREATE INDEX "Patient_primaryFamilyMemberId_idx" ON "Patient"("primaryFamilyMemberId");

-- CreateIndex
CREATE INDEX "Patient_isPrimaryFamilyMember_idx" ON "Patient"("isPrimaryFamilyMember");

-- CreateIndex
CREATE INDEX "FamilyMember_patientId_idx" ON "FamilyMember"("patientId");

-- CreateIndex
CREATE INDEX "FamilyMember_email_idx" ON "FamilyMember"("email");

-- CreateIndex
CREATE INDEX "FamilyMember_isActive_idx" ON "FamilyMember"("isActive");

-- CreateIndex
CREATE INDEX "FamilyMember_relationship_idx" ON "FamilyMember"("relationship");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_patientId_email_key" ON "FamilyMember"("patientId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE INDEX "Doctor_userId_idx" ON "Doctor"("userId");

-- CreateIndex
CREATE INDEX "Doctor_isAdmin_idx" ON "Doctor"("isAdmin");

-- CreateIndex
CREATE INDEX "Doctor_isActive_idx" ON "Doctor"("isActive");

-- CreateIndex
CREATE INDEX "Doctor_canBookAsPatient_idx" ON "Doctor"("canBookAsPatient");

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- CreateIndex
CREATE INDEX "Appointment_bookedByUserId_idx" ON "Appointment"("bookedByUserId");

-- CreateIndex
CREATE INDEX "Appointment_familyMemberId_idx" ON "Appointment"("familyMemberId");

-- CreateIndex
CREATE INDEX "Appointment_requiresMerge_idx" ON "Appointment"("requiresMerge");

-- CreateIndex
CREATE INDEX "Appointment_mergedToPatientId_idx" ON "Appointment"("mergedToPatientId");

-- CreateIndex
CREATE INDEX "Appointment_bookingMethod_idx" ON "Appointment"("bookingMethod");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "VerificationToken_identifier_idx" ON "VerificationToken"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "DoctorAvailability_doctorId_dayOfWeek_idx" ON "DoctorAvailability"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorAvailability_doctorId_dayOfWeek_key" ON "DoctorAvailability"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorCredentials_doctorId_key" ON "DoctorCredentials"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorCredentials_email_key" ON "DoctorCredentials"("email");

-- CreateIndex
CREATE INDEX "DoctorCredentials_email_idx" ON "DoctorCredentials"("email");

-- CreateIndex
CREATE INDEX "DoctorCredentials_doctorId_idx" ON "DoctorCredentials"("doctorId");

-- CreateIndex
CREATE INDEX "LoginLog_email_idx" ON "LoginLog"("email");

-- CreateIndex
CREATE INDEX "LoginLog_doctorId_idx" ON "LoginLog"("doctorId");

-- CreateIndex
CREATE INDEX "LoginLog_createdAt_idx" ON "LoginLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorInvitation_email_key" ON "DoctorInvitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorInvitation_token_key" ON "DoctorInvitation"("token");

-- CreateIndex
CREATE INDEX "DoctorInvitation_email_idx" ON "DoctorInvitation"("email");

-- CreateIndex
CREATE INDEX "DoctorInvitation_token_idx" ON "DoctorInvitation"("token");

-- CreateIndex
CREATE INDEX "DoctorInvitation_expiresAt_idx" ON "DoctorInvitation"("expiresAt");

-- CreateIndex
CREATE INDEX "PatientDoctorAssignment_patientId_idx" ON "PatientDoctorAssignment"("patientId");

-- CreateIndex
CREATE INDEX "PatientDoctorAssignment_doctorId_idx" ON "PatientDoctorAssignment"("doctorId");

-- CreateIndex
CREATE INDEX "PatientDoctorAssignment_isActive_idx" ON "PatientDoctorAssignment"("isActive");

-- CreateIndex
CREATE INDEX "PatientDoctorAssignment_status_idx" ON "PatientDoctorAssignment"("status");

-- CreateIndex
CREATE INDEX "PatientDoctorAssignment_referredFromDoctorId_idx" ON "PatientDoctorAssignment"("referredFromDoctorId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientDoctorAssignment_patientId_doctorId_isActive_key" ON "PatientDoctorAssignment"("patientId", "doctorId", "isActive");

-- CreateIndex
CREATE INDEX "PatientReferral_patientId_idx" ON "PatientReferral"("patientId");

-- CreateIndex
CREATE INDEX "PatientReferral_fromDoctorId_idx" ON "PatientReferral"("fromDoctorId");

-- CreateIndex
CREATE INDEX "PatientReferral_toDoctorId_idx" ON "PatientReferral"("toDoctorId");

-- CreateIndex
CREATE INDEX "PatientReferral_status_idx" ON "PatientReferral"("status");

-- CreateIndex
CREATE INDEX "PatientMedicalEvent_patientId_idx" ON "PatientMedicalEvent"("patientId");

-- CreateIndex
CREATE INDEX "PatientMedicalEvent_doctorId_idx" ON "PatientMedicalEvent"("doctorId");

-- CreateIndex
CREATE INDEX "PatientMedicalEvent_eventType_idx" ON "PatientMedicalEvent"("eventType");

-- CreateIndex
CREATE INDEX "PatientMedicalEvent_createdAt_idx" ON "PatientMedicalEvent"("createdAt");

-- CreateIndex
CREATE INDEX "PatientMedicalEvent_isTransferred_idx" ON "PatientMedicalEvent"("isTransferred");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userEmail_idx" ON "AuditLog"("userEmail");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_success_idx" ON "AuditLog"("success");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_primaryFamilyMemberId_fkey" FOREIGN KEY ("primaryFamilyMemberId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_bookedByUserId_fkey" FOREIGN KEY ("bookedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_bookedByPatientId_fkey" FOREIGN KEY ("bookedByPatientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_mergedToPatientId_fkey" FOREIGN KEY ("mergedToPatientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_mergedToFamilyMemberId_fkey" FOREIGN KEY ("mergedToFamilyMemberId") REFERENCES "FamilyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorCredentials" ADD CONSTRAINT "DoctorCredentials_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorInvitation" ADD CONSTRAINT "DoctorInvitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDoctorAssignment" ADD CONSTRAINT "PatientDoctorAssignment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDoctorAssignment" ADD CONSTRAINT "PatientDoctorAssignment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDoctorAssignment" ADD CONSTRAINT "PatientDoctorAssignment_referredFromDoctorId_fkey" FOREIGN KEY ("referredFromDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientReferral" ADD CONSTRAINT "PatientReferral_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientReferral" ADD CONSTRAINT "PatientReferral_fromDoctorId_fkey" FOREIGN KEY ("fromDoctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientReferral" ADD CONSTRAINT "PatientReferral_toDoctorId_fkey" FOREIGN KEY ("toDoctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedicalEvent" ADD CONSTRAINT "PatientMedicalEvent_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedicalEvent" ADD CONSTRAINT "PatientMedicalEvent_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedicalEvent" ADD CONSTRAINT "PatientMedicalEvent_transferredFromDoctorId_fkey" FOREIGN KEY ("transferredFromDoctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

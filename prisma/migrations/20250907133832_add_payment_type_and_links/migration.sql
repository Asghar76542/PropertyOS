-- AlterTable
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN "lastName" TEXT;
ALTER TABLE "users" ADD COLUMN "password" TEXT;
ALTER TABLE "users" ADD COLUMN "phone" TEXT;

-- CreateTable
CREATE TABLE "landlord_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "businessAddress" TEXT,
    "businessCity" TEXT,
    "businessPostcode" TEXT,
    "licenseNumber" TEXT,
    "taxNumber" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankSortCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "landlord_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tenant_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "currentAddress" TEXT,
    "city" TEXT,
    "postcode" TEXT,
    "employmentStatus" TEXT,
    "employerName" TEXT,
    "monthlyIncome" INTEGER,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "previousAddress" TEXT,
    "moveInDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tenant_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "result" TEXT NOT NULL,
    "errorDetails" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "processingFee" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentDate" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'RENT',
    "method" TEXT,
    "maintenanceId" TEXT,
    "propertyId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "tenancyId" TEXT,
    CONSTRAINT "payments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_tenancyId_fkey" FOREIGN KEY ("tenancyId") REFERENCES "tenancies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "maintenance_requests" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("amount", "createdAt", "description", "dueDate", "id", "landlordId", "paymentDate", "processingFee", "propertyId", "status", "tenancyId", "updatedAt") SELECT "amount", "createdAt", "description", "dueDate", "id", "landlordId", "paymentDate", "processingFee", "propertyId", "status", "tenancyId", "updatedAt" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE INDEX "payments_status_dueDate_idx" ON "payments"("status", "dueDate");
CREATE INDEX "payments_landlordId_dueDate_status_idx" ON "payments"("landlordId", "dueDate", "status");
CREATE INDEX "payments_propertyId_idx" ON "payments"("propertyId");
CREATE INDEX "payments_tenancyId_idx" ON "payments"("tenancyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "landlord_profiles_userId_key" ON "landlord_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_profiles_userId_key" ON "tenant_profiles"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "compliance_records_propertyId_idx" ON "compliance_records"("propertyId");

-- CreateIndex
CREATE INDEX "compliance_records_userId_idx" ON "compliance_records"("userId");

-- CreateIndex
CREATE INDEX "documents_propertyId_idx" ON "documents"("propertyId");

-- CreateIndex
CREATE INDEX "documents_uploadedBy_idx" ON "documents"("uploadedBy");

-- CreateIndex
CREATE INDEX "documents_tenancyId_idx" ON "documents"("tenancyId");

-- CreateIndex
CREATE INDEX "maintenance_requests_propertyId_status_idx" ON "maintenance_requests"("propertyId", "status");

-- CreateIndex
CREATE INDEX "maintenance_requests_reportedBy_idx" ON "maintenance_requests"("reportedBy");

-- CreateIndex
CREATE INDEX "maintenance_requests_assignedTo_idx" ON "maintenance_requests"("assignedTo");

-- CreateIndex
CREATE INDEX "properties_landlordId_idx" ON "properties"("landlordId");

-- CreateIndex
CREATE INDEX "properties_isAvailable_city_idx" ON "properties"("isAvailable", "city");

-- CreateIndex
CREATE INDEX "properties_city_postcode_propertyType_idx" ON "properties"("city", "postcode", "propertyType");

-- CreateIndex
CREATE INDEX "tenancies_status_endDate_idx" ON "tenancies"("status", "endDate");

-- CreateIndex
CREATE INDEX "tenancies_propertyId_idx" ON "tenancies"("propertyId");

-- CreateIndex
CREATE INDEX "tenancies_landlordId_idx" ON "tenancies"("landlordId");

-- CreateIndex
CREATE INDEX "tenancies_tenantId_idx" ON "tenancies"("tenantId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

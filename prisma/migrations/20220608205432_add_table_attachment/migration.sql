-- CreateTable
CREATE TABLE "attachment" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "keyname" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attachment_uuid_key" ON "attachment"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "attachment_profileId_key" ON "attachment"("profileId");

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

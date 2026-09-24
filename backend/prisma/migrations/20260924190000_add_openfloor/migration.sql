-- CreateTable
CREATE TABLE "openfloor_board" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 0,
    "spotlightId" TEXT,
    "tvTopicId" TEXT,

    CONSTRAINT "openfloor_board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "openfloor_topics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "openfloor_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "openfloor_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "name" TEXT,
    "author" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "topicId" TEXT,
    "answered" BOOLEAN NOT NULL DEFAULT false,
    "videoId" TEXT,
    "videoStart" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "openfloor_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "openfloor_votes" (
    "questionId" TEXT NOT NULL,
    "voter" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "openfloor_votes_pkey" PRIMARY KEY ("questionId","voter")
);

-- CreateIndex
CREATE INDEX "openfloor_questions_author_createdAt_idx" ON "openfloor_questions"("author", "createdAt");

-- CreateIndex
CREATE INDEX "openfloor_questions_ipHash_createdAt_idx" ON "openfloor_questions"("ipHash", "createdAt");

-- AddForeignKey
ALTER TABLE "openfloor_votes" ADD CONSTRAINT "openfloor_votes_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "openfloor_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add webtoon relations to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "dummy_webtoon" TEXT;
ALTER TABLE "users" DROP COLUMN IF EXISTS "dummy_webtoon";

-- CreateTable: webtoon_series
CREATE TABLE "webtoon_series" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webtoon_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable: webtoon_episodes
CREATE TABLE "webtoon_episodes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "episodeNum" INTEGER NOT NULL,
    "seriesId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webtoon_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: webtoon_pages
CREATE TABLE "webtoon_pages" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "imageData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webtoon_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webtoon_series_slug_key" ON "webtoon_series"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "webtoon_episodes_seriesId_episodeNum_key" ON "webtoon_episodes"("seriesId", "episodeNum");

-- AddForeignKey
ALTER TABLE "webtoon_series" ADD CONSTRAINT "webtoon_series_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webtoon_episodes" ADD CONSTRAINT "webtoon_episodes_seriesId_fkey"
    FOREIGN KEY ("seriesId") REFERENCES "webtoon_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webtoon_episodes" ADD CONSTRAINT "webtoon_episodes_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webtoon_pages" ADD CONSTRAINT "webtoon_pages_episodeId_fkey"
    FOREIGN KEY ("episodeId") REFERENCES "webtoon_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

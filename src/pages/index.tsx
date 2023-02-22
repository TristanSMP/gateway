import { ReviewStatus } from "@prisma/client";
import type { InferGetStaticPropsType, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "../server/db/client";

export const getStaticProps = async () => {
  const imagesCount = await prisma.image.count();
  const skip = Math.floor(Math.random() * imagesCount);

  const randomImage = await prisma.image.findMany({
    take: 5,
    skip: skip,
    orderBy: {
      createdAt: "desc",
    },
    where: {
      reviewStatus: ReviewStatus.Approved,
    },
  });

  const image = randomImage[Math.floor(Math.random() * randomImage.length)];

  return {
    props: {
      image: image?.url ?? "https://cdn.tristancamejo.com/tsmp.gif",
    },
    revalidate: 60, // New random image every minute.
  };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  image,
}) => {
  return (
    <>
      <div className="hero min-h-screen bg-base-300">
        <div className="hero-content -translate-y-24 flex-col gap-6 lg:flex-row-reverse lg:gap-12">
          <div className="max-w-lg overflow-hidden">
            <Image
              className="rounded-lg object-cover shadow-2xl"
              src={image}
              width={1920}
              height={1080}
              alt="Random Image"
            />
          </div>
          <div className="ml-1 self-start lg:ml-0 lg:self-center">
            <h1 className="text-5xl font-bold">Tristan SMP</h1>
            <p className="py-6">A modern technical SMP for everyone.</p>
            <Link href="/onboarding" className="btn-primary btn">
              Apply now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

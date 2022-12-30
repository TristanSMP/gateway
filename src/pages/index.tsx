import { InferGetStaticPropsType, type NextPage } from "next";
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
  });

  const image = randomImage[Math.floor(Math.random() * randomImage.length)];

  if (!image) {
    throw new Error("Failed to get random image.");
  }

  return {
    props: {
      image: image.url,
    },
    revalidate: 60, // New random image every minute.
  };
};

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  image,
}) => {
  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div
          className="hero-content flex-col lg:flex-row-reverse"
          style={{ gap: "1.5rem" }}
        >
          <Image
            className="ml-6 max-w-xl rounded-lg shadow-2xl"
            src={image}
            width={1920}
            height={1080}
            alt="Random Image"
          />
          <div>
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

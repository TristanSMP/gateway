import * as Mui from "@mui/material";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { type NextPage } from "next";
import { z } from "zod";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { prisma } from "../../server/db/client";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
  });

  if (!user || !user.canAccessAdminDashboard) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const params = z
    .object({
      id: z.string(),
    })
    .parse(ctx.params);

  const book = await prisma.blogBook.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!book) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      book: {
        pages: book.content.split("\n%PAGE%\n"),
        title: book.title,
      },
    },
  };
};

const Book: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ book: { pages, title } }) => {
  return (
    <Mui.Container>
      <Mui.Typography variant="h1">{title}</Mui.Typography>
      {pages.map((page, index) => (
        <Mui.Paper key={index} sx={{ p: 2, my: 2 }}>
          <Mui.Typography variant="body1">{page}</Mui.Typography>
        </Mui.Paper>
      ))}
    </Mui.Container>
  );
};

export default Book;

import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    // TODO - add auth
    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }
    const data = await db.company.findMany({
      where: {
        RewardPools: { some: { distributionDate: { lte: new Date() } } },
      },
      include: {
        RewardPools: true,
        featureList: { include: { features: { include: { comments: true } } } },
      },
    });
    console.log(data);

    // return NextResponse.json({ user: createdUser, ok: true });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server", { status: 500 });
  }
}

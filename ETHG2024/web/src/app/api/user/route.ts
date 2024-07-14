import { type NextRequest, NextResponse } from "next/server";
import { api } from "~/trpc/server";

export async function POST(request: NextRequest) {
  try {
    // TODO - add auth
    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }
    const data = (await request.json()) as {
      email: string;
      name: string;
      id: string;
      walletAddress: string;
    };

    const createdUser = await api.user.create({
      email: data.email,
      name: data.name,
      id: data.id,
      walletAddress: data.walletAddress,
    });

    return NextResponse.json({ user: createdUser, ok: true });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server", { status: 500 });
  }
}

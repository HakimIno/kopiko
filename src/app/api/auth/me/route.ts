import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

interface JwtPayload {
    currentUserId: string;
    // add other fields if needed
}

export async function GET() {
    try {
        const headersList = await headers();
        const authHeader = headersList.get("authorization");
        
        if (!authHeader?.startsWith("Bearer ")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        return NextResponse.json({
            currentUserId: decoded.currentUserId
        });
    } catch (error) {
        console.error("[AUTH_ME]", error);
        return new NextResponse("Unauthorized", { status: 401 });
    }
} 
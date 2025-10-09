import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";

export async function POST(request: NextRequest) {

    const body = await request.json();
    const {csrfToken} = body;
    const url: string = `https://www.tiktok.com/v2/auth/authorize/`
    const urlParams = new URLSearchParams({
        "client_key": `${process.env.TIKTOK_CLIENT_KEY}`,
        "scope": "user.info.basic",
        "response_type": "code",
        "redirect_uri": "https://tiktok-integration-playground.vercel.app/authorize/",
        "state": `${csrfToken}`,
    });
    const cookieStore = await cookies();
   cookieStore.set({
        name: 'csrfState',
        value: crypto.randomUUID(),
        maxAge: 60, // 60 seconds
        httpOnly: true,
        secure: true,
        path: '/',
    })


    return NextResponse.redirect(`${url}${urlParams.toString()}`);
}
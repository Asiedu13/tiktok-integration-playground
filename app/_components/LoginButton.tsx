"use client"
import {useTransition} from "react";
import {getTiktokURL, LoginWithTiktok} from "@/app/actions/actions";
import {useRouter} from "next/navigation";


export function LoginButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async  (e) => {
        e.preventDefault();
        // required by TikTok to confirm the request
        const someRandomValue = new Uint8Array(30);
        const csrfToken = window.crypto.getRandomValues(someRandomValue);
        const url: string = `https://www.tiktok.com/v2/auth/authorize/?`
        const urlParams = new URLSearchParams({
            " client_key": `${process.env.TIKTOK_CLIENT_KEY}`,
            "scope": "user.info.basic",
            "response_type": "code",
            "redirect_uri": "https://tiktok-integration-playground.vercel.app/authorize",
            "state": `${csrfToken}`,
        });

        startTransition(async () => {
            const tiktokLogin = await getTiktokURL(csrfToken);
            console.log({tiktokLogin})
            if (tiktokLogin) {
                window.location = `${tiktokLogin}`;
            }
        })


    }

    return (
        <form onSubmit={handleSubmit}>
            <button type={"submit"}>{!isPending ? "Login in With TikTok" : "loading..."}</button>
        </form>
    )
}
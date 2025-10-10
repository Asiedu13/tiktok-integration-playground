"use client"
import {useTransition} from "react";
import {getTiktokURL} from "@/app/actions/actions";


export function LoginButton() {
    const [isPending, startTransition] = useTransition();

    const handleSubmit:  React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();

        // required by TikTok to confirm the request
        const someRandomValue = new Uint8Array(30);
        const csrfToken = window.crypto.getRandomValues(someRandomValue);

        startTransition(async () => {
            const tiktokLogin = await getTiktokURL(csrfToken);
            console.log({tiktokLogin})
            if (tiktokLogin) {
                window.location = `${tiktokLogin}` as Location &string;
            }
        })


    }

    return (
        <form onSubmit={handleSubmit}>
            <button type={"submit"}>{!isPending ? "Login in With TikTok" : "loading..."}</button>
        </form>
    )
}
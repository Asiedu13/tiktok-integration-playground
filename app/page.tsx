import {LoginButton} from "@/app/_components/LoginButton";

export default function Home() {
    return (
        <div>
            <h1>TikTok Integration Journey</h1>
            <p>By Prince Asiedu</p>

            {/*Login with Tiktok*/}
            <section>
                <LoginButton />
            </section>
        </div>
    )
}
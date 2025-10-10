import {redirect} from "next/navigation";

interface searchParamsType {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({searchParams}: searchParamsType) {
    const authorizedURLParams: URLSearchParams =  new URLSearchParams(Object.fromEntries(searchParams));

    const newRedirectURI: string = `http://localhost:3000/feed/?${authorizedURLParams.toString()}`;
    console.log(newRedirectURI);
    redirect(newRedirectURI);

    return (
        <section>
            Redirecting...
        </section>
    )
}
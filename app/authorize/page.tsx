import {Log} from "@/app/utils/functions";
import {redirect} from "next/navigation";

interface searchParamsType {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({searchParams}: searchParamsType) {
    console.log({searchParams})
    const authorizedURLParams: URLSearchParams =  new URLSearchParams();


    for (const key in searchParams) {
        const value = searchParams[key];

        if (typeof value === "string") {
            authorizedURLParams.append(key,  String(value));

        } else if (Array.isArray(value)) {
            value.forEach(val => {
                    authorizedURLParams.append(key,  String(val))
            })
        }
    }

    const newRedirectURI: string = `http://localhost:3000/?${authorizedURLParams.toString()}`;
    console.log(newRedirectURI);
    redirect(newRedirectURI);

    return (
        <section>
            Redirecting...
        </section>
    )
}
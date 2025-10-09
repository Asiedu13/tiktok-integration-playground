import {Log} from "@/app/utils/functions";
import {redirect} from "next/navigation";

interface searchParamsType {
    [item: string]: string,
}

export default function Page({searchParams}: searchParamsType) {
    console.log({searchParams})
    const authorizedURLParams: string =  new URLSearchParams(searchParams).toString();
    const newRedirectURI: string = `http://localhost:3000/?${authorizedURLParams}`;

    console.log(newRedirectURI);

    redirect(newRedirectURI);
    
    return (
        <section>
            Redirecting...
        </section>
    )
}
import {Button} from "@/app/feed/components/Button";

export interface searchParamsType {
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}


export default async function Page({searchParams}: searchParamsType) {
    const searchParam = await searchParams;
    return (
        <section>
            Feed goes here
            <Button searchParams={searchParam} />
        </section>
    )
}
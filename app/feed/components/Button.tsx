"use client"

import {searchParamsType} from "@/app/feed/page";
import {useState, useTransition} from "react";
import {getUserAccessToken, getUserFeed, getUserProfile, handleCodeSetting} from "@/app/actions/actions";
import Image from "next/image";

type TiktokUserType = UserProfileType | undefined;

interface UserProfileType {
    avatar_url: string,
    display_name: string,
    open_id: string,
    union_id: string
}

export function Button({searchParams}: searchParamsType) {
    const [isPending, startTransition] = useTransition();
    const [userProfile, setUserProfileInfo] = useState<TiktokUserType>(undefined);

    const handleFeedAuthorization = () => {
        startTransition(async () => {
            const userCode = await handleCodeSetting(searchParams); // set the dev cookie

            if (userCode) {
                console.log({userCode})
                const getUserToken = await getUserAccessToken(userCode, window.location.href as Location &string);
                const getProfile = await getUserProfile(getUserToken);

                setUserProfileInfo(getProfile.data.user);

                console.log({getUserToken, getProfile});
            } else {
                console.error('Error setting code',{userCode})
            }
        })
    }

    return (
        <section>
            <button onClick={handleFeedAuthorization} className={"bg-white text-black rounded-md p-2"}>
                {isPending ? "Loading...": "Authorize to use Feed"}</button>

            {
                userProfile &&
                <section className={"text-amber-50"}>
                    <Image src={userProfile.avatar_url} alt={userProfile.display_name} width={50} height={50} />
                    <h2>{userProfile?.display_name || 'something'}</h2>
                </section>
            }
        </section>
    )
}
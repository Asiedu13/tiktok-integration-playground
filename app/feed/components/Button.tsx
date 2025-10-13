"use client"

import {searchParamsType} from "@/app/feed/page";
import {useState, useTransition} from "react";
import {
    getUserAccessToken,
    getUserContent,
    getUserProfile,
    handleCodeSetting
} from "@/app/actions/actions";
import Image from "next/image";

type TiktokUserType = UserProfileType | undefined;
type TiktokVideoType = UserVideoType | UserVideoType[];

interface UserProfileType {
    avatar_url: string,
    display_name: string,
    open_id: string,
    union_id: string
}

interface UserVideoType {
    title: string,
    video_description: string,
    embed_link: string,
    duration: number,
    id: string,
    cover_image_url: string
}

export function Button({searchParams}: searchParamsType) {
    const [isPending, startTransition] = useTransition();
    const [userProfile, setUserProfileInfo] = useState<TiktokUserType>(undefined);
    const [content, setContent] = useState([]);

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

    const handleContentAuthorization = () => {
        startTransition(async () => {
            const userCode = await handleCodeSetting(searchParams);
            if (userCode) {
                const getUserToken = await getUserAccessToken(userCode, window.location.href as Location &string);
                const getContent =  await getUserContent(getUserToken);

                console.log({content: getContent.data.videos});
                setContent(getContent.data.videos);
            }

        })
    }

    return (
        <section>
            <button onClick={handleFeedAuthorization} className={"bg-white text-black rounded-md p-2"}>
                {isPending ? "Loading...": "Authorize to use Feed"}</button>

            <button onClick={handleContentAuthorization} className={"bg-white text-black rounded-md p-2"}>
                {isPending ? "Loading...": "Get content"}</button>

            {
                userProfile &&
                <section className={"text-amber-50"}>
                    <Image src={userProfile.avatar_url} alt={userProfile.display_name} width={50} height={50} />
                    <h2>{userProfile?.display_name || 'something'}</h2>
                </section>
            }

            {
                content &&
                <section>
                    Videos
                    {content.map((video) =>  {
                        console.log(video);
                        return (
                            <div>
                                <h2>{video.title}</h2>
                                <img src={video.cover_image_url} alt={"image goes here"}/>
                                {/*<iframe height="300" width= "400" src="https://www.tiktok.com/player/v1/6718335390845095173?&music_info=1&description=1" allow="fullscreen" title="test"></iframe>*/}
                                <iframe height="300" width= "500" src={video.embed_link} allow="fullscreen" title="test"></iframe>

                                <br />
                            </div>
                        )
                    })}

                </section>
            }
        </section>
    )
}
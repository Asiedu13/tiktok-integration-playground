"use server"
import crypto from "crypto";
import {cookies} from "next/headers";
import {parseUrlEncodedToRegularObject, removeEncodedSpaces} from "@/app/utils/functions";


interface finalCookieType {
    [key: string]: string | undefined
}

interface searchParamsType {
    searchParams: {
        [key: string]: string | string[] | undefined,
    }
}

interface UserAccessReqBody {
    client_key: string,
    client_secret: string,
    code: string,
    grant_type: 'authorization_code',
    redirect_uri: string,
    code_verifier?: string,
}




export async function getLocalCookies(...args:  string[]) {
    const cookieStore = await cookies();
    const finalCookie: finalCookieType = {}

    for (const item of args) {
        finalCookie[item] = cookieStore.get(item)?.value;
    }

    return finalCookie;
}

export async function handleCodeSetting (searchParams: searchParamsType["searchParams"]) {
    const cookieStore = await cookies();
    if (searchParams) {
        console.log({searchParams: Object.keys(searchParams)})
    }
    for (const key in searchParams) {
        if (key === "code") {
            console.log('code found', searchParams[key]);
            cookieStore.set('dev_code', String(searchParams[key]));
        }
    }
   return cookieStore.get('dev_code')?.value;
}

// Base64url encoder
function base64UrlEncode(arrayBuffer: Uint8Array | ArrayBuffer ) {
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

async function generateCodeVerifier() {
    const codeVerifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)))

    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const codeChallenge = base64UrlEncode(hashBuffer)

    return {codeChallenge, codeVerifier};

}

export async function getTiktokURL (csrfToken: Uint8Array) {
    const {codeChallenge, codeVerifier} = await generateCodeVerifier();
    // Store verifier securely in cookies
    const cookieStore = await cookies();
    cookieStore.set('tiktok_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 300,
    });

    const url: string = `https://www.tiktok.com/v2/auth/authorize/?`
    const urlParams = new URLSearchParams({
        "client_key": `${process.env.TIKTOK_CLIENT_KEY}`,
        "scope": "user.info.basic,video.list",
        "response_type": "code",
        "redirect_uri": "https://tiktok-integration-playground.vercel.app/authorize/",
        "state": `${csrfToken}`,
        "code_challenge": codeChallenge,
        "code_challenge_method": 'S256',
    });

   return `${url}${urlParams.toString()}`
}


export async function getUserAccessToken(code: string, redirectURI: string) {
    const {dev_code, userAccessToken} = await getLocalCookies('dev_code', 'userAccessToken');
    if (userAccessToken) {
        console.log('Code already exists');
        return removeEncodedSpaces(userAccessToken);
    }

    const uri = `https://open.tiktokapis.com/v2/oauth/token/`;
    const redirectURIs = `https://tiktok-integration-playground.vercel.app/authorize/`

    const {codeVerifier} = await generateCodeVerifier()

    const reqBody: UserAccessReqBody = {
        client_key: process.env.TIKTOK_CLIENT_KEY as string,
        client_secret: process.env.TIKTOK_CLIENT_SECRET as string,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectURIs,
        code_verifier: codeVerifier
    }

    const theBody = new URLSearchParams(reqBody);

    console.log("The request body", JSON.stringify(reqBody));
    const params = new URLSearchParams(reqBody);
    const completeURL = `${uri}?${params.toString()}`;

    console.log({completeURL});


    const response = await fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': "application/x-www-form-urlencoded"
        },
        body: theBody.toString()
    });

    if (!response.ok) {
        console.log(`Action.ts: getUserAccessToken`, {response});
        throw new Error(`Action.ts getUserAccesstoken()`)

    }
    const userToken = await response.json();
    console.log({dev_code, reqBody, userToken});

    const parsedUserToken = parseUrlEncodedToRegularObject(userToken);

    const cookieStore = await cookies();
    cookieStore.set('userAccessToken', parsedUserToken.access_token);

    return parsedUserToken.access_token;
}

async function GETTER(uri: string, options={}) {

    const response = await fetch(uri, options);

    if (!response.ok) {
        console.error(`Error occured while fetching ${uri}`);
    }
    console.log({response});

    return await response.json();
}

export async function getUserProfile(code: string) {
    const uri = `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name`
    const {userAccessToken} = await getLocalCookies('userAccessToken');
    const accessToken = removeEncodedSpaces(userAccessToken)
    console.log("Actions.ts: getUserFeed()",{accessToken});
    const OPTIONS =   {
        // method: "POST",
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
    const data = await GETTER(uri, OPTIONS);
    console.log('actions.ts: getUserFeed()', {data});
    return data;
}


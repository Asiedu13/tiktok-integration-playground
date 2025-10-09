"use server"
import crypto from "crypto";
import {cookies} from "next/headers";

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


export async function getTiktokURL (csrfToken: Uint8Array) {
    const codeVerifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)))

    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const codeChallenge = base64UrlEncode(hashBuffer)

    // Store verifier securely in cookies
    const cookieStore = await cookies();
    cookieStore.set('tiktok_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 300,
    })
    console.log(process.env.TIKTOK_CLIENT_KEY);
    const url: string = `https://www.tiktok.com/v2/auth/authorize/?`
    const urlParams = new URLSearchParams({
        "client_key": `${process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY}`,
        "scope": "user.info.basic,video.list",
        "response_type": "code",
        "redirect_uri": "https://tiktok-integration-playground.vercel.app/",
        "state": `${csrfToken}`,
        "code_challenge": codeChallenge,
        "code_challenge_method": 'S256',
    });

   return `${url}${urlParams.toString()}`
}
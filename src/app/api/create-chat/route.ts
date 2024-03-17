import { db } from "@/lib/db"
import { chats } from "@/lib/db/schema"
import { loadS3IntoPinecone } from "@/lib/pinecone"
import { getS3Url } from "@/lib/s3"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function POST(req: Request, res: Response) {
    const { userId } = auth()
    if (!userId) {
        return NextResponse.json({ error: 'unauthorised' }, { status: 401 })
    }
    try {
        const body = await req.json()
        const { file_key, file_name } = body
        console.log(file_key, file_name)
        let pages = await loadS3IntoPinecone(file_key);
        console.log("pages", pages.length);
        const [id] = await db.insert(chats).values({
            fileKye: file_key,
            pdfName: file_name,
            pdfUrl: getS3Url(file_key),
            userId
        }).returning({
            insertedId: chats.id
        })
        return NextResponse.json(
            { message: 'Chat created sucessfully', chat_id: id.insertedId },
            { status: 200 }
        )
    } catch (err) {
        console.error(err)
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        )
    }
}
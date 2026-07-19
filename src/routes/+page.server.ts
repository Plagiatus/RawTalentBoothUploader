import { Client } from "basic-ftp";
import { mkdirSync, renameSync, rmSync, writeFileSync, type PathLike } from "fs";
import { FTP_PORT, FTP_PW, FTP_SERVER, FTP_USER } from "$env/static/private";
import { Database } from "$lib/db.js";
import type { PageServerLoad } from "./$types.js";
import { fail } from "@sveltejs/kit";
import type { RTGame } from "../types.js";
import path from "path";
import Stream from "stream";

const db = new Database();
const client = new Client();
// client.ftp.verbose = true;

export const load: PageServerLoad = async ({ }) => {
    try {
        await db.ready();

    } catch (error) {
        console.error(error);
        return;
    }
    const games = await db.getAllGames();
    const events = await db.getAllEvents();
    return { events, games }
}


export const actions = {
    sendData: async ({ request }) => {
        const data = await request.formData();
        const event: string = data.get("event") as string;
        const id: number = parseInt(data.get("id") as string);

        if (!event || !id) {
            console.error("No event or no id. Both are needed.", event, id, !event, !id)
            return fail(422, { error: "No event or no id. Both are needed." });
        }
        let prevId: number | undefined = parseInt(data.get("prevId") as string);
        if (isNaN(prevId) || !prevId) prevId = undefined;
        let game = await db.getGame(prevId ?? id, event);
        if (!game) {
            game = { event } as RTGame;
        }
        game.id = id;

        // strings
        if (data.has("name"))
            game.name = data.get("name") as string;
        if (data.has("teamName"))
            game.teamName = data.get("teamName") as string;
        if (data.has("teamMembers"))
            game.teamMembers = data.get("teamMembers") as string;
        if (data.has("shortDescription"))
            game.shortDescription = data.get("shortDescription") as string;
        if (data.has("university"))
            game.university = data.get("university") as string;

        if (data.has("trailer"))
            game.trailer = data.get("trailer") as string;
        if (data.has("gameEngine"))
            game.gameEngine = data.get("gameEngine") as string;
        if (data.has("ageRating"))
            game.ageRating = data.get("ageRating") as string;

        // string arrays
        if (data.has("tags"))
            game.tags = data.getAll("tags") as string[];
        if (data.has("links"))
            game.links = data.getAll("links") as string[];

        // other    
        game.aiUsed = data.has("aiUsed")

        // files
        if (!game.images) {
            // @ts-expect-error
            game.images = {};
        }
        let cover: File = <File>data.get("cover");
        // no old images & no new ones
        if (!cover && !game.images.cover) {
            console.error("No cover image provided.");
            return fail(422, { message: "No cover image provided." })
        }
        let capsule: File = <File>data.get("capsule");
        if (!capsule && !game.images.capsule) {
            console.error("No capsule image provided.");
            return fail(422, { message: "No capsule image provided." })
        }

        // there is a new id, we need to move the images there if there already are some.
        if (prevId) {
            if (game.images.cover && !cover) {
                let oldPath = game.images.cover
                game.images.cover = `${event}/${id}/cover${path.extname(game.images.cover)}`
                await moveImage(oldPath, game.images.cover);
            }
            if (game.images.capsule && !capsule) {
                let oldPath = game.images.capsule
                game.images.capsule = `${event}/${id}/capsule${path.extname(game.images.capsule)}`
                await moveImage(oldPath, game.images.capsule);
            }
        }

        // new images
        if (cover) {
            // but also old ones
            if (game.images.cover) {
                await removeImage(game.images.cover);
            }
            game.images.cover = `${event}/${id}/cover${path.extname(cover.name)}`;
            await uploadImage(game.images.cover, cover)
        }

        if (capsule) {
            if (game.images.capsule) {
                await removeImage(game.images.capsule);
            }
            game.images.capsule = `${event}/${id}/capsule${path.extname(capsule.name)}`;
            await uploadImage(game.images.capsule, capsule)
        }

        db.addOrModifyGame(game, prevId);
    }
}

async function uploadImage(_path: string, file: File) {
    // try {
    //     mkdirSync(path.join("static", path.dirname(_path)), { recursive: true });
    //     writeFileSync(path.join("static", _path), Buffer.from(await file.arrayBuffer()));
    // } catch (error) {
    //     console.error(error);
    // }

    return new Promise<void>(async (resolve, reject) => {
        try {
            await reconnectClient();
            console.log("uploading", file.name, file.size, _path);
            await client.ensureDir(path.dirname(_path));
            await client.uploadFrom(Stream.Readable.from(file.stream()), path.basename(_path));
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}


async function moveImage(from: string, to: string) {
    // try {
    //     mkdirSync(path.join("static", path.dirname(to)), { recursive: true });
    //     renameSync(path.join("static", from), path.join("static", to));
    // } catch (error) {
    //     console.error(error);
    // }    
    
    return new Promise<void>(async (resolve, reject) => {
        try {
            await reconnectClient();
            console.log("moving", from, to);
            await client.rename(from, to);
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

async function removeImage(_path: string) {
    // try {
    //     rmSync(path.join("static", _path));
    // } catch (error) {
    //     console.error(error);
    // }

    return new Promise<void>(async (resolve, reject) => {
        try {
            await reconnectClient();
            console.log("removing", _path);
            await client.ensureDir(path.dirname(_path));
            await client.remove(path.basename(_path));
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}


async function reconnectClient() {
    return client.access({
        host: FTP_SERVER,
        user: FTP_USER,
        password: FTP_PW,
        secure: true,
        port: parseInt(FTP_PORT),
    })
}
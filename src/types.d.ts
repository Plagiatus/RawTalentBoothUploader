import type { GameEngine } from "$lib/data"

type RTGame = {
    event: string, //
    id: number, //
    name: string, //
    teamName: string, //
    teamMembers: string, //
    shortDescription: string, //
    tags: string[], //
    trailer: string, //
    links: string[], //
    gameEngine: GameEngine | string, //
    university: string, //
    aiUsed?: boolean, //
    ageRating: string, //
    images: {
        cover: string,
        capsule: string,
        additional: string[],
    },
}


type RTEvent = {
    id: string,
    name: string,
    year: number,
}

type University = {
    id: string,
    name: string,
    url: string,
}
// place files you want to import through the `$lib` alias in this folder.

import type { University } from "../types"

export const tags: Map<string, string[]> = new Map<string, string[]>([
    ["Player Amount", ["singleplayer", "multiplayer"]],
    ["Platforms", ["steam", "itch", "mobile", "epic"]],
    ["Monetization", ["free2play", "pay2play", "demo"]],
    ["Gameplay", ["co-op", "competitve", "casual/party"]],
    ["Category", ["shooter", "platform", "simulation", "strategy", "roguelike", "puzzle", "rpg", "romance", "story driven", "gambling", "incremental", "metroidvania"]],
    ["Style", ["horror", "pixel", "fantasy", "sci-fi", "realistic", "cartoon"]],
])


export enum GameEngine {
    GODOT = "godot",
    UNREAL = "unreal",
    UNITY = "unity",
    RENPY = "renpy",
    GAMEMAKER = "gamemaker",
    RPGMAKER = "rpgmaker",
    CONSTRUCT = "construct",
    FUDGE = "fudge",
}

export const universities: University[] = [
    {
        url: "https://colognegamelab.de/",
        id: "cgl",
        name: "Cologne Game Lab, TH Köln",
    }, {
        url: "https://gtc.inf.ethz.ch/",
        id: "eth",
        name: "ETH Zürich",
    }, {
        url: "https://www.filmakademie.de/",
        id: "fabw",
        name: "Filmakademie Baden-Württemberg",
    }, {
        url: "https://hdm-stuttgart.de/",
        id: "hdm",
        name: "Hochschule der Medien Stuttgart",
    }, {
        url: "https://www.hs-heilbronn.de/",
        id: "hhn",
        name: "Hochschule Heilbronn",
    }, {
        url: "https://h-da.de/",
        id: "hda",
        name: "Hochschule Darmstadt",
    }, {
        url: "https://hs-furtwangen.de",
        id: "hfu",
        name: "Hochschule Furtwangen",
    }, {
        url: "https://www.hs-mittweida.de/",
        id: "hsmw",
        name: "Hochschule Mittweida",
    }, {
        url: "https://www.hnu.de/",
        id: "hsnu",
        name: "Hochschule Neu-Ulm",
    }, {
        url: "https://nord.no/",
        id: "nord",
        name: "Nord Universitet",
    }, {
        url: "https://www.ru.is/",
        id: "ru",
        name: "Reykjavik University",
    }, {
        url: "https://www.tha.de/",
        id: "tha",
        name: "TH Augsburg",
    }, {
        url: "https://www.tu-darmstadt.de/",
        id: "tud",
        name: "TU Darmstadt",
    }, {
        url: "https://www.tum.de/",
        id: "tum",
        name: "TU München",
    }, {
        url: "https://www.uni-bayreuth.de/",
        id: "uba",
        name: "Uni Bayreuth",
    }, {
        url: "https://www.uni-siegen.de/",
        id: "unsi",
        name: "Uni Siegen",
    }, {
        url: "https://uni-tuebingen.de/",
        id: "ut",
        name: "Uni Tübingen",
    }, {
        url: "https://www.tugraz.at",
        id: "tug",
        name: "TU Graz",
    },
]
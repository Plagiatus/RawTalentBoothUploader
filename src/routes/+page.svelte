<script lang="ts">
    import ImageUploader from "$lib/comp/ImageUploader.svelte";
    import { GameEngine, tags, universities } from "$lib/data";
    import type { RTGame } from "../types.js";
    let { data } = $props();

    let selectedEvent: string = $state("");
    let selectedGameId: number = $state(0);
    let infoWasSubmitted: boolean = $state(false);

    // svelte-ignore state_referenced_locally
    const allGames = $state(data.games!);

    let gamesOfEvent: RTGame[] = $derived(
        allGames
            .filter((game) => game.event == selectedEvent)
            .sort((a, b) => a.id - b.id),
    );
    // @ts-expect-error
    let selectedGame: (RTGame & { prevId: number }) | undefined = $derived(
        gamesOfEvent.find((game) => game.id == selectedGameId),
    );

    function addGame() {
        allGames.push({
            id: 999,
            name: "Unnamed Game",
            event: selectedEvent,
            tags: [] as string[],
            links: [] as string[],
        } as RTGame & { prevId: number });
        selectedGameId = 999;
    }

    function updateSelectedGame(event: Event) {
        let input = event.target as HTMLInputElement;
        let newId: number = input.valueAsNumber;
        if (isNaN(newId) || gamesOfEvent.find((g) => g.id == newId)) {
            input.value = selectedGameId.toString();
            return;
        }
        if (selectedGame) {
            if (!selectedGame.prevId) {
                selectedGame.prevId = selectedGameId;
            }
            selectedGame.id = input.valueAsNumber;
        }
        selectedGameId = input.valueAsNumber;
    }
    function addLink() {
        if (!selectedGame) return;
        if (!selectedGame.links) {
            selectedGame.links = [];
        }
        selectedGame?.links.push("");
    }
    function removeLink(index: number) {
        if (!selectedGame?.links) return;
        selectedGame?.links.splice(index, 1);
    }
</script>

<h1>RAWTalent upload page</h1>

<select name="event" id="event" bind:value={selectedEvent}>
    <option value="" disabled selected>Select Event</option>
    {#each data.events as event}
        <option value={event.id}>{event.id}</option>
    {/each}
</select>
{#if selectedEvent}
    <select name="id" id="id" bind:value={selectedGameId}>
        <option value="0" disabled selected>Select Game</option>
        {#each gamesOfEvent as game}
            <option value={game.id}>{game.id} - {game.name}</option>
        {/each}
    </select>
    <span
        >Don't see your game in the list? If you just saved it, you might need
        to reload the page first. Otherwise:</span
    >
    <button onclick={addGame}>Add new game</button>
{/if}
{#if selectedGame}
    <form
        method="post"
        action="?/sendData"
        enctype="multipart/form-data"
        onsubmit={() => {
            infoWasSubmitted = true;
        }}
    >
        <input type="text" name="event" bind:value={selectedEvent} hidden />
        <input
            type="text"
            name="prevId"
            bind:value={selectedGame.prevId}
            hidden
        />
        <div>
            <!-- #region Basic Info -->
            <h2>Basic Info</h2>
            <div class="input-group">
                <label for="name"> Game Name </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    bind:value={selectedGame.name}
                    required
                />
                <span class="info">
                    The name of your game as it should appear on the website.
                </span>
            </div>
            <div class="input-group">
                <label for="game-id"> ID </label>
                <input
                    type="number"
                    name="id"
                    id="game-id"
                    min="1"
                    max="99"
                    step="1"
                    value={selectedGame.id}
                    onchange={updateSelectedGame}
                    required
                />
                <span class="info">
                    The id of your game as it is in the large google
                    spreadsheet.
                </span>
            </div>
            <div class="input-group">
                <label for="shortDescription"> Description </label>
                <textarea
                    name="shortDescription"
                    id="shortDescription"
                    bind:value={selectedGame.shortDescription}
                    required
                ></textarea>
                <span class="info">
                    A short description of what your game is. Don't go into too
                    much detail, it's just supposed to give some additional info
                    about the game to make people go to your actual game pages
                    (steam, itch, etc.)
                </span>
            </div>

            <div class="input-group">
                <label for="teamName"> Team Name </label>
                <input
                    type="text"
                    name="teamName"
                    id="teamName"
                    bind:value={selectedGame.teamName}
                    required
                />
                <span class="info">
                    The name of the team that created the game.
                </span>
            </div>

            <div class="input-group">
                <label for="teamMembers"> Team Members </label>
                <textarea
                    name="teamMembers"
                    id="teamMembers"
                    bind:value={selectedGame.teamMembers}
                ></textarea>
                <span class="info">
                    Optional. You can credit your team members in whatever way
                    you want here.
                </span>
            </div>
            <!-- #endregion -->
        </div>
        <div>
            <!-- #region Additional Info -->
            <h2>Additional Info</h2>
            <div class="input-group">
                <label for="trailer">Trailer Link (youtube)</label>
                <input
                    type="url"
                    name="trailer"
                    id="trailer"
                    pattern="https://.*"
                    bind:value={selectedGame.trailer}
                />
                <span class="info"
                    >If you've got a trailer on youtube, link it here.</span
                >
            </div>
            <div class="input-group">
                <label for="links">Links</label>
                {#each selectedGame.links as link, i}
                    <div>
                        <input
                            type="url"
                            name="links"
                            pattern="https://.*"
                            bind:value={selectedGame.links[i]}
                        />
                        <button
                            type="button"
                            onclick={() => {
                                removeLink(i);
                            }}>remove</button
                        >
                    </div>
                {/each}
                <button type="button" onclick={addLink}>add</button>
                <span class="info"
                    >Add further links here. Including but not limited to links
                    to platforms where visitors can download your game.</span
                >
            </div>
            <div class="input-group">
                <span>Game Engine</span>
                <ul>
                    {#each Object.values(GameEngine) as engine}
                        <li>
                            <input
                                type="radio"
                                name="gameEngine"
                                value={engine}
                                id={engine}
                                bind:group={selectedGame.gameEngine}
                            />
                            <label for={engine}>{engine}</label>
                        </li>
                    {/each}
                    <li>
                        <input
                            type="radio"
                            name="gameEngine"
                            value="other"
                            id="otherEngine"
                            bind:group={selectedGame.gameEngine}
                        />
                        <label for="otherEngine">other</label>
                    </li>
                </ul>
                <span class="info">Choose which engine you've used</span>
            </div>
            <div class="input-group">
                <label for="university">University</label>
                <select
                    name="university"
                    id="university"
                    required
                    bind:value={selectedGame.university}
                >
                    <option value="" disabled selected>Select University</option
                    >
                    {#each universities as university}
                        <option value={university.id}>{university.name}</option>
                    {/each}
                </select>
                <span class="info">Which University is your team from?</span>
            </div>
            <div class="input-group">
                <span>AI Disclosure</span>
                <label for="aiUsed"
                    >AI was used in the creation of the game
                    <input
                        name="aiUsed"
                        id="aiUsed"
                        bind:checked={selectedGame.aiUsed}
                        type="checkbox"
                    />
                </label>
                <span class="info"></span>
            </div>
            <div class="input-group">
                <label for="ageRating">Age Rating</label>
                <select
                    name="ageRating"
                    id="ageRating"
                    bind:value={selectedGame.ageRating}
                >
                    <option value="12">12</option>
                    <option value="18">18</option>
                </select>
                <span class="info"
                    >Please select the age rating you're probably getting from
                    the USK. Due to procedural reasons, there are only two
                    options: 12 and 18.
                </span>
            </div>
            <!-- #endregion -->
        </div>
        <div>
            <!-- #region Visuals -->
            <h2>Images</h2>
            <p class="visuals-info">
                Please note: It is important to use <strong
                    >images with small file sizes</strong
                >
                when making websites. <em>Especially</em> for a website like
                ours, when we expect most of our visitors to be on slow, limited
                mobile data. <br />
                So please, upload images with a small file size, preferably
                <code>.webp</code>
                or <code>.jp(e)g</code> or if you're using <code>.png</code>,
                please consider using a site like
                <a
                    href="https://tinypng.com/"
                    target="_blank"
                    rel="noopener noreferrer">tinypng.com</a
                > to minimize file sizes.
            </p>
            <div class="input-group">
                <label for="cover">Cover Image</label>
                <ImageUploader
                    id="cover"
                    name="cover"
                    required
                    ratio={[16, 9]}
                    min={[1920, 1080]}
                    existingImg={selectedGame.images?.cover}
                    fileSizeWarningLimits={[1 * 1024 * 1024, 3 * 1024 * 1024]}
                />
                <span class="info"
                    >A cover image for your game page. <strong
                        >ratio: 16:9, min. size: 1920x1080, preferably below 1
                        MB</strong
                    ></span
                >
            </div>
            <div class="input-group">
                <label for="capsule">Capsule Image</label>
                <ImageUploader
                    id="capsule"
                    name="capsule"
                    required
                    ratio={[4, 3]}
                    min={[400, 300]}
                    existingImg={selectedGame.images?.capsule}
                    fileSizeWarningLimits={[40 * 1024, 100 * 1024]}
                />
                <span class="info"
                    >A capsule image to be used on the front page and game
                    overview pages. <strong
                        >ratio: 4:3, min. size: 400x300, preferably below 40kB</strong
                    ></span
                >
            </div>
        </div>
        <div>
            <!-- #region Tags -->
            <h2>Tags</h2>
            <span class="info">
                Select all that apply. User will be able to filter by these. If
                you feel like any important tags are missing, let the website
                force (which is part of the marketing force) know.
            </span>
            <div class="input-group">
                {#each tags as [category, tagList]}
                    <div class="input-group">
                        <span>{category}</span>
                        <ul>
                            {#each tagList as tag}
                                <li>
                                    <label class="tags-label">
                                        <input
                                            type="checkbox"
                                            name="tags"
                                            value={tag}
                                            checked={selectedGame.tags.includes(
                                                tag,
                                            )}
                                        />
                                        {tag}
                                    </label>
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/each}
            </div>
        </div>

        <button type="submit" disabled={infoWasSubmitted}>Save Game</button>
    </form>
{/if}

<style>
    div.input-group {
        display: flex;
        flex-direction: column;
        margin-top: 1em;
    }
    div.input-group > label {
        font-weight: bold;
    }
    .info {
        font-size: smaller;
        color: rgb(61, 61, 61);
        font-style: italic;
    }
</style>

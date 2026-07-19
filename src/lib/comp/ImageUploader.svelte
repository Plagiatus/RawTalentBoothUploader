<script lang="ts">
    import { compareNumbers } from "$lib/utils";

    let {
        name,
        id,
        required = false,
        ratio,
        min,
        existingImg = "",
        fileSizeWarningLimits = [1 * 1024 * 1024, 3 * 1024 * 1024],
    }: {
        name: string;
        id: string;
        required: boolean;
        ratio: [number, number];
        min: [number, number];
        existingImg?: string;
        fileSizeWarningLimits?: [number, number];
    } = $props();

    let warning: string = $state("");
    let error: string = $state("");
    let files: FileList | undefined = $state();
    let ratioFraction: number = $derived(ratio[0] / ratio[1]);
    let input: HTMLInputElement = $state()!;

    function checkImage() {
        warning = "";
        error = "";
        if (!files || files.length == 0) {
            return;
        }
        for (let file of files) {
            if (file.size > fileSizeWarningLimits[1]) {
                warning += `${file.name} is too large (${Math.floor(file.size / 1024)}kB > ${fileSizeWarningLimits[1] / 1024}kB)!`;
            } else if (file.size > fileSizeWarningLimits[0]) {
                warning += `${file.name} is a little large (${Math.floor(file.size / 1024)}kB > ${fileSizeWarningLimits[0] / 1024}kB).`;
            }

            let image = new Image();
            image.addEventListener("load", () => {
                let sizes = { width: image.width, height: image.height };
                URL.revokeObjectURL(image.src);
                let imgRatio = sizes.width / sizes.height;
                if (!compareNumbers(imgRatio, ratioFraction, 0.001)) {
                    error += `${file.name} doesn't have a ratio of ${ratio[0]}:${ratio[1]}.\n`;
                }
                if (sizes.width < min[0] || sizes.height < min[1]) {
                    error += `${file.name} is smaller than the minimum size of ${min[0]}x${min[1]}.`;
                }
                input.setCustomValidity(error);
            });
            image.src = URL.createObjectURL(file);
        }
    }

    function replaceImage(){
        existingImg = "";
    }
</script>

{#if existingImg}
<div>
    <img src={"https://static.rawtalentbooth.com/"+existingImg} alt="name" class="img-preview"> 
    <button type="button" onclick={replaceImage}>replace</button>
</div>
{:else}
    <input
        type="file"
        {name}
        {id}
        accept=".jpg, .jpeg, .png, .webp"
        required={existingImg ? false: required}
        onchange={checkImage}
        bind:files
        bind:this={input}
    />
    <span class="error">{error}</span>
    <span class="warning">{warning}</span>
    {#if warning}
        <span class="extra-info"
            >Consider using <a
                href="https://tinypng.com/"
                target="_blank"
                rel="noopener noreferrer">tinypng.com</a
            >
            or, preferably, switching to a better compressed format like
            <code>.webp</code> altogether.</span
        >
    {/if}
{/if}

<style>
    .warning,
    .extra-info {
        color: darkorange;
    }
    .error {
        color: darkred;
    }
    .extra-info {
        font-style: italic;
    }

    .img-preview {
        max-height: 100px;
        width: auto;
    }
</style>

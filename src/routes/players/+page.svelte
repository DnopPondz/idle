<script lang="ts">
    export let data;
    export let form;
</script>

<main class="container mx-auto p-8 max-w-lg">
    <h1 class="text-3xl font-bold mb-6 text-center">Idle MMO</h1>

    <form method="POST" class="mb-8 p-4 border rounded-lg shadow-md bg-white">
        <h2 class="text-xl font-semibold mb-2">Create New Player</h2>
        <div class="flex gap-2">
            <input
                type="text"
                name="name"
                placeholder="Enter player name"
                class="flex-grow p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                minlength="3"
            />
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                Create
            </button>
        </div>
        {#if form?.error}
            <p class="text-red-500 text-sm mt-2">{form.error}</p>
        {/if}
    </form>


    <h2 class="text-2xl font-bold mb-4">Player List</h2>

    {#if data.players.length > 0}
        <ul class="list-none space-y-2">
            {#each data.players as player (player.id)}
                <a href="/players/{player.id}" class="block hover:bg-gray-100 rounded-md transition-colors">
                    <li class="p-3 border flex justify-between items-center">
                        <span class="font-bold">{player.name}</span>
                        <span class="text-sm text-gray-500">View Profile &rarr;</span>
                    </li>
                </a>
            {/each}
        </ul>
    {:else}
        <p class="text-gray-500 text-center mt-4">No players found. Create one above!</p>
    {/if}
</main>
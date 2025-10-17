<script lang="ts">
    export let data;
    const { player } = data;
</script>

<main class="container mx-auto p-8 max-w-md">
    <a href="/players" class="text-blue-500 hover:underline mb-4 block">&larr; Back to Player List</a>

    <div class="bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-3xl font-bold mb-2">{player.name}</h1>
        <p class="text-gray-600">ID: {player.id}</p>
        <hr class="my-4">
        
        <div class="space-y-2">
            <div>
                <span class="font-semibold">Level:</span>
                <span>{player.level ?? 1}</span>
            </div>
            <div>
                <span class="font-semibold">Joined:</span>
                <span>{new Date(player.createdAt ?? Date.now()).toLocaleDateString()}</span>
            </div>
        </div>
    </div>
</main>
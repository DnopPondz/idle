<main class="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
    <h1 class="text-4xl font-bold mb-4">Welcome to Idle MMO!</h1>
    <p class="text-lg text-gray-600 mb-8">
        This is the homepage of your new game.
    </p>
    <a href="/players" class="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold text-xl hover:bg-blue-600 transition-transform transform hover:scale-105">
        Go to Player List &rarr;
    </a>
</main>

<style>
    /* เพิ่ม CSS เพื่อให้ Tailwind ทำงานได้ถูกต้องในไฟล์ Svelte */
    :global(body) {
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
    }
</style>
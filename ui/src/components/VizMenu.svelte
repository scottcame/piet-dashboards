<script lang="ts">

  import type { Group } from "../Config";
  import VizMenuGroup from "./VizMenuGroup.svelte";

  export let groups: Group[] = [];

  let menuFilterText = "";
  let menuFilterRegex: RegExp = null;
  export let helpVisible: boolean;

  $: menuFilterRegex = menuFilterText.trim() === "" ? null : new RegExp(menuFilterText, "i");

  function toggleHelp() {
    helpVisible = !helpVisible;
    if (helpVisible) {
      document.addEventListener("keydown", escapeKeyListener);
    } else {
      document.removeEventListener("keydown", escapeKeyListener);
    }
  }

  let escapeKeyListener = e => {
    if (e.key==="Escape") {
      helpVisible = false;
      document.removeEventListener("keydown", escapeKeyListener);
    }
  }

</script>

<div>
  <div class="flex flex-row items-center">
    <input class="w-full outline-none border p-1" type="search" placeholder="Filter visualizations..." bind:value={menuFilterText}/>
    <div class="ml-1 text-gray-700 relative" title="Click for help">
      <div class="h-6 w-6 cursor-pointer">
        <svg viewBox="0 0 24 24" class="stroke-current" on:click="{toggleHelp}">
          <g stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
            <g transform="scale(1.1)">
              <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </g>
          </g>
        </svg>
      </div>
      <div class="absolute bg-blue-100 border-4 border-blue-800 ml-6 rounded-md shadow-xl w-64 z-50 select-none {helpVisible ? '' : 'hidden'}">
        <div class="p-3 text-justify">
          <p>Type in the "Filter visualizations" box to the left to show only a subset of available visualizations.</p>
          <p class="mt-2">Expand a group of visualizations in the left sidebar by clicking on it.</p>
          <p class="mt-2">Drag visualizations from the left sidebar onto the desired spot in the grid area to the right.</p>
          <p class="mt-2 underline cursor-pointer" on:click="{toggleHelp}">Close Help</p>
        </div>
      </div>
    </div>
  </div>
  <div class="mt-2 overflow-y-auto">
    {#each groups as group}
      <VizMenuGroup group={group} filterRegex={menuFilterRegex}/>
    {/each}
  </div>
</div>

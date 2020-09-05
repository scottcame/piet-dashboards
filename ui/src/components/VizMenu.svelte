<script lang="ts">

  import type { Group } from "../Config";
  import VizMenuGroup from "./VizMenuGroup.svelte";

  export let groups: Group[] = [];

  let menuFilterText = "";
  let menuFilterRegex: RegExp = null;

  $: menuFilterRegex = menuFilterText.trim() === "" ? null : new RegExp(menuFilterText, "i");

</script>

<div>
  <input class="w-full outline-none border p-1" type="search" placeholder="Filter visualizations..." bind:value={menuFilterText}/>
  <div class="mt-2 overflow-y-auto">
    {#each groups as group}
      <VizMenuGroup group={group} filterRegex={menuFilterRegex}/>
    {/each}
  </div>
</div>
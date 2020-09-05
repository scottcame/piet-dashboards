<script lang="ts">
  export let columnCount: number;
  export let rowIndex: number;
</script>

<div class="w-full flex lg:flex-row flex-col grid-row data-row-index={rowIndex}">
  {#each [...Array(columnCount).keys()] as idx}
    <div class="h-80 lg:w-1/2 m-1 border-2 border-dashed dragula-container dragula-drop-target" data-row-index={rowIndex} data-col-index={idx}></div>
  {/each}
</div>

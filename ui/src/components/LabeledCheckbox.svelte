<script lang="ts">

  import { createEventDispatcher } from 'svelte';

  export let value: boolean = true;
  export let label = "Checkbox label";

  const dispatch: (event: string, detail?: any) => void = createEventDispatcher();

  function handleClick(): void {
    value = !value;
    dispatch('click', value);
  }


</script>

<div class="flex flex-inline items-center">
  <div class="mr-2 ml-1 border w-4 h-4 hover:bg-gray-300 {value ? 'bg-gray-900 hover:bg-gray-900' : ''}" on:click={ e => handleClick() }></div>
  <div>{label}</div>
</div>

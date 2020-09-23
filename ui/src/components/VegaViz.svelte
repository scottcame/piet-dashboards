<script lang="ts">

  import vegaEmbed from 'vega-embed';
  import type { Result } from 'vega-embed';
  import type { VegaLiteSpec } from '../VegaLiteSpec';

  export let vegaLiteSpec: VegaLiteSpec;
  export let exportOption: boolean = false;
  export let rendering: boolean = true;

  let container: HTMLElement;
  let actions: boolean | {export: boolean, source: boolean, compiled: boolean, editor: boolean};

  let showNoDataLabel = false;

  $: actions = exportOption ? {
        export: true,
        source: false,
        compiled: false,
        editor: false
  } : false;

  $: if (vegaLiteSpec && vegaLiteSpec.hasData && container) {
    vegaEmbed(container, vegaLiteSpec as any, {
      actions: actions,
      renderer: "canvas"
    }).then((_embedResult: Result): void => {
      let canvasElement = container.querySelector(".vega-embed > canvas") as HTMLElement;
      if (!canvasElement) {
        // we'll get in here if the embed export button is shown
        canvasElement = container.querySelector(".chart-wrapper > canvas") as HTMLElement;
      }
      if (canvasElement) {
        canvasElement.style.margin = "auto";
        // todo: still need to figure out how to center vertically
      }
    });
    showNoDataLabel = false;
  } else {
    showNoDataLabel = true;
  }

</script>

{#if !rendering}
  <div class="mt-px h-full w-full {vegaLiteSpec && vegaLiteSpec.hasData ? '' : 'hidden'}" bind:this={container}></div>
  <div class="{showNoDataLabel ? '' : 'hidden'} italic mt-12 text-center">No data available</div>
{:else}
  <div class="mt-24">
    <div id="wait-spinner"></div>
  </div>
{/if}

<style>
  #wait-spinner {
    position: relative;
    left: 50%;
    top: 50%;
    z-index: 1;
    margin: 0;
    border: 4px solid #f3f3f3;
    border-radius: 50%;
    border-top: 4px solid #3498db;
    width: 30px;
    height: 30px;
    -webkit-animation: spin 2s linear infinite;
    animation: spin 2s linear infinite;
  }
  
  @-webkit-keyframes spin {
    0% { -webkit-transform: rotate(0deg); }
    100% { -webkit-transform: rotate(360deg); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
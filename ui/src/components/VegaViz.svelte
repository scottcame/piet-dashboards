<script lang="ts">

  import vegaEmbed from 'vega-embed';
  import type { Result } from 'vega-embed';
  import type { VegaLiteSpec } from '../VegaLiteSpec';

  export let vegaLiteSpec: VegaLiteSpec;
  export let exportOption: boolean = false;

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
    vegaEmbed(container, vegaLiteSpec, {
      actions: actions,
      renderer: "canvas"
    }).then((_embedResult: Result): void => {
      const canvasElement = container.querySelector(".vega-embed > canvas") as HTMLElement;
      canvasElement.style.margin = "auto";
      // todo: still need to figure out how to center vertically
    });
    showNoDataLabel = false;
  } else {
    showNoDataLabel = true;
  }

</script>

<div class="mt-px h-full w-full {vegaLiteSpec && vegaLiteSpec.hasData ? '' : 'hidden'}" bind:this={container}></div>

<div class="{showNoDataLabel ? '' : 'hidden'} italic mt-12 text-center">No data available</div>
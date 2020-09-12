<script lang="ts">

  import vegaEmbed, { Result } from 'vega-embed';
  import type { VegaLiteSpec } from '../VegaLiteSpec';

  export let vegaLiteSpec: VegaLiteSpec;
  export let exportOption: boolean = false;

  let container: HTMLElement;
  let actions: boolean | {export: boolean, source: boolean, compiled: boolean, editor: boolean};

  $: actions = exportOption ? {
        export: true,
        source: false,
        compiled: false,
        editor: false
  } : false;

  $: if (vegaLiteSpec && container) {
    console.log(vegaLiteSpec);
    vegaEmbed(container, vegaLiteSpec, {
      actions: actions,
      renderer: "canvas"
    }).then((embedResult: Result): void => {
      console.log(embedResult);
      const canvasElement = container.querySelector(".vega-embed > canvas") as HTMLElement;
      canvasElement.style.margin = "auto";
      // todo: still need to figure out how to center vertically
    });
  }

</script>

<div class="mt-px h-full w-full {vegaLiteSpec ? '' : 'hidden'}" bind:this={container}></div>

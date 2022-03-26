<script type="ts">
    export let opened: boolean;
</script>

{#if opened}
<span class="icon">
    <svg width="32" height="32" viewBox="0 0 8.4666661 8.466667">
         <g
                 transform="translate(-68.579204,-80.103198)"
                 id="layer1">
    <path
            id="path1864"
            d="m 75.87518,82.373036 -3.055698,3.148515 -3.055698,-3.148515"
            style="fill:none;fill-rule:evenodd;stroke:#404040;stroke-width:1.32291663;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
  </g>
    </svg>
</span>
{:else}
<span class="icon">
    <svg width="32" height="32" viewBox="0 0 8.4666661 8.466667">
  <g
          transform="translate(-68.579204,-80.103198)"
          id="layer1">
    <path
            id="path1864"
            d="m 74.638281,87.247533 -3.148515,-3.055698 3.148515,-3.055698"
            style="fill:none;fill-rule:evenodd;stroke:#404040;stroke-width:1.32291663;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
  </g>
    </svg>
</span>
{/if}



<style>
    .icon {
        display: inline-flex;
        align-self: center;
    }

    .icon svg {
        height: 1em;
        width: 1em;
        fill: currentColor;
    }
</style>

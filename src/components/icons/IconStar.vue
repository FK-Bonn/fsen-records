<script setup lang="ts">
defineProps<{
  title?: string,
}>()
</script>

<template>
<span class="icon" title={title}>
    <svg width="32" height="32" viewBox="0 0 8.4666661 8.466667">
       <g transform="translate(-68.579204,-80.103198)" id="layer1">
        <path
            id="path914"
            d="m 70.083048,88.13833 c 0.12514,0.213934 0.39636,0.291683 0.615835,0.176539 l 2.113742,-1.111264 2.113701,1.111208 c 0.340509,0.179585 0.738946,-0.109861 0.673419,-0.489206 l -0.403863,-2.353759 1.709812,-1.667098 c 0.274723,-0.26843 0.122798,-0.735347 -0.257284,-0.790719 l -2.363028,-0.343458 -1.056777,-2.141248 c -0.169948,-0.344951 -0.661715,-0.345158 -0.831954,-3.5e-4 l -1.056476,2.141398 -2.363193,0.343693 c -0.380571,0.05518 -0.532558,0.522878 -0.257123,0.791231 l 1.710222,1.666733 -0.404136,2.353784 c -0.01835,0.107652 0.0019,0.218329 0.0571,0.312537 z"
            style="fill:#ff9900;fill-opacity:1;fill-rule:nonzero;"/>
        </g>
    </svg>
</span>
</template>

<style scoped>
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
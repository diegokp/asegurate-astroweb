<script setup>
import { LoopingRhombusesSpinner } from 'epic-spinners'


</script>


<template>
    <div class="flex justify-center items-center h-full gap-6 flex-col">
        <looping-rhombuses-spinner
            :animation-duration="2500"
            :rhombus-size="15"
            color="#283B5A"
        />
        <span>Cargando...</span>
    </div>
</template>
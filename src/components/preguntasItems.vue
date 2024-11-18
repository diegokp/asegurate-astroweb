<script setup>
import {  ref, computed } from "vue";
import { items } from "~/components/preguntas.json"

const preguntas = ref(items)
const active = ref(false)

defineProps(["id"])

function showRespuesta(){
    if (active.value === true) {
        active.value= false;
  } else {
     active.value= true
  }
}



</script>

<template>
        <article
            class="accordion"
            >
                <div  class="question"  @click="showRespuesta" > 
                    {{ preguntas[id].question }} 
                    
                    <i v-if="active" class="fa-solid fa-angle-up angle"></i>
                    <i v-else class="fa-solid fa-angle-down angle"></i>
                </div>
                <div 
                class="answer"
                :class="{ answerOpen: active }"
                >
                    <div>
                        <p
                        v-for="respuesta in preguntas[id].answer"
                        >
                        {{ respuesta }}
                        </p>
                    </div>
                </div>
        </article>
</template>


<style>


.accordion{
    width: 80%;
    margin: auto;
}

.question{
    color: #ffff;
    background-color: var(--blue);
    font-family: bayan;
    font-weight: bold;
    border: 1px solid white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    cursor: pointer;
    gap:10px

}

.question:hover{
    color: var(--yellow);
}

.answer{
    background-color: #ffff;
    height: 0;
    overflow-y: hidden;
    transition:2s;

}

.answer div{
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}



.answerOpen{
    height: auto;
}

@media only screen and (max-width: 900px)  {
    .accordion{
        width: 100%;
    }
    
}
</style>
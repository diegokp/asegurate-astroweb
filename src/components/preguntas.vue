<script setup>
import preguntasItems from './preguntasItems.vue';


</script>

<template>
    <section id="preguntas">
        <div>
            <h3>Preguntas frecuentes</h3>
            <preguntasItems id="0" />
            <preguntasItems id="1" />
            <preguntasItems id="2" />
            <preguntasItems id="3" />
            <preguntasItems id="4" />
            <preguntasItems id="5" />
        </div>
    </section>
</template>


<style>
    #preguntas{
    padding: 60px 0;
    background-image: url("images/webback.webp");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    margin: auto;
}

#preguntas h3{
    padding-bottom: 50px;
}

#preguntas > div{
    width: 85%;
    margin: auto;

}

</style>
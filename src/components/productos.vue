<script setup>
import {  ref } from "vue";
import { items } from "~/components/data/productos.json"

const products =ref(items)
const selected = ref(0)

function showProduct(id) {
    selected.value = id
}
</script>

<template>
    <section id="productos">
        <h3>Seguros destacados en Las Palmas</h3>
        <article>
            <div>
                <h3 id="productoTitle">{{ products[selected].title }}</h3>
                <p id="productoTxt">{{ products[selected].description }}</p>
                <a
                    :href="products[selected].href"
                    class="botonGenerico"
                    >
                    Calcula tu Seguro
                    <i class="fa-solid fa-angle-right"></i>
                </a>
            </div>
            <div>
                <img
                :src="products[selected].image"
                alt="Seguros Las Palmas"
                id="productoImg"
                draggable="false">
            </div>
            <div>
                <button
                    v-for="(product, index) in products"
                    :key="product.id"
                    @click="showProduct(index)"
                    class="botonProducto"
                    :class="{
                    Active: selected === index,
                    }"
                >
                <i :class="product.icon"></i>
                {{ product.productType }}
                </button>
            </div>
        </article>
    </section>
</template>






<style>

#productos{
    width: 85%;
    text-align: center;
    padding: 60px 0;
    margin: auto;
}

#productos >article{
    background-color: #ffff;
    box-shadow: 5px 5px 18px #adadad;
    border-top: 6px solid;
    border-color: var(--blue);
    padding: 120px 60px;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: 400px;
    grid-template-areas:
        "txt image boton"
    ;
    align-items: center;
    gap:30px;
    margin-bottom: 100px;
    overflow: hidden;
}

article > div:nth-child(1){
    text-align: left;
    padding-left: 20px;
}

#productoTxt{
    padding: 20px 0;
}

#productos article > div:nth-child(2){
    border: 2px solid grey;
    grid-area: image;
    height: 100%;
    padding: 20px;
    overflow: hidden;
    min-width: 250px;
}

#productos article *> img{
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

#productos article > div:nth-child(3){
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
    grid-area: boton;

}

.botonProducto{
    border-bottom: 1px solid;
    border-color: var(--grey);
    display: flex;
    justify-content: space-between;
    height: 100%;
    align-items: center;
    cursor: pointer;
    color: var(--grey);
    font-family: nunito semi;
    margin: auto;
    width: 80%;
}

.botonProducto:hover{
    color: var(--blue);
}

.Active{
    color: var(--blue);
}

.botonProducto > i{
    font-size: 2rem;
}

.botonGenerico{
    background-color: var(--yellow);
    /* font-family: bayan; */
    font-weight: bold;
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid;
    border-color: var(--yellow);
    transition: 0.5s;
    cursor: pointer;
    max-width: 360px;
    color: var(--blue);
    padding: 12px 10px;
    /* padding-top: 5px; */
}


.botonGenerico > i{
    color: #ffff;
    font-size: 1.2rem;
    padding-left:10px;
}

.botonGenerico:hover{
    background: var(--back);
}

@media only screen and (max-width: 900px)  {
   #productos >article{
       grid-template-rows:repeat(3, 1fr);
       grid-template-columns: 1fr;
       grid-template-areas:
       "boton"
       "image"
       "txt";
       gap: 30px;
       padding: 20px 10px;
   }
}

</style>
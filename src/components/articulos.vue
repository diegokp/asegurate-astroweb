<script setup>
import { ref , computed} from "vue";
import LoadSpiner from "./LoadSpiner.vue";

const articulos= ref([])
const loading = ref(true)


const fetchData = async () => {
  try {
    const res = await fetch('https://raw.githubusercontent.com/diegokp/asegurate-astroweb/main/public/api/data.json')
    articulos.value = await res.json()
  } catch (error) {
    console.log(error)
  }
  finally{
    loading.value = false
  }
}
fetchData();


const filteredArticulos = computed(() => {
  if (articulos.value) {
    return articulos.value.filter(
     articulos => articulos.publishDate <= (new Date().toJSON().slice(0, 10))
    );
  }
  return articulos.value;
});

const totalArticulos = computed(() => {
  return filteredArticulos.value.length
})

const restoArticulos = computed(() => {
  return filteredArticulos.value.length - 3
})



</script>

<template>
   <LoadSpiner v-if="loading"/>
   <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 xl:gap-24">
        <div  v-for="articulo in filteredArticulos.slice(`${restoArticulos}`,`${totalArticulos}`).reverse()">
            <article class="hover:rotate-1 transition hover:scale-105 duration-500 bg-white shadow-md">
              <a :href="`/blog/${articulo.slug}`" class="h-full flex flex-col">
              	<div class="overflow-hidden h-56">
              		<img :src="`${articulo.image}`"  :alt="`${articulo.imageAlt}`"/>
              	</div>
              	<div class="px-4 h-72 flex flex-col grow border-x-2 border-b-2 border-gray-100 overflow-hidden">
                  <div class="flex flex-col justify-center items-center h-full">
                    <h4 class="text-2xl tracking-wide ">{{articulo.title}}</h4>
              		  <p class="mt-2 prose">{{articulo.excerpt}}</p>
                  </div>
              		<span
              			class="text-center px-4 py-2 -mx-4 text-white text-2xl bg-brand mt-auto block"
              		>
              			Leer
              		</span>
              	</div>
              </a>
            </article>
        </div>
    </div>
    <h2 class="mt-14 mb-6">Otros Artículos</h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 xl:gap-24">
        <div  v-for="articulo in filteredArticulos.slice(0,`${restoArticulos}`).reverse()">
            <article class=" hover:rotate-1 transition hover:scale-105 duration-500 bg-white shadow-md">
              <a :href="`/blog/${articulo.slug}`" class="h-full flex flex-col">
              	<div class="overflow-hidden h-56">
              		<img :src="`${articulo.image}`"  :alt="`${articulo.imageAlt}`"/>
              	</div>
              	<div class="px-4 h-72 flex flex-col grow border-x-2 border-b-2 border-gray-100 overflow-hidden">
                  <div class="flex flex-col justify-center items-center h-full ">
                    <h4 class="text-2xl tracking-wide">{{articulo.title}}</h4>
              		  <p class="mt-2 prose customText">{{articulo.excerpt}}</p>
                  </div>
              		<span
              			class="text-center px-4 py-2 -mx-4 text-white text-2xl bg-brand mt-auto block"
              		>
              			Leer
              		</span>
              	</div>
              </a>
            </article>
        </div>
    </div>
   </div>
</template>

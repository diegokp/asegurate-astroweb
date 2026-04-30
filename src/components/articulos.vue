<script setup>
import { ref , computed} from "vue";
import LoadSpiner from "./LoadSpiner.vue";

const articulos= ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 6


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

const restoArticulosList = computed(() => {
  return filteredArticulos.value.slice(0, restoArticulos.value).reverse()
})

const totalPages = computed(() => {
  return Math.ceil(restoArticulosList.value.length / itemsPerPage)
})

const paginatedArticulos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return restoArticulosList.value.slice(start, start + itemsPerPage)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

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
        <div  v-for="articulo in paginatedArticulos">
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

    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-12">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 bg-white border-2 border-gray-100 text-gray-600 hover:bg-brand hover:text-white hover:border-brand transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ←
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-4 py-2 border-2 transition',
          currentPage === page
            ? 'bg-brand text-white border-brand'
            : 'bg-white border-gray-100 text-gray-600 hover:bg-brand hover:text-white hover:border-brand'
        ]"
      >
        {{ page }}
      </button>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 bg-white border-2 border-gray-100 text-gray-600 hover:bg-brand hover:text-white hover:border-brand transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        →
      </button>
    </div>
   </div>
</template>

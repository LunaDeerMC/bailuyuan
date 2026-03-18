import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './styles.css';
import { applyRouteSeo } from './utils/seo';

const app = createApp(App);

router.afterEach((to) => {
	applyRouteSeo(to);
});

app.use(router);

router.isReady().then(() => {
	applyRouteSeo(router.currentRoute.value);
	app.mount('#app');
});
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue';
import PhasesGenerator from '@/components/phases-generator';

import '@/style/stylesheet.scss';

Vue.use(BootstrapVue);

new Vue({
    selector: 'vue-app',
    components: {
        'phases-generator': PhasesGenerator,
    },
    el: '#app',
    template: `
        <div class="container">
            <section>
                <h1>Phases.json Helper Tool</h1>
                <phases-generator></phases-generator>
            </section>
        </div>
    `
});

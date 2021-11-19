import Vue from "vue";
import VueCompositionApi, {ref, computed} from "@vue/composition-api";
Vue.use(VueCompositionApi);

const potentialApplicants = ref([]);
export const getPotentialApplicants = computed(() => potentialApplicants.value);
export const setPotentialApplicants = newPotentialApplicants => (potentialApplicants.value = newPotentialApplicants);

const applicants = ref([]);
export const getApplicants = computed(() => applicants.value);
export const setApplicants = newApplicants => (applicants.value = newApplicants);

const recipients = ref([]);
export const getRecipients = computed(() => recipients.value);
export const setRecipients = newRecipients => (recipients.value = newRecipients);
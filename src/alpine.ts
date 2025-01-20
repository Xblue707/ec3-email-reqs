import maskPlugin from '@alpinejs/mask';
import type { Alpine } from 'alpinejs';

export default (Alpine: Alpine) => {
	Alpine.plugin(maskPlugin);
};
